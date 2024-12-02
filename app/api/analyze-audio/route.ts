import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { cache } from '@/lib/cache'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()
    
    if (!topic) {
      throw new Error('No topic provided')
    }

    // キャッシュを確認
    const cachedData = cache.get(topic, 'audio-content')
    if (cachedData) {
      console.log('Using cached audio content')
      return NextResponse.json(cachedData)
    }

    const prompt = `Pythonプログラミング教育の専門家として、トピック「${topic}」に関する聴覚学習に適した教育コンテンツを作成してください。

    以下の内容を提供してください：
    1. 概念説明：明確で口語的な方法で概念を説明
    2. コード例：シンプルな例を提供し、各ステップを説明
    3. 重要ポイントのまとめ：覚えるべきポイントを列挙
    4. 練習提案：口頭練習や考察問題を提供

    要件：
    - わかりやすい言葉を使用
    - 長い文を避ける
    - 比喩や実例を多用
    - 朗読や講義に適した表現方法

    日本語で回答し、以下のJSON形式でコンテンツを構成してください：
    {
      "title": "トピックタイトル",
      "introduction": "簡単な紹介",
      "sections": [
        {
          "title": "セクションタイトル",
          "content": "セクション内容",
          "codeExample": "コード例（該当する場合）",
          "explanation": "コードの説明（該当する場合）"
        }
      ],
      "keyPoints": ["重要ポイント1", "重要ポイント2", ...],
      "exercises": ["練習1", "練習2", ...]
    }`

    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: "あなたはプログラミング教育の専門家で、聴覚学習に適した教育コンテンツの作成に特化しています。明確で理解しやすい説明と例を生成してください。",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    // レスポンステキストを整理し、JSONのみを含むようにする
    let cleanedResponse = message.content[0].text.trim()
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.split('```json')[1].split('```')[0].trim()
    } else if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.split('```')[1].trim()
    }

    // JSONを解析
    const audioContent = JSON.parse(cleanedResponse)

    // キャッシュに保存
    cache.set(topic, 'audio-content', audioContent)
    
    return NextResponse.json(audioContent)
  } catch (error) {
    console.error('オーディオコンテンツ生成エラー:', error)
    return NextResponse.json(
      { error: '教育コンテンツの生成に失敗しました' },
      { status: 500 }
    )
  }
} 