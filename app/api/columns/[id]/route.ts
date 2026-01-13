import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/columns/[id]
 * Update a column
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Verify user has access to column's project
    const column = await prisma.column.findFirst({
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

    if (!column) {
      return NextResponse.json({ error: "Column not found or forbidden" }, { status: 404 })
    }

    const updatedColumn = await prisma.column.update({
      where: { id: params.id },
      data: {
        name: data.name,
        color: data.color,
        order: data.order,
      },
    })

    return NextResponse.json(updatedColumn)
  } catch (error) {
    console.error("Error updating column:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/columns/[id]
 * Delete a column
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user has access to column's project
    const column = await prisma.column.findFirst({
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

    if (!column) {
      return NextResponse.json({ error: "Column not found or forbidden" }, { status: 404 })
    }

    await prisma.column.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Column deleted" })
  } catch (error) {
    console.error("Error deleting column:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

