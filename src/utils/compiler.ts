// @ts-ignore - compile is not used directly, kept for reference
// import { compile } from '@vue/compiler-sfc';

// 简单的 TSX 转 JS 处理（实际项目中建议使用 @babel/standalone）
export function compileTsx(code: string, filename: string) {
    // 这里使用简化方案：将 TSX 包装为 Vue 组件
    // 实际生产环境建议集成 Babel  standalone 进行真正的 TSX -> JS 转换

    // 提取组件名（从 export default 或文件名）
    const componentName = filename.replace(/\.tsx$/, '').replace(/[^a-zA-Z0-9]/g, '_');

    // 包装为 Vue 3 组件选项
    const wrappedCode = `
    import { defineComponent, h } from 'vue';
    import * as React from 'react';
    import { createRoot } from 'react-dom/client';
    
    ${code}
    
    export default defineComponent({
      name: '${componentName}',
      setup() {
        return () => h('div', { 
          ref: (el) => {
            if (el && !el._reactRoot) {
              const root = createRoot(el);
              // 假设 TSX 默认导出组件
              const Component = (typeof exports !== 'undefined' && exports.default) 
                ? exports.default 
                : (typeof module !== 'undefined' ? module.exports : null);
              
              if (Component) {
                root.render(React.createElement(Component));
                el._reactRoot = root;
              }
            }
          }
        });
      }
    });
  `;

    return wrappedCode;
}

// 更实用的方案：使用 Blob URL + import()
export async function loadTsxModule(code: string) {
    // 将代码转为 Blob URL，通过动态 import 加载
    const blob = new Blob([code], { type: 'text/javascript' });
    const url = URL.createObjectURL(blob);
    try {
        const module = await import(/* @vite-ignore */ url);
        return module;
    } finally {
        URL.revokeObjectURL(url);
    }
}