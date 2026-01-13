"use client"

import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FolderKanban, Calendar, Users } from "lucide-react"
import { formatDate } from "@/lib/utils"

interface ProjectCardProps {
  project: {
    id: string
    name: string
    description?: string | null
    color?: string | null
    updatedAt: Date | string
    _count?: {
      tasks: number
    }
    members?: Array<{
      user: {
        id: string
        name: string | null
        email: string
        image: string | null
      }
    }>
  }
}

/**
 * Project card component for displaying project information
 */
export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <Card className="h-full transition-shadow hover:shadow-lg">
        <CardHeader>
          <div className="flex items-start justify-between">
            <CardTitle className="text-lg">{project.name}</CardTitle>
            {project.color && (
              <div
                className="h-4 w-4 rounded-full"
                style={{ backgroundColor: project.color }}
              />
            )}
          </div>
        </CardHeader>
        <CardContent>
          {project.description && (
            <p className="mb-4 line-clamp-2 text-sm text-gray-600">{project.description}</p>
          )}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <FolderKanban className="h-4 w-4" />
                <span>{project._count?.tasks || 0} tasks</span>
              </div>
              {project.members && (
                <div className="flex items-center space-x-1">
                  <Users className="h-4 w-4" />
                  <span>{project.members.length} members</span>
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(project.updatedAt)}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}

