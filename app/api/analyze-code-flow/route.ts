import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

interface Node {
  id: string
  label: string
  type?: string
}

interface Link {
  source: string
  target: string
  label?: string
}

export async function POST(request: Request) {
  try {
    const { code } = await request.json()

    // まずAIでコードを分析する
    const prompt = `あなたはPythonのプログラミング講師です。以下のPythonコードを分析し、以下を提供してください：
    1. コードの主な機能と目的（一文で要約）
    2. コードの実行フロー、簡単なステップで列挙（各ステップ10文字以内）
    3. 詳細な説明：
       - 重要な関数の役割
       - 重要な変数の意味
       - コアアルゴリズムの考え方
    
    説明では\`コード\`でコード片をマークし、説明が明確で分かりやすいことを確認してください。

    コード：
    ${code}

    日本語で回答し、フォーマットを適切に保ってください。`

    const aiResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: "あなたはプログラミング教育の専門家で、初心者がコードの流れを理解するのを支援することに特化しています。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!aiResponse.content[0]?.text) {
      throw new Error('AI分析に失敗しました')
    }

    const analysis = aiResponse.content[0].text

    // AI分析結果に基づいてフローチャートを生成
    const { nodes, links } = generateFlowchart(code, analysis)

    return NextResponse.json({ 
      nodes,
      links,
      analysis, // AI分析結果も返す
      success: true 
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: 'フローチャートの生成に失敗しました',
      success: false 
    }, { 
      status: 500 
    })
  }
}

function generateFlowchart(code: string, analysis: string): { nodes: Node[], links: Link[] } {
  // 基本ノード
  const nodes: Node[] = [
    { id: 'start', label: '開始', type: 'start' }
  ]
  const links: Link[] = []
  let lastNodeId = 'start'
  let nodeCounter = 1

  // AI分析から重要なステップを抽出
  const steps = extractStepsFromAnalysis(analysis)
  
  // コードを分析
  const lines = code.split('\n').filter(line => line.trim())
  
  function simplifyLabel(text: string): string {
    // 関数定義を簡略化
    if (text.includes('def ')) {
      return text.split('(')[0].replace('def ', '関数: ')
    }
    // 条件判断を簡略化
    if (text.includes('if ')) {
      return text.replace(/if\s+/, '判断: ').split(':')[0]
    }
    // ループを簡略化
    if (text.includes('while ')) {
      return text.replace(/while\s+/, 'ループ: ').split(':')[0]
    }
    if (text.includes('for ')) {
      return text.replace(/for\s+/, 'ループ: ').split(':')[0]
    }
    // 戻り値を簡略化
    if (text.includes('return ')) {
      return '戻り値: ' + text.replace('return ', '')
    }
    // その他の文は短く保つ
    return text.length > 15 ? text.slice(0, 15) + '...' : text
  }

  lines.forEach((line, index) => {
    const currentId = `node${nodeCounter}`
    const step = steps[index]
    
    if (line.includes('def ')) {
      nodes.push({
        id: currentId,
        label: simplifyLabel(line.trim()),
        type: 'function'
      })
    } else if (line.includes('if ')) {
      nodes.push({
        id: currentId,
        label: simplifyLabel(line.trim()),
        type: 'condition'
      })
      
      // 条件分岐を追加
      const trueId = `node${nodeCounter + 1}`
      const falseId = `node${nodeCounter + 2}`
      
      nodes.push(
        { id: trueId, label: 'True分岐を実行', type: 'process' },
        { id: falseId, label: 'False分岐を実行', type: 'process' }
      )
      
      links.push(
        { source: currentId, target: trueId, label: 'True' },
        { source: currentId, target: falseId, label: 'False' }
      )
      
      nodeCounter += 2
    } else if (line.includes('while ') || line.includes('for ')) {
      nodes.push({
        id: currentId,
        label: `ループ\n${step || line.trim()}`,
        type: 'loop'
      })
    } else {
      nodes.push({
        id: currentId,
        label: step || line.trim(), // AI解説または元のコードを使用
        type: 'process'
      })
    }

    links.push({
      source: lastNodeId,
      target: currentId
    })

    lastNodeId = currentId
    nodeCounter++
  })

  // 終了ノードを追加
  const endId = `node${nodeCounter}`
  nodes.push({ id: endId, label: '終了', type: 'end' })
  links.push({ source: lastNodeId, target: endId })

  return { nodes, links }
}

function extractStepsFromAnalysis(analysis: string): string[] {
  // AI分析テキストからステップ説明を抽出
  // AIの出力フォーマットに応じて調整可能
  const steps: string[] = []
  const lines = analysis.split('\n')
  
  lines.forEach(line => {
    if (line.includes('ステップ') || line.includes('第') || line.includes('.')) {
      // ステップ説明を抽出し、番号と余分な空白を削除
      const step = line.replace(/^[0-9.、ステップ]*/, '').trim()
      if (step) {
        steps.push(step)
      }
    }
  })

  return steps
} 