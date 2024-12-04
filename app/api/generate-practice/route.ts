import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface PracticeQuestion {
  question: string
  initialCode: string
  testCases: Array<{
    input: string
    expectedOutput: string
  }>
  hints: string[]
  solution: {
    code: string
    explanation: string
  }
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()
    
    if (!topic) {
      throw new Error('Topic is required')
    }

    const prompt = `あなたはHaskellのプログラミング講師です。トピック「${topic}」について実践的なプログラミング問題を3つ作成してください。

以下のJSON形式で厳密に回答してください：
{
  "questions": [
    {
      "question": "問題文（具体的なプログラミング課題）",
      "initialCode": "// 初期コード（学習者が編集するベースとなるコード）",
      "testCases": [
        {
          "input": "テストケースの入力値",
          "expectedOutput": "期待される出力値"
        }
      ],
      "hints": [
        "ヒント1（アプローチのヒント）",
        "ヒント2（実装のヒント）"
      ],
      "solution": {
        "code": "解答となるコード（完全な実装）",
        "explanation": "解答の詳細な説明"
      }
    }
  ]
}

要件：
1. 問題は実践的で、学習内容の理解を深められるものにする
2. テストケースは複数用意し、エッジケースも含める
3. 初期コードは基本的な構造を提供し、学習者が完成させる形にする
4. ヒントは段階的に具体的になるように複数提供する
5. 解答には詳細な説明を付け、なぜそのような実装になったのかを解説する
6. 難易度は徐々に上げていく
7. 各問題は独立して解けるようにする
8. コードは実行可能な完全なものにする
9. エラーハンドリングも考慮する
10. Haskellのベストプラクティスに従う`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: "あなたはHaskellプログラミングの専門家で、実践的な問題を作成することができます。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = response.content[0]
    if (!content || content.type !== 'text') {
      throw new Error('Empty response from Anthropic')
    }

    let cleanedResponse = content.text.trim()
    
    // JSON部分の抽出を改善
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in response:', cleanedResponse)
      throw new Error('No JSON found in response')
    }

    try {
      const parsedContent = JSON.parse(jsonMatch[0])
      
      // データの検証
      if (!Array.isArray(parsedContent.questions)) {
        throw new Error('Invalid practice data structure')
      }

      // 各問題のデータ構造を検証
      parsedContent.questions.forEach((question: PracticeQuestion, index: number) => {
        if (!question.question || !question.initialCode || !Array.isArray(question.testCases) || 
            !Array.isArray(question.hints) || !question.solution?.code || !question.solution?.explanation) {
          throw new Error(`Invalid question structure at index ${index}`)
        }
      })

      return NextResponse.json(parsedContent)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', cleanedResponse)
      throw new Error(`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }
  } catch (error) {
    console.error('練習問題の生成に失敗:', error)
    return NextResponse.json(
      { 
        error: '練習問題の生成に失敗しました', 
        details: error instanceof Error ? error.message : '不明なエラー',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 