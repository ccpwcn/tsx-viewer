/**
 * qoder/canvas 组件的浏览器端 stub 实现。
 * 这些 stub 用基础 HTML 元素模拟 Qoder Canvas 的布局组件，
 * 图表部分使用 Chart.js 渲染，使 .canvas.tsx 报告文件可以在 tsx-viewer 中可视化。
 */

import React from 'react';
import Chart from 'chart.js/auto';

const h = React.createElement;
const useEffect = React.useEffect;
const useRef = React.useRef;

// 图表默认配色
const CHART_COLORS = ['#1890ff', '#52c41a', '#fa8c16', '#ff4d4f', '#722ed1', '#13c2c2', '#eb2f96', '#faad14'];
const CHART_GRID_COLOR = '#f0f0f0';
const CHART_TEXT_COLOR = '#666';

// —— 基础布局组件 ——

export function ReportShell(props: any) {
  const { children, width, ariaLabel, ...rest } = props;
  return h('div', {
    className: 'canvas-report-shell',
    'aria-label': ariaLabel,
    style: {
      maxWidth: width === 'wide' ? '1200px' : '900px',
      margin: '0 auto',
      padding: '24px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      ...rest.style,
    },
  }, children);
}

export function Stack(props: any) {
  const { children, gap, ...rest } = props;
  const gapMap: Record<string, string> = {
    component: '16px',
    sectionCompact: '24px',
    section: '32px',
  };
  return h('div', {
    className: 'canvas-stack',
    style: {
      display: 'flex',
      flexDirection: 'column',
      gap: gapMap[gap] || gap || '16px',
      ...rest.style,
    },
  }, children);
}

export function H1(props: any) {
  const { children, ...rest } = props;
  return h('h1', {
    className: 'canvas-h1',
    style: {
      fontSize: '24px',
      fontWeight: 600,
      margin: 0,
      color: '#1a1a1a',
      ...rest.style,
    },
  }, children);
}

export function Text(props: any) {
  const { children, tone, ...rest } = props;
  const colorMap: Record<string, string> = {
    secondary: '#666',
    success: '#52c41a',
    warning: '#fa8c16',
    danger: '#ff4d4f',
  };
  return h('span', {
    className: 'canvas-text',
    style: {
      color: colorMap[tone] || '#333',
      fontSize: '14px',
      lineHeight: 1.6,
      ...rest.style,
    },
  }, children);
}

// —— 数据展示组件 ——

export function MetricsGrid(props: any) {
  const { items, columns, variant, ...rest } = props;
  const cols = columns || 4;
  return h('div', {
    className: 'canvas-metrics-grid',
    style: {
      display: 'grid',
      gridTemplateColumns: `repeat(${cols}, 1fr)`,
      gap: '16px',
      margin: '16px 0',
      ...rest.style,
    },
  }, (items || []).map((item: any, i: number) =>
    h('div', {
      key: i,
      className: 'canvas-metric-card',
      style: {
        padding: '16px',
        background: '#fafafa',
        borderRadius: '8px',
        border: '1px solid #e8e8e8',
      },
    },
      h('div', { style: { fontSize: '12px', color: '#999', marginBottom: '4px' } }, item.label),
      h('div', { style: { fontSize: '22px', fontWeight: 600, color: '#1a1a1a' } }, String(item.value ?? '—')),
      item.description ? h('div', { style: { fontSize: '12px', color: '#999', marginTop: '4px' } }, item.description) : null,
    )
  ));
}

export function Callout(props: any) {
  const { children, tone, title, ...rest } = props;
  const toneColors: Record<string, { bg: string; border: string; title: string }> = {
    info: { bg: '#e6f7ff', border: '#91d5ff', title: '#1890ff' },
    success: { bg: '#f6ffed', border: '#b7eb8f', title: '#52c41a' },
    warning: { bg: '#fffbe6', border: '#ffe58f', title: '#fa8c16' },
    danger: { bg: '#fff2f0', border: '#ffccc7', title: '#ff4d4f' },
  };
  const c = toneColors[tone] || toneColors.info;
  return h('div', {
    className: 'canvas-callout',
    style: {
      padding: '16px',
      background: c.bg,
      border: `1px solid ${c.border}`,
      borderRadius: '8px',
      margin: '8px 0',
      ...rest.style,
    },
  },
    title ? h('div', { style: { fontWeight: 600, color: c.title, marginBottom: '8px', fontSize: '14px' } }, title) : null,
    h('div', { style: { fontSize: '14px', lineHeight: 1.6, color: '#333' } }, children),
  );
}

export function Table(props: any) {
  const { headers, rows, rowTone, density, stickyHeader, ...rest } = props;
  const isCompact = density === 'compact';
  const padding = isCompact ? '6px 10px' : '10px 14px';
  const toneColors: Record<string, string> = {
    accent: '#f0f5ff',
    neutral: '#fafafa',
    default: 'transparent',
  };

  return h('div', {
    className: 'canvas-table-wrapper',
    style: { overflowX: 'auto', margin: '8px 0', ...rest.style },
  },
    h('table', {
      style: {
        width: '100%',
        borderCollapse: 'collapse',
        fontSize: '13px',
      },
    },
      h('thead', null,
        h('tr', null,
          (headers || []).map((header: string, i: number) =>
            h('th', {
              key: i,
              style: {
                padding,
                textAlign: 'left',
                fontWeight: 600,
                borderBottom: '2px solid #e8e8e8',
                background: stickyHeader ? '#fafafa' : 'transparent',
                position: stickyHeader ? 'sticky' : 'static',
                top: 0,
                whiteSpace: 'nowrap',
              },
            }, header)
          )
        )
      ),
      h('tbody', null,
        (rows || []).map((row: string[], ri: number) => {
          const tone = rowTone?.[ri] || 'default';
          return h('tr', {
            key: ri,
            style: { background: toneColors[tone] || 'transparent' },
          },
            row.map((cell: string, ci: number) =>
              h('td', {
                key: ci,
                style: {
                  padding,
                  borderBottom: '1px solid #f0f0f0',
                  whiteSpace: 'nowrap',
                  maxWidth: '300px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                },
              }, cell)
            )
          );
        })
      )
    )
  );
}

// —— 图表组件（使用 Chart.js 渲染）——

function useChart(canvasRef: any, type: string, data: any, options: any) {
  useEffect(() => {
    if (!canvasRef.current) {
      console.warn('[canvasStubs] canvas ref 未就绪');
      return;
    }

    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) {
      console.warn('[canvasStubs] 无法获取 canvas 2D 上下文');
      return;
    }

    let chart: Chart | null = null;
    try {
      chart = new Chart(ctx, { type: type as any, data, options });
    } catch (err) {
      console.error('[canvasStubs] Chart.js 渲染失败:', err);
    }

    return () => {
      if (chart) {
        chart.destroy();
      }
    };
  }, [canvasRef, type, JSON.stringify(data), JSON.stringify(options)]);
}

export function ChartContainer(props: any) {
  const { children, title, ariaLabel, ...rest } = props;
  return h('div', {
    className: 'canvas-chart-container',
    style: { margin: '8px 0', ...rest.style },
  },
    title ? h('div', { style: { fontWeight: 500, fontSize: '14px', color: '#333', marginBottom: '8px' } }, title) : null,
    children,
  );
}

export function ChartComparisonGrid(props: any) {
  const { children, ...rest } = props;
  return h('div', {
    className: 'canvas-chart-comparison-grid',
    style: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '16px',
      ...rest.style,
    },
  }, children);
}

export function LineChart(props: any) {
  const { categories, series, height, valueFormatter, ariaLabel } = props;
  const canvasRef = useRef(null);
  const chartHeight = height || 260;

  const data = {
    labels: categories || [],
    datasets: (series || []).map((s: any, i: number) => ({
      label: s.name || '',
      data: s.data || [],
      borderColor: CHART_COLORS[i % CHART_COLORS.length],
      backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + '20',
      borderWidth: 2,
      pointRadius: 3,
      pointHoverRadius: 5,
      tension: 0.3,
      fill: false,
    })),
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: (series || []).length > 1, labels: { color: CHART_TEXT_COLOR, font: { size: 12 } } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed.y;
            return `${ctx.dataset.label}: ${valueFormatter ? valueFormatter(val) : val}`;
          },
        },
      },
    },
    scales: {
      x: { grid: { color: CHART_GRID_COLOR }, ticks: { color: CHART_TEXT_COLOR, font: { size: 11 }, maxRotation: 45 } },
      y: {
        grid: { color: CHART_GRID_COLOR },
        ticks: {
          color: CHART_TEXT_COLOR,
          font: { size: 11 },
          callback: (val: any) => valueFormatter ? valueFormatter(val) : val,
        },
      },
    },
  };

  useChart(canvasRef, 'line', data, options);

  return h('div', { 'aria-label': ariaLabel, style: { height: chartHeight + 'px', position: 'relative', width: '100%' } },
    h('canvas', { ref: canvasRef, width: 800, height: chartHeight, style: { width: '100%', height: chartHeight + 'px' } }),
  );
}

export function BarChart(props: any) {
  const { categories, series, horizontal, valueFormatter, ariaLabel } = props;
  const canvasRef = useRef(null);

  const data = {
    labels: categories || [],
    datasets: (series || []).map((s: any, i: number) => ({
      label: s.name || '',
      data: s.data || [],
      backgroundColor: CHART_COLORS[i % CHART_COLORS.length] + 'cc',
      borderColor: CHART_COLORS[i % CHART_COLORS.length],
      borderWidth: 1,
      borderRadius: 3,
    })),
  };

  const options = {
    indexAxis: horizontal ? 'y' as const : 'x' as const,
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed[horizontal ? 'x' : 'y'];
            return `${categories?.[ctx.dataIndex] || ''}: ${valueFormatter ? valueFormatter(val) : val}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { color: CHART_GRID_COLOR },
        ticks: {
          color: CHART_TEXT_COLOR,
          font: { size: 11 },
          callback: (val: any) => valueFormatter ? valueFormatter(val) : val,
        },
      },
      y: { grid: { display: !horizontal, color: CHART_GRID_COLOR }, ticks: { color: CHART_TEXT_COLOR, font: { size: 11 } } },
    },
  };

  useChart(canvasRef, 'bar', data, options);

  const chartHeight = Math.max(200, (categories?.length || 0) * 36);
  return h('div', { 'aria-label': ariaLabel, style: { height: chartHeight + 'px', position: 'relative', width: '100%' } },
    h('canvas', { ref: canvasRef, width: 800, height: chartHeight, style: { width: '100%', height: chartHeight + 'px' } }),
  );
}

export function PieChart(props: any) {
  const { data: chartData, donut, valueFormatter, ariaLabel } = props;
  const canvasRef = useRef(null);
  const items = chartData || [];

  const data = {
    labels: items.map((d: any) => d.label),
    datasets: [{
      data: items.map((d: any) => d.value),
      backgroundColor: CHART_COLORS.slice(0, items.length),
      borderColor: '#fff',
      borderWidth: 2,
    }],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'right' as const, labels: { color: CHART_TEXT_COLOR, font: { size: 12 }, padding: 12 } },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed;
            return `${ctx.label}: ${valueFormatter ? valueFormatter(val) : val}`;
          },
        },
      },
    },
  };

  useChart(canvasRef, donut ? 'doughnut' : 'pie', data, options);

  return h('div', { 'aria-label': ariaLabel, style: { height: '320px', position: 'relative', width: '100%' } },
    h('canvas', { ref: canvasRef, width: 800, height: 320, style: { width: '100%', height: '320px' } }),
  );
}

// —— 报告段落组件 ——

export function ReportSection(props: any) {
  const { children, title, description, meta, divided, ...rest } = props;
  return h('section', {
    className: 'canvas-report-section',
    style: {
      margin: divided ? '32px 0' : '16px 0',
      ...(divided ? { borderTop: '1px solid #e8e8e8', paddingTop: '24px' } : {}),
      ...rest.style,
    },
  },
    h('div', { style: { marginBottom: '16px' } },
      h('h2', { style: { fontSize: '18px', fontWeight: 600, color: '#1a1a1a', margin: '0 0 4px 0' } }, title),
      description ? h('p', { style: { fontSize: '13px', color: '#666', margin: '4px 0' } }, description) : null,
      meta ? h('div', { style: { fontSize: '12px', color: '#999', marginTop: '4px' } }, meta) : null,
    ),
    children,
  );
}

// 默认导出：将所有组件打包为模块对象
export default {
  ReportShell,
  Stack,
  H1,
  Text,
  MetricsGrid,
  Callout,
  Table,
  ChartContainer,
  ChartComparisonGrid,
  LineChart,
  BarChart,
  PieChart,
  ReportSection,
};
