export const exportToSVG = (reactFlowInstance: any, projectName: string) => {
  if (!reactFlowInstance) {
    console.error("ReactFlow instance not available")
    return
  }

  try {
    // Get the ReactFlow viewport
    const viewport = reactFlowInstance.getViewport()
    const nodes = reactFlowInstance.getNodes()
    const edges = reactFlowInstance.getEdges()

    if (nodes.length === 0) {
      alert("No nodes to export. Please add some nodes to your flow first.")
      return
    }

    // Calculate bounds
    let minX = Number.POSITIVE_INFINITY,
      minY = Number.POSITIVE_INFINITY,
      maxX = Number.NEGATIVE_INFINITY,
      maxY = Number.NEGATIVE_INFINITY

    nodes.forEach((node: any) => {
      const x = node.position.x
      const y = node.position.y
      const width = node.width || 180
      const height = node.height || 80

      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x + width)
      maxY = Math.max(maxY, y + height)
    })

    // Add padding
    const padding = 50
    minX -= padding
    minY -= padding
    maxX += padding
    maxY += padding

    const width = maxX - minX
    const height = maxY - minY

    // Create SVG content
    let svgContent = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${width}" height="${height}" viewBox="${minX} ${minY} ${width} ${height}" 
     xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
  <defs>
    <style>
      .node-text { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 14px; font-weight: 600; }
      .node-subtext { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 11px; opacity: 0.7; }
      .edge-path { stroke-width: 2; fill: none; }
    </style>
    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="9" refY="3.5" orient="auto">
      <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
    </marker>
  </defs>
  
  <!-- Background -->
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="#f8fafc" stroke="#e2e8f0" stroke-width="1"/>
  
  <!-- Grid pattern -->
  <defs>
    <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
      <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e2e8f0" stroke-width="0.5"/>
    </pattern>
  </defs>
  <rect x="${minX}" y="${minY}" width="${width}" height="${height}" fill="url(#grid)" opacity="0.5"/>
`

    // Add edges first (so they appear behind nodes)
    edges.forEach((edge: any) => {
      const sourceNode = nodes.find((n: any) => n.id === edge.source)
      const targetNode = nodes.find((n: any) => n.id === edge.target)

      if (sourceNode && targetNode) {
        const sourceX = sourceNode.position.x + (sourceNode.width || 180)
        const sourceY = sourceNode.position.y + (sourceNode.height || 80) / 2
        const targetX = targetNode.position.x
        const targetY = targetNode.position.y + (targetNode.height || 80) / 2

        const stroke = edge.style?.stroke || "#6b7280"

        // Create bezier curve
        const controlX1 = sourceX + (targetX - sourceX) * 0.5
        const controlY1 = sourceY
        const controlX2 = sourceX + (targetX - sourceX) * 0.5
        const controlY2 = targetY

        svgContent += `
  <path d="M ${sourceX} ${sourceY} C ${controlX1} ${controlY1}, ${controlX2} ${controlY2}, ${targetX} ${targetY}" 
        class="edge-path" stroke="${stroke}" marker-end="url(#arrowhead)"/>
`
      }
    })

    // Add nodes
    nodes.forEach((node: any) => {
      const x = node.position.x
      const y = node.position.y
      const width = node.width || 180
      const height = node.height || 80

      let fill = "#ffffff"
      let stroke = "#d1d5db"
      let emoji = "📊"
      let typeLabel = "Node"

      // Determine node styling based on type
      if (node.data.type === "source") {
        if (node.data.sourceType === "teradata") {
          fill = "#fed7aa"
          stroke = "#fb923c"
          emoji = "🟠"
          typeLabel = "Teradata Source"
        } else if (node.data.sourceType === "postgres") {
          fill = "#dbeafe"
          stroke = "#60a5fa"
          emoji = "🐘"
          typeLabel = "PostgreSQL Source"
        } else if (node.data.sourceType === "synapse") {
          fill = "#e9d5ff"
          stroke = "#a78bfa"
          emoji = "🔷"
          typeLabel = "Synapse Source"
        }
      } else if (node.data.type === "target") {
        if (node.data.targetType === "databricks") {
          fill = "#fecaca"
          stroke = "#f87171"
          emoji = "🧱"
          typeLabel = "Databricks Target"
        } else if (node.data.targetType === "sql") {
          fill = "#dcfce7"
          stroke = "#4ade80"
          emoji = "🗄️"
          typeLabel = "SQL Server Target"
        } else if (node.data.targetType === "postgres") {
          fill = "#dbeafe"
          stroke = "#60a5fa"
          emoji = "🐘"
          typeLabel = "PostgreSQL Target"
        }
      } else if (node.data.type === "transform") {
        fill = "#dbeafe"
        stroke = "#60a5fa"
        emoji = "⚙️"
        typeLabel = "Transform"
      }

      svgContent += `
  <g>
    <rect x="${x}" y="${y}" width="${width}" height="${height}" 
          fill="${fill}" stroke="${stroke}" stroke-width="2" rx="8"/>
    <text x="${x + 12}" y="${y + 25}" class="node-text" fill="#1f2937">
      ${emoji} ${node.data.label}
    </text>
    <text x="${x + 12}" y="${y + 45}" class="node-subtext" fill="#6b7280">
      ${typeLabel}
    </text>
    <text x="${x + 12}" y="${y + 60}" class="node-subtext" fill="#6b7280">
      ${node.data.layer} Layer
    </text>
  </g>
`
    })

    // Add title
    svgContent += `
  <text x="${minX + 20}" y="${minY + 30}" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 18px; font-weight: bold; fill: #1f2937;">
    ${projectName}
  </text>
  <text x="${minX + 20}" y="${minY + 50}" style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 12px; fill: #6b7280;">
    Generated on ${new Date().toLocaleDateString()}
  </text>
</svg>`

    // Create and download the file
    const blob = new Blob([svgContent], { type: "image/svg+xml" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = `${projectName.replace(/[^a-z0-9]/gi, "_").toLowerCase()}-${new Date().toISOString().split("T")[0]}.svg`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error("Error exporting SVG:", error)
    alert("Error exporting SVG. Please try again.")
  }
}
