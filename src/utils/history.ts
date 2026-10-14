/**
 * 目录历史记录管理
 * 保存在用户主目录下的 .tsx-viewer-history.json
 */

import { invoke } from '@tauri-apps/api/core';

const MAX_HISTORY = 20;

export interface HistoryEntry {
  path: string;
  lastUsed: number;
}

export async function loadHistory(): Promise<HistoryEntry[]> {
  try {
    return await invoke<HistoryEntry[]>('load_history');
  } catch (err) {
    console.warn('加载历史记录失败:', err);
    return [];
  }
}

export async function saveHistory(history: HistoryEntry[]): Promise<void> {
  try {
    await invoke('save_history', { history });
  } catch (err) {
    console.warn('保存历史记录失败:', err);
  }
}

export async function addToHistory(dirPath: string): Promise<void> {
  const history = await loadHistory();

  // 移除已存在的路径
  const filtered = history.filter(h => h.path !== dirPath);

  // 添加到开头
  filtered.unshift({
    path: dirPath,
    lastUsed: Date.now()
  });

  // 限制数量
  const trimmed = filtered.slice(0, MAX_HISTORY);

  await saveHistory(trimmed);
}

export async function removeFromHistory(dirPath: string): Promise<void> {
  const history = await loadHistory();
  const filtered = history.filter(h => h.path !== dirPath);
  await saveHistory(filtered);
}

export async function clearHistory(): Promise<void> {
  await saveHistory([]);
}
