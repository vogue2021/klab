import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { topic } = await request.json()

    if (!topic) {
      return NextResponse.json({ 
        content: [],
        error: '请选择学习主题'
      })
    }

    // 这里以变量主题为例
    if (topic === '变量与数据类型') {
      return NextResponse.json({
        content: [
          {
            type: 'diagram',
            content: `graph TD
              A[变量基础] --> B[数据类型]
              B --> C[整数类型]
              B --> D[浮点类型]
              B --> E[字符串类型]
              B --> F[布尔类型]
              A --> G[变量命名]
              A --> H[变量作用域]`
          },
          {
            type: 'concept',
            nodeId: 'A',
            details: {
              title: '变量基础',
              description: '变量是计算机程序中用于存储数据的基本单位。你可以把变量想象成一个带标签的盒子，可以存放不同类型的数据。',
              examples: [
                {
                  code: 'name = "小明"\nage = 18\nheight = 1.75\nis_student = True',
                  explanation: '这个例子展示了不同类型的变量声明和赋值。',
                  output: 'print(name)  # 输出: 小明'
                }
              ],
              tips: [
                '变量名应该具有描述性，能表达其存储数据的用途',
                '变量在使用前必须先赋值',
                '同一个变量可以多次赋值，但要注意数据类型的一致性'
              ]
            }
          },
          {
            type: 'concept',
            nodeId: 'B',
            details: {
              title: '数据类型',
              description: 'Python中的主要数据类型包括数字（整数和浮点数）、字符串、布尔值等。每种类型都有其特定的用途和操作方法。',
              examples: [
                {
                  code: '# 数字类型\nage = 18          # 整数\nheight = 1.75     # 浮点数\n\n# 字符串类型\nname = "Python"   # 字符串\n\n# 布尔类型\nis_valid = True    # 布尔值',
                  explanation: '不同数据类型的声明和使用示例。',
                }
              ],
              tips: [
                '使用type()函数可以查看变量的数据类型',
                '不同数据类型之间可以进行转换',
                '注意数据类型转换时可能出现的精度损失'
              ]
            }
          }
          // ... 可以继续添加更多概念
        ]
      })
    }

    // 可以继续添加其他主题的内容...

    return NextResponse.json({ 
      content: [
        {
          type: 'text',
          content: `暂无 ${topic} 的学习内容`
        }
      ]
    })

  } catch (error) {
    console.error('Generate learning content error:', error)
    return NextResponse.json({ 
      content: [],
      error: '生成学习内容失败'
    }, { 
      status: 500 
    })
  }
} 