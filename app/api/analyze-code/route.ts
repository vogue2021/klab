import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface CodeAnalysis {
  output: string
  feedback: string
}

export async function POST(request: Request) {
  try {
    const { code, expectedCode, topic } = await request.json()
    
    if (!code || !expectedCode || !topic) {
      throw new Error('Code, expected code and topic are required')
    }

    const prompt = `あなたはHaskellプログラミングの講師です。学習者のコードを評価し、フィードバックを提供してください。

トピック: ${topic}

学習者のコード:
\`\`\`haskell
${code}
\`\`\`

模範解答:
\`\`\`haskell
${expectedCode}
\`\`\`

以下の点について評価し、厳密なJSON形式で回答してください：

{
  "output": "コードの実行結果をここに記入",
  "feedback": "1. コードの正確性: (評価内容) 2. コードの効率性: (評価内容) 3. コーディングスタイル: (評価内容) 4. 改善点: (改善点1, 改善点2) 5. 良い点: (良い点1, 良い点2)"
}`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: "あなたはHaskellプログラミングの専門家で、学習者のコードを評価し、建設的なフィードバックを提供することができます。必ず有効なJSONを返してください。改行は使わず、一行で返してください。",
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
    
    const jsonMatch = cleanedResponse.match(/\{[\s\S]*?\}/)
    if (!jsonMatch) {
      console.error('No JSON found in response:', cleanedResponse)
      throw new Error('No JSON found in response')
    }

    try {
      const jsonStr = jsonMatch[0].replace(/\n/g, ' ').replace(/\r/g, ' ')
      const parsedContent = JSON.parse(jsonStr) as CodeAnalysis
      
      if (!parsedContent.output || !parsedContent.feedback) {
        throw new Error('Invalid response structure')
      }

      return NextResponse.json(parsedContent)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      console.error('Raw response:', cleanedResponse)
      throw new Error(`Invalid JSON format: ${parseError instanceof Error ? parseError.message : 'Unknown error'}`)
    }
  } catch (error) {
    console.error('コードの評価に失敗:', error)
    return NextResponse.json(
      { 
        error: 'コードの評価に失敗しました', 
        details: error instanceof Error ? error.message : '不明なエラー',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    )
  }
}
