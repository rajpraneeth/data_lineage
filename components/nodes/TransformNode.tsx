import { Handle, Position } from "reactflow"
import { Code } from "lucide-react"

interface TransformNodeProps {
  data: {
    label: string
    metadata: any
  }
  selected: boolean
}

export function TransformNode({ data, selected }: TransformNodeProps) {
  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg bg-gradient-to-br from-blue-100 to-blue-200 border-2 border-blue-400 text-blue-900 ${selected ? "ring-2 ring-blue-500 shadow-xl" : ""} min-w-[140px]`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-blue-400" />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">⚙️</span>
        <Code className="w-4 h-4" />
        <div className="text-sm font-semibold">{data.label}</div>
      </div>
      <div className="text-xs opacity-75 font-medium">Transform</div>
      <Handle type="source" position={Position.Right} className="w-3 h-3 !bg-blue-400" />
    </div>
  )
}
