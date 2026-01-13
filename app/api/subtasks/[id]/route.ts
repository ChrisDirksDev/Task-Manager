import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/subtasks/[id]
 * Update a subtask
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Verify user has access to subtask's task project
    const subtask = await prisma.subtask.findFirst({
      where: {
        id: params.id,
        task: {
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
      },
    })

    if (!subtask) {
      return NextResponse.json({ error: "Subtask not found or forbidden" }, { status: 404 })
    }

    const updatedSubtask = await prisma.subtask.update({
      where: { id: params.id },
      data: {
        title: data.title,
        completed: data.completed,
        order: data.order,
      },
    })

    return NextResponse.json(updatedSubtask)
  } catch (error) {
    console.error("Error updating subtask:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/subtasks/[id]
 * Delete a subtask
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user has access to subtask's task project
    const subtask = await prisma.subtask.findFirst({
      where: {
        id: params.id,
        task: {
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
      },
    })

    if (!subtask) {
      return NextResponse.json({ error: "Subtask not found or forbidden" }, { status: 404 })
    }

    await prisma.subtask.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Subtask deleted" })
  } catch (error) {
    console.error("Error deleting subtask:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

