"use client"

import type React from "react"
import { useState, useRef } from "react"
import {
  Save,
  Upload,
  Info,
  FileText,
  Layers,
  Database,
  Code,
  Plus,
  X,
  Undo,
  Redo,
  Download,
  Server,
  HardDrive,
  Zap,
} from "lucide-react"

interface SidebarProps {
  onSave: () => void
  onLoad: (event: React.ChangeEvent<HTMLInputElement>) => void
  onExportSVG: () => void
  onNewProject: (projectName: string) => void
  nodeCount: number
  edgeCount: number
  onDragStart: (event: React.DragEvent, nodeType: string, subType?: string) => void
  projectName: string
  canUndo: boolean
  canRedo: boolean
  onUndo: () => void
  onRedo: () => void
  isVisible: boolean
  onToggle: () => void
}

export function Sidebar({
  onSave,
  onLoad,
  onExportSVG,
  onNewProject,
  nodeCount,
  edgeCount,
  onDragStart,
  projectName,
  canUndo,
  canRedo,
  onUndo,
  onRedo,
  isVisible,
  onToggle,
}: SidebarProps) {
  const [activeTab, setActiveTab] = useState<"info" | "files">("info")
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProjectName, setNewProjectName] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const sourceTypes = [
    { type: "teradata", label: "Teradata", icon: Database, description: "Teradata data warehouse", emoji: "🟠" },
    { type: "postgres", label: "PostgreSQL", icon: Server, description: "PostgreSQL database", emoji: "🐘" },
    { type: "synapse", label: "Synapse", icon: HardDrive, description: "Azure Synapse Analytics", emoji: "🔷" },
  ]

  const targetTypes = [
    { type: "databricks", label: "Databricks", icon: Zap, description: "Databricks platform", emoji: "🧱" },
    { type: "sql", label: "SQL Server", icon: Database, description: "Microsoft SQL Server", emoji: "🗄️" },
    { type: "postgres", label: "PostgreSQL", icon: Server, description: "PostgreSQL database", emoji: "🐘" },
  ]

  const transformTypes = [
    { type: "transform", label: "Transform", icon: Code, description: "Data transformation logic", emoji: "⚙️" },
  ]

  const handleNewProject = () => {
    if (newProjectName.trim()) {
      onNewProject(newProjectName.trim())
      setNewProjectName("")
      setShowNewProjectModal(false)
    }
  }

  const handleCancelNewProject = () => {
    setNewProjectName("")
    setShowNewProjectModal(false)
  }

  if (!isVisible) {
    return null
  }

  return (
    <div className="w-80 bg-white border-r border-gray-200 flex flex-col relative transition-all duration-300 ease-in-out">
      {/* Tab Navigation */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab("info")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "info"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <Info className="w-4 h-4 inline mr-2" />
          Information
        </button>
        <button
          onClick={() => setActiveTab("files")}
          className={`flex-1 px-4 py-3 text-sm font-medium ${
            activeTab === "files"
              ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          <FileText className="w-4 h-4 inline mr-2" />
          Files
        </button>
      </div>

      {/* Undo/Redo Controls */}
      <div className="flex items-center justify-between p-3 bg-gray-50 border-b border-gray-200">
        <div className="flex gap-2">
          <button
            onClick={onUndo}
            disabled={!canUndo}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <Undo className="w-3 h-3" />
            Undo
          </button>
          <button
            onClick={onRedo}
            disabled={!canRedo}
            className="flex items-center gap-1 px-3 py-1.5 text-xs bg-white border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            title="Redo (Ctrl+Y)"
          >
            <Redo className="w-3 h-3" />
            Redo
          </button>
        </div>
        <button
          onClick={onToggle}
          className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-200 rounded transition-colors"
          title="Hide sidebar"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Tab Content */}
      <div className="flex-1 p-4 overflow-y-auto">
        {activeTab === "info" && (
          <div className="space-y-6">
            {/* Project Info */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Layers className="w-5 h-5 mr-2 text-blue-600" />
                {projectName || "Data Pipeline Flow"}
              </h3>
              <div className="bg-gray-50 rounded-lg p-3 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Nodes:</span>
                  <span className="font-medium">{nodeCount}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Connections:</span>
                  <span className="font-medium">{edgeCount}</span>
                </div>
              </div>
            </div>

            {/* Source Systems */}
            <div>
              <h4 className="text-md font-medium mb-3 text-green-700">📥 Source Systems</h4>
              <div className="space-y-2">
                {sourceTypes.map((sourceType) => (
                  <div
                    key={sourceType.type}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg cursor-grab hover:from-green-100 hover:to-emerald-100 transition-all duration-200 hover:shadow-md"
                    draggable
                    onDragStart={(event) => onDragStart(event, "source", sourceType.type)}
                  >
                    <span className="text-lg">{sourceType.emoji}</span>
                    <sourceType.icon className="w-5 h-5 text-green-600" />
                    <div>
                      <div className="font-medium text-sm text-green-900">{sourceType.label}</div>
                      <div className="text-xs text-green-700">{sourceType.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Transform Operations */}
            <div>
              <h4 className="text-md font-medium mb-3 text-blue-700">⚙️ Transform Operations</h4>
              <div className="space-y-2">
                {transformTypes.map((transformType) => (
                  <div
                    key={transformType.type}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg cursor-grab hover:from-blue-100 hover:to-indigo-100 transition-all duration-200 hover:shadow-md"
                    draggable
                    onDragStart={(event) => onDragStart(event, transformType.type)}
                  >
                    <span className="text-lg">{transformType.emoji}</span>
                    <transformType.icon className="w-5 h-5 text-blue-600" />
                    <div>
                      <div className="font-medium text-sm text-blue-900">{transformType.label}</div>
                      <div className="text-xs text-blue-700">{transformType.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Systems */}
            <div>
              <h4 className="text-md font-medium mb-3 text-purple-700">📤 Target Systems</h4>
              <div className="space-y-2">
                {targetTypes.map((targetType) => (
                  <div
                    key={targetType.type}
                    className="flex items-center gap-3 p-3 bg-gradient-to-r from-purple-50 to-violet-50 border border-purple-200 rounded-lg cursor-grab hover:from-purple-100 hover:to-violet-100 transition-all duration-200 hover:shadow-md"
                    draggable
                    onDragStart={(event) => onDragStart(event, "target", targetType.type)}
                  >
                    <span className="text-lg">{targetType.emoji}</span>
                    <targetType.icon className="w-5 h-5 text-purple-600" />
                    <div>
                      <div className="font-medium text-sm text-purple-900">{targetType.label}</div>
                      <div className="text-xs text-purple-700">{targetType.description}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Instructions */}
            <div>
              <h4 className="text-md font-medium mb-3">How to Use</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Drag source systems to start your data pipeline</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Add transforms to process and clean your data</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Connect to target systems for final data storage</span>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                  <span>Click connections to style and configure them</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "files" && (
          <div className="space-y-6">
            {/* Project Management */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Project Management</h3>
              <div className="space-y-3">
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  New Project
                </button>
                <div className="text-xs text-gray-500 text-center">Current: {projectName || "Untitled Project"}</div>
              </div>
            </div>

            {/* File Operations */}
            <div>
              <h3 className="text-lg font-semibold mb-4">File Management</h3>
              <div className="space-y-3">
                <button
                  onClick={onSave}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Save className="w-4 h-4" />
                  Save Flow
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  <Upload className="w-4 h-4" />
                  Load Flow
                </button>
                <button
                  onClick={onExportSVG}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Export as SVG
                </button>
                <input ref={fileInputRef} type="file" accept=".json" onChange={onLoad} className="hidden" />
              </div>
            </div>

            {/* Export Info */}
            <div>
              <h4 className="text-md font-medium mb-3">Export Options</h4>
              <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600">
                <p className="mb-2">Available export formats:</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • <strong>JSON:</strong> Complete flow data with metadata
                  </li>
                  <li>
                    • <strong>SVG:</strong> Vector graphics for documentation
                  </li>
                </ul>
              </div>
            </div>

            {/* Tips */}
            <div>
              <h4 className="text-md font-medium mb-3">Tips</h4>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="font-medium text-blue-800 mb-1">💡 Pro Tip</div>
                  <div className="text-blue-700 text-xs">
                    Use SVG export to include your data flow diagrams in documentation.
                  </div>
                </div>
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <div className="font-medium text-green-800 mb-1">🔄 Version Control</div>
                  <div className="text-green-700 text-xs">
                    Save your flows regularly and use descriptive project names.
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* New Project Modal */}
      {showNewProjectModal && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-80 mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Create New Project</h3>
              <button onClick={handleCancelNewProject} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Project Name</label>
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="Enter project name..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                onKeyPress={(e) => e.key === "Enter" && handleNewProject()}
                autoFocus
              />
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
              <div className="text-yellow-800 text-sm">
                ⚠️ This will clear the current flow and create a new empty project.
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCancelNewProject}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNewProject}
                disabled={!newProjectName.trim()}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
