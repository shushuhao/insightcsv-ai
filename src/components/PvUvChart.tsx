'use client';

import { useEffect, useRef, useImperativeHandle, forwardRef } from 'react';

interface PvUvDataPoint {
  date: string;
  pv: number;
  uv: number;
}

export interface PvUvChartHandle {
  exportImage: () => void;
}

interface PvUvChartProps {
  data: PvUvDataPoint[];
}

const PvUvChart = forwardRef<PvUvChartHandle, PvUvChartProps>(function PvUvChart({ data }, ref) {
  const chartRef = useRef<HTMLDivElement>(null);
  const chartInstanceRef = useRef<ReturnType<typeof import('echarts')['init']> | null>(null);

  useImperativeHandle(ref, () => ({
    exportImage() {
      const chart = chartInstanceRef.current;
      if (!chart) return;
      const url = chart.getDataURL({
        type: 'png',
        pixelRatio: 2,
        backgroundColor: '#1e1130',
      });
      const a = document.createElement('a');
      a.href = url;
      a.download = `pv-uv-chart-${new Date().toISOString().slice(0, 10)}.png`;
      a.click();
    },
  }), []);

  useEffect(() => {
    if (!chartRef.current || data.length === 0) return;

    let chart: ReturnType<typeof import('echarts')['init']> | null = null;

    import('echarts').then((echarts) => {
      if (!chartRef.current) return;

      chart = echarts.init(chartRef.current, null, { renderer: 'canvas' });
      chartInstanceRef.current = chart;

      const option = {
        backgroundColor: 'transparent',
        tooltip: {
          trigger: 'axis',
          backgroundColor: 'rgba(15, 10, 40, 0.92)',
          borderColor: 'rgba(168, 85, 247, 0.4)',
          borderWidth: 1,
          textStyle: { color: '#e2d9f3', fontSize: 13 },
          axisPointer: {
            type: 'cross',
            lineStyle: { color: 'rgba(168, 85, 247, 0.5)', width: 1 },
            crossStyle: { color: 'rgba(168, 85, 247, 0.5)', width: 1 },
          },
        },
        legend: {
          data: ['PV（页面浏览量）', 'UV（独立访客）'],
          top: 8,
          textStyle: { color: '#c4b5fd', fontSize: 12 },
          icon: 'roundRect',
          itemWidth: 14,
          itemHeight: 8,
        },
        grid: {
          top: 52,
          left: 16,
          right: 20,
          bottom: 8,
          containLabel: true,
        },
        xAxis: {
          type: 'category',
          data: data.map((d) => d.date),
          boundaryGap: false,
          axisLine: { lineStyle: { color: 'rgba(255,255,255,0.15)' } },
          axisTick: { show: false },
          axisLabel: { color: '#a78bfa', fontSize: 11, margin: 10 },
          splitLine: { show: false },
        },
        yAxis: {
          type: 'value',
          axisLine: { show: false },
          axisTick: { show: false },
          axisLabel: { color: '#a78bfa', fontSize: 11 },
          splitLine: { lineStyle: { color: 'rgba(255,255,255,0.07)', type: 'dashed' } },
        },
        series: [
          {
            name: 'PV（页面浏览量）',
            type: 'line',
            data: data.map((d) => d.pv),
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2.5, color: '#a855f7' },
            itemStyle: { color: '#a855f7', borderColor: '#fff', borderWidth: 1.5 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(168, 85, 247, 0.35)' },
                  { offset: 1, color: 'rgba(168, 85, 247, 0.02)' },
                ],
              },
            },
          },
          {
            name: 'UV（独立访客）',
            type: 'line',
            data: data.map((d) => d.uv),
            smooth: true,
            symbol: 'circle',
            symbolSize: 6,
            lineStyle: { width: 2.5, color: '#22d3ee' },
            itemStyle: { color: '#22d3ee', borderColor: '#fff', borderWidth: 1.5 },
            areaStyle: {
              color: {
                type: 'linear',
                x: 0, y: 0, x2: 0, y2: 1,
                colorStops: [
                  { offset: 0, color: 'rgba(34, 211, 238, 0.28)' },
                  { offset: 1, color: 'rgba(34, 211, 238, 0.02)' },
                ],
              },
            },
          },
        ],
      };

      chart.setOption(option);

      const handleResize = () => chart?.resize();
      window.addEventListener('resize', handleResize);

      return () => {
        window.removeEventListener('resize', handleResize);
      };
    });

    return () => {
      chart?.dispose();
      chartInstanceRef.current = null;
    };
  }, [data]);

  return (
    <div>
      <div
        ref={chartRef}
        style={{ width: '100%', height: 300 }}
      />
      <div className="flex justify-end mt-2">
        <button
          onClick={() => {
            const chart = chartInstanceRef.current;
            if (!chart) return;
            const url = chart.getDataURL({ type: 'png', pixelRatio: 2, backgroundColor: '#1e1130' });
            const a = document.createElement('a');
            a.href = url;
            a.download = `pv-uv-chart-${new Date().toISOString().slice(0, 10)}.png`;
            a.click();
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-purple-200 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-purple-300/50 rounded-lg transition-all"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
          导出为图片
        </button>
      </div>
    </div>
  );
});

export default PvUvChart;
