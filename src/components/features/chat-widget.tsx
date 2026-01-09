"use client"

import { useState, useEffect, useRef } from "react"
import { Send, MessageCircle, X, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { collection, addDoc, query, where, orderBy, onSnapshot, Timestamp, doc, updateDoc } from "firebase/firestore"
import { db, auth, isMockMode } from "@/lib/firebaseConfig"
import { cn, logger } from "@/lib/utils"

interface Message {
    id: string
    text: string
    senderId: string
    senderName: string
    senderType: "customer" | "technician" | "admin"
    createdAt: any
    read: boolean
}

interface ChatWidgetProps {
    orderId: string
    userType: "customer" | "technician" | "admin"
    userName: string
    userId: string
    minimized?: boolean
}

export function ChatWidget({ orderId, userType, userName, userId, minimized = true }: ChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(!minimized)
    const [messages, setMessages] = useState<Message[]>([])
    const [newMessage, setNewMessage] = useState("")
    const [sending, setSending] = useState(false)
    const [unreadCount, setUnreadCount] = useState(0)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (!orderId) return
        if (isMockMode) {
            setMessages([])
            setUnreadCount(0)
            return
        }

        const q = query(
            collection(db, "orders", orderId, "messages"),
            orderBy("createdAt", "asc")
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const msgs: Message[] = []
            let unread = 0

            snapshot.docs.forEach((doc) => {
                const msg = { id: doc.id, ...doc.data() } as Message
                msgs.push(msg)
                if (!msg.read && msg.senderId !== userId) {
                    unread++
                }
            })

            setMessages(msgs)
            setUnreadCount(unread)
        })

        return () => unsubscribe()
    }, [orderId, userId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    // Mark messages as read when opening chat
    useEffect(() => {
        if (isOpen && unreadCount > 0) {
            messages.forEach(async (msg) => {
                if (!msg.read && msg.senderId !== userId) {
                    await updateDoc(doc(db, "orders", orderId, "messages", msg.id), {
                        read: true
                    })
                }
            })
        }
    }, [isOpen, messages, orderId, userId, unreadCount])

    const handleSend = async () => {
        if (!newMessage.trim() || sending) return

        setSending(true)
        try {
            await addDoc(collection(db, "orders", orderId, "messages"), {
                text: newMessage.trim(),
                senderId: userId,
                senderName: userName,
                senderType: userType,
                createdAt: Timestamp.now(),
                read: false
            })
            setNewMessage("")
        } catch (error) {
            logger.error("Failed to send message:", error)
        } finally {
            setSending(false)
        }
    }

    const getSenderColor = (type: string) => {
        switch (type) {
            case "customer": return "bg-blue-500"
            case "technician": return "bg-green-500"
            case "admin": return "bg-purple-500"
            default: return "bg-gray-500"
        }
    }

    if (!isOpen) {
        return (
            <button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-4 right-4 z-50 p-4 bg-cyan-500 hover:bg-cyan-400 rounded-full shadow-lg transition-all"
            >
                <MessageCircle className="w-6 h-6 text-white" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                        {unreadCount}
                    </span>
                )}
            </button>
        )
    }

    return (
        <Card className="fixed bottom-4 right-4 z-50 w-80 h-96 bg-zinc-900 border-white/10 flex flex-col shadow-2xl">
            <CardHeader className="pb-2 border-b border-white/10">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-sm flex items-center gap-2">
                        <MessageCircle className="w-4 h-4 text-cyan-400" />
                        Order Chat
                    </CardTitle>
                    <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-6 w-6">
                        <X className="w-4 h-4 text-white/60" />
                    </Button>
                </div>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto p-3 space-y-3">
                {messages.length === 0 ? (
                    <div className="flex items-center justify-center h-full text-white/30 text-sm">
                        No messages yet
                    </div>
                ) : (
                    messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex flex-col max-w-[80%]",
                                msg.senderId === userId ? "ml-auto items-end" : "items-start"
                            )}
                        >
                            <div className="flex items-center gap-1 mb-1">
                                <div className={cn("w-2 h-2 rounded-full", getSenderColor(msg.senderType))} />
                                <span className="text-xs text-white/40">{msg.senderName}</span>
                            </div>
                            <div
                                className={cn(
                                    "px-3 py-2 rounded-lg text-sm",
                                    msg.senderId === userId
                                        ? "bg-cyan-500 text-white"
                                        : "bg-white/10 text-white"
                                )}
                            >
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </CardContent>

            <div className="p-2 border-t border-white/10">
                <div className="flex gap-2">
                    <Input
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="bg-white/5 border-white/10 text-white text-sm"
                        onKeyPress={(e) => e.key === "Enter" && handleSend()}
                    />
                    <Button
                        onClick={handleSend}
                        disabled={sending || !newMessage.trim()}
                        size="icon"
                        className="bg-cyan-500 hover:bg-cyan-400"
                    >
                        {sending ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            <Send className="w-4 h-4" />
                        )}
                    </Button>
                </div>
            </div>
        </Card>
    )
}
