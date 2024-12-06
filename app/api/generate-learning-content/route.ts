import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface Visualization {
  type: string
  description: string
  elements: Array<{
    id: string
    type: string
    label: string
  }>
  connections: Array<{
    from: string
    to: string
    label: string
  }>
}

interface Section {
  title: string
  content: string
  codeExample?: string
  explanation?: string
  visualizations: Visualization[]
}

interface LearningContent {
  title: string
  introduction: string
  sections: Section[]
}

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()
    
    if (!topic) {
      return NextResponse.json(
        { error: 'トピックが指定されていません' },
        { status: 400 }
      )
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
    - function-call: 関数呼び出し図
    - data-flow: データフロー図
    - type-relation: 型関係図
    - adt: 代数データ型図
    - monad: Monad操作図
    - functor: 関手図

    以下のような構造のJSONで回答してください。改行を含めず、1行で返してください：

    {
      "title": "${topic}の視覚的理解",
      "introduction": "概要説明",
      "sections": [
        {
          "title": "セクションタイトル",
          "content": "説明文",
          "codeExample": "実行可能なコード例",
          "explanation": "コードの詳細な説明",
          "visualizations": [
            {
              "type": "function-call",
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
    2. 改行は使用せず、1行で返してください
    3. 全ての文字列はダブルクォートで囲んでください
    4. 説明は初心者にもわかりやすい言葉を使ってください
    5. セクションは2-3個程度に収めてください`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: "あなたは視覚的な説明に特化したHaskellのプログラミング講師です。必ず有効なJSONを返してください。改行を含めずに1行で返してください。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = response.content[0]
    if (!content || content.type !== 'text') {
      throw new Error('Empty response from AI')
    }

    // 处理 AI 响应
    const text = content.text.trim()
    let jsonContent = text

    // 如果响应被包裹在 ```json ``` 中，提取 JSON 部分
    if (text.includes('```json')) {
      jsonContent = text.split('```json')[1].split('```')[0].trim()
    } else if (text.includes('```')) {
      jsonContent = text.split('```')[1].split('```')[0].trim()
    }

    try {
      const parsedData = JSON.parse(jsonContent) as LearningContent
      
      // 基本数据结构验证
      if (!parsedData.title || !parsedData.introduction || !Array.isArray(parsedData.sections)) {
        console.error('Missing required fields:', { 
          hasTitle: !!parsedData.title,
          hasIntro: !!parsedData.introduction,
          hasSections: Array.isArray(parsedData.sections)
        })
        throw new Error('Invalid data structure: missing required fields')
      }

      // 验证每个部分，但更宽松
      parsedData.sections.forEach((section, index) => {
        if (!section.title || !section.content || !Array.isArray(section.visualizations)) {
          console.error(`Invalid section at index ${index}:`, section)
          throw new Error(`Invalid section structure at index ${index}`)
        }

        // 验证可视化数据
        section.visualizations.forEach((vis, visIndex) => {
          if (!vis.type || !vis.description || !Array.isArray(vis.elements) || !Array.isArray(vis.connections)) {
            console.error(`Invalid visualization at section ${index}, visualization ${visIndex}:`, vis)
            throw new Error(`Invalid visualization structure at section ${index}`)
          }
        })
      })

      return NextResponse.json(parsedData)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', jsonContent)
      return NextResponse.json(
        { error: 'AIからの応答の解析に失敗しました' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('視覚的コンテンツの生成に失敗:', error)
    return NextResponse.json(
      { error: '視覚的コンテンツの生成に失敗しました' },
      { status: 500 }
    )
  }
}