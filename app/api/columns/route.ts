import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * POST /api/columns
 * Create a new column for a project
 */
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { projectId, name, color } = await request.json()

    if (!projectId || !name) {
      return NextResponse.json({ error: "projectId and name are required" }, { status: 400 })
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

    // Get max order
    const maxOrder = await prisma.column.findFirst({
      where: { projectId },
      orderBy: { order: "desc" },
      select: { order: true },
    })

    const column = await prisma.column.create({
      data: {
        projectId,
        name,
        color,
        order: (maxOrder?.order ?? -1) + 1,
      },
    })

    return NextResponse.json(column, { status: 201 })
  } catch (error) {
    console.error("Error creating column:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

