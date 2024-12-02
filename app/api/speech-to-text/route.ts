import { NextResponse } from 'next/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: Request) {
  try {
    const formData = await request.formData()
    const audioFile = formData.get('audio') as File

    if (!audioFile) {
      return NextResponse.json(
        { error: '音声ファイルが見つかりません' },
        { status: 400 }
      )
    }

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: 'whisper-1',
      language: 'zh', // 中国語に設定
      response_format: 'json',
    })

    return NextResponse.json({ text: transcription.text })
  } catch (error) {
    console.error('音声からテキストへの変換エラー:', error)
    return NextResponse.json(
      { error: '音声認識に失敗しました' },
      { status: 500 }
    )
  }
} 