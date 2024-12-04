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

    const prompt = `Haskellプログラミング教育の専門家として、トピック「${topic}」に関する視覚的な学習に適した教育コンテンツを作成してください。

    以下の内容を提供してください：

    1. 概念の視覚化：
       - 基本的な定義と目的を図解で説明
       - 概念間の関係性を図示
       - 実際の処理フローを視覚的に表現

    2. 段階的な学習内容：
       - 各概念を視覚的な要素と共に説明
       - 抽象的な概念を具体的な図で表現
       - 複雑な処理を段階的な図解で解説

    3. コード例と視覚化：
       - コードの実行フローを図示
       - データの変換過程を図解
       - エラーケースと解決策を視覚的に説明

    図解の種類は以下から適切なものを選んでください：
    - function-call: 関数呼び出し図（再帰やパターンマッチングの理解に）
    - data-flow: データフロー図（純関数とデータ変換の説明に）
    - type-relation: 型関係図（型システムの理解を助ける）
    - adt: 代数データ型図（データ構造の説明に）
    - monad: Monad操作図（モナドの理解を深める）
    - functor: 関手図（FunctorやApplicativeの説明に）

    以下のJSON形式で回答してください：
    {
      "title": "${topic}の視覚的理解",
      "introduction": "概要説明（200文字以内）",
      "sections": [
        {
          "title": "セクションタイトル",
          "content": "説明文",
          "codeExample": "実行可能なコード例",
          "explanation": "コードの詳細な説明",
          "visualizations": [
            {
              "type": "図の種類（上記6種類から選択）",
              "description": "図の説明",
              "elements": [
                {
                  "id": "node1",
                  "type": "node",
                  "label": "表示テキスト"
                }
              ],
              "connections": [
                {
                  "from": "node1",
                  "to": "node2",
                  "label": "接続の説明"
                }
              ]
            }
          ]
        }
      ]
    }

    注意事項：
    1. JSONは必ず有効な形式で返してください
    2. コード例は実行可能な完全なものにしてください
    3. 図の要素とつながりは具体的に定義してください
    4. 説明は初心者にもわかりやすい言葉を使ってください
    5. セクションは2-3個程度に収めてください`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: "あなたはHaskellプログラミングの専門家で、視覚的な教材作成を得意としています。必ず有効なJSONを返してください。",
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
      throw new Error('No JSON found in response')
    }

    try {
      const parsedContent = JSON.parse(jsonMatch[0])
      
      // データの検証
      if (!parsedContent.title || !parsedContent.introduction || !Array.isArray(parsedContent.sections)) {
        throw new Error('Invalid content structure')
      }

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