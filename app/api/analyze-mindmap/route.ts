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
    const cachedData = cache.get(code, 'mindmap')
    if (cachedData) {
      console.log('Using cached mindmap data')
      return NextResponse.json(cachedData)
    }

    const prompt = `
    请分析以下Python代码，提取其中涉及的知识点，并以思维导图的形式组织。
    
    代码:
    ${code}

    请生成一个包含以下结构的JSON格式思维导图数据：
    {
      "name": "代码分析",  // 根节点名称
      "children": [        // 子节点数组
        {
          "name": "基本概念",   // 第一层节点
          "children": [         // 第二层节点
            {
              "name": "具体知识点"  // 叶子节点
            }
          ]
        }
      ]
    }

    要求：
    1. 根节点应该概括代码的主要功能或主题
    2. 第一层节点应该是主要的知识点类别（如：变量定义、控制流程、函数定义等）
    3. 第二层节点应该是具体的知识点
    4. 每个节点必须有name属性
    5. 如果有子节点，必须包含children数组
    6. 确保生成的是合法的JSON格式
    7. 不要包含注释

    请确保输出的JSON格式完全符合要求，不要添加任何额外的文字说明。
    `

    console.log('Sending request to Anthropic...')
    const message = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 4000,
      temperature: 0.7,
      system: "你是一个编程教育专家。请分析代码并提取重要的知识点，生成思维导图数据。返回的必须是一个有效的JSON字符串，包含name和可选的children字段。不要包含任何其他说明文字。",
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
    let mindMapData
    try {
      mindMapData = JSON.parse(cleanedResponse)
    } catch (parseError) {
      console.error('JSON parse error:', parseError)
      console.error('Raw response:', cleanedResponse)
      throw new Error('Invalid JSON response')
    }

    // 验证数据结构
    if (!mindMapData.name || !mindMapData.children) {
      throw new Error('Invalid mindmap data structure')
    }

    // 存入缓存
    cache.set(code, 'mindmap', mindMapData)
    
    return NextResponse.json(mindMapData)
  } catch (error) {
    console.error('思维导图生成错误:', error)
    
    // 返回一个基础的思维导图结构
    return NextResponse.json({
      name: "代码分析",
      children: [
        {
          name: "基本结构",
          children: [
            {
              name: "正在分析代码..."
            }
          ]
        }
      ]
    })
  }
} 