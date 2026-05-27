import { NextResponse } from 'next/server';

type CsvRow = Record<string, string>;

interface SummaryRequestBody {
  data: CsvRow[];
  headers: string[];
}

export async function POST(req: Request) {
  try {
    const { data, headers } = (await req.json()) as SummaryRequestBody;

    if (!Array.isArray(data) || !Array.isArray(headers)) {
      return NextResponse.json({ error: 'Invalid request payload' }, { status: 400 });
    }

    const sampleData = data.slice(0, 20);
    const prompt = `我有一份用户点击行为数据，格式为 CSV，包含以下字段：${headers.join(', ')}。
以下是前 20 行样本数据：
${JSON.stringify(sampleData, null, 2)}

请帮我分析：
1. 整体趋势：数据有什么明显特征？（比如哪个页面访问最多？哪个时段活跃？）
2. 异常点：有没有不合理的数据（比如空值、异常值）？
3. 基于这些数据，可以关注哪些指标来优化用户体验？

请用中文简洁回答。`;

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${process.env.DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: [{ role: 'user', content: prompt }],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      return NextResponse.json({ error }, { status: response.status });
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    });
  } catch (error) {
    console.error('Summary API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export const runtime = 'edge';
