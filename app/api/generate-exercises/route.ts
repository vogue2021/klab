import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface Exercise {
  question: string
  initialCode: string
}

interface ExercisesResponse {
  exercises: Exercise[]
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()
    
    if (!topic) {
      throw new Error('No topic provided')
    }

    const prompt = `你是一位 Python 编程教师。请为主题"${topic}"创建5个实践练习题。

    请严格按照以下 JSON 格式回答，确保生成的是合法的 JSON：

    {
      "exercises": [
        {
          "question": "Write a program that...",
          "initialCode": "# Your code here\\n"
        }
      ]
    }

    要求：
    1. 练习题要循序渐进，从简单到复杂
    2. 每个问题都要独立且完整
    3. 问题描述用中文，代码和注释用英文
    4. 初始代码要包含必要的英文注释和提示
    5. 确保代码可以直接运行
    6. 每个练习包含：
       - 清晰的问题描述（中文）
       - 可运行的初始代码（英文）
       - 代码中的注释（英文）
    7. 确保生成的是合法的 JSON 格式
    8. 不要在 JSON 中使用特殊字符
    9. 所有中文字符需要进行 Unicode 编码

    注意：JSON 中的换行使用 \\n，确保所有引号都正确转义。`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.5,
      system: `你是一个专注于实践教学的Python编程教师。
      你必须生成完全合法的JSON格式内容。
      问题描述使用中文，但需要将中文转换为Unicode编码。
      代码和注释使用英文。
      确保生成的JSON可以被正确解析。`,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = response.content[0]
    if (!content || content.type !== 'text') {
      throw new Error('Empty response from Anthropic')
    }

    // 解析 JSON 响应
    try {
      const text = content.text.trim()
      
      // 记录原始响应以便调试
      console.log('AI Response:', text)

      // 尝试提取 JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON found in response:', text)
        throw new Error('Invalid response format')
      }

      const jsonText = jsonMatch[0]
      console.log('Extracted JSON:', jsonText)

      // 将中文转换为 Unicode 编码
      const encodedText = jsonText.replace(/[\u4e00-\u9fa5]/g, char => 
        `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
      )

      // 解析 JSON
      const data = JSON.parse(encodedText) as ExercisesResponse

      // 验证数据结构
      if (!Array.isArray(data.exercises)) {
        throw new Error('Invalid exercises format')
      }

      // 验证每个练习
      data.exercises.forEach((exercise, index) => {
        if (!exercise.question || !exercise.initialCode) {
          throw new Error(`Invalid exercise at index ${index}`)
        }
      })

      // 处理代码中的换行符和解码中文
      const processedData = {
        exercises: data.exercises.map(exercise => ({
          ...exercise,
          // 解码中文字符
          question: decodeURIComponent(JSON.parse(`"${exercise.question}"`)),
          initialCode: exercise.initialCode
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .trim()
        }))
      }

      return NextResponse.json(processedData)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      if (content.type === 'text') {
        console.error('Raw response:', content.text)
      }
      throw new Error(`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }
  } catch (error) {
    console.error('生成练习失败:', error)
    return NextResponse.json(
      { 
        error: '生成练习失败',
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 