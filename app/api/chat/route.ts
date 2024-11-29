import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

export async function POST(request: Request) {
  try {
    const { message, history } = await request.json()

    // 构建上下文
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
          content: `请解答这个Python相关的问题，要求：
1. 回答要有清晰的逻辑结构
2. 重要概念用**加粗**标记
3. 代码示例要用 \`\`\`python 和 \`\`\` 包裹
4. 如果有步骤，用有序列表表示
5. 如果有要点，用无序列表表示
6. 专业术语用*斜体*标记

问题：${message}`
        }
      ]
    })

    return NextResponse.json({ response: response.content[0].text })
  } catch (error) {
    console.error('Chat API error:', error)
    return NextResponse.json(
      { error: '发送消息失败' },
      { status: 500 }
    )
  }
} 