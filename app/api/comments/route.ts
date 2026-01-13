import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/comments
 * Create a new comment on a task
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { taskId, content } = await request.json()

    if (!taskId || !content) {
      return NextResponse.json({ error: "taskId and content are required" }, { status: 400 })
    }

    // Verify user has access to task's project
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        project: {
          members: {
            some: {
              userId: session.user.id,
            },
          },
        },
      },
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found or forbidden" }, { status: 404 })
    }

    const comment = await prisma.comment.create({
      data: {
        taskId,
        userId: session.user.id,
        content,
      },
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
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Error creating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

