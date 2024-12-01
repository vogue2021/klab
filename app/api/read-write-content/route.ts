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

    const prompt = `你是一位 Python 编程教师。请为主题"${topic}"创建一个详细的教学内容。

    请严格按照以下 JSON 格式回答：

    {
      "title": "主题标题",
      "introduction": "详细的概念介绍",
      "concepts": [
        "核心概念点1",
        "核心概念点2"
      ],
      "relatedTopics": [
        {
          "topic": "相关知识点1",
          "explanation": "详细解释"
        }
      ],
      "sections": [
        {
          "title": "示例标题",
          "content": "示例说明",
          "codeExample": [
            {
              "code": "fruits = [\"apple\", \"banana\", \"cherry\"]",
              "explanation": "这行代码的详细解释"
            },
            {
              "code": "for fruit in fruits:",
              "explanation": "这行代码的详细解释"
            },
            {
              "code": "    print(fruit)",
              "explanation": "这行代码的详细解释"
            }
          ],
          "summary": "示例总结"
        }
      ]
    }

    要求：
    1. 概念介绍要全面且深入
    2. 核心概念点要突出重点
    3. 相关知识点要有助于理解
    4. 代码示例要分行展示，每行代码都是独立的
    5. 每行代码都要有详细解释
    6. 代码要保持正确的缩进
    7. 确保生成的是合法的 JSON 格式

    注意：
    1. 代码必须按行拆分，每行代码作为一个独立的对象
    2. 保持代码的缩进格式（使用空格）
    3. 每行代码都需要详细的解释
    4. 所有引号要正确转义`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: "你是一个专注于深入讲解的Python编程教师。你的解释要详细、全面，同时易于理解。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    try {
      const text = message.content[0].text.trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      
      if (!jsonMatch) {
        throw new Error('Invalid response format')
      }

      const data = JSON.parse(jsonMatch[0])
      
      // 验证数据结构
      if (!data.title || !data.introduction || !Array.isArray(data.sections)) {
        throw new Error('Invalid content structure')
      }

      return NextResponse.json(data)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      throw new Error('Invalid JSON format in response')
    }
  } catch (error) {
    console.error('生成教学内容失败:', error)
    return NextResponse.json(
      { error: '生成教学内容失败' },
      { status: 500 }
    )
  }
} 