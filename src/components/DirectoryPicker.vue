<template>
  <div class="directory-picker">
    <span class="path-label">目录</span>
    <div class="path-input-wrapper">
      <input
          v-model="pathDisplay"
          type="text"
          placeholder="输入目录路径或选择历史..."
          class="path-input"
          @keyup.enter="handleLoad"
          @input="onPathInput"
          @focus="showHistory = true"
      />
      <div v-if="showHistory && history.length > 0" class="history-dropdown">
        <div class="history-header">
          <span>历史记录</span>
          <button class="clear-btn" @click="handleClearHistory" title="清除全部历史">×</button>
        </div>
        <ul class="history-list">
          <li v-for="(entry, index) in history" :key="index" class="history-item">
            <span class="history-path" @click="selectHistory(entry.path)" :title="entry.path">
              {{ entry.path }}
            </span>
            <button class="delete-btn" @click="deleteHistory(entry.path)" title="删除">×</button>
          </li>
        </ul>
      </div>
    </div>
    <button @click="selectDirectory" class="btn btn-open">
      <span v-if="!isLoading">📁 打开</span>
      <span v-else>⏳</span>
    </button>
    <button @click="handleLoad" class="btn btn-load" :disabled="!pathDisplay.trim()">
      加载
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { invoke } from '@tauri-apps/api/core';
import { loadHistory, addToHistory, removeFromHistory, clearHistory, type HistoryEntry } from '../utils/history';

const emit = defineEmits<{
  (e: 'load', files: Array<{ name: string; path: string; content: string; lastModified: number }>): void
  (e: 'error', message: string): void
  (e: 'pathChange', path: string): void
}>();

const pathDisplay = ref('');
const isLoading = ref(false);
const pathManuallyEdited = ref(false);
const history = ref<HistoryEntry[]>([]);
const showHistory = ref(false);

function onPathInput() {
  pathManuallyEdited.value = true;
}

// 点击外部关闭历史下拉
function handleClickOutside(e: MouseEvent) {
  const target = e.target as HTMLElement;
  if (!target.closest('.path-input-wrapper')) {
    showHistory.value = false;
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside);
  loadHistoryData();
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});

async function loadHistoryData() {
  history.value = await loadHistory();
}

async function selectDirectory() {
  try {
    isLoading.value = true;
    const { open } = await import('@tauri-apps/plugin-dialog');
    const selected = await open({
      directory: true,
      multiple: false,
      title: '选择 TSX 文件目录'
    });

    if (selected) {
      const dirPath = Array.isArray(selected) ? selected[0] : selected;
      pathDisplay.value = dirPath;
      pathManuallyEdited.value = false;
      emit('pathChange', dirPath);
      await handleLoad();
    }
  } catch (err: any) {
    emit('error', `无法访问目录：${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

async function handleLoad() {
  const dirPath = pathDisplay.value.trim();

  if (!dirPath) {
    emit('error', '请输入目录路径');
    return;
  }

  showHistory.value = false;

  try {
    isLoading.value = true;
    const files = await invoke<Array<{ name: string; path: string; content: string; last_modified: number }>>('list_tsx_files', {
      dirPath
    });

    if (files.length === 0) {
      emit('error', '该目录下没有找到 .tsx 文件');
    } else {
      // 添加到历史记录
      await addToHistory(dirPath);
      await loadHistoryData();

      const normalizedFiles = files.map(f => ({
        name: f.name,
        path: f.path,
        content: f.content,
        lastModified: f.last_modified
      }));
      emit('load', normalizedFiles);
    }
  } catch (err: any) {
    emit('error', `读取目录失败：${err.message}`);
  } finally {
    isLoading.value = false;
  }
}

function selectHistory(dirPath: string) {
  pathDisplay.value = dirPath;
  pathManuallyEdited.value = false;
  showHistory.value = false;
  handleLoad();
}

async function deleteHistory(dirPath: string) {
  await removeFromHistory(dirPath);
  await loadHistoryData();
}

async function handleClearHistory() {
  await clearHistory();
  await loadHistoryData();
}

// 组件挂载时检查是否有初始目录
onMounted(async () => {
  try {
    const initialDir = await invoke<string | null>('get_initial_dir');
    if (initialDir) {
      pathDisplay.value = initialDir;
      await handleLoad();
      return;
    }

    // 没有初始目录，检查历史记录
    const hist = await loadHistory();
    if (hist.length > 0) {
      // 有历史记录，不自动加载，让用户选择
      return;
    }

    // 没有历史记录，检查程序所在目录
    const appDir = await invoke<string>('get_app_dir');
    if (appDir) {
      try {
        const files = await invoke<Array<{ name: string }>>('list_tsx_files', { dirPath: appDir });
        if (files.length > 0) {
          pathDisplay.value = appDir;
          await handleLoad();
        }
      } catch {
        // 程序目录没有 tsx 文件，什么也不做
      }
    }
  } catch {
    // 忽略错误，用户手动选择
  }
});
</script>

<style scoped>
.directory-picker {
  display: flex;
  gap: 8px;
  padding: 12px;
  background: #f5f5f5;
  border-bottom: 1px solid #ddd;
  align-items: center;
}

.path-label {
  font-size: 14px;
  color: #333;
  white-space: nowrap;
  font-weight: 500;
}

.path-input-wrapper {
  flex: 1;
  position: relative;
}

.path-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-family: monospace;
  box-sizing: border-box;
}

.history-dropdown {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: 4px;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 1000;
  max-height: 300px;
  overflow-y: auto;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #eee;
  font-size: 12px;
  color: #666;
}

.clear-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 16px;
  padding: 0 4px;
}

.clear-btn:hover {
  color: #ff4d4f;
}

.history-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  border-bottom: 1px solid #f5f5f5;
}

.history-item:last-child {
  border-bottom: none;
}

.history-item:hover {
  background: #f5f5f5;
}

.history-path {
  flex: 1;
  font-size: 13px;
  font-family: monospace;
  color: #333;
  cursor: pointer;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.history-path:hover {
  color: #1890ff;
}

.delete-btn {
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 14px;
  padding: 0 4px;
  margin-left: 8px;
}

.delete-btn:hover {
  color: #ff4d4f;
}

.btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-open {
  background: #1890ff;
  color: white;
}

.btn-open:hover {
  background: #40a9ff;
}

.btn-load {
  background: #52c41a;
  color: white;
}

.btn-load:disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}
</style>
