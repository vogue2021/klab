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

    const prompt = `Haskellプログラミング教育の専門家として、トピック「${topic}」に関する聴覚学習に適した教育コンテンツを作成してください。

    以下の内容を提供してください：
    1. 概念説明：
       - 基本的な定義と目的を日常生活の例を用いて説明
       - 必要な背景知識や前提条件の解説
       - 実際の応用場面や使用例の紹介
    
    2. 段階的な学習内容：
       - 基礎から応用まで、小さなステップで説明
       - 各概念がどのように関連しているかの説明
       - プログラミング初心者でも理解できる言葉での解説
    
    3. コード例と解説：
       - シンプルな例から実践的な例まで段階的に提示
       - 各行のコードの役割と意図の詳細な説明
       - よくある間違いや注意点の解説
       - デバッグのヒントと解決方法
    
    4. 実践とフィードバック：
       - 理解度を確認するための質問
       - 実践的な練習問題と解答例
       - 応用課題とヒント
    
    要件：
    - 専門用語を使用する場合は必ず平易な言葉で説明を追加
    - 具体的な例や比喩を多用し、イメージしやすく
    - 学習者が躓きやすいポイントを予測して説明
    - 質問形式を取り入れ、対話的な学習を促進
    - 実際の開発現場での活用例も含める

    日本語で回答し、以下のJSON形式でコンテンツを構成してください：
    {
      "title": "トピックタイトル",
      "introduction": "簡単な紹介",
      "prerequisites": ["前提知識1", "前提知識2"],
      "sections": [
        {
          "title": "セクションタイトル",
          "content": "セクション内容",
          "codeExample": "コード例",
          "explanation": "詳細な説明",
          "commonMistakes": ["よくある間違い1", "よくある間違い2"],
          "tips": ["実践的なヒント1", "実践的なヒント2"]
        }
      ],
      "keyPoints": ["重要ポイント1", "重要ポイント2"],
      "exercises": [
        {
          "question": "練習問題",
          "hints": ["ヒント1", "ヒント2"],
          "solution": "解答例"
        }
      ],
      "realWorldExamples": ["実際の使用例1", "実際の使用例2"],
      "furtherResources": ["追加の学習リソース1", "追加の学習リソース2"]
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