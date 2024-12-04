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

    const prompt = `以下のHaskellコードを実行し、実行結果を返してください。
    コードの出力結果のみを返し、他の説明は追加しないでください。
    コードにエラーがある場合は、エラーメッセージを返してください。
    コードに出力がない場合は、"Code executed successfully with no output"を返してください。

    コード：
    ${code}

    以下のJSON形式で回答してください：
    {
      "output": "実行結果またはエラーメッセージ"
    }`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      temperature: 0,
      system: "あなたはHaskellコード実行者です。コードを実行して結果のみを返してください。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    const content = message.content[0]
    if (!content || content.type !== 'text') {
      throw new Error('Empty response from code execution')
    }

    try {
      const text = content.text.trim()
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      
      if (!jsonMatch) {
        throw new Error('Invalid response format')
      }

      const data = JSON.parse(jsonMatch[0])
      
      if (!data.output) {
        throw new Error('No output in response')
      }

      return NextResponse.json({ output: data.output })
    } catch (parseError) {
      console.error('出力の解析に失敗:', parseError)
      return NextResponse.json({ output: content.text.trim() })
    }
  } catch (error) {
    console.error('コードの実行に失敗:', error)
    return NextResponse.json(
      { 
        error: 'コードの実行に失敗',
        details: error instanceof Error ? error.message : '不明なエラー'
      },
      { status: 500 }
    )
  }
} 