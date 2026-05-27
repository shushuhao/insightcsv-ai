'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';

const PvUvChart = dynamic(() => import('@/components/PvUvChart'), { ssr: false });

interface CsvRow {
  [key: string]: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [data, setData] = useState<CsvRow[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [summary, setSummary] = useState('');
  const [generating, setGenerating] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        setError('请选择 CSV 文件');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
      setData([]);
      setHeaders([]);
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setUploading(true);
    setError('');

    try {
      const text = await file.text();
     
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length === 0) {
        setError('CSV 文件为空');
        setUploading(false);
        return;
      }

      const headerLine = lines[0];
      const parsedHeaders = headerLine.split(',').map(h => h.trim());
      setHeaders(parsedHeaders);

      const rows: CsvRow[] = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const row: CsvRow = {};
        parsedHeaders.forEach((header, index) => {
          row[header] = values[index] || '';
        });
        rows.push(row);
      }

      setData(rows);
    } catch (err) {
      setError('解析 CSV 文件失败');
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  // ── PV/UV chart data ────────────────────────────────────────────
  const chartData = useMemo(() => {
    if (data.length === 0) return [];

    // Detect a timestamp/date column
    const find = (candidates: string[]) =>
      headers.find((h) =>
        candidates.some((c) => h.toLowerCase().includes(c))
      ) ?? null;

    const tsCol  = find(['timestamp', 'time', 'date', 'day', '时间', '日期']);
    const pvCol  = find(['pv', 'pageview', 'page_view', '浏览']);
    const uvCol  = find(['uv', 'visitor', 'unique', '访客']);

    // Case 1: explicit pv + uv columns
    if (tsCol && pvCol && uvCol) {
      return data.map((row) => ({
        date: row[tsCol].split('T')[0],
        pv:   Number(row[pvCol]) || 0,
        uv:   Number(row[uvCol]) || 0,
      }));
    }

    // Case 2: timestamp column exists — aggregate PV per day
    // New CSV format: timestamp, page, action
    // PV = total rows per day (访问次数), UV = distinct pages visited per day (访问页面种类数)
    if (tsCol) {
      const pageCol = find(['page', 'url', 'path', '页面']);
      const byDay = new Map<string, { pv: number; pages: Set<string> }>();

      data.forEach((row) => {
        const day = (row[tsCol] ?? '').split('T')[0].split(' ')[0];
        if (!day) return;
        if (!byDay.has(day)) byDay.set(day, { pv: 0, pages: new Set() });
        const entry = byDay.get(day)!;
        entry.pv += 1;
        if (pageCol && row[pageCol]) entry.pages.add(row[pageCol]);
      });

      return Array.from(byDay.entries())
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([day, { pv, pages }]) => ({
          date: day,
          pv,
          uv: pages.size,
        }));
    }

    // Fallback: demo trend data
    const DEMO_DAYS = 14;
    return Array.from({ length: DEMO_DAYS }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (DEMO_DAYS - 1 - i));
      const label = `${d.getMonth() + 1}/${d.getDate()}`;
      const base = 800 + Math.round(Math.sin(i * 0.7) * 300);
      return {
        date: label,
        pv: base + Math.round(Math.random() * 200),
        uv: Math.round((base + Math.round(Math.random() * 200)) * 0.45),
      };
    });
  }, [data, headers]);
  // ─────────────────────────────────────────────────────────────────

  const handleClear = () => {
    setFile(null);
    setData([]);
    setHeaders([]);
    setError('');
    setSummary('');
  };

  const handleGenerateSummary = async () => {
    if (data.length === 0) return;

    setGenerating(true);
    setSummary('');
    setError('');

    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ data, headers }),
      });

      if (!response.ok) {
        throw new Error('生成摘要失败');
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('无法读取响应');
      }

      const decoder = new TextDecoder('utf-8');
      let buffer = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data:')) continue;
          const jsonStr = trimmed.slice(5).trim();
          if (jsonStr === '[DONE]') break;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed?.choices?.[0]?.delta?.content;
            if (content) {
              setSummary((prev) => prev + content);
            }
          } catch {
            // 忽略解析失败的行
          }
        }
      }

    } catch (err) {
      setError('生成摘要失败，请重试');
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      // 可选：显示复制成功提示
      alert('摘要已复制到剪贴板');
    } catch (err) {
      console.error('复制失败:', err);
      alert('复制失败，请重试');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">CSV 文件上传</h1>
          <p className="text-purple-200">上传并预览您的 CSV 数据</p>
        </div>

        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 shadow-2xl">
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <label className="flex-1">
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleFileChange}
                  className="hidden"
                  id="csv-upload"
                />
                <div className="flex items-center gap-3 p-4 bg-white/5 border-2 border-dashed border-purple-300/50 rounded-xl cursor-pointer hover:bg-white/10 hover:border-purple-300 transition-all">
                  <svg className="w-8 h-8 text-purple-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <div className="flex-1">
                    <p className="text-white font-medium">
                      {file ? file.name : '点击选择 CSV 文件'}
                    </p>
                    <p className="text-purple-200 text-sm">
                      {file ? `${(file.size / 1024).toFixed(2)} KB` : '支持 .csv 格式'}
                    </p>
                  </div>
                </div>
              </label>

              <button
                onClick={handleUpload}
                disabled={!file || uploading}
                className="px-6 py-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-purple-600 hover:to-pink-600 transition-all shadow-lg hover:shadow-xl disabled:hover:from-purple-500 disabled:hover:to-pink-500"
              >
                {uploading ? '解析中...' : '上传解析'}
              </button>

              {data.length > 0 && (
                <button
                  onClick={handleClear}
                  className="px-6 py-4 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all border border-white/20"
                >
                  清空
                </button>
              )}
            </div>

            {error && (
              <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl text-red-200">
                {error}
              </div>
            )}

            {data.length > 0 && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    数据预览 <span className="text-purple-300">({data.length} 行)</span>
                  </h2>
                  <button
                    onClick={handleGenerateSummary}
                    disabled={generating}
                    className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 text-white rounded-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:from-cyan-600 hover:to-blue-600 transition-all shadow-lg hover:shadow-xl flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                    </svg>
                    {generating ? '生成中...' : '生成数据摘要'}
                  </button>
                </div>

                {summary && (
                  <div className="p-6 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border border-cyan-300/30 rounded-xl">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-semibold text-cyan-200 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        AI 数据摘要
                      </h3>
                      <button
                        onClick={handleCopySummary}
                        className="px-4 py-2 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-200 rounded-lg font-medium transition-all border border-cyan-300/50 flex items-center gap-2 text-sm cursor-pointer hover:scale-105 active:scale-95"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        复制摘要
                      </button>
                    </div>
                    <div className="text-white whitespace-pre-wrap leading-relaxed">
                      {summary}
                    </div>
                  </div>
                )}

                {/* ── PV/UV ECharts 趋势图 ── */}
                <div className="bg-white/5 border border-white/15 rounded-2xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                    </svg>
                    <h3 className="text-base font-semibold text-purple-200">
                      按日期统计访问量
                      {!headers.some(h => ['timestamp','time','date','pv','uv'].some(k => h.toLowerCase().includes(k))) && (
                        <span className="ml-2 text-xs font-normal text-purple-400/70">（演示数据）</span>
                      )}
                      {headers.some(h => ['timestamp','time','date'].some(k => h.toLowerCase().includes(k))) &&
                       !headers.some(h => ['pv','uv'].some(k => h.toLowerCase().includes(k))) && (
                        <span className="ml-2 text-xs font-normal text-purple-400/70">（PV = 当日总访问次数，UV = 当日访问的不同页面数）</span>
                      )}
                    </h3>
                  </div>
                  <PvUvChart data={chartData} />
                </div>

                <div className="overflow-x-auto rounded-xl border border-white/20">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-white/10">
                        {headers.map((header, index) => (
                          <th
                            key={index}
                            className="px-6 py-4 text-left text-sm font-semibold text-purple-200 border-b border-white/20"
                          >
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {data.map((row, rowIndex) => (
                        <tr
                          key={rowIndex}
                          className="hover:bg-white/5 transition-colors border-b border-white/10 last:border-0"
                        >
                          {headers.map((header, colIndex) => (
                            <td
                              key={colIndex}
                              className="px-6 py-4 text-sm text-white"
                            >
                              {row[header]}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
