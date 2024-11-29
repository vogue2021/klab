import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    console.log('Received code:', code)

    if (!code) {
      return NextResponse.json({ error: '没有提供代码' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'API密钥未配置' }, { status: 500 })
    }

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: `分析这段Python代码的执行过程，生成每一步的详细说明。
            
            要求：
            1. 逐行分析代码的执行过程
            2. 说明每一步的操作和变量变化
            3. 解释代码的逻辑和目的
            
            请以JSON格式返回，示例：
            {
              "steps": [
                {
                  "lineNumber": 1,
                  "code": "x = 5",
                  "explanation": "将数值5赋值给变量x",
                  "variables": {
                    "x": 5
                  }
                }
              ]
            }
            
            Python代码：
            ${code}`
          }
        ]
      })

      console.log('AI Response:', message.content)

      const responseText = message.content[0].text
      const startJson = responseText.indexOf('{')
      const endJson = responseText.lastIndexOf('}') + 1
      const jsonStr = responseText.slice(startJson, endJson)
      
      const data = JSON.parse(jsonStr)
      console.log('Parsed data:', data)

      return NextResponse.json(data)
      
    } catch (aiError) {
      console.error('AI Analysis Error:', aiError)
      return NextResponse.json({ error: 'AI分析代码时出错' }, { status: 500 })
    }

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json({ 
      error: '分析代码失败', 
      details: error instanceof Error ? error.message : '未知错误'
    }, { status: 500 })
  }
} 