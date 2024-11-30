import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { cache } from '@/lib/cache'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()
    
    if (!topic) {
      throw new Error('No topic provided')
    }

    // 检查缓存
    const cachedData = cache.get(topic, 'audio-content')
    if (cachedData) {
      console.log('Using cached audio content')
      return NextResponse.json(cachedData)
    }

    const prompt = `作为一个Python编程教学专家，请为主题"${topic}"创建一个适合听觉学习的教学内容。

    请提供以下内容：
    1. 概念讲解：用清晰、口语化的方式解释概念
    2. 代码示例：提供简单的示例，并解释每一步
    3. 关键点总结：列出需要记住的要点
    4. 练习建议：提供一些口头练习或思考题

    要求：
    - 使用通俗易懂的语言
    - 避免过长的句子
    - 多用类比和实例
    - 适合朗读和听讲的表达方式

    请用中文回答，并按以下JSON格式组织内容：
    {
      "title": "主题标题",
      "introduction": "简短介绍",
      "sections": [
        {
          "title": "章节标题",
          "content": "章节内容",
          "codeExample": "代码示例（如果有）",
          "explanation": "代码解释（如果有）"
        }
      ],
      "keyPoints": ["关键点1", "关键点2", ...],
      "exercises": ["练习1", "练习2", ...]
    }`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: "你是一个编程教育专家，专注于创建适合听觉学习的教学内容。请生成清晰、易于理解的解释和示例。",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    // 清理响应文本，确保只包含JSON
    let cleanedResponse = message.content[0].text.trim()
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.split('```json')[1].split('```')[0].trim()
    } else if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.split('```')[1].trim()
    }

    // 解析JSON
    const audioContent = JSON.parse(cleanedResponse)

    // 存入缓存
    cache.set(topic, 'audio-content', audioContent)
    
    return NextResponse.json(audioContent)
  } catch (error) {
    console.error('音频内容生成错误:', error)
    return NextResponse.json(
      { error: '生成教学内容失败' },
      { status: 500 }
    )
  }
} 