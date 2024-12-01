import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const { text } = await request.json()
    
    if (!text) {
      throw new Error('No text provided')
    }

    console.log('开始生成语音，文本内容:', text) // 添加详细日志

    try {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      })

      console.log('语音生成成功，准备发送音频数据') // 添加成功日志

      // 将音频数据转换为 Buffer
      const buffer = Buffer.from(await mp3.arrayBuffer())

      // 返回音频数据
      return new Response(buffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
        },
      })
    } catch (openaiError) {
      console.error('OpenAI API 调用失败:', openaiError) // 记录具体的 API 错误
      throw openaiError
    }
  } catch (error) {
    console.error('语音生成失败:', error)
    // 返回更详细的错误信息
    return NextResponse.json(
      { 
        error: '语音生成失败',
        details: error instanceof Error ? error.message : '未知错误'
      },
      { status: 500 }
    )
  }
} 