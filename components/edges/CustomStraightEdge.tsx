"use client"

import type React from "react"

import { useState } from "react"
import { getStraightPath, type EdgeProps, EdgeLabelRenderer } from "reactflow"
import { Trash2, Palette } from "lucide-react"

interface CustomStraightEdgeProps extends EdgeProps {
  onEdit: (edgeId: string) => void
  onDelete: (edgeId: string) => void
}

export function CustomStraightEdge({
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
}: CustomStraightEdgeProps) {
  const [isHovered, setIsHovered] = useState(false)

  const [edgePath, labelX, labelY] = getStraightPath({
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
      <path
        id={id}
        style={{
          ...style,
          strokeWidth: isHovered ? 3 : 2,
          stroke: isHovered ? "#3b82f6" : style.stroke || "#b1b1b7",
          transition: "all 0.2s ease",
        }}
        className="react-flow__edge-path"
        d={edgePath}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      />

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
            <div className="flex gap-1 bg-white rounded-full shadow-lg border border-gray-200 p-1">
              <button
                onClick={handleEdit}
                className="p-1.5 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors border border-white"
                title="Edit edge"
              >
                <Palette className="w-3 h-3" />
              </button>
              <button
                onClick={handleDelete}
                className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors border border-white"
                title="Delete edge"
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
