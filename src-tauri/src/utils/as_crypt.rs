use base64::{engine::general_purpose::STANDARD, Engine as _};

#[tauri::command]
pub fn as_encrypt(text: &str, key: &str) -> String {
    let mut result = Vec::new();

    // Convert the key to bytes
    let key_bytes = key.as_bytes();

    // Convert the plaintext to bytes
    let text_bytes = text.as_bytes();

    for (i, byte) in text_bytes.iter().enumerate() {
        let key_byte = key_bytes[i % key_bytes.len()];
        // XOR the byte with the corresponding byte from the key
        let encrypted_byte = byte ^ key_byte;
        result.push(encrypted_byte);
    }

    STANDARD.encode(&result) // Encode the result as Base64
}

#[tauri::command]
pub fn as_decrypt(encrypted_text: &str, key: &str) -> Result<String, &'static str> {
    // Decode the Base64 encoded string
    let encrypted = STANDARD
        .decode(encrypted_text)
        .map_err(|_| "Base64 decode failed.")?;

    let mut result = Vec::new();

    // Convert the key to bytes
    let key_bytes = key.as_bytes();

    for (i, byte) in encrypted.iter().enumerate() {
        let key_byte = key_bytes[i % key_bytes.len()];
        // XOR the byte with the corresponding byte from the key
        let decrypted_byte = byte ^ key_byte;
        result.push(decrypted_byte);
    }

    // Convert the decrypted bytes back to a String
    String::from_utf8(result).map_err(|_| "Invalid UTF-8 sequence.")
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_crypto() {
        let key = "secret";
        let plaintext = "{\"script\":{\"entry\":\"main.mrs\",\"line\":49},\"background\":\"bg.png\",\"music\":{\"name\":\"1.mp3\",\"seconds\":47.46133333333333},\"characters\":[{\"identity\":\"soi\",\"name\":\"诗织\",\"figure\":\"/images/figure/shiori_shy.png\",\"position\":{\"type\":\"auto\",\"order\":1}},{\"identity\":\"self\",\"name\":\"“我”?\"},{\"identity\":\"author\",\"name\":\"夏叶的师傅\"}],\"speaker\":\"诗织\",\"values\":{\"constant\":{\"soi\":\"shiori.png\",\"soiL\":\"shiori_low.png\",\"soiM\":\"shiori_mid.png\",\"soiC\":\"shiori_close.png\",\"soiCS\":\"shiori_close_smile.png\",\"soiS\":\"shiori_smile.png\",\"soiO\":\"shiori_open.png\",\"soiOL\":\"shiori_open_low.png\",\"soiSh\":\"shiori_shy.png\",\"soiSq\":\"shiori_squint.png\"},\"variables\":{\"score\":50}}}\'";

        let encrypted = as_encrypt(plaintext, key);
        let decrypted = as_decrypt(&encrypted, key).expect("Decryption failed.");

        assert_eq!(decrypted, plaintext);
    }
}
