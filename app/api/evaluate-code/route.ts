import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface TestCase {
  input: string
  expectedOutput: string
}

export async function POST(request: Request) {
  try {
    const { code, testCases } = await request.json()
    
    if (!code || !Array.isArray(testCases)) {
      throw new Error('Missing required fields')
    }

    const prompt = `以下のHaskellコードをテストケースで評価し、結果を返してください：

コード：
\`\`\`haskell
${code}
\`\`\`

テストケース：
${testCases.map((test: TestCase, index: number) => `
テストケース${index + 1}:
入力: ${test.input}
期待される出力: ${test.expectedOutput}
`).join('\n')}

以下の形式で回答してください：
{
  "feedback": "テスト結果の詳細な説明（成功したケース、失敗したケース、改善点など）"
}`

    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: "あなたはHaskellプログラミングの専門家で、コードのテストと評価を行います。必ず有効なJSONを返してください。",
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
      throw new Error('Invalid response format')
    }

    try {
      const data = JSON.parse(jsonMatch[0].replace(/\n/g, '\\n'))
      if (!data.feedback) {
        throw new Error('Invalid response structure')
      }
      return NextResponse.json(data)
    } catch (parseError) {
      console.error('JSON parsing error:', parseError)
      throw new Error('Invalid JSON format')
    }
  } catch (error) {
    console.error('コードの評価に失敗しました:', error)
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