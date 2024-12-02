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

    const prompt = `あなたはPythonのプログラミング講師です。トピック「${topic}」の詳細な教育コンテンツを作成してください。

    以下のJSON形式で厳密に回答してください：

    {
      "title": "トピックのタイトル",
      "introduction": "詳細な概念紹介",
      "concepts": [
        "コアコンセプト1",
        "コアコンセプト2"
      ],
      "relatedTopics": [
        {
          "topic": "関連知識1",
          "explanation": "詳細な説明"
        }
      ],
      "sections": [
        {
          "title": "例題のタイトル",
          "content": "例題の説明",
          "codeExample": [
            {
              "code": "fruits = [\"apple\", \"banana\", \"cherry\"]",
              "explanation": "このコード行の詳細な説明"
            },
            {
              "code": "for fruit in fruits:",
              "explanation": "このコード行の詳細な説明"
            },
            {
              "code": "    print(fruit)",
              "explanation": "このコード行の詳細な説明"
            }
          ],
          "summary": "例題のまとめ"
        }
      ]
    }

    要件：
    1. 概念紹介は包括的で深い内容にすること
    2. コアコンセプトは重要点を強調すること
    3. 関連知識は理解の助けとなること
    4. コード例は行ごとに表示し、各行を独立させること
    5. 各コード行に詳細な説明をつけること
    6. コードは適切なインデントを保持すること
    7. 生成されるJSONは有効な形式であること

    注意：
    1. コードは必ず行ごとに分割し、各行を独立したオブジェクトとすること
    2. コードのインデント形式を保持すること（スペースを使用）
    3. 各コード行に詳細な説明が必要
    4. すべての引用符を適切にエスケープすること`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: "あなたは詳細な説明に特化したPythonプログラミング講師です。あなたの説明は詳細で包括的であり、かつ理解しやすいものである必要があります。",
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
      if (!data.title || !data.introduction || !Array.isArray(data.sections)) {
        throw new Error('Invalid content structure')
      }

      return NextResponse.json(data)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      throw new Error('Invalid JSON format in response')
    }
  } catch (error) {
    console.error('教育コンテンツの生成に失敗:', error)
    return NextResponse.json(
      { error: '教育コンテンツの生成に失敗' },
      { status: 500 }
    )
  }
} 