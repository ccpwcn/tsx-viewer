<template>
  <div class="app">
    <DirectoryPicker
        @load="handleFilesLoaded"
        @error="handleError"
    />

    <div v-if="globalError" class="error-banner">
      {{ globalError }}
      <button @click="globalError = ''" class="close-btn">×</button>
    </div>

    <div class="main-content">
      <div class="sidebar" :style="{ width: sidebarWidth + 'px' }">
        <div class="sidebar-header">
          <span class="file-count">共 {{ sortedFiles.length }} 个文件</span>
          <div class="sort-buttons">
            <button
                class="sort-btn"
                :class="{ active: sortBy === 'name' }"
                @click="toggleSort('name')"
                :title="sortBy === 'name' ? (sortOrder === 'asc' ? '名称正序' : '名称倒序') : '按名称排序'"
            >
              名称
              <span class="sort-arrow" v-if="sortBy === 'name'">{{ sortOrder === 'asc' ? '↓' : '↑' }}</span>
            </button>
            <button
                class="sort-btn"
                :class="{ active: sortBy === 'time' }"
                @click="toggleSort('time')"
                :title="sortBy === 'time' ? (sortOrder === 'asc' ? '时间正序' : '时间倒序') : '按修改时间排序'"
            >
              时间
              <span class="sort-arrow" v-if="sortBy === 'time'">{{ sortOrder === 'asc' ? '↓' : '↑' }}</span>
            </button>
          </div>
        </div>
        <ul class="file-list">
          <li
              v-for="file in sortedFiles"
              :key="file.name"
              :class="{ active: selectedFile?.name === file.name }"
              @click="selectFile(file)"
          >
            <span class="file-name" :title="file.name">{{ file.name }}</span>
          </li>
        </ul>
      </div>

      <div class="resize-handle" @mousedown="startResize"></div>

      <div class="preview-area">
        <div v-if="!selectedFile" class="placeholder">
          请选择左侧文件进行预览
        </div>
        <TsxPreview
            v-else
            :code="selectedFile.content"
            :filename="selectedFile.name"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DirectoryPicker from './components/DirectoryPicker.vue';
import TsxPreview from './components/TsxPreview.vue';

interface TsxFile {
  name: string;
  path: string;
  content: string;
  lastModified: number;
}

const files = ref<TsxFile[]>([]);
const selectedFile = ref<TsxFile | null>(null);
const globalError = ref('');

// 排序
const sortBy = ref<'name' | 'time'>('name');
const sortOrder = ref<'asc' | 'desc'>('asc');

function toggleSort(field: 'name' | 'time') {
  if (sortBy.value === field) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortBy.value = field;
    sortOrder.value = 'asc';
  }
}

const sortedFiles = computed(() => {
  const list = [...files.value];
  const dir = sortOrder.value === 'asc' ? 1 : -1;
  if (sortBy.value === 'name') {
    list.sort((a, b) => a.name.localeCompare(b.name) * dir);
  } else {
    list.sort((a, b) => (a.lastModified - b.lastModified) * dir);
  }
  return list;
});

// 可拖动分隔栏
const sidebarWidth = ref(280);
const MIN_SIDEBAR = 180;
const MAX_SIDEBAR_RATIO = 0.5;

function startResize(e: MouseEvent) {
  e.preventDefault();
  const startX = e.clientX;
  const startWidth = sidebarWidth.value;

  function onMove(ev: MouseEvent) {
    const maxW = window.innerWidth * MAX_SIDEBAR_RATIO;
    sidebarWidth.value = Math.max(MIN_SIDEBAR, Math.min(maxW, startWidth + ev.clientX - startX));
  }

  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  document.body.style.cursor = 'col-resize';
  document.body.style.userSelect = 'none';
  document.addEventListener('mousemove', onMove);
  document.addEventListener('mouseup', onUp);
}

function handleFilesLoaded(loadedFiles: TsxFile[]) {
  globalError.value = '';
  files.value = loadedFiles;

  if (files.value.length > 0) {
    selectFile(files.value[0]);
  }
}

function selectFile(file: TsxFile) {
  selectedFile.value = file;
}

function handleError(message: string) {
  globalError.value = message;
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.app {
  height: 100vh;
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}

.error-banner {
  background: #fff2f0;
  border: 1px solid #ffccc7;
  color: #ff4d4f;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.close-btn {
  background: none;
  border: none;
  font-size: 20px;
  cursor: pointer;
  color: #ff4d4f;
}

.main-content {
  flex: 1;
  display: flex;
  overflow: hidden;
}

.sidebar {
  border-right: none;
  display: flex;
  flex-direction: column;
  background: #fafafa;
  flex-shrink: 0;
}

.sidebar-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  border-bottom: 1px solid #e8e8e8;
  gap: 8px;
}

.file-count {
  font-size: 12px;
  color: #666;
  white-space: nowrap;
}

.sort-buttons {
  display: flex;
  gap: 4px;
}

.sort-btn {
  padding: 2px 8px;
  border: 1px solid #d9d9d9;
  border-radius: 3px;
  background: white;
  font-size: 11px;
  color: #666;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 2px;
  transition: all 0.15s;
}

.sort-btn:hover {
  border-color: #1890ff;
  color: #1890ff;
}

.sort-btn.active {
  background: #1890ff;
  border-color: #1890ff;
  color: white;
}

.sort-arrow {
  font-size: 10px;
}

.file-list {
  flex: 1;
  overflow-y: auto;
  overflow-x: hidden;
  list-style: none;
}

.file-list li {
  padding: 6px 12px;
  cursor: pointer;
  border-bottom: 1px solid #f0f0f0;
  transition: background 0.15s;
}

.file-list li:hover {
  background: #e6f7ff;
}

.file-list li.active {
  background: #1890ff;
  color: white;
}

.file-name {
  font-size: 13px;
  word-break: break-all;
  line-height: 1.4;
}

.resize-handle {
  width: 4px;
  cursor: col-resize;
  background: #e8e8e8;
  flex-shrink: 0;
  transition: background 0.15s;
}

.resize-handle:hover {
  background: #1890ff;
}

.preview-area {
  flex: 1;
  overflow: auto;
  background: white;
  min-width: 0;
}

.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #999;
  font-size: 16px;
}
</style>
