// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]
#![allow(special_module_name)]

mod commands;
mod lib;

use lib::{SharedBuffer, Work};
use std::sync::Arc;
use tokio::sync::Mutex;

pub struct GlobalState {
    read_collection_pid: Arc<Mutex<usize>>,
    read_collection_finished: Arc<Mutex<bool>>,
    read_collection_works: SharedBuffer<Work>,
    read_collection_warnings: SharedBuffer<String>,
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .manage(GlobalState {
            read_collection_pid: Arc::new(Mutex::new(0)),
            read_collection_finished: Arc::new(Mutex::new(false)),
            read_collection_works: SharedBuffer(Arc::new(Mutex::new(vec![]))),
            read_collection_warnings: SharedBuffer(Arc::new(Mutex::new(vec![]))),
        })
        .invoke_handler(tauri::generate_handler![
            commands::start_reading_collection,
            commands::poll_next_collection_chunk,
            commands::read_collection_list,
            commands::write_collection_list,
            commands::open_external,
        ])
        .run(tauri::generate_context!())
        .expect("Error while running Tauri application");
}
