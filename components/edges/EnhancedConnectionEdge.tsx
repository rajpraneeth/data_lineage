"use client"

import type React from "react"
import { useState } from "react"
import { getBezierPath, type EdgeProps, EdgeLabelRenderer } from "reactflow"
import { Trash2, Settings } from "lucide-react"

interface EnhancedConnectionEdgeProps extends EdgeProps {
  onEdit: (edgeId: string) => void
  onDelete: (edgeId: string) => void
}

export function EnhancedConnectionEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  data,
  onEdit,
  onDelete,
}: EnhancedConnectionEdgeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  })

  const handleEdit = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onEdit(id)
  }

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onDelete(id)
  }

  return (
    <>
      {/* Invisible wider path for easier hover detection */}
      <path
        id={`${id}-hover`}
        style={{
          strokeWidth: 12,
          stroke: "transparent",
          cursor: "pointer",
        }}
        className="react-flow__edge-path"
        d={edgePath}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleEdit}
      />

      {/* Visible edge path */}
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: isHovered ? 4 : 2,
          stroke: isHovered ? "#3b82f6" : style.stroke || "#6b7280",
          transition: "all 0.2s ease",
          filter: isHovered ? "drop-shadow(0 2px 4px rgba(59, 130, 246, 0.3))" : "none",
        }}
        className="react-flow__edge-path"
        d={edgePath}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleEdit}
      />

      {/* Connection flow animation */}
      {isHovered && (
        <circle r="4" fill="#3b82f6" className="animate-pulse">
          <animateMotion dur="2s" repeatCount="indefinite" path={edgePath} />
        </circle>
      )}

      {/* Hover controls */}
      {isHovered && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: "absolute",
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: "all",
              zIndex: 1000,
            }}
            className="nodrag nopan"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <div className="flex gap-1 bg-white rounded-full shadow-xl border border-gray-200 p-1 backdrop-blur-sm">
              <button
                onClick={handleEdit}
                className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors border border-white shadow-md"
                title="Style connection"
              >
                <Settings className="w-3 h-3" />
              </button>
              <button
                onClick={handleDelete}
                className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors border border-white shadow-md"
                title="Delete connection"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  )
}
