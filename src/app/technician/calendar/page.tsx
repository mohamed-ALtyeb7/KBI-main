"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    ChevronLeft,
    ChevronRight,
    Calendar as CalendarIcon,
    MapPin,
    Phone,
    Wrench
} from "lucide-react"
import { collection, query, where, orderBy, onSnapshot, getDoc, doc, getDocs } from "firebase/firestore"
import { db, auth, isMockMode } from "@/lib/firebaseConfig"
import { useRouter } from "next/navigation"
import { useLanguage } from "@/lib/i18n"

interface Order {
    id: string
    orderId: string
    customerName: string
    customerPhone: string
    phone?: string
    name?: string
    deviceType: string
    model: string
    issue: string
    issueType?: string
    status: string
    address?: string
    createdAt: any
    scheduledDate?: string
    scheduledTime?: string
}

export default function TechnicianCalendarPage() {
    const { t } = useLanguage()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [techId, setTechId] = useState<string | null>(null)
    const [orders, setOrders] = useState<Order[]>([])
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDate, setSelectedDate] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubAuth = auth.onAuthStateChanged((u) => {
            if (!u) {
                router.replace("/technician/login")
            } else {
                setUser(u)
            }
        })
        return () => unsubAuth()
    }, [router])

    useEffect(() => {
        if (!user) return
        const fetchTechId = async () => {
            const userDoc = await getDoc(doc(db, "users", user.uid))
            const data = userDoc.data()
            let id = data?.technicianId || null
            if (!id) {
                const q = query(collection(db, "technicians"), where("uid", "==", user.uid))
                const snap = await getDocs(q)
                if (!snap.empty) {
                    id = snap.docs[0].id
                } else if (user.email) {
                    const q2 = query(collection(db, "technicians"), where("email", "==", user.email))
                    const snap2 = await getDocs(q2)
                    if (!snap2.empty) id = snap2.docs[0].id
                }
            }
            setTechId(id)
        }
        fetchTechId()
    }, [user])

    useEffect(() => {
        if (!user?.uid) return
        if (isMockMode) {
            setOrders([])
            setLoading(false)
            return
        }
        const q = query(collection(db, "orders"), where("technicianId", "==", user.uid), orderBy("createdAt", "desc"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const orderList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Order))
            setOrders(orderList)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [user])

    // Calendar helpers
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()

    const firstDayOfMonth = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    for (let i = 0; i < firstDayOfMonth; i++) {
        days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
        days.push(i)
    }

    const getOrdersForDate = (day: number) => {
        const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
        return orders.filter(o => {
            if (o.scheduledDate === dateStr) return true
            // Also check createdAt date
            if (o.createdAt) {
                const orderDate = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt)
                const orderDateStr = orderDate.toISOString().split('T')[0]
                return orderDateStr === dateStr
            }
            return false
        })
    }

    const prevMonth = () => {
        setCurrentDate(new Date(year, month - 1, 1))
    }

    const nextMonth = () => {
        setCurrentDate(new Date(year, month + 1, 1))
    }

    const monthNames = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ]

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

    const todayStr = new Date().toISOString().split('T')[0]

    const getStatusColor = (status: string) => {
        switch (status?.toLowerCase()) {
            case "pending": return "bg-yellow-500"
            case "in_progress": return "bg-blue-500"
            case "completed": return "bg-green-500"
            case "cancelled": return "bg-red-500"
            default: return "bg-gray-500"
        }
    }

    const selectedOrders = selectedDate
        ? orders.filter(o => {
            if (o.scheduledDate === selectedDate) return true
            if (o.createdAt) {
                const orderDate = o.createdAt.toDate ? o.createdAt.toDate() : new Date(o.createdAt)
                return orderDate.toISOString().split('T')[0] === selectedDate
            }
            return false
        })
        : []

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-white">{t("Calendar")}</h1>
                <Button
                    variant="outline"
                    onClick={() => router.push('/technician/orders')}
                    className="border-cyan-500/50 text-cyan-500"
                >
                    {t("View All Orders")}
                </Button>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
                {/* Calendar */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="text-white flex items-center gap-2">
                            <CalendarIcon className="w-5 h-5 text-cyan-400" />
                            {monthNames[month]} {year}
                        </CardTitle>
                        <div className="flex gap-2">
                            <Button variant="ghost" size="icon" onClick={prevMonth}>
                                <ChevronLeft className="w-5 h-5 text-white" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={nextMonth}>
                                <ChevronRight className="w-5 h-5 text-white" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent>
                        {/* Day headers */}
                        <div className="grid grid-cols-7 gap-1 mb-2">
                            {dayNames.map(day => (
                                <div key={day} className="text-center text-xs text-white/50 py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* Calendar grid */}
                        <div className="grid grid-cols-7 gap-1">
                            {days.map((day, idx) => {
                                if (day === null) {
                                    return <div key={`empty-${idx}`} className="h-20" />
                                }

                                const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
                                const dayOrders = getOrdersForDate(day)
                                const isToday = dateStr === todayStr
                                const isSelected = dateStr === selectedDate

                                return (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDate(dateStr)}
                                        className={`h-20 p-1 rounded-lg border transition-all ${isSelected
                                                ? "border-cyan-500 bg-cyan-500/20"
                                                : isToday
                                                    ? "border-cyan-500/50 bg-cyan-500/10"
                                                    : "border-white/10 hover:bg-white/5"
                                            }`}
                                    >
                                        <div className={`text-sm font-medium ${isToday ? "text-cyan-400" : "text-white"}`}>
                                            {day}
                                        </div>
                                        <div className="flex flex-wrap gap-0.5 mt-1">
                                            {dayOrders.slice(0, 3).map((order, i) => (
                                                <div
                                                    key={i}
                                                    className={`w-2 h-2 rounded-full ${getStatusColor(order.status)}`}
                                                />
                                            ))}
                                            {dayOrders.length > 3 && (
                                                <span className="text-[10px] text-white/50">+{dayOrders.length - 3}</span>
                                            )}
                                        </div>
                                    </button>
                                )
                            })}
                        </div>

                        {/* Legend */}
                        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-white/10">
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <div className="w-3 h-3 rounded-full bg-yellow-500" />
                                <span>{t("Pending")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <div className="w-3 h-3 rounded-full bg-blue-500" />
                                <span>{t("In Progress")}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-white/50">
                                <div className="w-3 h-3 rounded-full bg-green-500" />
                                <span>{t("Completed")}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Selected Day Details */}
                <Card className="bg-white/5 border-white/10">
                    <CardHeader>
                        <CardTitle className="text-white">
                            {selectedDate
                                ? new Date(selectedDate).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    month: 'long',
                                    day: 'numeric'
                                })
                                : t("Select a date")
                            }
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {!selectedDate ? (
                            <p className="text-white/50 text-center py-8">{t("Click on a date to see orders")}</p>
                        ) : selectedOrders.length === 0 ? (
                            <p className="text-white/50 text-center py-8">{t("No orders for this date")}</p>
                        ) : (
                            <div className="space-y-4">
                                {selectedOrders.map(order => (
                                    <div
                                        key={order.id}
                                        className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-all"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div>
                                                <p className="font-semibold text-white">{order.orderId}</p>
                                                <p className="text-sm text-white/70">
                                                    {order.customerName || order.name || "Customer"}
                                                </p>
                                            </div>
                                            <Badge className={`${getStatusColor(order.status)} text-white border-0`}>
                                                {order.status?.replace('_', ' ')}
                                            </Badge>
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            <div className="flex items-center gap-2 text-white/60">
                                                <Wrench className="w-4 h-4" />
                                                <span>{order.deviceType} - {order.issueType || order.issue}</span>
                                            </div>

                                            {(order.customerPhone || order.phone) && (
                                                <a
                                                    href={`tel:${order.customerPhone || order.phone}`}
                                                    className="flex items-center gap-2 text-cyan-400 hover:text-cyan-300"
                                                >
                                                    <Phone className="w-4 h-4" />
                                                    <span>{order.customerPhone || order.phone}</span>
                                                </a>
                                            )}

                                            {order.address && (
                                                <div className="flex items-center gap-2 text-white/60">
                                                    <MapPin className="w-4 h-4" />
                                                    <span>{order.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
