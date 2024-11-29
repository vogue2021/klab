import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `作为编程教育专家，请为Python初学者生成一份关于"${topic}"的学习内容。
                 请严格按照以下JSON格式返回（不要添加任何其他文本）：
                 {
                   "concept": {
                     "explanation": "概念解释文本",
                     "svgDiagram": "<svg>...</svg>"
                   },
                   "examples": [
                     {
                       "code": "示例代码",
                       "explanation": "代码解释",
                       "output": "代码输出"
                     }
                   ],
                   "exercises": [
                     {
                       "question": "练习题目",
                       "hints": ["提示1", "提示2"],
                       "solution": "参考答案"
                     }
                   ]
                 }
                 
                 请确保：
                 1. 内容简单易懂，适合初学者
                 2. SVG图示要简洁清晰
                 3. 代码示例要实用且基础
                 4. 练习题目要循序渐进
                 5. 严格按照JSON格式返回，确保可以被JSON.parse()解析`
      }],
      temperature: 0.7,
    })

    // 检查和清理返回的内容
    let content = response.content[0].text
    
    // 尝试清理可能的前后缀文本
    content = content.trim()
    if (content.startsWith('```json')) {
      content = content.slice(7)
    }
    if (content.endsWith('```')) {
      content = content.slice(0, -3)
    }
    content = content.trim()

    try {
      const parsedContent = JSON.parse(content)
      return NextResponse.json(parsedContent)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.log('Raw content:', content)
      return NextResponse.json(
        { error: '内容格式错误' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Generate learning content error:', error)
    return NextResponse.json(
      { error: '生成内容失败' },
      { status: 500 }
    )
  }
} 