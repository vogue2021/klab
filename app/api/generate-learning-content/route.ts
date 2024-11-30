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
        content: `作为编程教育专家，请为Python初学者生成一份关于"${topic}"的学习内容。
                 对于流程图可视化，请确保返回以下节点：
                 - start (开始节点)
                 - condition (条件判断节点)
                 - true_block (条件为真时执行的代码块)
                 - false_block (条件为假时执行的代码块)
                 - end (结束节点)
                 
                 每个节点都应该有合适的中文标签。
                 连接线应该标注条件判断结果（True/False）。
                 
                 请严格按照以下JSON格式返回（不要添加任何其他文本）：
                 {
                   "concept": {
                     "explanation": "概念解释文本",
                     "visualization": {
                       "type": "图表类型，如 force-directed, tree, flowchart 等",
                       "nodes": [
                         {
                           "id": "唯一标识",
                           "label": "显示文本",
                           "type": "节点类型，如 concept, example, detail 等",
                           "description": "悬停时显示的详细解释"
                         }
                       ],
                       "links": [
                         {
                           "source": "源节点id",
                           "target": "目标节点id",
                           "label": "关系说明（可选）"
                         }
                       ]
                     }
                   },
                   "examples": [
                     {
                       "code": "示例代码",
                       "explanation": "代码解释",
                       "output": "代码输出"
                     }
                   ],
                   "exercises": [
                     {
                       "question": "练习题目",
                       "hints": ["提示1", "提示2"],
                       "solution": "参考答案"
                     }
                   ]
                 }
                 
                 请确保：
                 1. 概念可视化数据结构要适合用D3.js展示
                 2. 节点和连接的数据要有意义且易于理解
                 3. 内容要简单易懂，适合初学者
                 4. 严格按照JSON格式返回`
      }],
      temperature: 0.7,
    })

    // 处理返回内容
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
      { error: '生成内容失败' },
      { status: 500 }
    )
  }
} 