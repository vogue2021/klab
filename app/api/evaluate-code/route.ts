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

    const prompt = `你是一位 Python 编程老师。请评价学生对以下练习的解答：

问题：${question}

学生的代码：
${code}

运行结果：
${output || '无输出'}

请提供简短的评价，包括：
1. 代码是否正确解决了问题
2. 代码风格和可读性
3. 可以改进的地方
4. 鼓励性的话语

请用友善的语气，评价要简洁明了。`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0.7,
      system: "你是一个友善的编程老师，善于鼓励学生。你的评价要简洁、具体、有建设性。",
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
    console.error('评估代码失败:', error)
    return NextResponse.json(
      { error: '评估代码失败' },
      { status: 500 }
    )
  }
} 