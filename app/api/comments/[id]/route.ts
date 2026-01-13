import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/comments/[id]
 * Update a comment
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { content } = await request.json()

    // Verify user owns the comment
    const comment = await prisma.comment.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found or forbidden" }, { status: 404 })
    }

    const updatedComment = await prisma.comment.update({
      where: { id: params.id },
      data: { content },
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

    return NextResponse.json(updatedComment)
  } catch (error) {
    console.error("Error updating comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/comments/[id]
 * Delete a comment
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user owns the comment or is admin/editor of project
    const comment = await prisma.comment.findFirst({
      where: { id: params.id },
      include: {
        task: {
          include: {
            project: {
              include: {
                members: true,
              },
            },
          },
        },
      },
    })

    if (!comment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }

    const isOwner = comment.userId === session.user.id
    const isAdminOrEditor = comment.task.project.members.some(
      (m) => m.userId === session.user.id && ["admin", "editor"].includes(m.role)
    )

    if (!isOwner && !isAdminOrEditor) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    await prisma.comment.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Comment deleted" })
  } catch (error) {
    console.error("Error deleting comment:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

