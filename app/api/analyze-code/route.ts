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

    // 检查缓存
    const cachedData = cache.get(code, 'flowchart')
    if (cachedData) {
      console.log('Using cached flowchart data')
      return NextResponse.json(cachedData)
    }

    const prompt = `分析以下Python代码，并提供：
    1. 代码的主要功能和目的
    2. 代码的执行流程，以简单的步骤列出
    3. 将执行流程转换为流程图数据，格式如下：
    {
      "nodes": [
        {
          "id": "string",
          "label": "节点描述",
          "type": "start|end|process|condition|loop|function"
        }
      ],
      "links": [
        {
          "source": "起始节点id",
          "target": "目标节点id",
          "label": "可选的连接描述"
        }
      ]
    }

    代码：
    ${code}

    请用中文回答，确保生成的是合法的JSON格式，包含nodes和links数组。节点类型说明：
    - start: 开始节点
    - end: 结束节点
    - process: 普通处理节点
    - condition: 条件判断节点
    - loop: 循环节点
    - function: 函数定义节点

    请确保输出的JSON格式完全符合要求，不要添加任何额外的文字说明。`

    console.log('Sending request to Anthropic...')
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: "你是一个编程教育专家。请分析代码并生成适合初学者理解的流程图数据。返回的必须是一个有效的JSON字符串。不要包含任何其他说明文字。",
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

    // 清理响应文本，确保只包含JSON
    let cleanedResponse = message.content[0].text.trim()
    // 如果响应包含了```json和```，只提取JSON部分
    if (cleanedResponse.includes('```json')) {
      cleanedResponse = cleanedResponse.split('```json')[1].split('```')[0].trim()
    } else if (cleanedResponse.includes('```')) {
      cleanedResponse = cleanedResponse.split('```')[1].trim()
    }

    // 尝试解析JSON
    let flowchartData
    try {
      flowchartData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', cleanedResponse)
      throw new Error('Invalid JSON response')
    }

    // 验证数据结构
    if (!flowchartData.nodes || !flowchartData.links) {
      throw new Error('Invalid flowchart data structure')
    }

    // 存入缓存
    cache.set(code, 'flowchart', flowchartData)
    
    return NextResponse.json(flowchartData)
  } catch (error) {
    console.error('流程图生成错误:', error)
    return NextResponse.json(
      { error: '生成流程图失败' },
      { status: 500 }
    )
  }
}

