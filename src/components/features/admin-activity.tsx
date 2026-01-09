"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Shield, User, Clock, Filter, Search, AlertTriangle, CheckCircle, Trash2, Edit, Eye } from "lucide-react"
import { collection, query, orderBy, limit, onSnapshot, where, Timestamp } from "firebase/firestore"
import { db, isMockMode } from "@/lib/firebaseConfig"
import { formatDistanceToNow } from "date-fns"

interface AuditLog {
    id: string
    action: string
    entityType: string
    userId: string
    userEmail: string
    metadata: any
    timestamp: any
}

const actionIcons: Record<string, any> = {
    "order.created": CheckCircle,
    "order.updated": Edit,
    "order.deleted": Trash2,
    "technician.created": User,
    "technician.updated": Edit,
    "technician.deleted": Trash2,
    "settings.updated": Shield,
    "default": Eye
}

const actionColors: Record<string, string> = {
    "order.created": "bg-green-500/20 text-green-400",
    "order.updated": "bg-blue-500/20 text-blue-400",
    "order.deleted": "bg-red-500/20 text-red-400",
    "technician.created": "bg-cyan-500/20 text-cyan-400",
    "technician.updated": "bg-blue-500/20 text-blue-400",
    "technician.deleted": "bg-red-500/20 text-red-400",
    "settings.updated": "bg-purple-500/20 text-purple-400",
    "default": "bg-gray-500/20 text-gray-400"
}

export function AdminActivityDashboard() {
    const [logs, setLogs] = useState<AuditLog[]>([])
    const [loading, setLoading] = useState(true)
    const [actionFilter, setActionFilter] = useState("all")
    const [searchQuery, setSearchQuery] = useState("")
    const [limitCount, setLimitCount] = useState(50)

    useEffect(() => {
        if (isMockMode) {
            setLogs([])
            setLoading(false)
            return
        }
        let q = query(
            collection(db, "audit_logs"),
            orderBy("timestamp", "desc"),
            limit(limitCount)
        )

        const unsubscribe = onSnapshot(q, (snapshot) => {
            const auditLogs: AuditLog[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as AuditLog[]
            setLogs(auditLogs)
            setLoading(false)
        })

        return () => unsubscribe()
    }, [limitCount])

    const filteredLogs = logs.filter(log => {
        const matchesAction = actionFilter === "all" || log.action.includes(actionFilter)
        const matchesSearch = searchQuery === "" ||
            log.userEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            log.action.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesAction && matchesSearch
    })

    const getActionIcon = (action: string) => {
        const Icon = actionIcons[action] || actionIcons.default
        return Icon
    }

    const getActionColor = (action: string) => {
        return actionColors[action] || actionColors.default
    }

    // Stats
    const todayLogs = logs.filter(log => {
        if (!log.timestamp) return false
        const logDate = log.timestamp.toDate?.() || new Date(log.timestamp)
        const today = new Date()
        return logDate.toDateString() === today.toDateString()
    })

    const deleteActions = logs.filter(log => log.action.includes("deleted")).length
    const uniqueUsers = [...new Set(logs.map(log => log.userEmail))].length

    if (loading) {
        return (
            <Card className="bg-white/5 border-white/10">
                <CardContent className="p-8 text-center text-white/50">
                    Loading activity logs...
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Eye className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-white/60">Today's Actions</p>
                                <p className="text-2xl font-bold text-white">{todayLogs.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-red-500/20 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-red-400" />
                            </div>
                            <div>
                                <p className="text-sm text-white/60">Delete Actions</p>
                                <p className="text-2xl font-bold text-white">{deleteActions}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <User className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-white/60">Active Admins</p>
                                <p className="text-2xl font-bold text-white">{uniqueUsers}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <Shield className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-white/60">Total Logged</p>
                                <p className="text-2xl font-bold text-white">{logs.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card className="bg-white/5 border-white/10">
                <CardContent className="p-4">
                    <div className="flex flex-wrap gap-4">
                        <div className="relative flex-1 min-w-[200px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                            <Input
                                placeholder="Search by user or action..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9 bg-white/5 border-white/10 text-white"
                            />
                        </div>
                        <Select value={actionFilter} onValueChange={setActionFilter}>
                            <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white hover:bg-white/10 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/30 outline-none rounded-lg">
                                <SelectValue placeholder="Filter by action" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                <SelectItem value="all">All Actions</SelectItem>
                                <SelectItem value="order">Orders</SelectItem>
                                <SelectItem value="technician">Technicians</SelectItem>
                                <SelectItem value="settings">Settings</SelectItem>
                                <SelectItem value="deleted">Deletions Only</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Activity Log */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white flex items-center gap-2">
                        <Clock className="w-5 h-5 text-cyan-400" />
                        Activity Log
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredLogs.length === 0 ? (
                        <div className="text-center py-8 text-white/40">
                            No activity logs found
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredLogs.map((log) => {
                                const Icon = getActionIcon(log.action)
                                const colorClass = getActionColor(log.action)

                                return (
                                    <div key={log.id} className="flex items-start gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors">
                                        <div className={`p-2 rounded-lg ${colorClass}`}>
                                            <Icon className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="text-sm text-white">
                                                <span className="font-medium">{log.userEmail}</span>
                                                <span className="text-white/60"> performed </span>
                                                <Badge variant="outline" className={colorClass}>
                                                    {log.action}
                                                </Badge>
                                            </p>
                                            {log.metadata && (
                                                <p className="text-xs text-white/40 mt-1">
                                                    {log.metadata.targetType}: {log.metadata.targetId}
                                                    {log.metadata.details && ` • ${JSON.stringify(log.metadata.details)}`}
                                                </p>
                                            )}
                                        </div>
                                        <span className="text-xs text-white/40">
                                            {log.timestamp && formatDistanceToNow(log.timestamp.toDate?.() || new Date(log.timestamp), { addSuffix: true })}
                                        </span>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
