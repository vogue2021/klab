import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { topic, questionTypes } = await request.json()
    
    if (!topic) {
      throw new Error('No topic provided')
    }

    const prompt = `あなたはHaskellのプログラミング講師です。トピック「${topic}」について以下の練習問題を作成してください：

    1. 選択問題（${questionTypes.choice}問）：
       - 基本的な概念の理解を確認する問題
       - 各問題には4つの選択肢を用意
       - 正解は0-3の数字で表現（0が最初の選択肢）
       - 各問題に詳細な解説を付ける

    2. コード補完問題（${questionTypes.code}問）：
       - コードの一部が空欄（___で表示）になっている問題
       - 適切なコードを書いて完成させる形式
       - 各問題に詳細な解説を付ける

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
          "answer": "正解のコード",
          "explanation": "詳細な解説"
        }
      ]
    }

    要件：
    1. 選択問題は${questionTypes.choice}問、コード補完問題は${questionTypes.code}問を生成
    2. 問題の難易度は段階的に上げる
    3. 各問題に詳細な解説を付ける
    4. 有効なJSON形式であることを確認する`

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