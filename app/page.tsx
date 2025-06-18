"use client"

import type React from "react"
import { useState, useCallback, useRef, useMemo, useEffect } from "react"
import ReactFlow, {
  type Node,
  type Edge,
  addEdge,
  type Connection,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  ReactFlowProvider,
} from "reactflow"
import "reactflow/dist/style.css"
import { Menu } from "lucide-react"

import { Sidebar } from "../components/Sidebar"
import { MetadataPanel } from "../components/MetadataPanel"
import { EdgeStylingPanel } from "../components/EdgeStylingPanel"
import { SourceNode } from "../components/nodes/SourceNode"
import { TargetNode } from "../components/nodes/TargetNode"
import { EnhancedTransformNode } from "../components/nodes/EnhancedTransformNode"
import { EnhancedConnectionEdge } from "../components/edges/EnhancedConnectionEdge"
import { CustomStepEdge } from "../components/edges/CustomStepEdge"
import { CustomStraightEdge } from "../components/edges/CustomStraightEdge"
import { useUndoRedo } from "../hooks/useUndoRedo"
import { exportToSVG } from "../utils/svgExport"
import type { NodeData } from "../types"

const initialNodes: Node[] = [
  {
    id: "1",
    type: "sourceNode",
    position: { x: 50, y: 100 },
    data: {
      id: "1",
      label: "Customer Database",
      type: "source",
      sourceType: "postgres",
      layer: "bronze",
      metadata: {
        tableName: "customers",
        description: "Customer data from PostgreSQL database",
        host: "prod-db.company.com",
        database: "crm_db",
        port: 5432,
      },
    },
  },
  {
    id: "2",
    type: "sourceNode",
    position: { x: 50, y: 250 },
    data: {
      id: "2",
      label: "Sales Data Warehouse",
      type: "source",
      sourceType: "teradata",
      layer: "bronze",
      metadata: {
        tableName: "sales_transactions",
        description: "Historical sales data from Teradata warehouse",
        host: "tdw-prod.company.com",
        database: "sales_dw",
      },
    },
  },
  {
    id: "3",
    type: "enhancedTransformNode",
    position: { x: 400, y: 175 },
    data: {
      id: "3",
      label: "Data Integration",
      type: "transform",
      layer: "silver",
      metadata: {
        transformationLogic: `# Join customer and sales data
df_integrated = df_customers.join(
    df_sales, 
    df_customers.customer_id == df_sales.customer_id,
    'inner'
).select(
    'customer_id', 'customer_name', 'email',
    'transaction_id', 'amount', 'transaction_date'
).filter(
    col('amount') > 0
)`,
        description: "Integrate customer and sales data with validation",
      },
    },
  },
  {
    id: "4",
    type: "targetNode",
    position: { x: 750, y: 175 },
    data: {
      id: "4",
      label: "Analytics Platform",
      type: "target",
      targetType: "databricks",
      layer: "gold",
      metadata: {
        tableName: "customer_analytics",
        description: "Processed data for analytics in Databricks",
        host: "databricks-workspace.company.com",
        database: "analytics_db",
      },
    },
  },
]

const initialEdges: Edge[] = [
  {
    id: "e1-3",
    source: "1",
    target: "3",
    type: "enhancedConnectionEdge",
    animated: true,
    style: { stroke: "#10b981", strokeWidth: 2 },
  },
  {
    id: "e2-3",
    source: "2",
    target: "3",
    type: "enhancedConnectionEdge",
    animated: true,
    style: { stroke: "#f59e0b", strokeWidth: 2 },
  },
  {
    id: "e3-4",
    source: "3",
    target: "4",
    type: "enhancedConnectionEdge",
    animated: true,
    style: { stroke: "#3b82f6", strokeWidth: 2 },
  },
]

function DataLineageFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)
  const [selectedNode, setSelectedNode] = useState<NodeData | null>(null)
  const [selectedEdge, setSelectedEdge] = useState<Edge | null>(null)
  const [projectName, setProjectName] = useState("Data Pipeline Flow")
  const [sidebarVisible, setSidebarVisible] = useState(true)
  const [nodeClickedForEdit, setNodeClickedForEdit] = useState(false)
  const reactFlowWrapper = useRef<HTMLDivElement>(null)
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null)

  // Undo/Redo functionality
  const { canUndo, canRedo, undo, redo, saveState, clearHistory } = useUndoRedo(
    initialNodes,
    initialEdges,
    "Data Pipeline Flow",
    (newNodes, newEdges, newProjectName) => {
      setNodes(newNodes)
      setEdges(newEdges)
      setProjectName(newProjectName)
    },
  )

  // Save state whenever nodes, edges, or project name changes
  const saveCurrentState = useCallback(() => {
    saveState(nodes, edges, projectName)
  }, [nodes, edges, projectName, saveState])

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.ctrlKey || event.metaKey) {
        if (event.key === "z" && !event.shiftKey) {
          event.preventDefault()
          undo()
        } else if (event.key === "y" || (event.key === "z" && event.shiftKey)) {
          event.preventDefault()
          redo()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [undo, redo])

  // Handle node click for editing
  const handleNodeClick = useCallback((nodeData: NodeData) => {
    setSelectedNode(nodeData)
    setNodeClickedForEdit(true)
    setSelectedEdge(null) // Close edge panel if open
  }, [])

  // Handle edge click for styling
  const handleEdgeClick = useCallback((event: React.MouseEvent, edge: Edge) => {
    event.stopPropagation()
    setSelectedEdge(edge)
    setSelectedNode(null) // Close node panel if open
    setNodeClickedForEdit(false)
  }, [])

  // Memoized node types with callbacks
  const nodeTypes = useMemo(
    () => ({
      sourceNode: (props: any) => (
        <SourceNode
          {...props}
          onEdit={() => {
            setSelectedNode(props.data)
            setNodeClickedForEdit(true)
          }}
          onDelete={() => deleteNode(props.id)}
          onClick={() => handleNodeClick(props.data)}
        />
      ),
      targetNode: (props: any) => (
        <TargetNode
          {...props}
          onEdit={() => {
            setSelectedNode(props.data)
            setNodeClickedForEdit(true)
          }}
          onDelete={() => deleteNode(props.id)}
          onClick={() => handleNodeClick(props.data)}
        />
      ),
      enhancedTransformNode: (props: any) => (
        <EnhancedTransformNode
          {...props}
          onEdit={() => {
            setSelectedNode(props.data)
            setNodeClickedForEdit(true)
          }}
          onDelete={() => deleteNode(props.id)}
          onClick={() => handleNodeClick(props.data)}
        />
      ),
    }),
    [handleNodeClick],
  )

  // Memoized edge types with callbacks
  const edgeTypes = useMemo(
    () => ({
      enhancedConnectionEdge: (props: any) => (
        <EnhancedConnectionEdge
          {...props}
          onEdit={(edgeId: string) => {
            const edge = edges.find((e) => e.id === edgeId)
            if (edge) setSelectedEdge(edge)
          }}
          onDelete={deleteEdge}
        />
      ),
      customStepEdge: (props: any) => (
        <CustomStepEdge
          {...props}
          onEdit={(edgeId: string) => {
            const edge = edges.find((e) => e.id === edgeId)
            if (edge) setSelectedEdge(edge)
          }}
          onDelete={deleteEdge}
        />
      ),
      customStraightEdge: (props: any) => (
        <CustomStraightEdge
          {...props}
          onEdit={(edgeId: string) => {
            const edge = edges.find((e) => e.id === edgeId)
            if (edge) setSelectedEdge(edge)
          }}
          onDelete={deleteEdge}
        />
      ),
    }),
    [edges],
  )

  const onConnect = useCallback(
    (params: Connection) => {
      const newEdge = {
        ...params,
        type: "enhancedConnectionEdge",
        animated: true,
        style: { stroke: "#6b7280", strokeWidth: 2 },
      }
      setEdges((eds) => addEdge(newEdge, eds))
      // Save state after connecting
      setTimeout(saveCurrentState, 100)
    },
    [setEdges, saveCurrentState],
  )

  const onDragStart = useCallback((event: React.DragEvent, nodeType: string, subType?: string) => {
    const dragData = { nodeType, subType }
    event.dataTransfer.setData("application/reactflow", JSON.stringify(dragData))
    event.dataTransfer.effectAllowed = "move"
  }, [])

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault()
    event.dataTransfer.dropEffect = "move"
  }, [])

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault()

      const reactFlowBounds = reactFlowWrapper.current?.getBoundingClientRect()
      const dragDataStr = event.dataTransfer.getData("application/reactflow")

      if (!dragDataStr || !reactFlowBounds) {
        return
      }

      const { nodeType, subType } = JSON.parse(dragDataStr)
      const position = reactFlowInstance.project({
        x: event.clientX - reactFlowBounds.left,
        y: event.clientY - reactFlowBounds.top,
      })

      const newNodeId = `${Date.now()}`
      let newNode: Node

      if (nodeType === "source") {
        newNode = {
          id: newNodeId,
          type: "sourceNode",
          position,
          data: {
            id: newNodeId,
            label: `New ${subType.charAt(0).toUpperCase() + subType.slice(1)} Source`,
            type: "source",
            sourceType: subType,
            layer: "bronze",
            metadata: {
              description: `New ${subType} source system`,
              tableName: `${subType}_table`,
              host: "localhost",
              database: "default_db",
              ...(subType === "postgres" && { port: 5432 }),
            },
          },
        }
      } else if (nodeType === "target") {
        newNode = {
          id: newNodeId,
          type: "targetNode",
          position,
          data: {
            id: newNodeId,
            label: `New ${subType.charAt(0).toUpperCase() + subType.slice(1)} Target`,
            type: "target",
            targetType: subType,
            layer: "gold",
            metadata: {
              description: `New ${subType} target system`,
              tableName: `${subType}_target`,
              host: "localhost",
              database: "target_db",
            },
          },
        }
      } else {
        newNode = {
          id: newNodeId,
          type: "enhancedTransformNode",
          position,
          data: {
            id: newNodeId,
            label: "New Transform",
            type: "transform",
            layer: "silver",
            metadata: {
              description: "New data transformation",
              transformationLogic: "# Add your transformation logic here",
            },
          },
        }
      }

      setNodes((nds) => nds.concat(newNode))
      // Save state after adding node
      setTimeout(saveCurrentState, 100)
    },
    [reactFlowInstance, setNodes, saveCurrentState],
  )

  const onNodeUpdate = useCallback(
    (nodeId: string, updates: Partial<NodeData>) => {
      setNodes((nds) =>
        nds.map((node) => (node.id === nodeId ? { ...node, data: { ...node.data, ...updates } } : node)),
      )

      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode({ ...selectedNode, ...updates })
      }

      // Save state after updating node
      setTimeout(saveCurrentState, 100)
    },
    [setNodes, selectedNode, saveCurrentState],
  )

  const deleteNode = useCallback(
    (nodeId: string) => {
      setNodes((nds) => nds.filter((node) => node.id !== nodeId))
      setEdges((eds) => eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId))
      if (selectedNode && selectedNode.id === nodeId) {
        setSelectedNode(null)
      }
      // Save state after deleting node
      setTimeout(saveCurrentState, 100)
    },
    [setNodes, setEdges, selectedNode, saveCurrentState],
  )

  const deleteEdge = useCallback(
    (edgeId: string) => {
      setEdges((eds) => eds.filter((edge) => edge.id !== edgeId))
      if (selectedEdge && selectedEdge.id === edgeId) {
        setSelectedEdge(null)
      }
      // Save state after deleting edge
      setTimeout(saveCurrentState, 100)
    },
    [setEdges, selectedEdge, saveCurrentState],
  )

  const updateEdgeStyle = useCallback(
    (edgeId: string, color: string, style: string) => {
      setEdges((eds) =>
        eds.map((edge) =>
          edge.id === edgeId
            ? {
                ...edge,
                style: { stroke: color, strokeWidth: 2 },
                type:
                  style === "step"
                    ? "customStepEdge"
                    : style === "straight"
                      ? "customStraightEdge"
                      : "enhancedConnectionEdge",
              }
            : edge,
        ),
      )
      // Save state after updating edge style
      setTimeout(saveCurrentState, 100)
    },
    [setEdges, saveCurrentState],
  )

  // New project functionality
  const createNewProject = useCallback(
    (newProjectName: string) => {
      setProjectName(newProjectName)
      setNodes([])
      setEdges([])
      setSelectedNode(null)
      setSelectedEdge(null)
      setNodeClickedForEdit(false)
      clearHistory()
    },
    [setNodes, setEdges, clearHistory],
  )

  // SVG Export
  const handleExportSVG = useCallback(() => {
    exportToSVG(reactFlowInstance, projectName)
  }, [reactFlowInstance, projectName])

  // File operations
  const saveFlow = useCallback(() => {
    const flowData = {
      projectName,
      nodes,
      edges,
      timestamp: new Date().toISOString(),
      version: "3.0",
    }

    const dataStr = JSON.stringify(flowData, null, 2)
    const dataBlob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(dataBlob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${new Date().toISOString().split("T")[0]}.json`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }, [nodes, edges, projectName])

  const loadFlow = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (e) => {
        try {
          const flowData = JSON.parse(e.target?.result as string)
          if (flowData.nodes && flowData.edges) {
            setNodes(flowData.nodes)
            setEdges(flowData.edges)
            setProjectName(flowData.projectName || "Loaded Project")
            setSelectedNode(null)
            setSelectedEdge(null)
            setNodeClickedForEdit(false)
            clearHistory()
          }
        } catch (error) {
          alert("Error loading file. Please ensure it's a valid data pipeline flow file.")
        }
      }
      reader.readAsText(file)
    },
    [setNodes, setEdges, clearHistory],
  )

  const onPaneClick = useCallback(() => {
    setSelectedNode(null)
    setSelectedEdge(null)
    setNodeClickedForEdit(false)
  }, [])

  const toggleSidebar = useCallback(() => {
    setSidebarVisible((prev) => !prev)
  }, [])

  return (
    <div className="flex h-screen bg-gray-50">
      {sidebarVisible && (
        <Sidebar
          onSave={saveFlow}
          onLoad={loadFlow}
          onExportSVG={handleExportSVG}
          onNewProject={createNewProject}
          nodeCount={nodes.length}
          edgeCount={edges.length}
          onDragStart={onDragStart}
          projectName={projectName}
          canUndo={canUndo}
          canRedo={canRedo}
          onUndo={undo}
          onRedo={redo}
          isVisible={sidebarVisible}
          onToggle={toggleSidebar}
        />
      )}

      <div
        className={`flex-1 relative transition-all duration-300 ease-in-out ${sidebarVisible ? "" : "ml-0"}`}
        ref={reactFlowWrapper}
      >
        {/* Sidebar Toggle Button - Only show when sidebar is hidden */}
        {!sidebarVisible && (
          <button
            onClick={toggleSidebar}
            className="absolute top-4 left-4 z-10 p-2 bg-white border border-gray-300 rounded-lg shadow-lg hover:bg-gray-50 transition-colors"
            title="Show sidebar"
          >
            <Menu className="w-5 h-5 text-gray-600" />
          </button>
        )}

        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onPaneClick={onPaneClick}
          onEdgeClick={handleEdgeClick}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          className="bg-white"
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <Background color="#f8fafc" gap={20} />
        </ReactFlow>

        {/* Edge Styling Panel */}
        {selectedEdge && (
          <EdgeStylingPanel
            edge={selectedEdge}
            onClose={() => setSelectedEdge(null)}
            onUpdate={updateEdgeStyle}
            onDelete={deleteEdge}
          />
        )}
      </div>

      {selectedNode && (
        <MetadataPanel
          node={selectedNode}
          onClose={() => {
            setSelectedNode(null)
            setNodeClickedForEdit(false)
          }}
          onUpdate={onNodeUpdate}
          autoEdit={nodeClickedForEdit}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <DataLineageFlow />
    </ReactFlowProvider>
  )
}
