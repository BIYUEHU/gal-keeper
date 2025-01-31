use roga::transport::console::ConsoleTransport;
use roga::*;
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

#[derive(Clone)]
struct Monitor {
    app_handle: AppHandle,
    filepath: String,
    id: String,
    start_time: u64,
    pid: Option<Pid>,
    is_child: bool,
    logger: Logger,
}

impl Monitor {
    fn new(app_handle: AppHandle, filepath: String, id: String) -> Self {
        Self {
            app_handle,
            filepath,
            id: id.clone(),
            start_time: 0,
            pid: None,
            is_child: false,
            logger: Logger::new()
                .with_transport(ConsoleTransport {
                    ..Default::default()
                })
                .with_level(LoggerLevel::Info)
                .with_label(id.clone()),
        }
    }

    fn monit(&mut self) -> Result<(), String> {
        let pid = Command::new(self.filepath.clone())
            .current_dir(Path::new(self.filepath.as_str()).join(".."))
            .spawn()
            .map_err(|e| {
                let msg = format!("Failed to launch program: {}", e);
                l_error!(self.logger, "{}", msg);
                msg
            })?
            .id();
        self.pid = Some(Pid::from_u32(pid));
        l_info!(self.logger, "Process ID: {}", pid);

        self.start_time = get_secs_timestamp();

        let mut thread_self = self.clone();
        thread::spawn(move || {
            thread_self
                .monitor_process()
                .map_err(|e| {
                    let msg = format!("Failed to monitor process: {}", e);
                    l_error!(thread_self.logger, "{}", msg);
                    msg
                })
                .unwrap();

            l_info!(
                thread_self.logger,
                "Monitoring finished. Start time: {}, Stop time: {}",
                thread_self.start_time,
                get_secs_timestamp()
            );
        });

        Ok(())
    }

    fn monitor_process(&mut self) -> Result<(), String> {
        if self.pid.is_none() {
            return Ok(());
        }

        let mut system = System::new_all();

        loop {
            system.refresh_processes(ProcessesToUpdate::All, true);

            if system.process(self.pid.unwrap()).is_some() {
                if self.is_window_active().unwrap_or(false) {
                    self.app_handle
                        .emit_all(
                            "increase",
                            (self.id.clone(), self.start_time, get_secs_timestamp()),
                        )
                        .map_err(|e| {
                            let msg = format!("Failed to emit event: {}", e);
                            l_error!(self.logger, "{}", msg);
                            msg
                        })?;
                }
                thread::sleep(Duration::from_secs(1));
            } else if !self.is_child {
                system.refresh_processes(ProcessesToUpdate::All, true);
                self.get_child_process(&mut system);
                if let Some(target_pid) = self.pid {
                    l_info!(
                        self.logger,
                        "Found child process process with PID: {}",
                        target_pid
                    );
                    self.is_child = true;
                    self.monitor_process().map_err(|e| {
                        let msg = format!("Failed to monitor child process: {}", e);
                        l_error!(self.logger, "{}", msg);
                        msg
                    })?;
                } else {
                    l_warn!(
                        self.logger,
                        "Target process exited and no child process found."
                    );
                }
                break;
            } else {
                l_warn!(self.logger, "Target process exited.");
                break;
            }
        }

        Ok(())
    }

    fn get_child_process(&mut self, system: &mut System) {
        if self.pid.is_none() {
            return;
        }

        system.refresh_processes(ProcessesToUpdate::All, true);

        for (pid, process) in system.processes() {
            if let Some(parent_pid) = process.parent() {
                if parent_pid == self.pid.unwrap() {
                    self.pid = Some(*pid);
                }
            }
        }
    }

    fn is_window_active(&self) -> Result<bool, String> {
        if self.pid.is_none() {
            return Ok(false);
        }

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

            Ok(target_id == self.pid.unwrap().as_u32())
        } as Result<bool, String>)
            .map_err(|e| {
                let msg = format!("Failed to check if window is active: {}", e);
                l_error!(self.logger, "{}", msg);
                msg
            })?;
        l_record!(self.logger, "Is window active: {}", result);
        Ok(result)
    }
}

#[tauri::command]
pub fn launch_and_monitor(app_handle: AppHandle, filepath: &str, id: String) -> Result<(), String> {
    let mut monitor = Monitor::new(app_handle, filepath.to_string(), id.clone());
    monitor.monit()?;
    Ok(())
}
