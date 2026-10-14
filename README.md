# TSX Viewer

A desktop application for previewing Qoder Canvas `.canvas.tsx` report files. Built with [Tauri](https://tauri.app/) (Rust + WebView2), [Vue 3](https://vuejs.org/), and [React](https://react.dev/).

![Version](https://img.shields.io/badge/version-1.0.1-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-Windows-lightgrey)

## Features

- **Directory browsing** — select a folder and instantly preview all `.canvas.tsx` files within
- **Rich rendering** — compiles TSX on-the-fly via Babel and renders with React 18
- **Chart support** — Line, Bar, and Pie charts powered by Chart.js
- **Layout components** — ReportShell, Stack, MetricsGrid, Table, Callout, and more
- **Directory history** — remembers recently opened folders with quick access dropdown
- **Auto-load** — automatically opens the program directory on first launch if it contains `.tsx` files
- **CLI support** — pass a directory path as a command-line argument to open it directly

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Rust + Tauri v2 |
| Frontend Shell | Vue 3 + Vite |
| TSX Rendering | React 18 + Babel Standalone |
| Charts | Chart.js 4 |
| Packaging | NSIS (Windows) |

## Installation

### From Release

Download the latest NSIS installer from the [Releases](https://github.com/ccpwcn/tsx-viewer/releases) page and run it.

### From Source

**Prerequisites:**

- [Rust](https://www.rust-lang.org/tools/install) (latest stable)
- [Node.js](https://nodejs.org/) (v20+)
- [Microsoft Edge WebView2](https://developer.microsoft.com/en-us/microsoft-edge/webview2/) (Windows)

```bash
git clone https://github.com/ccpwcn/tsx-viewer.git
cd tsx-viewer
npm install
npm run tauri build
```

The installer will be generated at `src-tauri/target/release/bundle/nsis/`.

## Usage

### GUI

1. Launch TSX Viewer
2. Click the **Open** button to select a directory, or type a path directly
3. Select a `.canvas.tsx` file from the left panel to preview it on the right

### Command Line

```bash
tsx-viewer.exe "C:\path\to\tsx\files"
```

## Project Structure

```
tsx-viewer/
├── src/                    # Vue 3 frontend
│   ├── components/         # Vue components
│   │   ├── App.vue         # Main layout
│   │   ├── DirectoryPicker.vue
│   │   └── TsxPreview.vue  # TSX compilation & rendering
│   └── utils/
│       ├── canvasStubs.ts  # Qoder Canvas component stubs
│       └── history.ts      # Directory history management
├── src-tauri/              # Rust backend
│   ├── src/
│   │   ├── lib.rs          # Tauri commands
│   │   └── main.rs         # Entry point + WebView2 check
│   ├── capabilities/       # Tauri permissions
│   ├── icons/              # App icons
│   ├── Cargo.toml
│   └── tauri.conf.json
── package.json
├── vite.config.ts
└── README.md
```

## How It Works

1. The Rust backend reads `.tsx` files from the selected directory and sends their content to the frontend
2. `TsxPreview.vue` uses `@babel/standalone` to compile TSX → JavaScript (CommonJS)
3. A custom `require()` function maps dependencies to npm-bundled React, ReactDOM, and canvas stubs
4. The compiled component is rendered via `ReactDOM.createRoot()` into a container element
5. Canvas stub components (`LineChart`, `BarChart`, `PieChart`, etc.) render using Chart.js

## License

MIT © ccpwcn
