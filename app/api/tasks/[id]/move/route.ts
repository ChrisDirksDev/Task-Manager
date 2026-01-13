import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/tasks/[id]/move
 * Move a task to a different column/position (for drag-and-drop)
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { columnId, order } = await request.json()

    if (columnId === undefined || order === undefined) {
      return NextResponse.json({ error: "columnId and order are required" }, { status: 400 })
    }

    // Verify user has access to task's project
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
    })

    if (!task) {
      return NextResponse.json({ error: "Task not found or forbidden" }, { status: 404 })
    }

    // Update task position
    const updatedTask = await prisma.task.update({
      where: { id: params.id },
      data: {
        columnId,
        order,
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
        column: true,
      },
    })

    return NextResponse.json(updatedTask)
  } catch (error) {
    console.error("Error moving task:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

