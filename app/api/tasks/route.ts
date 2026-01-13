import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * GET /api/tasks
 * Get tasks for a project
 */
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 })
    }

    // Verify user has access to project
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const tasks = await prisma.task.findMany({
      where: {
        projectId,
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
        _count: {
          select: {
            comments: true,
            timeEntries: true,
          },
        },
      },
      orderBy: [
        { columnId: "asc" },
        { order: "asc" },
      ],
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Error fetching tasks:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * POST /api/tasks
 * Create a new task
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, description, projectId, columnId, priority, dueDate, assigneeId, tags } = await request.json()

    if (!title || !projectId) {
      return NextResponse.json({ error: "Title and projectId are required" }, { status: 400 })
    }

    // Verify user has access to project
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId: session.user.id,
        role: {
          in: ["admin", "editor"],
        },
      },
    })

    if (!member) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get the first column if no columnId provided
    let targetColumnId = columnId
    if (!targetColumnId) {
      const firstColumn = await prisma.column.findFirst({
        where: { projectId },
        orderBy: { order: "asc" },
      })
      targetColumnId = firstColumn?.id
    }

    // Get max order in column
    const maxOrder = await prisma.task.findFirst({
      where: { columnId: targetColumnId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const task = await prisma.task.create({
      data: {
        title,
        description,
        projectId,
        columnId: targetColumnId,
        priority: priority || "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
        assigneeId,
        creatorId: session.user.id,
        tags: tags || [],
        order: (maxOrder?.order ?? -1) + 1,
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

    return NextResponse.json(task, { status: 201 })
  } catch (error) {
    console.error("Error creating task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

