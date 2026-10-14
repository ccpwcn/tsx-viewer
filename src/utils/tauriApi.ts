/**
 * Tauri API 封装
 */

interface FileInfo {
  name: string;
  path: string;
  content: string;
  last_modified: number;
}

// 检测是否在 Tauri 环境中
export function isTauri(): boolean {
  return '__TAURI_INTERNALS__' in window || '__TAURI__' in window;
}

// 调用 Rust 后端命令
async function invoke<T>(cmd: string, args?: Record<string, unknown>): Promise<T> {
  if (isTauri()) {
    const { invoke: tauriInvoke } = await import('@tauri-apps/api/core');
    return tauriInvoke<T>(cmd, args);
  }
  throw new Error('非 Tauri 环境');
}

// 列出目录中的 TSX 文件
export async function listTsxFiles(dirPath: string): Promise<FileInfo[]> {
  return invoke<FileInfo[]>('list_tsx_files', { dirPath });
}

// 获取应用版本
export async function getAppVersion(): Promise<string> {
  return invoke<string>('get_app_version');
}

// 获取初始目录（从命令行参数）
export function getInitialDir(): string | null {
  // 在 Tauri 环境中，通过环境变量传递
  return null; // 前端无法直接访问环境变量，需要通过命令获取
}
