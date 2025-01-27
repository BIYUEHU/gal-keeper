use std::path::Path;
use std::process::Command;
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use sysinfo::{Pid, ProcessesToUpdate, System};
use tauri::{AppHandle, Manager};
use winapi::um::winuser::{GetForegroundWindow, GetWindowThreadProcessId};

fn get_secs_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs()
}

#[tauri::command]
pub fn launch_and_monitor(app_handle: AppHandle, filepath: &str, id: String) -> Result<(), String> {
    let pid = Command::new(filepath)
        .current_dir(Path::new(filepath).join(".."))
        .spawn()
        .map_err(|e| format!("Failed to launch program: {}", e))?
        .id();
    println!("Process ID: {}", pid);

    let start_time = get_secs_timestamp();
    thread::spawn(move || {
        monitor_process(
            app_handle,
            id.clone(),
            start_time,
            Pid::from_u32(pid),
            false,
        )
        .map_err(|e| format!("Failed to monitor process: {}", e))
        .unwrap();

        println!(
            "Monitoring finished. Start time: {}, Stop time: {}",
            start_time,
            get_secs_timestamp()
        );
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

fn monitor_process(
    app_handle: AppHandle,
    id: String,
    start_time: u64,
    pid: Pid,
    is_child: bool,
) -> Result<(), String> {
    let mut system = System::new_all();

    loop {
        system.refresh_processes(ProcessesToUpdate::All, true);

        if let Some(process) = system.process(pid) {
            if is_window_active(process.pid()).unwrap_or(false) {
                app_handle
                    .emit_all("increase", (id.clone(), start_time, get_secs_timestamp()))
                    .map_err(|e| format!("Failed to emit event: {}", e))
                    .unwrap();
            }
            thread::sleep(Duration::from_secs(1));
        } else if !is_child {
            system.refresh_processes(ProcessesToUpdate::All, true);
            if let Some(target_pid) = find_child_process(pid, &mut system) {
                println!("Found child process process with PID: {}", target_pid);
                monitor_process(app_handle, id, start_time, target_pid, true)
                    .map_err(|e| format!("Failed to monitor child process: {}", e))?;
            } else {
                println!("Target process exited and no child process found.");
            }
            break;
        } else {
            println!("Target process exited.");
            break;
        }
    }

    Ok(())
}

fn is_window_active(pid: Pid) -> Result<bool, String> {
    let result = (unsafe {
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
    } as Result<bool, String>)
        .map_err(|e| format!("Failed to check if window is active: {}", e))?;
    println!("Is window active: {}", result);
    Ok(result)
}
