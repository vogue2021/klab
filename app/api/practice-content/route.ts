import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface Section {
  title: string
  content: string
  codeExample: string
  explanation: string
}

interface Content {
  title: string
  introduction: string
  sections: Section[]
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()
    
    if (!topic) {
      throw new Error('No topic provided')
    }

    const prompt = `你是一位 Python 编程教师。请为主题"${topic}"创建一个实践教学内容。
    
    请严格按照以下 JSON 格式回答，不要添加任何其他内容：

    {
      "title": "${topic}",
      "introduction": "这里写一个不超过100字的概念说明",
      "sections": [
        {
          "title": "示例1：基础用法",
          "content": "这里写示例说明",
          "codeExample": "# 完整的可运行代码",
          "explanation": "这里写代码讲解，必须与代码示例完全对应"
        }
      ]
    }

    要求：
    1. 概念说明简短清晰（不超过100字）
    2. 提供2-3个循序渐进的代码示例
    3. 每个示例必须包含：
       - 清晰的标题（示例1/2/3：具体主题）
       - 简短的示例说明
       - 完整的可运行代码
       - 与代码完全对应的详细解释
    4. 代码示例要求：
       - 必须是完整的、可以直接运行的代码
       - 使用英文变量名和输出
       - 包含适当的注释
       - 代码长度适中（5-10行）
    5. 示例难度递增：
       - 示例1：基础概念演示
       - 示例2：基本应用
       - 示例3：综合运用
    6. 确保每个示例的代码和解释严格对应
    7. 所有示例必须相互独立，可以单独运行
    8. 避免示例之间的代码重复

    注意：确保生成的是合法的 JSON 格式，且代码中的换行使用 \\n 转义。`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.3,
      system: `你是一个专注于实践教学的Python编程教师。
      你必须生成完全合法的JSON格式内容。
      每个示例必须包含完整且独立的可运行代码。
      代码示例和解释必须严格对应。
      示例之间必须循序渐进且相互独立。`,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    // 清理和验证 JSON
    try {
      const text = message.content[0].text.trim()
      
      // 记录原始响应以便调试
      console.log('AI Response:', text)

      // 尝试提取 JSON
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON found in response:', text)
        throw new Error('No valid JSON found in response')
      }

      const jsonText = jsonMatch[0]
      console.log('Extracted JSON:', jsonText)

      // 解析 JSON
      const content = JSON.parse(jsonText) as Content

      // 验证内容结构
      if (!content.title || !content.introduction || !Array.isArray(content.sections)) {
        console.error('Invalid content structure:', content)
        throw new Error('Invalid content structure')
      }

      // 验证每个部分
      content.sections.forEach((section: Section, index: number) => {
        if (!section.title || !section.content || !section.codeExample || !section.explanation) {
          console.error(`Invalid section at index ${index}:`, section)
          throw new Error(`Invalid section structure at index ${index}`)
        }
      })

      // 清理代码示例中的转义字符
      content.sections = content.sections.map(section => ({
        ...section,
        codeExample: section.codeExample
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .trim()
      }))

      return NextResponse.json(content)
    } catch (parseError: unknown) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', message.content[0].text)
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      throw new Error(`Invalid JSON format in response: ${errorMessage}`)
    }
  } catch (error) {
    console.error('生成教学内容失败:', error)
    return NextResponse.json(
      { 
        error: '生成教学内容失败', 
        details: error instanceof Error ? error.message : '未知错误',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 