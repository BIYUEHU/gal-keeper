use sled::Db;
use std::fs;

const DB_NAME: &'static str = "db";

fn initialize_db(directory: &str) -> Result<Db, String> {
    let directory = std::path::Path::new(&directory);
    if !directory.exists() {
        fs::create_dir_all(directory).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    Ok(sled::open(directory.join(DB_NAME)).unwrap())
}

#[tauri::command]
pub fn db_read_value(directory: &str, key: &str) -> Result<String, String> {
    Ok(match initialize_db(directory)?.get(key).unwrap() {
        Some(v) => String::from_utf8_lossy(&v).to_string(),
        None => "".to_string(),
    })
}

#[tauri::command]
pub fn db_write_value(directory: &str, key: &str, value: &str) -> Result<(), String> {
    let db = initialize_db(directory)?;
    db.insert(key, value.as_bytes())
        .map_err(|e| format!("Failed to insert key-value pair: {}", e))?;
    db.flush()
        .map_err(|e| format!("Failed to flush database: {}", e))?;
    Ok(())
}
