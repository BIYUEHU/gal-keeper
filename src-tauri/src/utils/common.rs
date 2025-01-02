use std::fs;
use std::path::Path;
use std::process::Command;

#[tauri::command]
pub fn search_nearby_files_and_saves(
    filepath: &str,
) -> Result<(Vec<String>, Option<String>), String> {
    let filepath = Path::new(filepath);
    if !filepath.exists() || !filepath.is_file() {
        return Err(format!("Invalid exe path: {}", filepath.display()));
    }

    let exe_dir = filepath
        .parent()
        .ok_or_else(|| "Cannot determine the parent directory.".to_string())?;

    let mut text_files = Vec::new();
    let mut save_folder = None;

    for entry in fs::read_dir(exe_dir).map_err(|e| e.to_string())? {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_file() {
            if let Some(ext) = path.extension() {
                if ext == "txt" {
                    text_files.push(path.clone());
                }
            }
        } else if path.is_dir() {
            if {
                let mut has_save = false;
                for entry in fs::read_dir(path.clone()).unwrap() {
                    let entry_path = entry.unwrap().path();
                    if !entry_path.is_file() {
                        continue;
                    }

                    let ext = entry_path.extension().unwrap();
                    if vec!["sav", "save", "dat"].contains(&ext.to_str().unwrap_or("")) {
                        has_save = true;
                        break;
                    }
                }
                has_save
            } {
                save_folder = Some(path.clone());
            }
        }
    }

    Ok((
        text_files
            .iter()
            .map(|p| p.to_str().unwrap().to_string())
            .collect(),
        save_folder.map(|p| p.to_str().unwrap().to_string()),
    ))
}

// #[tauri::command]
// pub fn initialize_directory(directory: &str, files: Vec<&str>) -> Result<(), String> {
//     let directory = std::path::Path::new(&directory);
//     if !directory.exists() {
//         fs::create_dir_all(directory).map_err(|e| format!("Failed to create directory: {}", e))?;
//     }
//     for file in files {
//         let file = directory.join(file);
//         if !file.exists() {
//             fs::File::create(file).map_err(|e| format!("Failed to create file: {}", e))?;
//         }
//     }
//     Ok(())
// }

#[cfg(target_os = "windows")]
#[tauri::command]
pub fn open_with_notepad(filepath: &str) -> Result<(), String> {
    Command::new("notepad")
        .arg(filepath)
        .spawn()
        .map_err(|e| format!("Failed to open file with Notepad: {}", e))?;
    Ok(())
}

#[cfg(target_os = "macos")]
#[tauri::command]
pub fn open_with_notepad(filepath: &str) -> Result<(), String> {
    Command::new("open")
        .arg("-a")
        .arg("TextEdit")
        .arg(filepath)
        .spawn()
        .map_err(|e| format!("Failed to open file with TextEdit: {}", e))?;
    Ok(())
}

#[cfg(target_os = "linux")]
#[tauri::command]
pub fn open_with_notepad(filepath: &str) -> Result<(), String> {
    Command::new("xdg-open")
        .arg(filepath)
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
