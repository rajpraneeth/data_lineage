export interface NodeData {
  id: string
  label: string
  type: "source" | "target" | "transform"
  sourceType?: "teradata" | "postgres" | "synapse"
  targetType?: "databricks" | "sql" | "postgres"
  layer: "bronze" | "silver" | "gold"
  metadata: {
    tableName?: string
    schema?: string[]
    transformationLogic?: string
    description?: string
    connectionString?: string
    database?: string
    host?: string
    port?: number
  }
}

export interface CustomNode {
  id: string
  type: string
  position: { x: number; y: number }
  data: NodeData
}

export interface DragItem {
  type: "source" | "target" | "transform"
  sourceType?: "teradata" | "postgres" | "synapse"
  targetType?: "databricks" | "sql" | "postgres"
  label: string
}
