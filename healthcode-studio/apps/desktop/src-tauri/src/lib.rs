use log::{info, error};
use tauri::Manager;

mod commands;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    // Initialize logger
    env_logger::Builder::from_env(env_logger::Env::default().default_filter_or("info"))
        .format_timestamp_millis()
        .init();

    info!("Starting HealthCode Studio v{}", env!("CARGO_PKG_VERSION"));

    tauri::Builder::default()
        .plugin(tauri_plugin_sql::Builder::new().build())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_os::init())
        .invoke_handler(tauri::generate_handler![
            commands::get_app_version,
            commands::get_platform_info,
            commands::open_app_folder,
        ])
        .setup(|app| {
            info!("HealthCode Studio setup complete");

            // Set up global error handler
            let window = app.get_webview_window("main").expect("Failed to get main window");

            // Log window creation
            info!("Main window created successfully");
            info!("Window title: HealthCode Studio");
            info!("Window label: main");

            // Set window title
            window.set_title("HealthCode Studio").map_err(|e| {
                error!("Failed to set window title: {}", e);
                e
            })?;

            Ok(())
        })
        .on_window_event(|window, event| {
            match event {
                tauri::WindowEvent::CloseRequested { .. } => {
                    info!("Window close requested");
                }
                tauri::WindowEvent::Focused(focused) => {
                    if *focused {
                        info!("Window focused");
                    }
                }
                _ => {}
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
