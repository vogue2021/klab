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

    // 使用 Claude 运行代码并获取结果
    const prompt = `请运行以下 Python 代码并返回运行结果。
    只返回代码的输出结果，不要添加任何其他解释。
    如果代码有错误，返回错误信息。
    如果代码没有输出，返回 "Code executed successfully with no output"。

    代码：
    ${code}

    请用以下 JSON 格式回答：
    {
      "output": "运行结果或错误信息"
    }`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0,
      system: "你是一个 Python 代码执行器。你的任务是运行代码并返回结果。只返回代码的实际输出，不要添加任何评论或解释。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from code execution')
    }

    try {
      // 提取 JSON 响应
      const text = message.content[0].text.trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      
      if (!jsonMatch) {
        throw new Error('Invalid response format')
      }

      const data = JSON.parse(jsonMatch[0])
      
      if (!data.output) {
        throw new Error('No output in response')
      }

      return NextResponse.json({ output: data.output })
    } catch (parseError) {
      console.error('解析输出失败:', parseError)
      return NextResponse.json({ output: message.content[0].text.trim() })
    }
  } catch (error) {
    console.error('运行代码失败:', error)
    return NextResponse.json(
      { 
        error: '运行代码失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
} 