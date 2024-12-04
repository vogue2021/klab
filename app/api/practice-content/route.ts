import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface Section {
  title: string
  content: string
  codeExample: string
  explanation: string
}

interface Content {
  title: string
  introduction: string
  sections: Section[]
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()
    
    if (!topic) {
      throw new Error('No topic provided')
    }

    const prompt = `あなたはHaskellのプログラミング講師です。トピック「${topic}」の実践的な教育コンテンツを作成してください。
    
    以下のJSON形式で厳密に回答してください。他の内容は追加しないでください：

    {
      "title": "${topic}",
      "introduction": "ここに100文字以内の概念説明を書いてください",
      "sections": [
        {
          "title": "例題1：基本的な使い方",
          "content": "ここに例題の説明を書いてください",
          "codeExample": "-- 完全な実行可能なコード",
          "explanation": "ここにコードの解説を書いてください。必ずコード例と完全に対応させてください"
        }
      ]
    }

    要件：
    1. 概念説明は簡潔明瞭に（100文字以内）
    2. 2-3個の段階的なコード例を提供
    3. 各例題には以下を含める：
       - 明確なタイトル（例題1/2/3：具体的なトピック）
       - 簡潔な例題説明
       - 完全な実行可能なコード
       - コードと完全に対応する詳細な説明
    4. コード例の要件：
       - 完全で直接実行可能なコード
       - 英語の変数名と出力を使用
       - 適切なコメントを含む
       - 適度なコードの長さ（5-10行）
    5. 例題は難易度順に：
       - 例題1：基本概念のデモ
       - 例題2：基本的な応用
       - 例題3：総合的な活用
    6. 各例題のコードと説明が厳密に対応していることを確認
    7. すべての例題は独立して実行可能
    8. 例題間のコードの重複を避ける

    注意：生成されるJSONは有効な形式であり、コード内の改行は \\n でエスケープしてください。`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.3,
      system: `あなたは実践的な教育に焦点を当てたHaskellプログラミング講師です。
      完全に有効なJSON形式のコンテンツを生成する必要があります。
      各例題は完全で独立した実行可能なコードを含む必要があります。
      コード例と説明は厳密に対応している必要があります。
      例題は段階的で相互に独立している必要があります。`,
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    // JSONのクリーニングと検証
    try {
      const text = message.content[0].text.trim()
      
      // デバッグ用に元のレスポンスを記録
      console.log('AI Response:', text)

      // JSONの抽出を試みる
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) {
        console.error('No JSON found in response:', text)
        throw new Error('No valid JSON found in response')
      }

      const jsonText = jsonMatch[0]
      console.log('Extracted JSON:', jsonText)

      // JSONの解析
      const content = JSON.parse(jsonText) as Content

      // コンテンツ構造の検証
      if (!content.title || !content.introduction || !Array.isArray(content.sections)) {
        console.error('Invalid content structure:', content)
        throw new Error('Invalid content structure')
      }

      // 各セクションの検証
      content.sections.forEach((section: Section, index: number) => {
        if (!section.title || !section.content || !section.codeExample || !section.explanation) {
          console.error(`Invalid section at index ${index}:`, section)
          throw new Error(`Invalid section structure at index ${index}`)
        }
      })

      // コード例のエスケープ文字をクリーニング
      content.sections = content.sections.map(section => ({
        ...section,
        codeExample: section.codeExample
          .replace(/\\n/g, '\n')
          .replace(/\\"/g, '"')
          .replace(/\\'/g, "'")
          .trim()
      }))

      return NextResponse.json(content)
    } catch (parseError: unknown) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', message.content[0].text)
      const errorMessage = parseError instanceof Error ? parseError.message : 'Unknown parsing error'
      throw new Error(`Invalid JSON format in response: ${errorMessage}`)
    }
  } catch (error) {
    console.error('教育コンテンツの生成に失敗:', error)
    return NextResponse.json(
      { 
        error: '教育コンテンツの生成に失敗', 
        details: error instanceof Error ? error.message : '不明なエラー',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
} 