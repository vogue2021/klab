import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || ''
})

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    console.log('Received code:', code)

    if (!code) {
      return NextResponse.json({ error: 'コードが提供されていません' }, { status: 400 })
    }

    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json({ error: 'APIキーが設定されていません' }, { status: 500 })
    }

    try {
      const message = await anthropic.messages.create({
        model: 'claude-3-sonnet-20240229',
        max_tokens: 4000,
        temperature: 0,
        messages: [
          {
            role: 'user',
            content: `このHaskellコードの実行プロセスを分析し、各ステップの詳細な説明を生成してください。
            
            要件：
            1. コードの実行プロセスを行ごとに分析
            2. 各ステップの関数評価と型の変化を説明
            3. コードの純粋性とロジックを説明
            
            JSONフォーマットで返してください。例：
            {
              "steps": [
                {
                  "lineNumber": 1,
                  "code": "let x = 5",
                  "explanation": "値5を不変の変数xにバインド",
                  "types": {
                    "x": "Integer"
                  }
                }
              ]
            }
            
            Haskellコード：
            ${code}`
          }
        ]
      })

      console.log('AI Response:', message.content)

      const responseText = message.content[0].text
      const startJson = responseText.indexOf('{')
      const endJson = responseText.lastIndexOf('}') + 1
      const jsonStr = responseText.slice(startJson, endJson)
      
      const data = JSON.parse(jsonStr)
      console.log('Parsed data:', data)

      return NextResponse.json(data)
      
    } catch (aiError) {
      console.error('AI Analysis Error:', aiError)
      return NextResponse.json({ error: 'AIがコードを分析中にエラーが発生しました' }, { status: 500 })
    }

  } catch (error) {
    console.error('API Route Error:', error)
    return NextResponse.json({ 
      error: 'コードの分析に失敗しました', 
      details: error instanceof Error ? error.message : '不明なエラー'
    }, { status: 500 })
  }
} 