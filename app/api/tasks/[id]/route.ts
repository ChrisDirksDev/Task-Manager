import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/tasks/[id]
 * Get a single task by ID
 */
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        column: true,
        subtasks: {
          orderBy: {
            order: "asc",
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: {
            createdAt: "asc",
          },
        },
        timeEntries: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        files: {
          orderBy: {
            createdAt: "desc",
          },
        },
        dependencies: {
          include: {
            dependencyTask: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
        dependents: {
          include: {
            dependentTask: {
              select: {
                id: true,
                title: true,
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 })
    }

    return NextResponse.json(task)
  } catch (error) {
    console.error("Error fetching task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * PATCH /api/tasks/[id]
 * Update a task
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user has access to task's project
    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: {
          members: {
            some: {
              userId: session.user.id,
              role: {
                in: ["admin", "editor"],
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found or forbidden" }, { status: 404 })
    }

    const data = await request.json()

    // Handle column change and reordering
    if (data.columnId !== undefined && data.columnId !== task.columnId) {
      // Get max order in new column
      const maxOrder = await prisma.task.findFirst({
        where: { columnId: data.columnId },
        orderBy: { order: "desc" },
        select: { order: true },
      })
      data.order = (maxOrder?.order ?? -1) + 1
    }

    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        title: data.title,
        description: data.description,
        priority: data.priority,
        status: data.status,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assigneeId: data.assigneeId,
        columnId: data.columnId,
        order: data.order,
        tags: data.tags,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        column: true,
        subtasks: true,
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error updating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/tasks/[id]
 * Delete a task
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user has access to task's project
    const task = await prisma.task.findFirst({
      where: {
        id: params.id,
        project: {
          members: {
            some: {
              userId: session.user.id,
              role: {
                in: ["admin", "editor"],
              },
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found or forbidden" }, { status: 404 })
    }

    await prisma.task.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Task deleted" })
  } catch (error) {
    console.error("Error deleting task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

