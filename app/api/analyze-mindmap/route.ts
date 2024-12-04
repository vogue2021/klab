import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { cache } from '@/lib/cache'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

export async function POST(request: Request) {
  try {
    const { code } = await request.json()
    
    if (!code) {
      throw new Error('No code provided')
    }

    // キャッシュをチェック
    const cachedData = cache.get(code, 'mindmap')
    if (cachedData) {
      console.log('Using cached mindmap data')
      return NextResponse.json(cachedData)
    }

    const prompt = `
    以下のHaskellコードを分析し、含まれる知識ポイントを抽出し、マインドマップの形式で整理してください。
    
    コード:
    ${code}

    以下の構造を含むJSON形式のマインドマップデータを生成してください：
    {
      "name": "コード分析",  // ルートノード名
      "children": [        // 子ノード配列
        {
          "name": "基本概念",   // 第一層ノード
          "children": [         // 第二層ノード
            {
              "name": "具体的な知識ポイント"  // リーフノード
            }
          ]
        }
      ]
    }

    要件：
    1. ルートノードはコードの主な機能やテーマを概括すべき
    2. 第一層ノードは主な知識ポイントのカテゴリーであるべき（例：型定義、パターンマッチング、関数定義など）
    3. 第二層ノードは具体的な知識ポイントであるべき
    4. 各ノードはname属性を持つ必要がある
    5. 子ノードがある場合は、children配列を含む必要がある
    6. 生成される形式は有効なJSONである必要がある
    7. コメントを含めないでください

    出力されるJSONフォーマットが要件を完全に満たすようにし、余分な説明文を追加しないでください。
    `

    console.log('Sending request to Anthropic...')
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: "あなたはプログラミング教育の専門家です。コードを分析し、重要な知識ポイントを抽出し、マインドマップデータを生成してください。返却値は、nameと任意のchildren フィールドを含む有効なJSON文字列である必要があります。他の説明文を含めないでください。",
      messages: [
        {
          role: 'user',
          content: prompt
        }
      ]
    })

    console.log('Received response from Anthropic')
    
    if (!message.content[0]?.text) {
      throw new Error('Empty response from Anthropic')
    }

    // レスポンステキストをクリーンアップし、JSONのみを含むようにする
    let cleanedResponse = message.content[0].text.trim()
    // レスポンスに```jsonと```が含まれている場合、JSON部分のみを抽出
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.split('```json')[1].split('```')[0].trim()
    } else if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.split('```')[1].trim()
    }

    // JSONの解析を試みる
    let mindMapData
    try {
      mindMapData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', cleanedResponse)
      throw new Error('Invalid JSON response')
    }

    // データ構造を検証
    if (!mindMapData.name || !mindMapData.children) {
      throw new Error('Invalid mindmap data structure')
    }

    // キャッシュに保存
    cache.set(code, 'mindmap', mindMapData)
    
    return NextResponse.json(mindMapData)
  } catch (error) {
    console.error('マインドマップ生成エラー:', error)
    
    // 基本的なマインドマップ構造を返す
    return NextResponse.json({
      name: "コード分析",
      children: [
        {
          name: "基本構造",
          children: [
            {
              name: "コードを分析中..."
            }
          ]
        }
      ]
    })
  }
} 