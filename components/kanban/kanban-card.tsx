"use client"

"use client"

import { useSortable } from "@dnd-kit/sortable"
import { CSS } from "@dnd-kit/utilities"
import { Calendar, User } from "lucide-react"
import { Card } from "@/components/ui/card"
import { getPriorityColor, formatDate } from "@/lib/utils"
import { useRouter } from "next/navigation"

interface KanbanCardProps {
  task: {
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
  }
}

/**
 * Kanban card component for individual tasks
 */
export function KanbanCard({ task }: KanbanCardProps) {
  const router = useRouter()
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: "task",
      task,
    },
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  const priorityColor = getPriorityColor(task.priority)

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="cursor-grab active:cursor-grabbing bg-white hover:shadow-md transition-shadow p-4"
      onClick={() => router.push(`/tasks/${task.id}`)}
    >
      <div className="space-y-2">
        <div className="flex items-start justify-between">
          <h4 className="font-medium text-sm text-gray-900 line-clamp-2">{task.title}</h4>
          <div className={`h-2 w-2 rounded-full flex-shrink-0 mt-1 ${priorityColor}`} />
        </div>

        {task.tags && task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {task.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded"
              >
                {tag}
              </span>
            ))}
            {task.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{task.tags.length - 3}</span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-gray-500">
          {task.dueDate && (
            <div className="flex items-center space-x-1">
              <Calendar className="h-3 w-3" />
              <span>{formatDate(task.dueDate)}</span>
            </div>
          )}
          {task.assignee && (
            <div className="flex items-center space-x-1">
              <User className="h-3 w-3" />
              <span className="truncate max-w-[100px]">
                {task.assignee.name || task.assignee.email}
              </span>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}

