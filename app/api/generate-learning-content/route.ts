import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { content } = await request.json()
    
    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'コンテンツが提供されていないか、無効な形式です' },
        { status: 400 }
      )
    }

    const prompt = `あなたは親しみやすいプログラミング講師です。以下の教育コンテンツを、以下の要件で書き換えてください：
    1. 分かりやすい比喩や例を使用
    2. 適度なユーモアを含める
    3. 話し言葉的な表現を使用
    4. 内容の正確性を保持
    5. 音声読み上げに適したリズム

    内容：${content}

    プログラミング学習を楽しく、でも正確に伝えられるように書き換えてください。`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const rewrittenText = message.content.reduce((text, content) => {
      if ('text' in content) {
        return text + content.text
      }
      return text
    }, '')

    if (!rewrittenText) {
      throw new Error('AIからの応答が空です')
    }

    // 書き換えられたテキストを返す
    return NextResponse.json({ content: rewrittenText })

  } catch (error) {
    console.error('コンテンツ生成エラー:', error)
    return NextResponse.json(
      { error: 'コンテンツの生成に失敗しました' },
      { status: 500 }
    )
  }
} 