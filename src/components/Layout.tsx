import { SidebarProvider } from "@/components/ui/sidebar"
import { AppSidebar } from "./AppSidebar"
import { NotificationsMenu } from "./NotificationsMenu"

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto">
          <div className="container py-6">
            <div className="flex justify-end mb-4">
              <NotificationsMenu />
            </div>
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  )
}