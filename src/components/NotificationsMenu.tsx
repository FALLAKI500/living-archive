import { useState, useEffect } from "react"
import { Bell, BellDot } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useQuery, useQueryClient } from "@tanstack/react-query"
import { supabase } from "@/integrations/supabase/client"
import { format } from "date-fns"
import { useToast } from "@/hooks/use-toast"

interface Notification {
  id: string
  message: string
  created_at: string
  status: "read" | "unread"
}

export function NotificationsMenu() {
  const { toast } = useToast()
  const queryClient = useQueryClient()

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false })

      if (error) {
        console.error("Error fetching notifications:", error)
        return []
      }
      return data as Notification[]
    },
  })

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel("schema-db-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: ["notifications"] })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [queryClient])

  const unreadCount = notifications.filter((n) => n.status === "unread").length

  const markAsRead = async (notificationId: string) => {
    const { error } = await supabase
      .from("notifications")
      .update({ status: "read" })
      .eq("id", notificationId)

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Could not mark notification as read",
      })
    } else {
      queryClient.invalidateQueries({ queryKey: ["notifications"] })
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <>
              <BellDot className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-destructive text-[10px] font-medium text-destructive-foreground flex items-center justify-center">
                {unreadCount}
              </span>
            </>
          ) : (
            <Bell className="h-5 w-5" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        {notifications.length === 0 ? (
          <div className="p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          notifications.map((notification) => (
            <DropdownMenuItem
              key={notification.id}
              onClick={() => markAsRead(notification.id)}
              className={`flex flex-col items-start gap-1 p-4 ${
                notification.status === "unread"
                  ? "bg-muted/50"
                  : "text-muted-foreground"
              }`}
            >
              <p className="text-sm">{notification.message}</p>
              <p className="text-xs text-muted-foreground">
                {format(new Date(notification.created_at), "PPp")}
              </p>
            </DropdownMenuItem>
          ))
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}