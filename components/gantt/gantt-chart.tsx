"use client"

import { useMemo } from "react"
import { format, startOfWeek, endOfWeek, addDays, differenceInDays, isWithinInterval } from "date-fns"
import { Card } from "@/components/ui/card"

interface GanttChartProps {
  tasks: Array<{
    id: string
    title: string
    dueDate?: Date | string | null
    createdAt: Date | string
    status?: string
    priority?: string
  }>
  startDate?: Date
  endDate?: Date
}

/**
 * Simplified Gantt chart component
 * Displays tasks on a timeline view
 */
export function GanttChart({ tasks, startDate, endDate }: GanttChartProps) {
  // Calculate date range
  const dateRange = useMemo(() => {
    if (startDate && endDate) {
      return { start: startDate, end: endDate }
    }

    const taskDates = tasks
      .map((t) => {
        const created = new Date(t.createdAt)
        const due = t.dueDate ? new Date(t.dueDate) : null
        return { start: created, end: due || addDays(created, 7) }
      })
      .filter((d) => d.start && d.end)

    if (taskDates.length === 0) {
      const today = new Date()
      return { start: startOfWeek(today), end: endOfWeek(addDays(today, 14)) }
    }

    const minDate = new Date(Math.min(...taskDates.map((d) => d.start.getTime())))
    const maxDate = new Date(Math.max(...taskDates.map((d) => d.end.getTime())))

    return {
      start: startOfWeek(minDate),
      end: endOfWeek(maxDate),
    }
  }, [tasks, startDate, endDate])

  const days = useMemo(() => {
    const daysArray = []
    let current = dateRange.start
    while (current <= dateRange.end) {
      daysArray.push(new Date(current))
      current = addDays(current, 1)
    }
    return daysArray
  }, [dateRange])

  const getTaskPosition = (task: typeof tasks[0]) => {
    const created = new Date(task.createdAt)
    const due = task.dueDate ? new Date(task.dueDate) : addDays(created, 7)

    const startOffset = differenceInDays(created, dateRange.start)
    const duration = differenceInDays(due, created)

    return {
      left: `${(startOffset / days.length) * 100}%`,
      width: `${(duration / days.length) * 100}%`,
    }
  }

  const getPriorityColor = (priority?: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <Card className="p-6">
      <div className="overflow-x-auto">
        {/* Timeline header */}
        <div className="mb-4 flex min-w-full">
          <div className="w-48 flex-shrink-0"></div>
          <div className="flex flex-1 border-b">
            {days.map((day, idx) => {
              if (idx % 7 === 0 || idx === 0) {
                return (
                  <div key={day.toISOString()} className="flex-1 border-l px-2 py-1 text-xs font-medium">
                    {format(day, "MMM d")}
                  </div>
                )
              }
              return null
            })}
          </div>
        </div>

        {/* Tasks */}
        <div className="space-y-2">
          {tasks.map((task) => {
            const position = getTaskPosition(task)
            return (
              <div key={task.id} className="flex items-center min-h-[40px]">
                <div className="w-48 flex-shrink-0 pr-4">
                  <div className="font-medium text-sm truncate">{task.title}</div>
                </div>
                <div className="flex-1 relative h-8">
                  <div
                    className={`absolute h-6 rounded ${getPriorityColor(task.priority)} opacity-80 hover:opacity-100 transition-opacity cursor-pointer`}
                    style={{
                      left: position.left,
                      width: position.width,
                      minWidth: "20px",
                    }}
                    title={task.title}
                  />
                </div>
              </div>
            )
          })}
        </div>

        {tasks.length === 0 && (
          <div className="text-center text-gray-500 py-8">No tasks to display</div>
        )}
      </div>
    </Card>
  )
}

