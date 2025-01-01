use std::process::Command;

#[tauri::command]
pub fn initialize_directory(directory: &str, files: Vec<&str>) -> Result<(), String> {
    let directory = std::path::Path::new(&directory);
    if !directory.exists() {
        std::fs::create_dir_all(directory)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    for file in files {
        let file = directory.join(file);
        if !file.exists() {
            std::fs::File::create(file).map_err(|e| format!("Failed to create file: {}", e))?;
        }
    }
    Ok(())
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub fn open_with_notepad(file_path: &str) -> Result<(), String> {
    Command::new("notepad")
        .arg(file_path)
        .spawn()
        .map_err(|e| format!("Failed to open file with Notepad: {}", e))?;
    Ok(())
}

#[cfg(target_os = "macos")]
#[tauri::command]
pub fn open_with_notepad(file_path: &str) -> Result<(), String> {
    Command::new("open")
        .arg("-a")
        .arg("TextEdit")
        .arg(file_path)
        .spawn()
        .map_err(|e| format!("Failed to open file with TextEdit: {}", e))?;
    Ok(())
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn open_with_notepad(file_path: &str) -> Result<(), String> {
    Command::new("xdg-open")
        .arg(file_path)
        .spawn()
        .map_err(|e| format!("Failed to open file with default text editor: {}", e))?;
    Ok(())
}

#[cfg(target_os = "windows")]
#[tauri::command]
pub fn open_with_explorer(directory: &str) -> Result<(), String> {
    Command::new("explorer")
        .arg(directory)
        .spawn()
        .map_err(|e| format!("Failed to open directory with File Explorer: {}", e))?;
    Ok(())
}

#[cfg(target_os = "macos")]
#[tauri::command]
pub fn open_with_explorer(directory: &str) -> Result<(), String> {
    Command::new("open")
        .arg(directory)
        .spawn()
        .map_err(|e| format!("Failed to open directory with Finder: {}", e))?;
    Ok(())
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn open_with_explorer(directory: &str) -> Result<(), &str> {
    Command::new("xdg-open")
        .arg(directory)
        .spawn()
        .map_err(|e| format!("Failed to open directory with File Explorer: {}", e))?;
    Ok(())
}
