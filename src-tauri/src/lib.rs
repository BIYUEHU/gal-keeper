use utils::common::{open_with_explorer, open_with_notepad, search_nearby_files_and_saves};
use utils::database::{db_read_value, db_write_value};
use utils::launch::launch_and_monitor;
use utils::request::{send_http_request, url_to_base64};

mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            db_read_value,
            db_write_value,
            open_with_explorer,
            open_with_notepad,
            launch_and_monitor,
            send_http_request,
            url_to_base64,
            search_nearby_files_and_saves
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
