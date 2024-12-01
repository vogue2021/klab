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

    // 首先用 AI 分析代码
    const prompt = `你是一位 Python 编程老师。请分析以下 Python 代码，并提供：
    1. 代码的主要功能和目的
    2. 代码的执行流程，用简单的步骤列出
    3. 重点关注代码中的：
       - 函数定义
       - 条件判断
       - 循环结构
       - 关键操作
    4. 用初学者容易理解的语言描述每个步骤

    代码：
    ${code}

    请用中文回答，确保解释清晰易懂。`

    const aiResponse = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 2000,
      temperature: 0.7,
      system: "你是一个编程教育专家，专注于帮助初学者理解代码流程。",
      messages: [{
        role: 'user',
        content: prompt
      }]
    })

    if (!aiResponse.content[0]?.text) {
      throw new Error('AI 分析失败')
    }

    const analysis = aiResponse.content[0].text

    // 基于 AI 分析结果生成流程图
    const { nodes, links } = generateFlowchart(code, analysis)

    return NextResponse.json({ 
      nodes,
      links,
      analysis, // 同时返回 AI 分析结果
      success: true 
    })

  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json({ 
      error: '生成流程图失败',
      success: false 
    }, { 
      status: 500 
    })
  }
}

function generateFlowchart(code: string, analysis: string): { nodes: Node[], links: Link[] } {
  // 基本节点
  const nodes: Node[] = [
    { id: 'start', label: '开始', type: 'start' }
  ]
  const links: Link[] = []
  let lastNodeId = 'start'
  let nodeCounter = 1

  // 从 AI 分析中提取关键步骤
  const steps = extractStepsFromAnalysis(analysis)
  
  // 分析代码
  const lines = code.split('\n').filter(line => line.trim())
  
  lines.forEach((line, index) => {
    const currentId = `node${nodeCounter}`
    const step = steps[index] // 获取对应的 AI 分析步骤
    
    // 检测代码类型并创建相应节点
    if (line.includes('def ')) {
      nodes.push({
        id: currentId,
        label: `函数定义\n${step || line.trim()}`, // 使用 AI 解释或原始代码
        type: 'function'
      })
    } else if (line.includes('if ')) {
      nodes.push({
        id: currentId,
        label: `条件判断\n${step || line.trim()}`,
        type: 'condition'
      })
      
      // 添加条件分支
      const trueId = `node${nodeCounter + 1}`
      const falseId = `node${nodeCounter + 2}`
      
      nodes.push(
        { id: trueId, label: '执行True分支', type: 'process' },
        { id: falseId, label: '执行False分支', type: 'process' }
      )
      
      links.push(
        { source: currentId, target: trueId, label: 'True' },
        { source: currentId, target: falseId, label: 'False' }
      )
      
      nodeCounter += 2
    } else if (line.includes('while ') || line.includes('for ')) {
      nodes.push({
        id: currentId,
        label: `循环\n${step || line.trim()}`,
        type: 'loop'
      })
    } else {
      nodes.push({
        id: currentId,
        label: step || line.trim(), // 使用 AI 解释或原始代码
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

  // 添加结束节点
  const endId = `node${nodeCounter}`
  nodes.push({ id: endId, label: '结束', type: 'end' })
  links.push({ source: lastNodeId, target: endId })

  return { nodes, links }
}

function extractStepsFromAnalysis(analysis: string): string[] {
  // 从 AI 分析文本中提取步骤说明
  // 这里可以根据实际的 AI 输出格式进行调整
  const steps: string[] = []
  const lines = analysis.split('\n')
  
  lines.forEach(line => {
    if (line.includes('步骤') || line.includes('第') || line.includes('.')) {
      // 提取步骤说明，去除序号和多余空格
      const step = line.replace(/^[0-9.、步骤]*/, '').trim()
      if (step) {
        steps.push(step)
      }
    }
  })

  return steps
} 