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

    const prompt = `あなたはユーモアのあるPythonプログラミング講師です。以下のPythonコードを楽しく分かりやすく説明してください...`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: "あなたはユーモアのあるプログラミング講師で、コードをわかりやすく説明することに特化しています。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    const explanation = message.content[0].text.trim()

    return NextResponse.json({ explanation })
  } catch (error) {
    console.error('コード分析に失敗しました:', error)
    return NextResponse.json(
      { error: 'コード分析に失敗しました' },
      { status: 500 }
    )
  }
}
