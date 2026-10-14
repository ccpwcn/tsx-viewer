<template>
  <div class="tsx-preview">
    <div v-if="error" class="error">
      <h3>渲染错误</h3>
      <pre>{{ error }}</pre>
    </div>
    <div v-show="!error" ref="containerRef" class="preview-container"></div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted, nextTick } from 'vue';
import * as Babel from '@babel/standalone';
import * as React from 'react';
import * as ReactDOM from 'react-dom/client';
import canvasStubs from '../utils/canvasStubs';

const props = defineProps<{
  code: string;
  filename: string;
}>();

const containerRef = ref<HTMLElement>();
const error = ref('');
let reactRoot: ReactDOM.Root | null = null;

// 清理函数
function cleanup() {
  if (reactRoot && containerRef.value) {
    try { reactRoot.unmount(); } catch {}
    reactRoot = null;
  }
  if (containerRef.value) {
    containerRef.value.innerHTML = '';
  }
}

// 编译并渲染 TSX
async function renderTsx() {
  if (!props.code) return;

  await nextTick();
  if (!containerRef.value) {
    console.warn('[TsxPreview] containerRef 尚未就绪，跳过渲染');
    return;
  }

  cleanup();
  error.value = '';

  try {
    const result = Babel.transform(props.code, {
      presets: [
        ['env', { modules: 'commonjs' }],
        'react',
        'typescript'
      ],
      filename: props.filename,
    });

    const exports: any = {};
    const module = { exports };
    const require = (name: string) => {
      if (name === 'react' || name === 'React') return React;
      if (name === 'react-dom' || name === 'react-dom/client' || name === 'ReactDOM') return ReactDOM;
      if (name === 'react/jsx-runtime' || name === 'react/jsx-dev-runtime') {
        return {
          jsx: React.createElement,
          jsxs: React.createElement,
          jsxDEV: React.createElement,
          Fragment: React.Fragment,
        };
      }
      if (name === 'qoder/canvas') return canvasStubs;
      throw new Error(`未知依赖：${name}`);
    };

    const func = new Function('exports', 'module', 'require', 'React', result.code || '');
    func(exports, module, require, React);

    const Component = module.exports.default || module.exports;

    if (!Component) {
      throw new Error('未找到默认导出的组件');
    }

    reactRoot = ReactDOM.createRoot(containerRef.value);
    reactRoot.render(React.createElement(Component));

  } catch (err: any) {
    error.value = err.message || '编译失败';
    console.error('[TsxPreview] 渲染错误:', err);
  }
}

watch(() => props.code, renderTsx, { immediate: true });
onUnmounted(cleanup);
</script>

<style scoped>
.tsx-preview {
  width: 100%;
  height: 100%;
  overflow: auto;
  padding: 20px;
}

.error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #ff4d4f;
  flex-direction: column;
}

.error pre {
  background: #fff2f0;
  padding: 12px;
  border-radius: 4px;
  max-width: 100%;
  overflow: auto;
}

.preview-container {
  min-height: 400px;
  border: 1px dashed #d9d9d9;
  border-radius: 4px;
  padding: 16px;
}
</style>
