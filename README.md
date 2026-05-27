# InsightCSV AI

一个面向运营/产品场景的 AI CSV 数据洞察工具。用户上传 CSV 后，系统会在前端完成数据解析和预览，自动生成 PV/UV 趋势图，并调用 DeepSeek 以流式输出的方式生成中文数据洞察摘要。

> 这个项目用于面试作品集展示，重点体现：前端工程能力、AI API 接入、数据可视化、产品闭环设计和快速交付能力。

## 功能亮点

- **CSV 上传与解析**：校验 `.csv` 文件，解析表头与行数据，并提供表格预览。
- **AI 数据摘要**：基于上传数据生成整体趋势、异常点和优化建议。
- **流式响应体验**：服务端转发 DeepSeek 流式响应，前端实时拼接展示结果。
- **PV/UV 趋势图**：自动识别时间、PV、UV、页面等字段，并用 ECharts 展示访问趋势。
- **图表导出**：支持将趋势图导出为 PNG 图片，便于汇报和沉淀。
- **示例数据内置**：`public/sample.csv` 可直接用于本地体验。

## Demo 视频

项目根目录提供了录屏演示文件：`insightcsv-ai-demo.mov`。上传到 GitHub 后，可以在仓库中直接查看或下载，用于快速展示完整操作流程。

## 技术栈

- [Next.js 16](https://nextjs.org/) App Router
- [React 19](https://react.dev/)
- TypeScript
- Tailwind CSS 4
- ECharts 6
- DeepSeek Chat Completions API

## 项目结构

```text
src/
  app/
    api/summary/route.ts      # AI 数据摘要接口
    upload/page.tsx           # CSV 上传、解析、预览和摘要页面
    page.tsx                  # 项目首页/作品介绍页
    layout.tsx                # 页面元信息和全局布局
  components/
    PvUvChart.tsx             # ECharts PV/UV 趋势图组件
public/
  sample.csv                  # 示例 CSV 数据
```

## 本地运行

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

复制环境变量示例文件：

```bash
cp .env.example .env.local
```

然后在 `.env.local` 中填写 DeepSeek API Key：

```bash
DEEPSEEK_API_KEY=your_deepseek_api_key
```

### 3. 启动开发服务

```bash
npm run dev
```

默认访问：<http://localhost:8090>

## 使用方式

1. 打开首页，点击「体验 CSV 分析」。
2. 上传自己的 CSV，或使用 `public/sample.csv` 示例数据。
3. 点击「上传解析」查看数据预览和趋势图。
4. 点击「生成数据摘要」获取 AI 分析结论。
5. 可将图表导出为 PNG 图片。

## 面试讲解思路

可以从以下几个角度介绍这个项目：

1. **业务价值**：帮助非技术角色快速理解 CSV 数据，降低临时分析成本。
2. **技术闭环**：本地文件解析 → 数据结构化 → 图表可视化 → AI 生成洞察。
3. **工程实现**：Next.js App Router、Edge Runtime、流式响应、动态加载 ECharts 避免 SSR 问题。
4. **可扩展方向**：支持更多图表类型、接入数据库、增加文件拖拽、导出分析报告、做字段映射配置。

## 注意事项

- 本项目不会把上传的 CSV 保存到服务器，解析逻辑在浏览器端完成。
- AI 摘要接口会将部分样本数据发送给 DeepSeek，请勿上传敏感数据。
- 如果没有配置 `DEEPSEEK_API_KEY`，CSV 解析和图表仍可使用，但 AI 摘要不可用。
