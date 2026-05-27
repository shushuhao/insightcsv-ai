import Link from "next/link";

const features = [
  {
    title: "CSV 数据解析",
    description: "支持本地上传 CSV，自动解析表头和行数据，并提供结构化预览。",
  },
  {
    title: "AI 智能摘要",
    description: "调用 DeepSeek 对运营数据进行趋势、异常点和优化方向分析。",
  },
  {
    title: "PV / UV 可视化",
    description: "基于 ECharts 自动生成访问趋势图，并支持导出图片用于汇报。",
  },
];

const techStack = ["Next.js 16", "React 19", "TypeScript", "Tailwind CSS", "ECharts", "DeepSeek API"];

export default function Home() {
  return (
    <main className="min-h-screen overflow-hidden bg-slate-950 text-white">
      <section className="relative px-6 py-20 sm:px-10 lg:px-16">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_left,rgba(168,85,247,0.35),transparent_34%),radial-gradient(circle_at_80%_20%,rgba(34,211,238,0.22),transparent_30%),linear-gradient(135deg,#0f172a,#111827_45%,#312e81)]" />
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
          <div>
            <div className="mb-6 inline-flex rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm text-cyan-100 backdrop-blur">
              InsightCSV AI · AI CSV 数据洞察工具
            </div>
            <h1 className="max-w-4xl text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
              InsightCSV AI：上传 CSV，快速得到可视化图表和 AI 分析结论
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-300">
              一个面向运营和产品同学的 AI CSV 数据洞察工具：从 CSV 上传、前端解析、趋势图展示到 DeepSeek 流式摘要，完整呈现 AI + 数据可视化的产品闭环。
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/upload"
                className="rounded-full bg-cyan-400 px-7 py-3 text-center font-semibold text-slate-950 shadow-lg shadow-cyan-500/25 transition hover:bg-cyan-300"
              >
                体验 CSV 分析
              </Link>
              <a
                href="/sample.csv"
                className="rounded-full border border-white/20 bg-white/10 px-7 py-3 text-center font-semibold text-white transition hover:bg-white/15"
              >
                下载示例数据
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-white/15 bg-white/10 p-4 shadow-2xl shadow-purple-950/40 backdrop-blur-xl">
            <div className="rounded-2xl bg-slate-950/80 p-5">
              <div className="mb-5 flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <p className="text-sm text-slate-400">AI Summary</p>
                  <h2 className="text-xl font-semibold">用户行为数据洞察</h2>
                </div>
                <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs text-emerald-200">Streaming</span>
              </div>
              <div className="space-y-4 text-sm leading-6 text-slate-300">
                <p>整体趋势：访问量在工作日明显提升，详情页和首页贡献了主要 PV。</p>
                <p>异常点：部分时间段存在空值和访问突增，需要结合投放活动进一步验证。</p>
                <p>优化建议：重点观察转化页面路径、活跃时段和高跳出页面。</p>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-3">
                {[
                  ["1.2k", "PV"],
                  ["486", "UV"],
                  ["3", "异常点"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white/5 p-4 text-center">
                    <div className="text-2xl font-bold text-cyan-200">{value}</div>
                    <div className="mt-1 text-xs text-slate-400">{label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-white/10 bg-slate-900/70 px-6 py-12 sm:px-10 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div key={feature.title} className="rounded-3xl border border-white/10 bg-white/[0.04] p-6">
              <h3 className="text-xl font-semibold text-cyan-100">{feature.title}</h3>
              <p className="mt-3 leading-7 text-slate-300">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="px-6 py-16 sm:px-10 lg:px-16">
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-purple-300">Tech Stack</p>
              <h2 className="mt-3 text-3xl font-bold">技术实现与产品亮点</h2>
            </div>
            <Link href="/upload" className="text-cyan-200 hover:text-cyan-100">
              进入核心功能 →
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {techStack.map((item) => (
              <span key={item} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-slate-200">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
