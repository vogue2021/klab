import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      throw new Error('No code provided')
    }

    const prompt = `あなたはHaskellプログラミング講師です。以下のHaskellコードの実行過程をステップバイステップで分析し、
    各ステップでの変数の状態と説明を提供してください。

    コード：
    ${code}

    以下のJSON形式で応答してください：
    {
      "steps": [
        {
          "line": 0,  // 実行中の行番号（0から開始）
          "explanation": "この行では...",  // その行で何が起こっているかの説明
          "variables": {  // その時点での変数の状態
            "変数名": "値"
          }
        }
      ]
    }

    要件：
    1. 各ステップは1行のコードの実行を表す
    2. explanationは初心者にもわかりやすい説明であること
    3. variablesには、その時点で定義されているすべての変数の状態を含める
    4. 関数定義や型宣言なども適切に説明する
    5. エラーが発生する可能性がある場合はその旨を説明に含める

    注意：
    - 実際の実行結果ではなく、コードの解析結果を提供してください
    - 説明は具体的で、技術的に正確であること
    - 変数の状態変化を詳細に追跡すること`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: "あなたはHaskellプログラミングの専門家で、コードの実行過程を詳細に分析し、わかりやすく説明することができます。",
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
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.split('```json')[1].split('```')[0].trim()
    } else if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.split('```')[1].trim()
    }

    // JSONを解析
    const animationData = JSON.parse(cleanedResponse)

    // データの検証
    if (!Array.isArray(animationData.steps)) {
      throw new Error('Invalid animation data format')
    }

    return NextResponse.json(animationData)
  } catch (error) {
    console.error('アニメーション分析エラー:', error)
    return NextResponse.json(
      { error: 'アニメーション分析に失敗しました' },
      { status: 500 }
    )
  }
} 