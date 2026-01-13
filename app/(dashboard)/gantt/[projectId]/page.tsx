"use client"

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query"
import { GanttChart } from "@/components/gantt/gantt-chart"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Gantt chart page for a specific project
 */
export default function GanttPage() {
  const params = useParams()
  const projectId = params.projectId as string

  const { data: tasks, isLoading } = useQuery({
    queryKey: ["tasks", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?projectId=${projectId}`)
      if (!response.ok) throw new Error("Failed to fetch tasks")
      return response.json()
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Gantt Chart</h1>
        <p className="mt-2 text-sm text-gray-600">Timeline view of tasks</p>
      </div>
      <GanttChart tasks={tasks || []} />
    </div>
  )
}

