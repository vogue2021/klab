'use client'

type Tool = 'flowchart' | 'mindmap' | 'animation'

interface VisualizationToolbarProps {
  selectedTool: Tool
  onToolChange: (tool: Tool) => void
}

export default function VisualizationToolbar({
  selectedTool,
  onToolChange
}: VisualizationToolbarProps) {
  return (
    <div className="flex gap-2 mb-4">
      <button
        className={`px-4 py-2 rounded ${
          selectedTool === 'flowchart' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
        onClick={() => onToolChange('flowchart')}
      >
        フローチャート
      </button>
      <button
        className={`px-4 py-2 rounded ${
          selectedTool === 'mindmap' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
        onClick={() => onToolChange('mindmap')}
      >
        マインドマップ
      </button>
      <button
        className={`px-4 py-2 rounded ${
          selectedTool === 'animation' ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
        onClick={() => onToolChange('animation')}
      >
        アニメーション
      </button>
    </div>
  )
} 