use utils::as_crypt::{as_decrypt, as_encrypt};
use utils::common::{initialize_directory, open_with_explorer, open_with_notepad};
use utils::launch::launch_and_monitor;
use utils::request::{send_http_request, url_to_base64};

mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .invoke_handler(tauri::generate_handler![
            initialize_directory,
            open_with_explorer,
            open_with_notepad,
            launch_and_monitor,
            as_decrypt,
            as_encrypt,
            send_http_request,
            url_to_base64
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
