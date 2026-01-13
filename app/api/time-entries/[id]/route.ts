import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

/**
 * PATCH /api/time-entries/[id]
 * Update a time entry (e.g., stop timer, update duration)
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()

    // Verify user owns the time entry
    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!timeEntry) {
      return NextResponse.json({ error: "Time entry not found or forbidden" }, { status: 404 })
    }

    const updateData: any = {}
    if (data.endTime !== undefined) {
      updateData.endTime = new Date(data.endTime)
    }
    if (data.duration !== undefined) {
      updateData.duration = data.duration
    }
    if (data.description !== undefined) {
      updateData.description = data.description
    }

    const updatedEntry = await prisma.timeEntry.update({
      where: { id: params.id },
      data: updateData,
      include: {
        task: {
          select: {
            id: true,
            title: true,
          },
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(updatedEntry)
  } catch (error) {
    console.error("Error updating time entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

/**
 * DELETE /api/time-entries/[id]
 * Delete a time entry
 */
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Verify user owns the time entry
    const timeEntry = await prisma.timeEntry.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    })

    if (!timeEntry) {
      return NextResponse.json({ error: "Time entry not found or forbidden" }, { status: 404 })
    }

    await prisma.timeEntry.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ message: "Time entry deleted" })
  } catch (error) {
    console.error("Error deleting time entry:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

