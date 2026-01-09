"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { db, auth, isMockMode } from "@/lib/firebaseConfig"
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from "firebase/firestore"
import { formatDistanceToNow } from "date-fns"
import { logger } from "@/lib/utils"

interface Notification {
    id: string
    type: string
    title: string
    message: string
    read: boolean
    link?: string
    createdAt: any
}

interface NotificationBellProps {
    role?: "admin" | "technician"
}

export function NotificationBell({ role = "admin" }: NotificationBellProps) {
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)

    useEffect(() => {
        const user = auth.currentUser
        if (!user) return
        if (isMockMode) {
            setNotifications([])
            setUnreadCount(0)
            return
        }

        // Subscribe to notifications
        const q = query(
            collection(db, "notifications"),
            where("role", "==", role),
            orderBy("createdAt", "desc"),
            limit(20)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const notifs = snapshot.docs.map(d => ({
                id: d.id,
                ...d.data()
            } as Notification))

            setNotifications(notifs)
            setUnreadCount(notifs.filter(n => !n.read).length)
        }, (error) => {
            logger.error("Notification subscription error:", error)
        })

        return () => unsubscribe()
    }, [role])

    const markAsRead = async (notificationId: string) => {
        try {
            await updateDoc(doc(db, "notifications", notificationId), {
                read: true
            })
        } catch (error) {
            logger.error("Error marking as read:", error)
        }
    }

    const handleNotificationClick = (notification: Notification) => {
        if (!notification.read) {
            markAsRead(notification.id)
        }
        if (notification.link) {
            window.location.href = notification.link
        }
    }

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case "order_created": return "🛒"
            case "status_update": return "📝"
            case "assignment": return "👤"
            case "low_stock": return "⚠️"
            default: return "🔔"
        }
    }

    const getTimeAgo = (timestamp: any) => {
        if (!timestamp) return ""
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        return formatDistanceToNow(date, { addSuffix: true })
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5 text-white/70 hover:text-white" />
                    {unreadCount > 0 && (
                        <Badge
                            className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500 text-white text-xs"
                        >
                            {unreadCount > 9 ? "9+" : unreadCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 bg-zinc-900 border-zinc-800 text-white">
                <DropdownMenuLabel className="flex justify-between items-center">
                    <span>Notifications</span>
                    {unreadCount > 0 && (
                        <span className="text-xs text-white/50">{unreadCount} unread</span>
                    )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800" />

                {notifications.length === 0 ? (
                    <div className="py-8 text-center text-white/50 text-sm">
                        No notifications
                    </div>
                ) : (
                    <div className="max-h-[400px] overflow-y-auto">
                        {notifications.map((notification) => (
                            <DropdownMenuItem
                                key={notification.id}
                                onClick={() => handleNotificationClick(notification)}
                                className={`flex flex-col items-start gap-1 p-3 cursor-pointer hover:bg-white/5 ${!notification.read ? "bg-cyan-500/5 border-l-2 border-cyan-500" : ""
                                    }`}
                            >
                                <div className="flex items-center gap-2 w-full">
                                    <span>{getNotificationIcon(notification.type)}</span>
                                    <span className={`font-medium text-sm flex-1 ${!notification.read ? "text-white" : "text-white/70"}`}>
                                        {notification.title}
                                    </span>
                                    {!notification.read && (
                                        <div className="w-2 h-2 rounded-full bg-cyan-500" />
                                    )}
                                </div>
                                <p className="text-xs text-white/50 pl-6 line-clamp-2">{notification.message}</p>
                                <span className="text-[10px] text-white/30 pl-6">{getTimeAgo(notification.createdAt)}</span>
                            </DropdownMenuItem>
                        ))}
                    </div>
                )}

                {notifications.length > 0 && (
                    <>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="justify-center text-cyan-500 hover:text-cyan-400">
                            View all notifications
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
