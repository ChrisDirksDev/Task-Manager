"use client"

import { useQuery } from "@tanstack/react-query"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, CheckCircle2, Clock, Users } from "lucide-react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts"
import { Skeleton } from "@/components/ui/skeleton"

/**
 * Dashboard page with statistics and charts
 */
export default function DashboardPage() {
  const { data: projects, isLoading: projectsLoading } = useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const response = await fetch("/api/projects")
      if (!response.ok) throw new Error("Failed to fetch projects")
      return response.json()
    },
  })

  const { data: allTasks, isLoading: tasksLoading } = useQuery({
    queryKey: ["all-tasks"],
    queryFn: async () => {
      if (!projects || projects.length === 0) return []
      const taskPromises = projects.map((project: any) =>
        fetch(`/api/tasks?projectId=${project.id}`).then((res) => res.json())
      )
      const taskArrays = await Promise.all(taskPromises)
      return taskArrays.flat()
    },
    enabled: !!projects,
  })

  const { data: timeEntries, isLoading: timeLoading } = useQuery({
    queryKey: ["time-entries"],
    queryFn: async () => {
      const response = await fetch("/api/time-entries")
      if (!response.ok) throw new Error("Failed to fetch time entries")
      return response.json()
    },
  })

  // Calculate statistics
  const stats = {
    totalProjects: projects?.length || 0,
    totalTasks: allTasks?.length || 0,
    completedTasks: allTasks?.filter((t: any) => t.status === "done" || t.column?.name === "Done").length || 0,
    totalHours: timeEntries?.reduce((acc: number, entry: any) => {
      const hours = entry.duration ? entry.duration / 3600 : 0
      return acc + hours
    }, 0) || 0,
  }

  // Tasks by status
  const tasksByStatus = allTasks
    ? [
        { name: "To Do", value: allTasks.filter((t: any) => t.column?.name === "To Do" || t.status === "todo").length },
        {
          name: "In Progress",
          value: allTasks.filter((t: any) => t.column?.name === "In Progress" || t.status === "in-progress").length,
        },
        { name: "Review", value: allTasks.filter((t: any) => t.column?.name === "Review" || t.status === "review").length },
        { name: "Done", value: allTasks.filter((t: any) => t.column?.name === "Done" || t.status === "done").length },
      ]
    : []

  // Tasks by priority
  const tasksByPriority = allTasks
    ? [
        { name: "Low", value: allTasks.filter((t: any) => t.priority === "low").length },
        { name: "Medium", value: allTasks.filter((t: any) => t.priority === "medium").length },
        { name: "High", value: allTasks.filter((t: any) => t.priority === "high").length },
        { name: "Urgent", value: allTasks.filter((t: any) => t.priority === "urgent").length },
      ]
    : []

  const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444"]

  if (projectsLoading || tasksLoading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-sm text-gray-600">Overview of your projects and tasks</p>
      </div>

      {/* Statistics Cards */}
      <div className="mb-8 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">{stats.completedTasks} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalHours.toFixed(1)}h</div>
            <p className="text-xs text-muted-foreground">Time tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {projects?.reduce((acc: number, p: any) => acc + (p.members?.length || 0), 0) || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
            <CardDescription>Distribution of tasks across statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={tasksByStatus} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                  tick={{ fontSize: 12 }}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tasks by Priority</CardTitle>
            <CardDescription>Distribution of tasks by priority level</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={tasksByPriority}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => {
                    if (percent < 0.05) return "" // Hide labels for very small slices
                    return `${name} ${(percent * 100).toFixed(0)}%`
                  }}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {tasksByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend 
                  verticalAlign="bottom" 
                  height={36}
                  formatter={(value) => value}
                />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

