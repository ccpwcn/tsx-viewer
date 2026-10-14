use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use tauri::command;

#[derive(Serialize)]
struct FileInfo {
    name: String,
    path: String,
    content: String,
    last_modified: u64,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(rename_all = "camelCase")]
struct HistoryEntry {
    path: String,
    last_used: u64,
}

fn get_history_file_path() -> PathBuf {
    let home = std::env::var("USERPROFILE").unwrap_or_else(|_| "C:\\Users\\Default".to_string());
    PathBuf::from(home).join(".tsx-viewer-history.json")
}

#[command]
fn load_history() -> Result<Vec<HistoryEntry>, String> {
    let path = get_history_file_path();
    if path.exists() {
        let content = std::fs::read_to_string(&path)
            .map_err(|e| format!("读取历史记录失败：{}", e))?;
        let history: Vec<HistoryEntry> = serde_json::from_str(&content)
            .map_err(|e| format!("解析历史记录失败：{}", e))?;
        Ok(history)
    } else {
        Ok(Vec::new())
    }
}

#[command]
fn save_history(history: Vec<HistoryEntry>) -> Result<(), String> {
    let path = get_history_file_path();
    let content = serde_json::to_string_pretty(&history)
        .map_err(|e| format!("序列化历史记录失败：{}", e))?;
    std::fs::write(&path, content)
        .map_err(|e| format!("写入历史记录失败：{}", e))?;
    Ok(())
}

#[command]
fn list_tsx_files(dir_path: String) -> Result<Vec<FileInfo>, String> {
    let path = PathBuf::from(&dir_path);

    if !path.exists() {
        return Err(format!("目录不存在：{}", dir_path));
    }

    if !path.is_dir() {
        return Err(format!("路径不是目录：{}", dir_path));
    }

    let mut files = Vec::new();

    let entries = std::fs::read_dir(&path).map_err(|e| format!("读取目录失败：{}", e))?;

    for entry in entries {
        let entry = entry.map_err(|e| format!("读取条目失败：{}", e))?;
        let file_type = entry.file_type().map_err(|e| format!("获取文件类型失败：{}", e))?;

        if file_type.is_file() {
            let file_name = entry.file_name();
            let name = file_name.to_string_lossy().to_string();

            if name.ends_with(".tsx") {
                let file_path = entry.path();
                let content = std::fs::read_to_string(&file_path)
                    .map_err(|e| format!("读取文件 {} 失败：{}", name, e))?;

                let metadata = entry.metadata()
                    .map_err(|e| format!("获取文件元数据失败：{}", e))?;

                let last_modified = metadata.modified()
                    .map(|t| {
                        t.duration_since(std::time::UNIX_EPOCH)
                            .unwrap_or_default()
                            .as_millis() as u64
                    })
                    .unwrap_or(0);

                files.push(FileInfo {
                    name,
                    path: file_path.to_string_lossy().to_string(),
                    content,
                    last_modified,
                });
            }
        }
    }

    Ok(files)
}

#[command]
fn get_app_version() -> String {
    env!("CARGO_PKG_VERSION").to_string()
}

#[command]
fn get_initial_dir() -> Option<String> {
    std::env::var("TSX_VIEWER_INITIAL_DIR").ok()
}

#[command]
fn get_app_dir() -> String {
    std::env::current_exe()
        .ok()
        .and_then(|p| p.parent().map(|p| p.to_path_buf()))
        .unwrap_or_default()
        .to_string_lossy()
        .to_string()
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_dialog::init())
        .invoke_handler(tauri::generate_handler![
            list_tsx_files,
            get_app_version,
            get_initial_dir,
            get_app_dir,
            load_history,
            save_history
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
