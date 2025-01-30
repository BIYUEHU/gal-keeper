use base64::{engine::general_purpose::STANDARD, Engine as _};
use reqwest::Client;
use serde::{Deserialize, Serialize};

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
