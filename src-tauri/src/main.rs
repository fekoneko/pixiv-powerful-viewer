// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};

mod handlers;

pub struct Pids {
    read_collection_pid: Arc<Mutex<usize>>,
}

fn main() {
    tauri::Builder::default()
        .manage(Pids {
            read_collection_pid: Arc::new(Mutex::new(0)),
        })
        .invoke_handler(tauri::generate_handler![handlers::read_collection])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
