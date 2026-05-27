# InsightCSV AI

InsightCSV AI 是一个面向运营、产品和数据分析场景的 AI CSV 数据洞察工具。用户上传 CSV 后，系统会在浏览器端完成数据解析和预览，自动生成 PV/UV 趋势图，并调用 DeepSeek 以流式输出的方式生成中文数据分析摘要。

项目聚焦「轻量数据分析」场景，目标是把原始 CSV 快速转化为可读的图表和可执行的业务洞察。

## 功能亮点

- **CSV 上传与解析**：校验 `.csv` 文件，解析表头与行数据，并提供表格预览。
- **AI 数据摘要**：基于上传数据生成整体趋势、异常点和优化建议。
- **流式响应体验**：服务端转发 DeepSeek 流式响应，前端实时拼接展示结果。
- **PV/UV 趋势图**：自动识别时间、PV、UV、页面等字段，并用 ECharts 展示访问趋势。
- **图表导出**：支持将趋势图导出为 PNG 图片，便于汇报和沉淀。
- **示例数据内置**：`public/sample.csv` 可直接用于本地体验。

## Demo 视频

项目根目录提供了录屏演示文件：`insightcsv-ai-demo.mov`。可以直接查看或下载，用于快速了解完整操作流程。

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
    page.tsx                  # 项目首页
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

## 实现亮点

1. **前端本地解析 CSV**：上传文件后直接在浏览器端解析，避免不必要的文件上传和存储。
2. **AI 分析链路**：将结构化样本数据组织为 Prompt，通过 API 获取趋势、异常点和优化建议。
3. **流式输出体验**：后端保持流式响应，前端逐段渲染内容，减少等待感。
4. **可视化适配**：根据字段自动生成 PV/UV 趋势图；如果数据缺少明确指标，则提供可用的演示趋势。
5. **客户端图表导出**：基于 ECharts 生成图片，方便将分析结果用于汇报或记录。

## 可扩展方向

- 支持拖拽上传和更复杂的 CSV 解析规则。
- 增加字段映射配置，适配更多业务数据格式。
- 支持更多图表类型，例如漏斗图、留存图、分布图。
- 导出完整分析报告，例如 Markdown、PDF 或图片长图。
- 接入数据库或对象存储，支持历史分析记录。

## 注意事项

- 本项目不会把上传的 CSV 保存到服务器，解析逻辑在浏览器端完成。
- AI 摘要接口会将部分样本数据发送给 DeepSeek，请勿上传敏感数据。
- 如果没有配置 `DEEPSEEK_API_KEY`，CSV 解析和图表仍可使用，但 AI 摘要不可用。
