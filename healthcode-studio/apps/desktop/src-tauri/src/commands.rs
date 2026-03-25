use serde::Serialize;
use tauri::command;
use log::info;

#[derive(Serialize)]
pub struct AppVersion {
    pub version: String,
    pub name: String,
}

#[derive(Serialize)]
pub struct PlatformInfo {
    pub os: String,
    pub arch: String,
    pub version: String,
}

#[command]
pub fn get_app_version() -> AppVersion {
    info!("Getting app version");
    AppVersion {
        version: env!("CARGO_PKG_VERSION").to_string(),
        name: env!("CARGO_PKG_NAME").to_string(),
    }
}

#[command]
pub fn get_platform_info() -> PlatformInfo {
    info!("Getting platform info");
    PlatformInfo {
        os: std::env::consts::OS.to_string(),
        arch: std::env::consts::ARCH.to_string(),
        version: "1.0.0".to_string(),
    }
}

#[command]
pub async fn open_app_folder() -> Result<(), String> {
    info!("Opening app folder");
    #[cfg(target_os = "windows")]
    {
        std::process::Command::new("explorer")
            .arg(std::env::current_dir().unwrap_or_default())
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "macos")]
    {
        std::process::Command::new("open")
            .arg(std::env::current_dir().unwrap_or_default())
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    #[cfg(target_os = "linux")]
    {
        std::process::Command::new("xdg-open")
            .arg(std::env::current_dir().unwrap_or_default())
            .spawn()
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}
