import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()

    const response = await anthropic.messages.create({
      model: "claude-3-sonnet-20240229",
      max_tokens: 4000,
      messages: [{
        role: "user",
        content: `プログラミング教育の専門家として、Pythonの初心者向けに「${topic}」についての学習コンテンツを生成してください。
                 フローチャートの視覚化については、以下のノードを必ず含めてください：
                 - start (開始ノード)
                 - condition (条件判断ノード)
                 - true_block (条件が真の時に実行されるコードブロック)
                 - false_block (条件が偽の時に実行されるコードブロック)
                 - end (終了ノード)
                 
                 各ノードには適切な日本語のラベルを付けてください。
                 接続線には条件判断結果（True/False）を表示してください。
                 
                 以下のJSON形式で厳密に返してください（他のテキストは追加しないでください）：
                 {
                   "concept": {
                     "explanation": "概念説明テキスト",
                     "visualization": {
                       "type": "グラフタイプ（force-directed, tree, flowchartなど）",
                       "nodes": [
                         {
                           "id": "一意の識別子",
                           "label": "表示テキスト",
                           "type": "ノードタイプ（concept, example, detailなど）",
                           "description": "ホバー時に表示される詳細説明"
                         }
                       ],
                       "links": [
                         {
                           "source": "ソースノードid",
                           "target": "ターゲットノードid",
                           "label": "関係の説明（オプション）"
                         }
                       ]
                     }
                   },
                   "examples": [
                     {
                       "code": "サンプルコード",
                       "explanation": "コードの説明",
                       "output": "コードの出力"
                     }
                   ],
                   "exercises": [
                     {
                       "question": "練習問題",
                       "hints": ["ヒント1", "ヒント2"],
                       "solution": "参考解答"
                     }
                   ]
                 }
                 
                 以下を確認してください：
                 1. 概念の視覚化データ構造はD3.jsでの表示に適していること
                 2. ノードと接続のデータは意味があり理解しやすいこと
                 3. コンテンツは簡単で初心者向けであること
                 4. 厳密にJSON形式で返すこと`
      }],
      temperature: 0.7,
    })

    // レスポンスの処理
    let content = response.content[0].text.trim()
    if (content.startsWith('```json')) {
      content = content.slice(7)
    }
    if (content.endsWith('```')) {
      content = content.slice(0, -3)
    }
    content = content.trim()

    const parsedContent = JSON.parse(content)
    return NextResponse.json(parsedContent)

  } catch (error) {
    console.error('Generate learning content error:', error)
    return NextResponse.json(
      { error: 'コンテンツの生成に失敗しました' },
      { status: 500 }
    )
  }
} 