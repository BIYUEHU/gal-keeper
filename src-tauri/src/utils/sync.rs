use roga::{transport::console::ConsoleTransport, *};
use std::{thread, time::Duration};
use tauri::{AppHandle, Manager};

#[derive(Clone)]
struct Sync {
    app_handle: AppHandle,
    duration_minutes: u64,
    logger: Logger,
}

impl Sync {
    pub fn new(app_handle: AppHandle, duration_minutes: u64) -> Self {
        Self {
            app_handle,
            duration_minutes,
            logger: Logger::new()
                .with_transport(ConsoleTransport {
                    ..Default::default()
                })
                .with_level(LoggerLevel::Info)
                .with_label("Sync"),
        }
    }

    pub fn run(&self) {
        l_info!(
            &self.logger,
            "Auto sync to github every {} minutes",
            self.duration_minutes
        );

        let thread_self = self.clone();
        thread::spawn(move || loop {
            l_info!(&thread_self.logger, "Syncing to github...");
            if let Err(e) = thread_self.app_handle.emit_all("sync", ()) {
                l_error!(&thread_self.logger, "Failed to emit event: {}", e);
            }
            thread::sleep(Duration::from_secs(thread_self.duration_minutes * 60));
        });
    }
}

#[tauri::command]
pub fn auto_sync(app_handle: AppHandle, duration_minutes: u64) {
    let sync = Sync::new(app_handle, duration_minutes);
    sync.run();
}
