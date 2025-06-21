"use client"

import { useState, useCallback } from "react"
import type { Node, Edge } from "reactflow"

interface HistoryState {
  nodes: Node[]
  edges: Edge[]
  projectName: string
}

interface UseUndoRedoReturn {
  canUndo: boolean
  canRedo: boolean
  undo: () => void
  redo: () => void
  saveState: (nodes: Node[], edges: Edge[], projectName: string) => void
  clearHistory: () => void
}

export function useUndoRedo(
  initialNodes: Node[],
  initialEdges: Edge[],
  initialProjectName: string,
  onStateChange: (nodes: Node[], edges: Edge[], projectName: string) => void,
): UseUndoRedoReturn {
  const [history, setHistory] = useState<HistoryState[]>([
    { nodes: initialNodes, edges: initialEdges, projectName: initialProjectName },
  ])
  const [currentIndex, setCurrentIndex] = useState(0)

  const saveState = useCallback(
    (nodes: Node[], edges: Edge[], projectName: string) => {
      setHistory((prev) => {
        const newHistory = prev.slice(0, currentIndex + 1)
        newHistory.push({ nodes: [...nodes], edges: [...edges], projectName })

        // Limit history to 50 states to prevent memory issues
        if (newHistory.length > 50) {
          newHistory.shift()
          return newHistory
        }

        return newHistory
      })
      setCurrentIndex((prev) => Math.min(prev + 1, 49))
    },
    [currentIndex],
  )

  const undo = useCallback(() => {
    if (currentIndex > 0) {
      const newIndex = currentIndex - 1
      setCurrentIndex(newIndex)
      const state = history[newIndex]
      onStateChange(state.nodes, state.edges, state.projectName)
    }
  }, [currentIndex, history, onStateChange])

  const redo = useCallback(() => {
    if (currentIndex < history.length - 1) {
      const newIndex = currentIndex + 1
      setCurrentIndex(newIndex)
      const state = history[newIndex]
      onStateChange(state.nodes, state.edges, state.projectName)
    }
  }, [currentIndex, history, onStateChange])

  const clearHistory = useCallback(() => {
    setHistory([{ nodes: [], edges: [], projectName: "New Project" }])
    setCurrentIndex(0)
  }, [])

  return {
    canUndo: currentIndex > 0,
    canRedo: currentIndex < history.length - 1,
    undo,
    redo,
    saveState,
    clearHistory,
  }
}
