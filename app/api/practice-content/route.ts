import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface Content {
  title: string
  introduction: string
  prerequisites: string[]
  sections: Array<{
    title: string
    content: string
    codeExample: string
    explanation: string
    commonMistakes: string[]
    tips: string[]
  }>
  keyPoints: string[]
  exercises: Array<{
    question: string
    hints: string[]
    solution: string
  }>
  realWorldExamples: string[]
  furtherResources: string[]
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()
    
    if (!topic) {
      throw new Error('Topic is required')
    }

    const prompt = `あなたはHaskellプログラミング教育の専門家です。トピック「${topic}」について、詳細な教育コンテンツを作成してください。

以下のJSON形式で厳密に回答してください：
{
  "title": "${topic}の基礎と実践",
  "introduction": "概念の簡潔な説明（200文字以内）",
  "prerequisites": [
    "必要な前提知識1",
    "必要な前提知識2"
  ],
  "sections": [
    {
      "title": "セクションタイトル",
      "content": "詳細な説明と解説（コードは\`code\`で囲み、重要な部分は**太字**で強調）",
      "codeExample": "実行可能なサンプルコード",
      "explanation": "コードの詳細な説明（各行の役割を明確に）",
      "commonMistakes": [
        "よくある間違い1",
        "よくある間違い2"
      ],
      "tips": [
        "実践的なヒント1",
        "実践的なヒント2"
      ]
    }
  ],
  "keyPoints": [
    "重要ポイント1",
    "重要ポイント2"
  ],
  "exercises": [
    {
      "question": "練習問題",
      "hints": [
        "ヒント1",
        "ヒント2"
      ],
      "solution": "解答例"
    }
  ],
  "realWorldExamples": [
    "実際の使用例1",
    "実際の使用例2"
  ],
  "furtherResources": [
    "追加の学習リソース1",
    "追加の学習リソース2"
  ]
}

コンテンツの要件：

1. 説明スタイル：
   - 専門用語を使用する場合は必ず平易な言葉で説明を追加
   - 具体的な例や比喩を多用し、イメージしやすく
   - 学習者が躓きやすいポイントを予測して説明
   - 質問形式を取り入れ、対話的な学習を促進

2. コード例：
   - シンプルな例から実践的な例まで段階的に提示
   - 各行のコードの役割と意図の詳細な説明
   - エラーハンドリングも含める
   - デバッグのヒントと解決方法

3. セクション構成：
   - 基礎から応用まで、3-4つのセクションで構成
   - 各セクションは独立して理解できるように
   - セクション間の関連性を明確に
   - 段階的な難易度の上昇

4. 実践的な内容：
   - 実際のプログラミングで使用される例
   - パフォーマンスの考慮事項
   - ベストプラクティスの紹介
   - よくある間違いと解決策

5. 学習のポイント：
   - 重要な概念は必ず強調（**太字**）
   - コードは必ずバッククォート(\`)で囲む
   - 箇条書きを活用して読みやすく
   - 発展的な学習への道筋を示す

6. 全体の要件：
   - 論理的な流れを持つ構成
   - 実践的な例を重視
   - Haskellの特徴を活かした説明
   - 有効なJSON形式であること`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: "あなたはHaskellプログラミングの専門家で、初心者にもわかりやすい説明ができます。教育コンテンツは実践的で、段階的な学習を重視します。",
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
    
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      console.error('No JSON found in response:', cleanedResponse)
      throw new Error('No JSON found in response')
    }

    try {
      const parsedContent = JSON.parse(jsonMatch[0]) as Content
      
      if (!parsedContent.title || !parsedContent.introduction || !Array.isArray(parsedContent.sections)) {
        throw new Error('Invalid content structure')
      }

      parsedContent.sections.forEach((section, index) => {
        if (!section.title || !section.content || !section.codeExample || !section.explanation) {
          throw new Error(`Invalid section structure at index ${index}`)
        }
      })

      return NextResponse.json(parsedContent)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', cleanedResponse)
      throw new Error(`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }
  } catch (error) {
    console.error('教育コンテンツの生成に失敗:', error)
    return NextResponse.json(
      { 
        error: '教育コンテンツの生成に失敗しました', 
        details: error instanceof Error ? error.message : '不明なエラー',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 