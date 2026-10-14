// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

#[cfg(target_os = "windows")]
fn show_message_box(title: &str, message: &str) {
    use std::ffi::OsStr;
    use std::os::windows::ffi::OsStrExt;

    extern "system" {
        fn MessageBoxW(
            hwnd: *mut std::ffi::c_void,
            lp_text: *const u16,
            lp_caption: *const u16,
            u_type: u32,
        ) -> i32;
    }

    const MB_ICONERROR: u32 = 0x00000010;
    const MB_OK: u32 = 0x00000000;

    let title_wide: Vec<u16> = OsStr::new(title).encode_wide().chain(std::iter::once(0)).collect();
    let message_wide: Vec<u16> = OsStr::new(message).encode_wide().chain(std::iter::once(0)).collect();

    unsafe {
        MessageBoxW(std::ptr::null_mut(), message_wide.as_ptr(), title_wide.as_ptr(), MB_ICONERROR | MB_OK);
    }
}

fn check_webview2() -> bool {
    // 检查 WebView2 是否已安装
    // 方法 1: 检查注册表 (64 位系统上的 32 位视图)
    let reg_check = std::process::Command::new("reg")
        .args([
            "query",
            r"HKLM\SOFTWARE\WOW6432Node\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
            "/v",
            "pv",
        ])
        .output();

    if let Ok(output) = reg_check {
        if output.status.success() {
            return true;
        }
    }

    // 方法 2: 检查注册表 (机器级，原生视图)
    let reg_check2 = std::process::Command::new("reg")
        .args([
            "query",
            r"HKLM\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
            "/v",
            "pv",
        ])
        .output();

    if let Ok(output) = reg_check2 {
        if output.status.success() {
            return true;
        }
    }

    // 方法 3: 检查注册表 (用户级)
    let reg_check_user = std::process::Command::new("reg")
        .args([
            "query",
            r"HKCU\SOFTWARE\Microsoft\EdgeUpdate\Clients\{F3017226-FE2A-4295-8BDF-00C3A9A7E4C5}",
            "/v",
            "pv",
        ])
        .output();

    if let Ok(output) = reg_check_user {
        if output.status.success() {
            return true;
        }
    }

    // 方法 4: 检查 WebView2 运行时文件是否存在
    let program_files_x86 = std::env::var("ProgramFiles(x86)").unwrap_or_else(|_| "C:\\Program Files (x86)".to_string());
    let program_files = std::env::var("ProgramFiles").unwrap_or_else(|_| "C:\\Program Files".to_string());

    let paths_to_check = [
        format!("{}\\Microsoft\\EdgeWebView\\Application\\msedgewebview2.exe", program_files_x86),
        format!("{}\\Microsoft\\EdgeWebView\\Application\\msedgewebview2.exe", program_files),
        format!("{}\\Microsoft\\Edge\\Application\\msedge.exe", program_files_x86),
        format!("{}\\Microsoft\\Edge\\Application\\msedge.exe", program_files),
    ];

    for path in &paths_to_check {
        if std::path::Path::new(path).exists() {
            return true;
        }
    }

    false
}

fn handle_missing_webview2() {
    #[cfg(target_os = "windows")]
    {
        show_message_box(
            "TSX Viewer - 缺少 WebView2",
            "本程序需要 Microsoft Edge WebView2 运行时才能运行。\n\n\
             点击确定后将打开下载页面，请安装后重新启动本程序。"
        );

        // 打开 WebView2 下载页面
        std::process::Command::new("cmd")
            .args(["/C", "start", "https://developer.microsoft.com/en-us/microsoft-edge/webview2/"])
            .output()
            .ok();
    }

    #[cfg(not(target_os = "windows"))]
    {
        eprintln!("TSX Viewer requires WebView2 runtime to run on Windows.");
        eprintln!("Please download it from: https://developer.microsoft.com/en-us/microsoft-edge/webview2/");
    }
}

fn main() {
    // 检查 WebView2 是否已安装
    if !check_webview2() {
        handle_missing_webview2();
        std::process::exit(1);
    }

    let args: Vec<String> = std::env::args().collect();
    let initial_dir = args.get(1).cloned().unwrap_or_default();

    // Store the initial directory in an environment variable for the frontend to access
    if !initial_dir.is_empty() {
        std::env::set_var("TSX_VIEWER_INITIAL_DIR", &initial_dir);
    }

    tsx_viewer_lib::run()
}
