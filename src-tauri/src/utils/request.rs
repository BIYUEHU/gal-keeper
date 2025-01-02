use base64::{engine::general_purpose::STANDARD, Engine as _};
use reqwest::Client;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use std::path::Path;
use uuid::Uuid;

#[derive(Debug, Deserialize)]
pub struct HttpRequestConfig {
    pub method: String,
    pub url: String,
    pub headers: Option<Vec<(String, String)>>,
    pub body: Option<String>,
    pub user_agent: Option<String>,
}

#[derive(Debug, Serialize)]
pub struct HttpResponse {
    pub status: u16,
    pub body: String,
    pub headers: Vec<(String, String)>,
}

#[tauri::command]
pub async fn send_http_request(config: HttpRequestConfig) -> Result<HttpResponse, String> {
    let client = Client::new();

    let mut request = client.request(
        config.method.parse().map_err(|_| "Invalid HTTP method")?,
        &config.url,
    );

    if let Some(user_agent) = config.user_agent {
        request = request.header("User-Agent", user_agent);
    }

    if let Some(headers) = config.headers {
        for (key, value) in headers {
            request = request.header(&key, &value);
        }
    }

    if let Some(body) = config.body {
        request = request.body(body);
    }

    let response = request
        .send()
        .await
        .map_err(|err| format!("HTTP request failed: {}", err))?;

    let status = response.status().as_u16();
    let headers = response
        .headers()
        .iter()
        .map(|(key, value)| (key.to_string(), value.to_str().unwrap_or("").to_string()))
        .collect();
    let body = response.text().await.unwrap_or_default();

    Ok(HttpResponse {
        status,
        body,
        headers,
    })
}

#[tauri::command]
pub async fn url_to_base64(url: &str) -> Result<String, String> {
    let response = reqwest::get(url)
        .await
        .map_err(|err| format!("Failed to fetch URL: {}", err))?;

    if !response.status().is_success() {
        return Err(format!("Failed to fetch URL: {}", response.status()).into());
    }

    let bytes = response.bytes().await.unwrap_or_default();

    let mime_type = "image/png";
    let base64_string = format!("data:{};base64,{}", mime_type, STANDARD.encode(&bytes));

    Ok(base64_string)
}

#[tauri::command]
pub async fn download_image(url: String, directory: String) -> Result<String, String> {
    let response = reqwest::get(&url)
        .await
        .map_err(|err| format!("Failed to fetch URL: {}", err))?;

    if !response.status().is_success() {
        return Err(format!("Failed to download image: {}", response.status()));
    }

    let path = Path::new(&directory);
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|err| format!("Failed to create directory: {}", err))?;
    }

    let save_path = path.join(format!(
        "{}.{}",
        Uuid::new_v4().to_string(),
        if let Some(extension) = url.split('.').last() {
            extension.to_lowercase()
        } else {
            "jpg".to_string()
        }
    ));

    let mut file =
        fs::File::create(&save_path).map_err(|err| format!("Failed to create file: {}", err))?;
    file.write_all(&response.bytes().await.unwrap_or_default())
        .map_err(|err| format!("Failed to write file: {}", err))?;

    Ok(save_path.to_string_lossy().to_string())
}
