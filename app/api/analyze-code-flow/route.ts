import { NextResponse } from 'next/server'

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

    // 解析代码并生成节点和连接
    const { nodes, links } = analyzeCode(code)

    return NextResponse.json({ 
      nodes,
      links,
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

function analyzeCode(code: string): { nodes: Node[], links: Link[] } {
  // 基本节点
  const nodes: Node[] = [
    { id: 'start', label: '开始', type: 'start' }
  ]
  const links: Link[] = []
  let lastNodeId = 'start'
  let nodeCounter = 1

  // 分析代码
  const lines = code.split('\n').filter(line => line.trim())
  
  lines.forEach((line, index) => {
    const currentId = `node${nodeCounter}`
    
    // 检测代码类型并创建相应节点
    if (line.includes('def ')) {
      nodes.push({
        id: currentId,
        label: `函数定义\n${line.trim()}`,
        type: 'function'
      })
    } else if (line.includes('if ')) {
      nodes.push({
        id: currentId,
        label: `条件判断\n${line.trim()}`,
        type: 'condition'
      })
      
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
        label: `循环\n${line.trim()}`,
        type: 'loop'
      })
    } else {
      nodes.push({
        id: currentId,
        label: line.trim(),
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