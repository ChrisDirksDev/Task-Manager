"use client"

import { useParams } from "next/navigation"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { formatDate, formatDateTime, formatDuration } from "@/lib/utils"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"
import { Calendar, User, MessageSquare, Clock, CheckCircle2, Plus, Trash2 } from "lucide-react"
import ReactMarkdown from "react-markdown"
import { useState } from "react"

/**
 * Task detail page with full task information, comments, subtasks, and time tracking
 */
export default function TaskDetailPage() {
  const params = useParams()
  const taskId = params.id as string
  const queryClient = useQueryClient()
  const [commentText, setCommentText] = useState("")
  const [subtaskText, setSubtaskText] = useState("")
  const [isTracking, setIsTracking] = useState(false)
  const [timerStart, setTimerStart] = useState<Date | null>(null)

  const { data: task, isLoading } = useQuery({
    queryKey: ["task", taskId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks/${taskId}`)
      if (!response.ok) throw new Error("Failed to fetch task")
      return response.json()
    },
  })

  const updateTask = useMutation({
    mutationFn: async (data: any) => {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })
      if (!response.ok) throw new Error("Failed to update task")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      queryClient.invalidateQueries({ queryKey: ["tasks"] })
    },
  })

  const addComment = useMutation({
    mutationFn: async (content: string) => {
      const response = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, content }),
      })
      if (!response.ok) throw new Error("Failed to add comment")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      setCommentText("")
    },
  })

  const deleteComment = useMutation({
    mutationFn: async (commentId: string) => {
      const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE",
      })
      if (!response.ok) throw new Error("Failed to delete comment")
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
    },
  })

  const toggleSubtask = useMutation({
    mutationFn: async ({ subtaskId, completed }: { subtaskId: string; completed: boolean }) => {
      const response = await fetch(`/api/subtasks/${subtaskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed }),
      })
      if (!response.ok) throw new Error("Failed to update subtask")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
    },
  })

  const addSubtask = useMutation({
    mutationFn: async (title: string) => {
      const response = await fetch("/api/subtasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ taskId, title }),
      })
      if (!response.ok) throw new Error("Failed to create subtask")
      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      setSubtaskText("")
    },
  })

  const startTimer = () => {
    setIsTracking(true)
    setTimerStart(new Date())
  }

  const stopTimer = useMutation({
    mutationFn: async () => {
      if (!timerStart) return
      const endTime = new Date()
      const duration = Math.floor((endTime.getTime() - timerStart.getTime()) / 1000)
      const response = await fetch("/api/time-entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          taskId,
          startTime: timerStart.toISOString(),
          endTime: endTime.toISOString(),
          duration,
        }),
      })
      if (!response.ok) throw new Error("Failed to save time entry")
      return response.json()
    },
    onSuccess: () => {
      setIsTracking(false)
      setTimerStart(null)
      queryClient.invalidateQueries({ queryKey: ["task", taskId] })
      queryClient.invalidateQueries({ queryKey: ["time-entries"] })
    },
  })

  if (isLoading) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <Skeleton className="h-8 w-64 mb-8" />
        <Skeleton className="h-96" />
      </div>
    )
  }

  if (!task) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
        <p>Task not found</p>
      </div>
    )
  }

  const totalTime = task.timeEntries?.reduce((acc: number, entry: any) => {
    return acc + (entry.duration || 0)
  }, 0) || 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Input
              value={task.title}
              onChange={(e) => updateTask.mutate({ title: e.target.value })}
              className="text-2xl font-bold border-none p-0 focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center space-x-2">
            {isTracking ? (
              <Button onClick={() => stopTimer.mutate()} variant="destructive">
                <Clock className="mr-2 h-4 w-4" />
                Stop Timer
              </Button>
            ) : (
              <Button onClick={startTimer}>
                <Clock className="mr-2 h-4 w-4" />
                Start Timer
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              {task.description ? (
                <div className="prose prose-sm max-w-none">
                  <ReactMarkdown>{task.description}</ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  placeholder="Add a description..."
                  value={task.description || ""}
                  onChange={(e) => updateTask.mutate({ description: e.target.value })}
                  rows={5}
                />
              )}
            </CardContent>
          </Card>

          {/* Subtasks */}
          <Card>
            <CardHeader>
              <CardTitle>Subtasks</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {task.subtasks?.map((subtask: any) => (
                  <div key={subtask.id} className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={subtask.completed}
                      onChange={() => toggleSubtask.mutate({ subtaskId: subtask.id, completed: !subtask.completed })}
                      className="rounded"
                    />
                    <span className={subtask.completed ? "line-through text-gray-500" : ""}>
                      {subtask.title}
                    </span>
                  </div>
                ))}
                <div className="flex space-x-2">
                  <Input
                    placeholder="Add subtask..."
                    value={subtaskText}
                    onChange={(e) => setSubtaskText(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && subtaskText.trim()) {
                        addSubtask.mutate(subtaskText.trim())
                      }
                    }}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Comments */}
          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {task.comments?.map((comment: any) => (
                  <div key={comment.id} className="border-b pb-4 last:border-0">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center">
                          {comment.user.name?.[0] || comment.user.email[0]}
                        </div>
                        <div>
                          <div className="font-medium text-sm">{comment.user.name || comment.user.email}</div>
                          <div className="text-xs text-gray-500">{formatDateTime(comment.createdAt)}</div>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteComment.mutate(comment.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="mt-2 prose prose-sm max-w-none">
                      <ReactMarkdown>{comment.content}</ReactMarkdown>
                    </div>
                  </div>
                ))}
                <div className="space-y-2">
                  <Textarea
                    placeholder="Add a comment..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    rows={3}
                  />
                  <Button
                    onClick={() => addComment.mutate(commentText)}
                    disabled={!commentText.trim() || addComment.isPending}
                  >
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Add Comment
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-500">Status</label>
                <Select
                  value={task.columnId || ""}
                  onValueChange={(value) => updateTask.mutate({ columnId: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {/* Columns would come from project */}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Priority</label>
                <Select
                  value={task.priority}
                  onValueChange={(value) => updateTask.mutate({ priority: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {task.dueDate && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Due Date</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{formatDate(task.dueDate)}</span>
                  </div>
                </div>
              )}
              {task.assignee && (
                <div>
                  <label className="text-sm font-medium text-gray-500">Assignee</label>
                  <div className="flex items-center space-x-2 mt-1">
                    <User className="h-4 w-4 text-gray-400" />
                    <span className="text-sm">{task.assignee.name || task.assignee.email}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Time Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Time</span>
                  <span className="font-medium">{formatDuration(totalTime)}</span>
                </div>
                {task.timeEntries && task.timeEntries.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-medium text-gray-500">Recent Entries</div>
                    {task.timeEntries.slice(0, 5).map((entry: any) => (
                      <div key={entry.id} className="text-xs text-gray-600">
                        {formatDateTime(entry.startTime)} - {formatDuration(entry.duration)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

