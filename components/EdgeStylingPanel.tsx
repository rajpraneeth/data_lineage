"use client"

import { useState } from "react"
import { X, Trash2, Palette, Save } from "lucide-react"
import type { Edge } from "reactflow"

interface EdgeStylingPanelProps {
  edge: Edge | null
  onClose: () => void
  onUpdate: (edgeId: string, color: string, style: string) => void
  onDelete: (edgeId: string) => void
}

export function EdgeStylingPanel({ edge, onClose, onUpdate, onDelete }: EdgeStylingPanelProps) {
  const [selectedColor, setSelectedColor] = useState(edge?.style?.stroke || "#b1b1b7")
  const [selectedStyle, setSelectedStyle] = useState(() => {
    if (edge?.type === "customStepEdge") return "step"
    if (edge?.type === "customStraightEdge") return "straight"
    return "default"
  })

  if (!edge) return null

  const handleSave = () => {
    onUpdate(edge.id, selectedColor, selectedStyle)
    onClose()
  }

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this connection?")) {
      onDelete(edge.id)
      onClose()
    }
  }

  const colorOptions = [
    { value: "#b1b1b7", label: "Default Gray", color: "#b1b1b7" },
    { value: "#3b82f6", label: "Blue", color: "#3b82f6" },
    { value: "#10b981", label: "Green", color: "#10b981" },
    { value: "#f59e0b", label: "Orange", color: "#f59e0b" },
    { value: "#ef4444", label: "Red", color: "#ef4444" },
    { value: "#8b5cf6", label: "Purple", color: "#8b5cf6" },
    { value: "#06b6d4", label: "Cyan", color: "#06b6d4" },
    { value: "#84cc16", label: "Lime", color: "#84cc16" },
  ]

  const styleOptions = [
    { value: "default", label: "Curved", description: "Smooth curved connection" },
    { value: "step", label: "Step", description: "Right-angled step connection" },
    { value: "straight", label: "Straight", description: "Direct straight line" },
  ]

  return (
    <div className="absolute top-4 right-4 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Palette className="w-5 h-5 text-blue-600" />
          Connection Style
        </h3>
        <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Close panel">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="p-4 space-y-6">
        {/* Color Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Connection Color</label>
          <div className="grid grid-cols-4 gap-2">
            {colorOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedColor(option.value)}
                className={`p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                  selectedColor === option.value
                    ? "border-blue-500 ring-2 ring-blue-200"
                    : "border-gray-200 hover:border-gray-300"
                }`}
                title={option.label}
              >
                <div className="w-full h-4 rounded" style={{ backgroundColor: option.color }} />
                <div className="text-xs mt-1 text-gray-600">{option.label}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Style Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">Connection Style</label>
          <div className="space-y-2">
            {styleOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => setSelectedStyle(option.value)}
                className={`w-full p-3 text-left rounded-lg border-2 transition-all ${
                  selectedStyle === option.value
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="font-medium text-sm">{option.label}</div>
                <div className="text-xs text-gray-600 mt-1">{option.description}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Preview</label>
          <div className="h-16 bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
            <svg width="120" height="40" viewBox="0 0 120 40">
              {selectedStyle === "straight" ? (
                <line
                  x1="10"
                  y1="20"
                  x2="110"
                  y2="20"
                  stroke={selectedColor}
                  strokeWidth="3"
                  markerEnd="url(#arrowhead)"
                />
              ) : selectedStyle === "step" ? (
                <path
                  d="M 10 20 L 60 20 L 60 20 L 110 20"
                  stroke={selectedColor}
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              ) : (
                <path
                  d="M 10 20 Q 60 10 110 20"
                  stroke={selectedColor}
                  strokeWidth="3"
                  fill="none"
                  markerEnd="url(#arrowhead)"
                />
              )}
              <defs>
                <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill={selectedColor} />
                </marker>
              </defs>
            </svg>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={handleSave}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            Apply Style
          </button>
          <button
            onClick={handleDelete}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}
