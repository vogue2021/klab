'use client'

import { useState } from 'react'
import CodeEditor from '@/components/CodeEditor'
import FlowchartVisualization from '@/components/FlowchartVisualization'
import MindMap from '@/components/MindMap'
import CodeAnimation from '@/components/CodeAnimation'
import VisualizationTools from '@/components/VisualizationTools'
import Sidebar from '@/components/Sidebar'

export default function Home() {
  const [code, setCode] = useState('')
  const [selectedTool, setSelectedTool] = useState('flowchart')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)

  const handleTopicSelect = (topic: string) => {
    console.log('Selected topic:', topic)
  }

  return (
    <div className="flex h-screen">
      {/* 左侧菜单 */}
      <Sidebar 
        onTopicSelect={handleTopicSelect}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />
      

      {/* 主要内容区域 - 使用flex-1自动占据剩余空间 */}
      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        {/* 顶部标题栏 */}
        <div className="p-4 border-b bg-white">
          <h1 className="text-2xl font-bold">Python可视化学习平台</h1>
        </div>
        
        {/* 主要内容区域 */}
        <div className="flex-1 flex min-h-0">
          {/* 可视化工具选项 */}
          <div className="border-r bg-white">
            <VisualizationTools 
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
            />
          </div>

          {/* 代码编辑器 */}
          <div className="flex-1 border-r">
            <CodeEditor 
              value={code}
              onChange={(value) => setCode(value)}
            />
          </div>
          
          {/* 可视化展示区域 */}
          <div className="flex-1">
            {selectedTool === 'flowchart' && <FlowchartVisualization code={code} />}
            {selectedTool === 'mindmap' && <MindMap code={code} />}
            {selectedTool === 'animation' && <CodeAnimation code={code} />}
          </div>
        </div>
      </div>
    </div>
  )
}

