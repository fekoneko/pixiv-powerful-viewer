// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

use std::sync::Arc;
use tokio::sync::Mutex;

pub struct Pids {
    read_collection_pid: Arc<Mutex<usize>>,
}

fn main() {
    tauri::Builder::default()
        .manage(Pids {
            read_collection_pid: Arc::new(Mutex::new(0)),
        })
        .invoke_handler(tauri::generate_handler![
            commands::read_collection,
            commands::read_collection_list,
            commands::write_collection_list,
            commands::open_external,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
