import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      throw new Error('No code provided')
    }

    const prompt = `你是一位幽默风趣的 Python 编程老师。请用轻松有趣的口吻解释以下 Python 代码，要求：
    1. 使用生动的比喻和例子
    2. 加入适当的幽默元素
    3. 使用口语化的表达
    4. 保持解释的准确性
    5. 适合朗读的语言节奏

    代码：
    ${code}

    请用中文回答，确保解释既专业又有趣，让学习编程变得轻松愉快。`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: "你是一个幽默风趣的编程教师，专注于用通俗易懂的方式解释代码。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    return NextResponse.json({ explanation: message.content[0].text })
  } catch (error) {
    console.error('代码分析失败:', error)
    return NextResponse.json(
      { error: '代码分析失败' },
      { status: 500 }
    )
  }
}

