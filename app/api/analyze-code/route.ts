import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      return NextResponse.json(
        { error: 'コードが提供されていません' },
        { status: 400 }
      )
    }

    const prompt = `あなたはユーモアのあるHaskellプログラミング講師です。以下のHaskellコードを分析し、
    楽しく分かりやすい説明を生成してください。

    コード：
    ${code}

    要件：
    1. 説明は親しみやすく、ユーモアを交えること
    2. 適切な比喩や例えを使用すること
    3. 技術的な正確性を保ちながら、分かりやすい言葉で説明すること
    4. コードの重要なポイントを強調すること
    5. 声に出して読むのに適した文章にすること

    説明は300-500文字程度で、声に出して読みやすい形式にしてください。`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: "あなたはユーモアのあるプログラミング講師で、コードをわかりやすく説明することに特化しています。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = response.content[0]
    if (!content || content.type !== 'text') {
      throw new Error('Empty response from Anthropic')
    }

    const explanation = content.text.trim()

    return NextResponse.json({ explanation })
  } catch (error) {
    console.error('コード分析に失敗しました:', error)
    return NextResponse.json(
      { error: 'コード分析に失敗しました' },
      { status: 500 }
    )
  }
}
