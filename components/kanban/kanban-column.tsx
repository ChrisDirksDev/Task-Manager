"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { KanbanCard } from "./kanban-card"
import { Card } from "@/components/ui/card"

interface KanbanColumnProps {
  column: {
    id: string
    name: string
    color?: string | null
    order: number
  }
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
  }>
}

/**
 * Kanban column component with drag-and-drop support
 */
export function KanbanColumn({ column, tasks }: KanbanColumnProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: column.id,
    data: {
      type: "column",
      column,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div ref={setNodeRef} style={style} className="flex-shrink-0 w-80">
      <Card className="bg-gray-50">
        <div className="p-4 border-b">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-gray-900">{column.name}</h3>
            <span className="text-sm text-gray-500 bg-white px-2 py-1 rounded-full">
              {tasks.length}
            </span>
          </div>
        </div>
        <div className="p-4 space-y-3 min-h-[400px]">
          {tasks.map((task) => (
            <KanbanCard key={task.id} task={task} />
          ))}
          {tasks.length === 0 && (
            <div className="text-center text-sm text-gray-400 py-8">No tasks</div>
          )}
        </div>
      </Card>
    </div>
  )
}

