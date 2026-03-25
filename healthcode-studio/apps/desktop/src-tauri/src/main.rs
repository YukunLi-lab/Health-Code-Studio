// HealthCode Studio - Desktop Application Entry Point
// MIT License

#![cfg_attr(
    all(not(debug_assertions), target_os = "windows"),
    windows_subsystem = "windows"
)]

fn main() {
    healthcode_studio_lib::run()
}
