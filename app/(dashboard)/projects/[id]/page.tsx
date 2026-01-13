"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import Link from "next/link"
import { KanbanBoard } from "@/components/kanban/kanban-board"
import { CreateTaskDialog } from "@/components/tasks/create-task-dialog"
import { Button } from "@/components/ui/button"
import { Plus, Calendar } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Project detail page showing the Kanban board
 */
export default function ProjectDetailPage() {
  const params = useParams()
  const projectId = params.id as string
  const queryClient = useQueryClient()

  const { data: project, isLoading: projectLoading } = useQuery({
    queryKey: ["projects", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`)
      if (!response.ok) throw new Error("Failed to fetch project")
      return response.json()
    },
  })

  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?projectId=${projectId}`)
      if (!response.ok) throw new Error("Failed to fetch tasks")
      return response.json()
    },
    enabled: !!projectId,
  })

  if (projectLoading || tasksLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <p>Project not found</p>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 bg-white min-h-screen">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{project.name}</h1>
          {project.description && (
            <p className="mt-2 text-sm text-gray-600">{project.description}</p>
          )}
        </div>
        <div className="flex items-center space-x-2">
          <Link href={`/gantt/${projectId}`}>
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              Gantt Chart
            </Button>
          </Link>
          <CreateTaskDialog projectId={projectId} columns={project.columns || []} />
        </div>
      </div>

      {project.columns && project.columns.length > 0 ? (
        <KanbanBoard
          projectId={projectId}
          columns={project.columns}
          tasks={tasks || []}
        />
      ) : (
        <div className="rounded-lg border border-dashed border-gray-300 p-12 text-center bg-white">
          <p className="text-gray-500">No columns found. Please create columns for this project.</p>
        </div>
      )}
    </div>
  )
}

