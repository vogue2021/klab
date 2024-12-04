import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    // コンテキストを構築
    const contextMessages = history?.map((msg: any) => ({
      role: msg.role,
      content: msg.content
    })) || []

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [
        ...contextMessages,
        {
          role: 'user',
          content: `このHaskell関連の質問に答えてください。要件：
1. 回答は明確な論理構造を持つこと
2. 重要な概念は**太字**でマークすること
3. コード例は \`\`\`haskell と \`\`\` で囲むこと
4. 手順がある場合は順序付きリストで表示すること
5. ポイントがある場合は箇条書きで表示すること
6. 専門用語は*斜体*でマークすること

質問：${message}`
        }
      ]
    })

    return NextResponse.json({ response: response.content[0].text })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: 'メッセージの送信に失敗しました' },
      { status: 500 }
    )
  }
} 