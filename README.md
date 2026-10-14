# TSX Viewer

一款用于预览 Qoder Canvas `.canvas.tsx` 报告文件的桌面应用。基于 [Tauri](https://tauri.app/)（Rust + WebView2）、[Vue 3](https://vuejs.org/) 和 [React](https://react.dev/) 构建。

![版本](https://img.shields.io/badge/version-1.0.1-blue)
![许可证](https://img.shields.io/badge/license-MIT-green)
![平台](https://img.shields.io/badge/platform-Windows-lightgrey)

## 功能特性

- **目录浏览** — 选择文件夹后即可预览其中所有 `.canvas.tsx` 文件
- **实时渲染** — 通过 Babel 即时编译 TSX 并用 React 18 渲染
- **图表支持** — 折线图、柱状图、饼图，基于 Chart.js
- **布局组件** — ReportShell、Stack、MetricsGrid、Table、Callout 等
- **目录历史** — 记忆最近打开的文件夹，支持下拉快速访问
- **自动加载** — 首次启动时若程序所在目录包含 `.tsx` 文件则自动打开
- **命令行支持** — 可通过命令行参数直接指定目录路径

## 技术栈

| 层级 | 技术 |
|------|------|
| 后端 | Rust + Tauri v2 |
| 前端框架 | Vue 3 + Vite |
| TSX 渲染 | React 18 + Babel Standalone |
| 图表 | Chart.js 4 |
| 打包 | NSIS（Windows） |

## 安装

### 从 Release 安装

从 [Releases](https://github.com/ccpwcn/tsx-viewer/releases) 页面下载最新的 NSIS 安装包并运行。

### 从源码构建

**前置条件：**

- [Rust](https://www.rust-lang.org/tools/install)（最新稳定版）
- [Node.js](https://nodejs.org/)（v20+）
- [Microsoft Edge WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/)（Windows）

```bash
git clone https://github.com/ccpwcn/tsx-viewer.git
cd tsx-viewer
npm install
npm run tauri build
```

安装包将生成在 `src-tauri/target/release/bundle/nsis/` 目录下。

## 使用方法

### 图形界面

1. 启动 TSX Viewer
2. 点击 **打开** 按钮选择目录，或直接在路径框中输入路径
3. 在左侧面板选择 `.canvas.tsx` 文件，右侧即可预览

### 命令行

```bash
tsx-viewer.exe "C:\path\to\tsx\files"
```

## 项目结构

```
tsx-viewer/
├── src/                    # Vue 3 前端
│   ├── components/         # Vue 组件
│   │   ├── App.vue         # 主布局
│   │   ├── DirectoryPicker.vue
│   │   └── TsxPreview.vue  # TSX 编译与渲染
│   ── utils/
│       ├── canvasStubs.ts  # Qoder Canvas 组件桩实现
│       └── history.ts      # 目录历史管理
├── src-tauri/              # Rust 后端
│   ├── src/
│   │   ├── lib.rs          # Tauri 命令
│   │   └── main.rs         # 入口 + WebView2 检测
│   ├── capabilities/       # Tauri 权限配置
│   ├── icons/              # 应用图标
│   ├── Cargo.toml
│   └── tauri.conf.json
├── package.json
├── vite.config.ts
└── README.md
```

## 工作原理

1. Rust 后端从选定目录读取 `.tsx` 文件内容并发送到前端
2. `TsxPreview.vue` 使用 `@babel/standalone` 将 TSX 编译为 JavaScript（CommonJS）
3. 自定义 `require()` 函数将依赖映射到 npm 打包的 React、ReactDOM 和 Canvas 桩组件
4. 编译后的组件通过 `ReactDOM.createRoot()` 渲染到容器元素中
5. Canvas 桩组件（LineChart、BarChart、PieChart 等）使用 Chart.js 绘制图表

## 许可证

MIT © ccpwcn
