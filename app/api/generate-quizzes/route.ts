import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()
    
    if (!topic) {
      throw new Error('No topic provided')
    }

    const prompt = `あなたはHaskellのプログラミング講師です。トピック「${topic}」について5つの練習問題を作成してください。選択問題とコード補完問題を含みます。

    以下のJSON形式で厳密に回答してください：

    {
      "quizzes": [
        {
          "type": "choice", 
          "question": "問題の説明",
          "options": ["選択肢A", "選択肢B", "選択肢C", "選択肢D"],
          "answer": 0,
          "explanation": "詳細な解説"
        },
        {
          "type": "code",
          "question": "問題の説明",
          "code": "コード内容、___で空欄を表示",
          "answer": "正解",
          "explanation": "詳細な解説"
        }
      ]
    }

    要件：
    1. 3つの選択問題と2つのコード補完問題を生成
    2. 選択問題の答えは0-3の数字で表現
    3. コード補完問題は1つの空欄のみで、___で表示
    4. 各問題に詳細な解説を付ける
    5. 問題の難易度は段階的に上げる
    6. 有効なJSON形式であることを確認する`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: "あなたは教育に特化したHaskellのプログラミング講師です。練習問題は教育原理に従い、難易度を段階的に上げていきます。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    try {
      const text = message.content[0].text.trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      
      if (!jsonMatch) {
        throw new Error('Invalid response format')
      }

      const data = JSON.parse(jsonMatch[0])
      
      // データ構造の検証
      if (!Array.isArray(data.quizzes)) {
        throw new Error('Invalid quizzes format')
      }

      return NextResponse.json(data)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      throw new Error('Invalid JSON format in response')
    }
  } catch (error) {
    console.error('練習問題の生成に失敗しました:', error)
    return NextResponse.json(
      { error: '練習問題の生成に失敗しました' },
      { status: 500 }
    )
  }
} 