use sled::Db;
use std::fs;

fn initialize_db(directory: &str, file: &str) -> Result<Db, String> {
    let directory = std::path::Path::new(&directory);
    if !directory.exists() {
        fs::create_dir_all(directory).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    // let file = ;
    // if !file.exists() {
    //     fs::File::create(file.clone()).map_err(|e| format!("Failed to create file: {}", e))?;
    // }

    Ok(sled::open(directory.join(file)).unwrap())
}

#[tauri::command]
pub fn db_read_value(directory: &str, file: &str, key: &str) -> Result<String, String> {
    Ok(match initialize_db(directory, file)?.get(key).unwrap() {
        Some(v) => String::from_utf8_lossy(&v).to_string(),
        None => "".to_string(),
    })
}

#[tauri::command]
pub fn db_write_value(directory: &str, file: &str, key: &str, value: &str) -> Result<(), String> {
    let db = initialize_db(directory, file)?;
    db.insert(key, value.as_bytes())
        .map_err(|e| format!("Failed to insert key-value pair: {}", e))?;
    db.flush()
        .map_err(|e| format!("Failed to flush database: {}", e))?;
    Ok(())
}
