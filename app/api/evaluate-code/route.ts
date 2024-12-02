import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { code, output, question } = await request.json()
    
    if (!code || !question) {
      throw new Error('Missing required fields')
    }

    const prompt = `あなたはPythonのプログラミング講師です。以下の練習問題に対する生徒の解答を評価してください：

問題：${question}

生徒のコード：
${code}

実行結果：
${output || '出力なし'}

以下を含む簡潔な評価を提供してください：
1. コードは問題を正しく解決しているか
2. コードスタイルと可読性
3. 改善できる点
4. 励ましの言葉

親切な口調で、評価は簡潔で分かりやすくしてください。`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      system: "あなたは親切なプログラミング講師で、生徒を励ますのが得意です。評価は簡潔で具体的で建設的であるべきです。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    return NextResponse.json({ feedback: message.content[0].text.trim() })
  } catch (error) {
    console.error('コードの評価に失敗しました:', error)
    return NextResponse.json(
      { error: 'コードの評価に失敗しました' },
      { status: 500 }
    )
  }
} 