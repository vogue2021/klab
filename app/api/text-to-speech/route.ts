import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import OpenAI from 'openai'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { content, section } = await request.json()
    
    // 首先用 Claude 改写内容
    const prompt = `你是一位幽默风趣的编程老师。请用轻松有趣的口吻改写以下教学内容，要求：
    1. 使用生动的比喻和例子
    2. 加入适当的幽默元素
    3. 使用口语化的表达
    4. 保持内容的准确性
    5. 适合朗读的语言节奏

    内容：${content}

    请确保改写后的内容既专业又有趣，让学习编程变得轻松愉快。`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    // 使用 OpenAI TTS 生成语音
    const mp3 = await openai.audio.speech.create({
      model: "tts-1",
      voice: "shimmer", // 可以选择 alloy, echo, fable, onyx, nova, shimmer
      input: message.content[0].text,
      speed: 1.0,
    })

    // 将音频数据转换为 Buffer
    const buffer = Buffer.from(await mp3.arrayBuffer())

    // 返回音频数据
    return new Response(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    })
  } catch (error) {
    console.error('生成语音失败:', error)
    return NextResponse.json(
      { error: '生成语音失败' },
      { status: 500 }
    )
  }
} 