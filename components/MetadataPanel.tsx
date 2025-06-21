"use client"

import { useState, useEffect } from "react"
import { X, Edit3, Save, DeleteIcon as Cancel } from "lucide-react"
import type { NodeData } from "../types"

interface MetadataPanelProps {
  node: NodeData | null
  onClose: () => void
  onUpdate: (nodeId: string, updates: Partial<NodeData>) => void
  autoEdit?: boolean
}

export function MetadataPanel({ node, onClose, onUpdate, autoEdit = false }: MetadataPanelProps) {
  const [isEditing, setIsEditing] = useState(autoEdit)
  const [editData, setEditData] = useState<NodeData | null>(null)

  // Reset editing state when node changes or autoEdit changes
  useEffect(() => {
    if (node) {
      setIsEditing(autoEdit)
      if (autoEdit) {
        setEditData({ ...node })
      } else {
        setEditData(null)
      }
    }
  }, [node, autoEdit])

  if (!node) return null

  const handleEdit = () => {
    setEditData({ ...node })
    setIsEditing(true)
  }

  const handleSave = () => {
    if (editData) {
      onUpdate(editData.id, editData)
      setIsEditing(false)
      setEditData(null)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditData(null)
  }

  const currentData = editData || node

  return (
    <div className="w-80 bg-white border-l border-gray-200 p-4 overflow-y-auto shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">{isEditing ? "Edit Node" : "Node Details"}</h3>
        <div className="flex gap-2">
          {!isEditing ? (
            <button onClick={handleEdit} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Edit node">
              <Edit3 className="w-4 h-4" />
            </button>
          ) : (
            <>
              <button
                onClick={handleSave}
                className="p-1 hover:bg-green-100 rounded text-green-600 transition-colors"
                title="Save changes"
              >
                <Save className="w-4 h-4" />
              </button>
              <button
                onClick={handleCancel}
                className="p-1 hover:bg-red-100 rounded text-red-600 transition-colors"
                title="Cancel changes"
              >
                <Cancel className="w-4 h-4" />
              </button>
            </>
          )}
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded transition-colors" title="Close panel">
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isEditing && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="text-blue-800 text-sm font-medium mb-1">✏️ Edit Mode</div>
          <div className="text-blue-700 text-xs">Make your changes below and click Save to apply them.</div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          {isEditing ? (
            <input
              type="text"
              value={currentData.label}
              onChange={(e) => setEditData((prev) => (prev ? { ...prev, label: e.target.value } : null))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter node name..."
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 rounded-md">{currentData.label}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
          <div className="px-3 py-2 bg-gray-50 rounded-md capitalize">
            {currentData.type}
            {currentData.sourceType && ` - ${currentData.sourceType}`}
            {currentData.targetType && ` - ${currentData.targetType}`}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Layer</label>
          {isEditing ? (
            <select
              value={currentData.layer}
              onChange={(e) => setEditData((prev) => (prev ? { ...prev, layer: e.target.value as any } : null))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="bronze">Bronze</option>
              <option value="silver">Silver</option>
              <option value="gold">Gold</option>
            </select>
          ) : (
            <div className="px-3 py-2 bg-gray-50 rounded-md capitalize">{currentData.layer}</div>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
          {isEditing ? (
            <textarea
              value={currentData.metadata.description || ""}
              onChange={(e) =>
                setEditData((prev) =>
                  prev
                    ? {
                        ...prev,
                        metadata: { ...prev.metadata, description: e.target.value },
                      }
                    : null,
                )
              }
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter description..."
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 rounded-md min-h-[80px]">
              {currentData.metadata.description || "No description"}
            </div>
          )}
        </div>

        {/* Connection Details for Source and Target nodes */}
        {(currentData.type === "source" || currentData.type === "target") && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Host</label>
              {isEditing ? (
                <input
                  type="text"
                  value={currentData.metadata.host || ""}
                  onChange={(e) =>
                    setEditData((prev) =>
                      prev
                        ? {
                            ...prev,
                            metadata: { ...prev.metadata, host: e.target.value },
                          }
                        : null,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter host address..."
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">{currentData.metadata.host || "Not specified"}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Database</label>
              {isEditing ? (
                <input
                  type="text"
                  value={currentData.metadata.database || ""}
                  onChange={(e) =>
                    setEditData((prev) =>
                      prev
                        ? {
                            ...prev,
                            metadata: { ...prev.metadata, database: e.target.value },
                          }
                        : null,
                    )
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter database name..."
                />
              ) : (
                <div className="px-3 py-2 bg-gray-50 rounded-md">
                  {currentData.metadata.database || "Not specified"}
                </div>
              )}
            </div>

            {currentData.metadata.port && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Port</label>
                {isEditing ? (
                  <input
                    type="number"
                    value={currentData.metadata.port || ""}
                    onChange={(e) =>
                      setEditData((prev) =>
                        prev
                          ? {
                              ...prev,
                              metadata: { ...prev.metadata, port: Number.parseInt(e.target.value) || undefined },
                            }
                          : null,
                      )
                    }
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Enter port number..."
                  />
                ) : (
                  <div className="px-3 py-2 bg-gray-50 rounded-md">{currentData.metadata.port || "Default"}</div>
                )}
              </div>
            )}
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Table Name</label>
          {isEditing ? (
            <input
              type="text"
              value={currentData.metadata.tableName || ""}
              onChange={(e) =>
                setEditData((prev) =>
                  prev
                    ? {
                        ...prev,
                        metadata: { ...prev.metadata, tableName: e.target.value },
                      }
                    : null,
                )
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter table name..."
            />
          ) : (
            <div className="px-3 py-2 bg-gray-50 rounded-md">{currentData.metadata.tableName || "Not specified"}</div>
          )}
        </div>

        {currentData.type === "transform" && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Transformation Logic</label>
            {isEditing ? (
              <textarea
                value={currentData.metadata.transformationLogic || ""}
                onChange={(e) =>
                  setEditData((prev) =>
                    prev
                      ? {
                          ...prev,
                          metadata: { ...prev.metadata, transformationLogic: e.target.value },
                        }
                      : null,
                  )
                }
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
                placeholder="# Enter Python transformation logic here..."
              />
            ) : (
              <div className="px-3 py-2 bg-gray-50 rounded-md font-mono text-sm min-h-[160px] whitespace-pre-wrap">
                {currentData.metadata.transformationLogic || "# No transformation logic defined"}
              </div>
            )}
          </div>
        )}

        {isEditing && (
          <div className="pt-4 border-t border-gray-200">
            <div className="flex gap-3">
              <button
                onClick={handleSave}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Save className="w-4 h-4" />
                Save Changes
              </button>
              <button
                onClick={handleCancel}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
