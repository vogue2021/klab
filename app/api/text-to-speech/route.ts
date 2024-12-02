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

    console.log('音声生成を開始、テキスト内容:', text) // 詳細ログを追加

    try {
      const mp3 = await openai.audio.speech.create({
        model: "tts-1",
        voice: "alloy",
        input: text,
      })

      console.log('音声生成成功、音声データ送信準備中') // 成功ログ

      // 音声データをBufferに変換
      const buffer = Buffer.from(await mp3.arrayBuffer())

      // 音声データを返す
      return new Response(buffer, {
        headers: {
          'Content-Type': 'audio/mpeg',
          'Content-Length': buffer.length.toString(),
        },
      })
    } catch (openaiError) {
      console.error('OpenAI APIの呼び出しに失敗:', openaiError) // APIエラーを記録
      throw openaiError
    }
  } catch (error) {
    console.error('音声生成に失敗:', error)
    // より詳細なエラー情報を返す
    return NextResponse.json(
      { 
        error: '音声生成に失敗',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
}