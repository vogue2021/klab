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

    const prompt = `你是一位 Python 编程教师。请为主题"${topic}"创建5个练习题，包括选择题和代码补全题。

    请严格按照以下 JSON 格式回答：

    {
      "quizzes": [
        {
          "type": "choice",
          "question": "问题描述",
          "options": ["选项A", "选项B", "选项C", "选项D"],
          "answer": 0,
          "explanation": "详细解释答案"
        },
        {
          "type": "code",
          "question": "问题描述",
          "code": "代码内容，使用___表示需要填空的部分",
          "answer": "正确答案",
          "explanation": "详细解释答案"
        }
      ]
    }

    要求：
    1. 生成3道选择题和2道代码补全题
    2. 选择题答案用0-3的数字表示
    3. 代码补全题只能有一个填空，用___表示
    4. 每个问题都要有详细的解释
    5. 问题难度要循序渐进
    6. 确保生成的是合法的 JSON 格式`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: "你是一个专注于教学的Python编程教师。你的练习题要符合教学规律，难度循序渐进。",
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
      if (!Array.isArray(data.quizzes)) {
        throw new Error('Invalid quizzes format')
      }

      return NextResponse.json(data)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      throw new Error('Invalid JSON format in response')
    }
  } catch (error) {
    console.error('生成练习失败:', error)
    return NextResponse.json(
      { error: '生成练习失败' },
      { status: 500 }
    )
  }
} 