"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, Mail, Phone, Shield, Award, Calendar, LogOut, Wrench } from "lucide-react"
import { Button } from "@/components/ui/button"
import { auth, db } from "@/lib/firebaseConfig"
import { useLanguage } from "@/lib/i18n"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore"
import { getTechnicianIdFromUser } from "@/lib/firestore/services/technicianService"

export default function TechnicianProfile() {
    const { t } = useLanguage()
    const router = useRouter()
    const [user, setUser] = useState<any>(null)
    const [techId, setTechId] = useState<string | null>(null)
    const [techData, setTechData] = useState<any>(null)
    const [stats, setStats] = useState({
        rating: 0,
        completedJobs: 0,
        activeJobs: 0,
        joinDate: ""
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const unsubscribe = auth.onAuthStateChanged((u) => {
            if (u) {
                setUser(u)
            } else {
                router.push("/technician/login")
            }
        })
        return () => unsubscribe()
    }, [router])

    useEffect(() => {
        const fetchTechId = async () => {
            if (!user) return
            const id = await getTechnicianIdFromUser({ uid: user.uid, email: user.email || undefined })
            setTechId(id)
        }
        fetchTechId()
    }, [user])

    useEffect(() => {
        const fetchProfileData = async () => {
            if (!techId || !user) return
            const techSnap = await getDoc(doc(db, "technicians", techId))
            if (techSnap.exists()) {
                setTechData({ id: techSnap.id, ...techSnap.data() })
            }
            const ordersQuery = query(collection(db, "orders"), where("technicianId", "==", user.uid))
            const ordersSnap = await getDocs(ordersQuery)
            let completed = 0
            let active = 0
            ordersSnap.docs.forEach(d => {
                const data = d.data()
                const s = String(data.status || "").toLowerCase()
                if (s === "completed" || s === "delivered") {
                    completed++
                } else if (s !== "cancelled") {
                    active++
                }
            })
            setStats({
                rating: 4.8,
                completedJobs: completed,
                activeJobs: active,
                joinDate: techSnap.data()?.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
            })
            setLoading(false)
        }
        fetchProfileData()
    }, [techId, user])

    const handleLogout = async () => {
        await auth.signOut()
        router.push("/technician/login")
    }

    if (loading || !user) return <div className="text-center py-20 text-white/50">{t("Loading profile...")}</div>

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in duration-500">
            <h1 className="text-3xl font-bold tracking-tight text-white">{t("My Profile")}</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Profile Card */}
                <Card className="md:col-span-1 bg-white/5 border-white/10">
                    <CardContent className="pt-6 flex flex-col items-center text-center">
                        <div className="h-24 w-24 rounded-full bg-cyan-500/20 flex items-center justify-center mb-4 border-2 border-cyan-500/30 overflow-hidden">
                            {techData?.avatar ? (
                                <img src={techData.avatar} alt={techData?.name} className="w-full h-full object-cover" />
                            ) : (
                                <User className="h-12 w-12 text-cyan-500" />
                            )}
                        </div>
                        <h2 className="text-xl font-bold text-white">{techData?.name || user.displayName || "Technician"}</h2>
                        <Badge className="mt-2 bg-cyan-500/20 text-cyan-500 border-cyan-500/50 hover:bg-cyan-500/30">
                            {techData?.role || "Technician"}
                        </Badge>

                        <div className="w-full mt-6 space-y-4 text-left">
                            <div className="flex items-center gap-3 text-white/70">
                                <Mail className="w-4 h-4" />
                                <span className="text-sm truncate">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/70">
                                <Phone className="w-4 h-4" />
                                <span className="text-sm">{techData?.phone || "N/A"}</span>
                            </div>
                            <div className="flex items-center gap-3 text-white/70">
                                <Shield className="w-4 h-4" />
                                <span className={`text-sm capitalize ${techData?.status === 'Active' ? 'text-green-400' : 'text-red-400'}`}>
                                    {techData?.status || "Active"}
                                </span>
                            </div>
                        </div>

                        <Button variant="destructive" className="w-full mt-8 gap-2" onClick={handleLogout}>
                            <LogOut className="w-4 h-4" /> {t("Sign Out")}
                        </Button>
                    </CardContent>
                </Card>

                {/* Details & Stats */}
                <div className="md:col-span-2 space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-yellow-500/20">
                                    <Award className="w-6 h-6 text-yellow-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.rating || "N/A"}</p>
                                    <p className="text-sm text-white/60">{t("Rating")}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-green-500/20">
                                    <CheckCircleIcon className="w-6 h-6 text-green-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.completedJobs}</p>
                                    <p className="text-sm text-white/60">{t("Completed")}</p>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="bg-white/5 border-white/10">
                            <CardContent className="p-6 flex items-center gap-4">
                                <div className="p-3 rounded-full bg-cyan-500/20">
                                    <Wrench className="w-6 h-6 text-cyan-500" />
                                </div>
                                <div>
                                    <p className="text-2xl font-bold text-white">{stats.activeJobs}</p>
                                    <p className="text-sm text-white/60">{t("Active")}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">{t("Specializations")}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {techData?.specialization?.length > 0 ? (
                                    techData.specialization.map((spec: string) => (
                                        <Badge key={spec} variant="secondary" className="bg-white/10 hover:bg-white/20 text-white border-white/10">
                                            {spec}
                                        </Badge>
                                    ))
                                ) : (
                                    <span className="text-white/50 text-sm">{t("No specializations set")}</span>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                            <CardTitle className="text-white">{t("Account Info")}</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center py-2 border-b border-white/10">
                                <span className="text-white/60">{t("Member Since")}</span>
                                <span className="text-white font-medium flex items-center gap-2">
                                    <Calendar className="w-4 h-4" /> {new Date(stats.joinDate).toLocaleDateString()}
                                </span>
                            </div>
                            <div className="flex justify-between items-center py-2">
                                <span className="text-white/60">{t("Employee ID")}</span>
                                <span className="text-white font-mono">{user.uid?.substring(0, 8).toUpperCase() || "TECH-001"}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}

function CheckCircleIcon({ className }: { className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
            <polyline points="22 4 12 14.01 9 11.01" />
        </svg>
    )
}
