import { Handle, Position } from "reactflow"
import { Target } from "lucide-react"

interface OutputNodeProps {
  data: {
    label: string
    layer: "bronze" | "silver" | "gold"
    metadata: any
  }
  selected: boolean
}

export function OutputNode({ data, selected }: OutputNodeProps) {
  const layerColors = {
    bronze: "bg-gradient-to-br from-amber-100 to-amber-200 border-amber-400 text-amber-900",
    silver: "bg-gradient-to-br from-gray-100 to-gray-200 border-gray-400 text-gray-900",
    gold: "bg-gradient-to-br from-yellow-100 to-yellow-200 border-yellow-400 text-yellow-900",
  }

  const layerIcons = {
    bronze: "🥉",
    silver: "🥈",
    gold: "🥇",
  }

  return (
    <div
      className={`px-4 py-3 shadow-lg rounded-lg border-2 ${layerColors[data.layer]} ${selected ? "ring-2 ring-blue-500 shadow-xl" : ""} min-w-[140px]`}
    >
      <Handle type="target" position={Position.Left} className="w-3 h-3 !bg-gray-400" />
      <div className="flex items-center gap-2 mb-1">
        <span className="text-sm">{layerIcons[data.layer]}</span>
        <Target className="w-4 h-4" />
        <div className="text-sm font-semibold">{data.label}</div>
      </div>
      <div className="text-xs opacity-75 capitalize font-medium">{data.layer} Output</div>
    </div>
  )
}
