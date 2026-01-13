import { withAuth } from "next-auth/middleware"

/**
 * Middleware to protect routes
 * 
 * All routes under /dashboard, /projects, /kanban, /gantt require authentication
 */
export default withAuth({
  pages: {
    signIn: "/login",
  },
})

export const config = {
  matcher: ["/dashboard/:path*", "/projects/:path*", "/kanban/:path*", "/gantt/:path*"],
}

