'use client'

import { useState } from 'react'
import { ChevronRight, ChevronDown } from 'lucide-react'

interface TreeItem {
  id: string
  label: string
  children?: TreeItem[]
}

interface TreeViewProps {
  items: TreeItem[]
  onSelect: (id: string) => void
  selectedId: string
}

export function TreeView({ items, onSelect, selectedId }: TreeViewProps) {
  return (
    <div className="space-y-1">
      {items.map((item) => (
        <TreeNode
          key={item.id}
          item={item}
          onSelect={onSelect}
          selectedId={selectedId}
          level={0}
        />
      ))}
    </div>
  )
}

interface TreeNodeProps {
  item: TreeItem
  onSelect: (id: string) => void
  selectedId: string
  level: number
}

function TreeNode({ item, onSelect, selectedId, level }: TreeNodeProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const hasChildren = item.children && item.children.length > 0
  
  return (
    <div>
      <div
        className={`flex items-center px-2 py-1 rounded-md cursor-pointer hover:bg-gray-100
          ${selectedId === item.id ? 'bg-blue-100' : ''}`}
        style={{ paddingLeft: `${level * 16}px` }}
        onClick={() => onSelect(item.id)}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation()
              setIsExpanded(!isExpanded)
            }}
            className="mr-1 p-1 hover:bg-gray-200 rounded"
          >
            {isExpanded ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-6" />}
        <span>{item.label}</span>
      </div>
      
      {hasChildren && isExpanded && (
        <div>
          {item.children!.map((child) => (
            <TreeNode
              key={child.id}
              item={child}
              onSelect={onSelect}
              selectedId={selectedId}
              level={level + 1}
            />
          ))}
        </div>
      )}
    </div>
  )
} 