"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Star, Clock, CheckCircle, TrendingUp, Award, Users } from "lucide-react"
import { collection, query, where, getDocs, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebaseConfig"
import { logger } from "@/lib/utils"

interface TechnicianStats {
    id: string
    name: string
    jobsCompleted: number
    avgRating: number
    avgRepairTime: number // in minutes
    revenueGenerated: number
    activeJobs: number
}

export function TechnicianPerformanceDashboard() {
    const [technicians, setTechnicians] = useState<TechnicianStats[]>([])
    const [loading, setLoading] = useState(true)
    const [timeRange, setTimeRange] = useState<"week" | "month" | "all">("month")

    useEffect(() => {
        const fetchStats = async () => {
            setLoading(true)
            try {
                // Fetch technicians
                const techSnap = await getDocs(collection(db, "technicians"))
                const techStats: TechnicianStats[] = []

                for (const techDoc of techSnap.docs) {
                    const tech = techDoc.data()

                    // Get orders for this technician
                    const ordersQuery = query(
                        collection(db, "orders"),
                        where("technicianId", "==", techDoc.id)
                    )
                    const ordersSnap = await getDocs(ordersQuery)

                    let totalRating = 0
                    let ratingCount = 0
                    let totalRepairTime = 0
                    let repairTimeCount = 0
                    let revenue = 0
                    let completed = 0
                    let active = 0

                    ordersSnap.docs.forEach(orderDoc => {
                        const order = orderDoc.data()

                        if (order.status === "completed" || order.status === "delivered") {
                            completed++
                            if (order.price) revenue += order.price

                            // Calculate repair time if we have timeline
                            if (order.timeline?.length >= 2) {
                                const start = order.timeline.find((t: any) => t.status === "in_progress")
                                const end = order.timeline.find((t: any) => t.status === "completed")
                                if (start && end) {
                                    const startTime = new Date(start.time).getTime()
                                    const endTime = new Date(end.time).getTime()
                                    totalRepairTime += (endTime - startTime) / 60000 // Convert to minutes
                                    repairTimeCount++
                                }
                            }
                        } else if (["in_progress", "on_way", "pending"].includes(order.status)) {
                            active++
                        }

                        if (order.rating?.score) {
                            totalRating += order.rating.score
                            ratingCount++
                        }
                    })

                    techStats.push({
                        id: techDoc.id,
                        name: tech.name || "Unknown",
                        jobsCompleted: completed,
                        avgRating: ratingCount > 0 ? totalRating / ratingCount : 0,
                        avgRepairTime: repairTimeCount > 0 ? Math.round(totalRepairTime / repairTimeCount) : 0,
                        revenueGenerated: revenue,
                        activeJobs: active
                    })
                }

                // Sort by jobs completed
                techStats.sort((a, b) => b.jobsCompleted - a.jobsCompleted)
                setTechnicians(techStats)
            } catch (error) {
                logger.error("Failed to fetch technician stats:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchStats()
    }, [timeRange])

    const getBadgeColor = (rank: number) => {
        if (rank === 0) return "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
        if (rank === 1) return "bg-gradient-to-r from-gray-300 to-gray-400 text-black"
        if (rank === 2) return "bg-gradient-to-r from-orange-600 to-orange-700 text-white"
        return "bg-white/10 text-white"
    }

    if (loading) {
        return (
            <Card className="bg-white/5 border-white/10">
                <CardContent className="p-8 text-center text-white/50">
                    Loading performance data...
                </CardContent>
            </Card>
        )
    }

    const topPerformer = technicians[0]
    const totalRevenue = technicians.reduce((sum, t) => sum + t.revenueGenerated, 0)
    const totalJobs = technicians.reduce((sum, t) => sum + t.jobsCompleted, 0)
    const avgRating = technicians.length > 0
        ? technicians.reduce((sum, t) => sum + t.avgRating, 0) / technicians.filter(t => t.avgRating > 0).length
        : 0

    return (
        <div className="space-y-6">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-white/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Users className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-white/60">Total Technicians</p>
                                <p className="text-2xl font-bold text-white">{technicians.length}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-500/20 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-400" />
                            </div>
                            <div>
                                <p className="text-sm text-white/60">Jobs Completed</p>
                                <p className="text-2xl font-bold text-white">{totalJobs}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <Star className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-white/60">Avg Rating</p>
                                <p className="text-2xl font-bold text-white">{avgRating.toFixed(1)}/5</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-purple-500/20 rounded-lg">
                                <TrendingUp className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <p className="text-sm text-white/60">Total Revenue</p>
                                <p className="text-2xl font-bold text-white">{totalRevenue.toLocaleString()} AED</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Top Performer */}
            {topPerformer && (
                <Card className="bg-gradient-to-r from-yellow-500/10 via-amber-500/10 to-orange-500/10 border-yellow-500/30">
                    <CardHeader className="pb-2">
                        <CardTitle className="text-white flex items-center gap-2">
                            <Award className="w-5 h-5 text-yellow-400" />
                            Top Performer
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-2xl font-bold text-black">
                                {topPerformer.name.charAt(0)}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold text-white">{topPerformer.name}</h3>
                                <div className="flex gap-4 mt-1 text-sm text-white/60">
                                    <span>{topPerformer.jobsCompleted} jobs</span>
                                    <span>⭐ {topPerformer.avgRating.toFixed(1)}</span>
                                    <span>{topPerformer.revenueGenerated.toLocaleString()} AED</span>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Leaderboard */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white">Performance Leaderboard</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {technicians.map((tech, index) => (
                            <div key={tech.id} className="flex items-center gap-4 p-3 rounded-lg bg-white/5">
                                <Badge className={getBadgeColor(index)}>
                                    #{index + 1}
                                </Badge>
                                <div className="flex-1">
                                    <h4 className="font-medium text-white">{tech.name}</h4>
                                    <div className="flex gap-4 text-xs text-white/50 mt-1">
                                        <span className="flex items-center gap-1">
                                            <CheckCircle className="w-3 h-3" /> {tech.jobsCompleted} jobs
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Star className="w-3 h-3 text-yellow-400" /> {tech.avgRating.toFixed(1)}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock className="w-3 h-3" /> ~{tech.avgRepairTime}min avg
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-cyan-400 font-mono font-medium">{tech.revenueGenerated.toLocaleString()} AED</p>
                                    <p className="text-xs text-white/40">{tech.activeJobs} active</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
