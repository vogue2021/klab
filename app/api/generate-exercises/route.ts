import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface Exercise {
  question: string
  initialCode: string
}

interface ExercisesResponse {
  exercises: Exercise[]
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()
    
    if (!topic) {
      throw new Error('No topic provided')
    }

    const prompt = `あなたはPythonプログラミング講師です。トピック「${topic}」のための5つの実践演習問題を作成してください。

    以下のJSON形式で厳密に回答してください。有効なJSONを生成することを確認してください：

    {
      "exercises": [
        {
          "question": "Write a program that...",
          "initialCode": "# Your code here\\n"
        }
      ]
    }

    要件：
    1. 演習問題は段階的に、簡単なものから複雑なものへと進めてください
    2. 各問題は独立して完結している必要があります
    3. 問題の説明は日本語で、コードとコメントは英語で
    4. 初期コードには必要な英語のコメントとヒントを含めてください
    5. コードが直接実行できることを確認してください
    6. 各演習には以下を含めてください：
       - 明確な問題の説明（日本語）
       - 実行可能な初期コード（英語）
       - コード内のコメント（英語）
    7. 有効なJSON形式であることを確認してください
    8. JSON内で特殊文字を使用しないでください
    9. すべての日本語文字はUnicodeエンコーディングする必要があります

    注意：JSONの改行には \\n を使用し、すべての引用符が正しくエスケープされていることを確認してください。`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.5,
      system: `あなたは実践的な教育に焦点を当てたPythonプログラミング講師です。
      完全に有効なJSON形式のコンテンツを生成する必要があります。
      問題の説明は日本語を使用しますが、日本語をUnicodeエンコーディングに変換する必要があります。
      コードとコメントは英語を使用します。
      生成されたJSONが正しく解析できることを確認してください。`,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = response.content[0]
    if (!content || content.type !== 'text') {
      throw new Error('Empty response from Anthropic')
    }

    // JSONレスポンスの解析
    try {
      const text = content.text.trim()
      
      // デバッグ用に元のレスポンスを記録
      console.log('AI Response:', text)

      // JSONの抽出を試みる
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON found in response:', text)
        throw new Error('Invalid response format')
      }

      const jsonText = jsonMatch[0]
      console.log('Extracted JSON:', jsonText)

      // 日本語をUnicodeエンコーディングに変換
      const encodedText = jsonText.replace(/[\u4e00-\u9fa5]/g, char => 
        `\\u${char.charCodeAt(0).toString(16).padStart(4, '0')}`
      )

      // JSONの解析
      const data = JSON.parse(encodedText) as ExercisesResponse

      // データ構造の検証
      if (!Array.isArray(data.exercises)) {
        throw new Error('Invalid exercises format')
      }

      // 各演習の検証
      data.exercises.forEach((exercise, index) => {
        if (!exercise.question || !exercise.initialCode) {
          throw new Error(`Invalid exercise at index ${index}`)
        }
      })

      // コード内の改行文字と日本語のデコード処理
      const processedData = {
        exercises: data.exercises.map(exercise => ({
          ...exercise,
          // 日本語文字のデコード
          question: decodeURIComponent(JSON.parse(`"${exercise.question}"`)),
          initialCode: exercise.initialCode
            .replace(/\\n/g, '\n')
            .replace(/\\"/g, '"')
            .replace(/\\'/g, "'")
            .trim()
        }))
      }

      return NextResponse.json(processedData)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      if (content.type === 'text') {
        console.error('Raw response:', content.text)
      }
      throw new Error(`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }
  } catch (error) {
    console.error('演習の生成に失敗しました:', error)
    return NextResponse.json(
      { 
        error: '演習の生成に失敗しました',
        details: error instanceof Error ? error.message : '不明なエラー',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 