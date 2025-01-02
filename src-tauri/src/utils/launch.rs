use std::path::Path;
use std::process::Command;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use sysinfo::{Pid, ProcessesToUpdate, System};
use tauri::{AppHandle, Emitter};
use winapi::um::winuser::{GetForegroundWindow, GetWindowThreadProcessId};

fn get_unix_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

#[tauri::command]
pub fn launch_and_monitor(app_handle: AppHandle, filepath: &str) -> Result<(), String> {
    let pid = Command::new(filepath)
        .current_dir(Path::new(filepath).join(".."))
        .spawn()
        .map_err(|e| format!("Failed to launch program: {}", e))?
        .id();
    println!("Process ID: {}", pid);

    let filepath = filepath.to_string();
    thread::spawn(move || {
        let start_time = get_unix_timestamp();
        let active_time = monitor_process(Pid::from_u32(pid), false).unwrap();
        let stop_time = get_unix_timestamp();

        println!(
            "Monitoring finished. Start time: {}, Stop time: {}, Total active time: {} seconds.",
            start_time, stop_time, active_time
        );

        app_handle
            .emit(
                "finished",
                (filepath, start_time, stop_time, active_time * 1000),
            )
            .unwrap();
    });

    Ok(())
}

fn find_child_process(launcher_pid: Pid, system: &mut System) -> Option<Pid> {
    system.refresh_processes(ProcessesToUpdate::All, true);

    for (pid, process) in system.processes() {
        if let Some(parent_pid) = process.parent() {
            if parent_pid == launcher_pid {
                return Some(*pid);
            }
        }
    }
    None
}

fn monitor_process(pid: Pid, is_child: bool) -> Result<u64, String> {
    let mut system = System::new_all();
    let mut active_time: u64 = 0;

    loop {
        system.refresh_processes(ProcessesToUpdate::All, true);

        if let Some(process) = system.process(pid) {
            if is_window_active(process.pid()).unwrap_or(false) {
                active_time += 1;
            }
            thread::sleep(Duration::from_secs(1));
        } else if !is_child {
            system.refresh_processes(ProcessesToUpdate::All, true);
            if let Some(target_pid) = find_child_process(pid, &mut system) {
                println!("Found child process process with PID: {}", target_pid);
                active_time += monitor_process(target_pid, true).unwrap();
            } else {
                println!("Target process exited and no child process found.");
            }
            break;
        } else {
            println!("Target process exited.");
            break;
        }
    }

    Ok(active_time)
}

fn is_window_active(pid: Pid) -> Result<bool, String> {
    let result: Result<bool, String> = unsafe {
        let hwnd = GetForegroundWindow();
        if hwnd.is_null() {
            return Err("No active window found.".to_string());
        }

        let mut target_id: u32 = 0;
        GetWindowThreadProcessId(hwnd, &mut target_id);
        if target_id == 0 {
            return Err("Failed to get process ID for the active window.".to_string());
        }

        Ok(target_id == pid.as_u32())
    };
    let result = result.unwrap();
    println!("Is window active: {}", result);
    Ok(result)
}
