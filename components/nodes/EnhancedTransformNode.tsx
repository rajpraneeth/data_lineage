"use client"

import type React from "react"

import { useState } from "react"
import { Handle, Position } from "reactflow"
import { Code, Edit3, Trash2 } from "lucide-react"

interface EnhancedTransformNodeProps {
  data: {
    label: string
    metadata: any
  }
  selected: boolean
  onEdit: () => void
  onDelete: () => void
  onClick?: () => void
}

export function EnhancedTransformNode({ data, selected, onEdit, onDelete, onClick }: EnhancedTransformNodeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit()
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete()
  }

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (onClick) {
      onClick()
    }
  }

  return (
    <div
      className={`relative px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-400 text-blue-900 transition-all duration-200 ${
        selected ? "ring-2 ring-blue-500 shadow-xl scale-105" : ""
      } ${isHovered ? "shadow-xl scale-105" : ""} min-w-[160px] cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="w-3 h-3 !bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
      />

      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">⚙️</span>
        <Code className="w-4 h-4" />
        <div className="text-sm font-semibold truncate">{data.label}</div>
      </div>

      <div className="text-xs opacity-75 font-medium">Transform</div>

      {/* Hover Actions */}
      {isHovered && (
        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
          <button
            onClick={handleEdit}
            className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors border border-white"
            title="Edit node"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors border border-white"
            title="Delete node"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="w-3 h-3 !bg-blue-400 opacity-0 hover:opacity-100 transition-opacity"
      />
    </div>
  )
}
