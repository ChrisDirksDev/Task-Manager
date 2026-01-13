import { Navbar } from "@/components/dashboard/navbar"

/**
 * Layout for all authenticated dashboard pages
 * Includes the navigation bar
 */
export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main>{children}</main>
    </div>
  )
}

