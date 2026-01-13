"use client"

import { useState } from "react"
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core"
import { SortableContext, horizontalListSortingStrategy } from "@dnd-kit/sortable"
import { KanbanColumn } from "./kanban-column"
import { KanbanCard } from "./kanban-card"
import { useMutation, useQueryClient } from "@tanstack/react-query"

interface KanbanBoardProps {
  projectId: string
  columns: Array<{
    id: string
    name: string
    color?: string | null
    order: number
  }>
  tasks: Array<{
    id: string
    title: string
    priority: string
    dueDate?: Date | string | null
    assignee?: {
      id: string
      name: string | null
      email: string
      image: string | null
    } | null
    tags: string[]
    columnId: string | null
    order: number
  }>
}

/**
 * Main Kanban board component with drag-and-drop functionality
 */
export function KanbanBoard({ projectId, columns, tasks }: KanbanBoardProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  )

  const moveTask = useMutation({
    mutationFn: async ({ taskId, columnId, order }: { taskId: string; columnId: string; order: number }) => {
      const response = await fetch(`/api/tasks/${taskId}/move`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ columnId, order }),
      })
      if (!response.ok) throw new Error("Failed to move task")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tasks", projectId] })
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] })
    },
  })

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over) {
      setActiveId(null)
      return
    }

    const activeId = active.id as string
    const overId = over.id as string

    // Find the active task
    const activeTask = tasks.find((t) => t.id === activeId)
    if (!activeTask) {
      setActiveId(null)
      return
    }

    // Check if dropped on a column
    const overColumn = columns.find((c) => c.id === overId)
    if (overColumn) {
      // Move task to new column
      const columnTasks = tasks.filter((t) => t.columnId === overColumn.id)
      const newOrder = columnTasks.length
      moveTask.mutate({ taskId: activeId, columnId: overColumn.id, order: newOrder })
    } else {
      // Check if dropped on another task
      const overTask = tasks.find((t) => t.id === overId)
      if (overTask && overTask.columnId) {
        const columnTasks = tasks.filter((t) => t.columnId === overTask.columnId)
        const overIndex = columnTasks.findIndex((t) => t.id === overId)
        const newOrder = overIndex >= 0 ? overIndex : columnTasks.length
        moveTask.mutate({ taskId: activeId, columnId: overTask.columnId, order: newOrder })
      }
    }

    setActiveId(null)
  }

  // Group tasks by column
  const tasksByColumn = columns.reduce((acc, column) => {
    acc[column.id] = tasks
      .filter((task) => task.columnId === column.id)
      .sort((a, b) => a.order - b.order)
    return acc
  }, {} as Record<string, typeof tasks>)

  const activeTask = activeId ? tasks.find((t) => t.id === activeId) : null

  return (
    <div className="bg-white rounded-lg p-4 w-full" style={{ backgroundColor: '#ffffff' }}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div 
          className="flex space-x-4 overflow-x-auto pb-4 w-full kanban-scroll-container" 
          style={{ 
            backgroundColor: '#ffffff',
            minWidth: '100%',
          }}
        >
          <div className="flex space-x-4 min-w-max" style={{ backgroundColor: '#ffffff' }}>
            <SortableContext items={columns.map((c) => c.id)} strategy={horizontalListSortingStrategy}>
              {columns.map((column) => (
                <KanbanColumn key={column.id} column={column} tasks={tasksByColumn[column.id] || []} />
              ))}
            </SortableContext>
          </div>
        </div>
        <DragOverlay>
          {activeTask ? (
            <div className="w-80">
              <KanbanCard task={activeTask} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}

