import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

interface TextRequest {
  text: string | { explanation: string }
}

export async function POST(request: Request) {
  try {
    const { text } = await request.json() as TextRequest
    
    const textToSpeak = typeof text === 'string' 
      ? text 
      : text?.explanation

    if (!textToSpeak) {
      console.error('Invalid text input:', text)
      return NextResponse.json(
        { error: 'テキストが提供されていません' },
        { status: 400 }
      )
    }

    console.log('音声生成を開始、テキスト内容:', textToSpeak)

    try {
      const mp3 = await openai.audio.speech.create({
        model: 'tts-1',
        voice: 'alloy',
        input: textToSpeak,
      })

      console.log('音声生成成功、音声データ送信準備中')

      const buffer = Buffer.from(await mp3.arrayBuffer())

      return new Response(buffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
        },
      })

    } catch (openaiError) {
      console.error('OpenAI APIの呼び出しに失敗:', openaiError)
      throw openaiError
    }

  } catch (error) {
    console.error('音声生成に失敗:', error)
    return NextResponse.json(
      { 
        error: '音声生成に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}