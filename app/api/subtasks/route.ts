import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/subtasks
 * Create a new subtask
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId, title } = await request.json()

    if (!taskId || !title) {
      return NextResponse.json({ error: "taskId and title are required" }, { status: 400 })
    }

    // Verify user has access to task's project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
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

    // Get max order
    const maxOrder = await prisma.subtask.findFirst({
      where: { taskId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const subtask = await prisma.subtask.create({
      data: {
        taskId,
        title,
        order: (maxOrder?.order ?? -1) + 1,
      },
    })

    return NextResponse.json(subtask, { status: 201 })
  } catch (error) {
    console.error("Error creating subtask:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

