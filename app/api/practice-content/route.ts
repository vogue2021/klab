import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()
    
    if (!topic) {
      throw new Error('No topic provided')
    }

    const prompt = `你是一位 Python 编程教师。请为主题"${topic}"创建一个实践教学内容，要求：

    1. 简短的概念说明（不超过100字）
    2. 2-3个代码示例，每个示例包含：
       - 示例标题
       - 简短说明
       - 实际可运行的代码
       - 详细的代码讲解（重点解释代码的实际应用场景）

    请用以下JSON格式回答：
    {
      "title": "主题标题",
      "introduction": "简短概念说明",
      "sections": [
        {
          "title": "示例标题",
          "content": "示例说明",
          "codeExample": "代码示例",
          "explanation": "代码讲解"
        }
      ]
    }

    确保生成的是有效的JSON格式。`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: "你是一个专注于实践教学的Python编程教师。注重代码示例的实用性和易理解性。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    // 解析 JSON 响应
    const content = JSON.parse(message.content[0].text)

    return NextResponse.json(content)
  } catch (error) {
    console.error('生成教学内容失败:', error)
    return NextResponse.json(
      { error: '生成教学内容失败' },
      { status: 500 }
    )
  }
} 