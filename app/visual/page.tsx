'use client'

import { useState } from 'react'
import { ArrowLeft } from 'lucide-react'
import { useRouter } from 'next/navigation'
import CodeEditor from '@/components/CodeEditor'
import FlowchartVisualization from '@/components/FlowchartVisualization'
import MindMap from '@/components/MindMap'
import CodeAnimation from '@/components/CodeAnimation'
import VisualizationTools from '@/components/VisualizationTools'
import Sidebar from '@/components/Sidebar'
import LearningContent from '@/components/LearningContent'

export default function VisualPlatform() {
  const router = useRouter()
  const [code, setCode] = useState('')
  const [selectedTool, setSelectedTool] = useState('flowchart')
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false)
  const [showLearningContent, setShowLearningContent] = useState(false)
  const [selectedTopic, setSelectedTopic] = useState('')

  const handleTopicSelect = (topic: string) => {
    setSelectedTopic(topic)
    setShowLearningContent(true)
  }

  const handleBack = () => {
    router.push('/')
  }

  return (
    <div className="flex h-screen">
      <Sidebar 
        onTopicSelect={handleTopicSelect}
        isCollapsed={isSidebarCollapsed}
        onCollapsedChange={setIsSidebarCollapsed}
      />

      <div className={`flex-1 flex flex-col transition-all duration-300 ${
        isSidebarCollapsed ? 'ml-16' : 'ml-64'
      }`}>
        <div className="p-4 border-b bg-white flex items-center gap-4">
          <button
            onClick={handleBack}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            title="ホームページに戻る"
          >
            <ArrowLeft className="w-6 h-6 text-gray-600" />
          </button>
          <h1 className="text-2xl font-bold">Haskell可視化学習プラットフォーム</h1>
        </div>
        
        <div className="flex-1 flex min-h-0">
          <div className="border-r bg-white">
            <VisualizationTools 
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
            />
          </div>

          <div className="flex-1 border-r">
            <CodeEditor 
              value={code}
              onChange={(value) => setCode(value)}
            />
          </div>
          
          <div className="flex-1">
            {selectedTool === 'flowchart' && <FlowchartVisualization code={code} />}
            {selectedTool === 'mindmap' && <MindMap code={code} />}
            {selectedTool === 'animation' && <CodeAnimation code={code} />}
          </div>
        </div>
      </div>

      {showLearningContent && (
        <LearningContent 
          topic={selectedTopic}
          onClose={() => setShowLearningContent(false)}
        />
      )}
    </div>
  )
} 