"use client"

import type React from "react"
import { useState } from "react"
import { Handle, Position } from "reactflow"
import { Database, Edit3, Trash2, Server, HardDrive } from "lucide-react"

interface SourceNodeProps {
  data: {
    label: string
    sourceType: "teradata" | "postgres" | "synapse"
    layer: "bronze" | "silver" | "gold"
    metadata: any
  }
  selected: boolean
  onEdit: () => void
  onDelete: () => void
  onClick?: () => void
}

export function SourceNode({ data, selected, onEdit, onDelete, onClick }: SourceNodeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sourceTypeConfig = {
    teradata: {
      icon: Database,
      color: "bg-gradient-to-br from-orange-100 to-orange-200 border-orange-400 text-orange-900",
      label: "Teradata",
      emoji: "🟠",
    },
    postgres: {
      icon: Server,
      color: "bg-gradient-to-br from-blue-100 to-blue-200 border-blue-400 text-blue-900",
      label: "PostgreSQL",
      emoji: "🐘",
    },
    synapse: {
      icon: HardDrive,
      color: "bg-gradient-to-br from-purple-100 to-purple-200 border-purple-400 text-purple-900",
      label: "Synapse",
      emoji: "🔷",
    },
  }

  const layerColors = {
    bronze: "ring-amber-300",
    silver: "ring-gray-300",
    gold: "ring-yellow-300",
  }

  const config = sourceTypeConfig[data.sourceType]

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
      className={`relative px-4 py-3 shadow-lg rounded-lg border-2 transition-all duration-200 ${config.color} ${
        selected ? `ring-2 ring-blue-500 shadow-xl scale-105` : ""
      } ${isHovered ? `shadow-xl scale-105 ring-2 ${layerColors[data.layer]}` : ""} min-w-[180px] cursor-pointer`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{config.emoji}</span>
        <config.icon className="w-5 h-5" />
        <div className="text-sm font-semibold truncate">{data.label}</div>
      </div>

      <div className="text-xs opacity-75 font-medium mb-1">{config.label} Source</div>
      <div className="text-xs opacity-60 capitalize">{data.layer} Layer</div>

      {/* Hover Actions */}
      {isHovered && (
        <div className="absolute -top-2 -right-2 flex gap-1 z-10">
          <button
            onClick={handleEdit}
            className="p-1.5 bg-blue-500 text-white rounded-full shadow-lg hover:bg-blue-600 transition-colors border border-white"
            title="Edit source"
          >
            <Edit3 className="w-3 h-3" />
          </button>
          <button
            onClick={handleDelete}
            className="p-1.5 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors border border-white"
            title="Delete source"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}

      <Handle
        type="source"
        position={Position.Right}
        className="w-4 h-4 !bg-green-500 opacity-0 hover:opacity-100 transition-opacity border-2 border-white"
      />
    </div>
  )
}
