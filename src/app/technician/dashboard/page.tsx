"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Clock, CircleCheckBig, AlertTriangle, Activity, Calendar, MapPin, Phone, Smartphone } from "lucide-react"
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore"
import { db, auth, isMockMode } from "@/lib/firebaseConfig"
import { useLanguage } from "@/lib/i18n"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TechStatsCard } from "@/components/features/tech-stats-card"
import { QuickActions, StatusButtons } from "@/components/features/quick-actions"
import { getTechnicianIdFromUser } from "@/lib/firestore/services/technicianService"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { proposeOrderPricing, acceptAssignedOrder, startWork, reAcceptCounterOffer } from "@/lib/firestore/services/orderService"
import { storage } from "@/lib/firebaseConfig"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { logger } from "@/lib/utils"

export default function TechnicianDashboard() {
  const { t, language } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    activeJobs: 0,
    completedToday: 0,
    totalAssigned: 0,
    pending: 0
  })
  const [assignedOrders, setAssignedOrders] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [notifications, setNotifications] = useState<any[]>([])
  const [techId, setTechId] = useState<string | null>(null)
  const [openProposalId, setOpenProposalId] = useState<string | null>(null)
  const [proposalDuration, setProposalDuration] = useState<string>("")
  const [proposalUnit, setProposalUnit] = useState<"minutes" | "hours">("minutes")
  const [proposalNote, setProposalNote] = useState<string>("")
  const [proposalETA, setProposalETA] = useState<string>("")
  const [priceMode, setPriceMode] = useState<"range" | "breakdown">("range")
  const [proposalPriceMin, setProposalPriceMin] = useState<string>("")
  const [proposalPriceMax, setProposalPriceMax] = useState<string>("")
  const [breakdownLabor, setBreakdownLabor] = useState<string>("")
  const [breakdownParts, setBreakdownParts] = useState<string>("")
  const [breakdownInspection, setBreakdownInspection] = useState<string>("")
  const [proposalMediaUrls, setProposalMediaUrls] = useState<string[]>([])

  useEffect(() => {
    // Real Firebase auth
    const unsubscribe = auth.onAuthStateChanged((u) => {
      setUser(u)
    })
    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) return
    const fetchTechId = async () => {
      const id = await getTechnicianIdFromUser({ uid: user.uid, email: user.email || undefined })
      setTechId(id)
    }
    fetchTechId()
  }, [user])

  useEffect(() => {
    if (!user?.uid) return
    if (isMockMode) {
      setAssignedOrders([])
      setStats({ activeJobs: 0, completedToday: 0, totalAssigned: 0, pending: 0 })
      setLoading(false)
      return
    }
    setLoading(true)
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, where("technicianId", "==", user.uid), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const orders = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setAssignedOrders(orders)
      const active = orders.filter((o: any) => ["in_progress", "on_way", "pending"].includes(o.status)).length
      const today = new Date().toISOString().split('T')[0]
      const completedToday = orders.filter((o: any) => o.status === "completed" && o.updatedAt?.toDate?.().toISOString().split('T')[0] === today).length
      setStats({
        activeJobs: active,
        completedToday: completedToday,
        totalAssigned: orders.length,
        pending: orders.filter((o: any) => o.status === "pending").length
      })
      setLoading(false)
    })
    return () => { unsubscribe() }
  }, [user])

  useEffect(() => {
    if (!user) return
    if (isMockMode) {
      setNotifications([])
      return
    }
    const notifQ = query(collection(db, "notifications"), where("role", "==", "technician"), where("userId", "==", user.uid || user.id), orderBy("createdAt", "desc"))
    const unsubNotif = onSnapshot(notifQ, (snap) => {
      setNotifications(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    })
    return () => { unsubNotif() }
  }, [user])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "bg-yellow-500/20 text-yellow-500 border-yellow-500/50"
      case "in_progress": return "bg-blue-500/20 text-blue-500 border-blue-500/50"
      case "on_way": return "bg-purple-500/20 text-purple-500 border-purple-500/50"
      case "completed": return "bg-green-500/20 text-green-500 border-green-500/50"
      case "cancelled": return "bg-red-500/20 text-red-500 border-red-500/50"
      default: return "bg-gray-500/20 text-gray-500 border-gray-500/50"
    }
  }

  const getStatusLabel = (status: string) => {
    // Simple mapping, can be expanded with t()
    return status.replace('_', ' ').toUpperCase()
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{t("Technician Dashboard")}</h1>
          <p className="text-white/60 mt-1">{t("Welcome back")}, {user?.name || "Technician"}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => router.push('/technician/orders')} variant="outline" className="border-cyan-500/50 text-cyan-500 hover:bg-cyan-500/10">
            {t("View All Orders")}
          </Button>
        </div>
      </div>

      {/* Earnings & Performance Stats */}
      {techId && <TechStatsCard technicianId={techId} />}

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="relative overflow-hidden bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-purple-500/10 border-white/10 backdrop-blur-md ring-1 ring-white/10">
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute -inset-1 rounded-xl bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:22px_22px] opacity-15" />
            <div className="absolute -top-20 -right-24 w-72 h-72 rounded-full bg-cyan-500/10 blur-2xl" />
            <div className="absolute -bottom-28 -left-28 w-80 h-80 rounded-full bg-blue-500/10 blur-2xl" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">{t("Active Jobs")}</CardTitle>
            <Activity className="h-4 w-4 text-cyan-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{loading ? "..." : stats.activeJobs}</div>
            <p className="text-xs text-white/60">{t("Orders in progress")}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">{t("Pending")}</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{loading ? "..." : stats.pending}</div>
            <p className="text-xs text-white/60">{t("Waiting for action")}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="relative flex flex-row items-center justify-between space-y-0 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500/15 via-cyan-500/10 to-cyan-500/20 border border-white/10 shadow-[0_8px_30px_-12px_rgba(6,182,212,0.35)]">
            <CardTitle className="text-sm font-semibold text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-200">{t("Completed Today")}</CardTitle>
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/20 ring-2 ring-emerald-400/30 shadow-[0_0_20px_rgba(34,197,94,0.25)]">
              <CircleCheckBig className="h-4 w-4 text-emerald-400" />
              <span className="absolute inset-0 rounded-full blur-[6px] bg-emerald-500/30 opacity-40" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{loading ? "..." : stats.completedToday}</div>
            <p className="text-xs text-white/60">{t("Successfully finished")}</p>
          </CardContent>
        </Card>

        <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-white/80">{t("Total Assigned")}</CardTitle>
            <ShoppingCart className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{loading ? "..." : stats.totalAssigned}</div>
            <p className="text-xs text-white/60">{t("Lifetime orders")}</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Assigned Orders */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">{t("Recent Assigned Orders")}</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-10 text-white/50">{t("Loading orders...")}</div>
          ) : assignedOrders.length === 0 ? (
            <div className="text-center py-10 text-white/50">{t("No orders assigned yet.")}</div>
          ) : (
            <div className="space-y-4">
              {assignedOrders.slice(0, 5).map((order) => (
                <div
                  key={order.id}
                  className="flex flex-col md:flex-row items-start md:items-center justify-between p-4 rounded-lg bg-white/5 border border-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                  onClick={() => router.push(`/technician/order/${order.id}`)}
                >
                  <div className="flex gap-4 items-start">
                    <div className="h-12 w-12 rounded-full bg-cyan-500/20 flex items-center justify-center shrink-0">
                      <Smartphone className="h-6 w-6 text-cyan-500" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">{order.device} <span className="text-white/40 text-sm">#{order.id}</span></h4>
                      <p className="text-sm text-white/60">{order.issue}</p>
                      <div className="flex flex-wrap gap-2 mt-2 text-xs text-white/50">
                        <span className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {new Date(order.date || order.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {order.location || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 md:mt-0 flex flex-col items-end gap-2 w-full md:w-auto">
                    <Badge variant="outline" className={getStatusColor(order.status)}>
                      {getStatusLabel(order.status)}
                    </Badge>
                    <span className="text-cyan-400 font-mono font-medium">{order.price} AED</span>
                    {order.status === "assigned" && (
                      <Button
                        variant="outline"
                        className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white"
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (isMockMode) {
                            setAssignedOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "accepted" } : o))
                          } else if (user?.uid) {
                            try { await acceptAssignedOrder(order.id, user.uid) } catch (err) { logger.error(err) }
                          }
                        }}
                      >
                        {t("Accept Order")}
                      </Button>
                    )}
                    {order.pricingStatus === "countered" && (
                      <Button
                        variant="outline"
                        className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white"
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (isMockMode) {
                            setAssignedOrders(prev => prev.map(o => o.id === order.id ? { ...o, pricingStatus: "re_accepted" } : o))
                          } else if (user?.uid) {
                            try { await reAcceptCounterOffer(order.id, user.uid) } catch (err) { logger.error(err) }
                          }
                        }}
                      >
                        {t("Accept Counter-Offer")}
                      </Button>
                    )}
                    <div className="text-xs text-white/60">
                      {order.pricingStatus && (
                        <span className="px-2 py-1 rounded bg-white/10 border border-white/10">
                          {t("Pricing")}: {order.pricingStatus}
                        </span>
                      )}
                    </div>
                    {order.pricingStatus === "approved" && order.status === "accepted" && (
                      <Button
                        className="w-full bg-green-600 hover:bg-green-700 text-white"
                        onClick={async (e) => {
                          e.stopPropagation()
                          if (isMockMode) {
                            setAssignedOrders(prev => prev.map(o => o.id === order.id ? { ...o, status: "in_progress" } : o))
                          } else if (user?.uid) {
                            try { await startWork(order.id, user.uid) } catch (err) { logger.error(err) }
                          }
                        }}
                      >
                        {t("Start Work")}
                      </Button>
                    )}
                    {((order.status === "assigned" || order.status === "accepted") && ((order.pricingStatus ?? "none") === "none" || order.pricingStatus === "rejected" || order.pricingStatus === "countered")) && (
                      <div
                        className="w-full md:w-auto mt-2 p-2 rounded border border-white/10 bg-white/5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        {openProposalId !== order.id ? (
                          <Button
                            variant="outline"
                            className="w-full bg-white/5 border-white/10 hover:bg-white/10 text-white"
                            onClick={() => setOpenProposalId(order.id)}
                          >
                            {t("Propose Price & Time")}
                          </Button>
                        ) : (
                          <div className="space-y-2">
                            <div className="flex gap-2">
                              <Button variant={priceMode === "range" ? "default" : "outline"} onClick={() => setPriceMode("range")}>{t("Range")}</Button>
                              <Button variant={priceMode === "breakdown" ? "default" : "outline"} onClick={() => setPriceMode("breakdown")}>{t("Breakdown")}</Button>
                            </div>
                            {priceMode === "range" ? (
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  type="number"
                                  placeholder={t("Price Min (AED)")}
                                  value={proposalPriceMin}
                                  onChange={(e) => setProposalPriceMin(e.target.value)}
                                  className="bg-white/5 border-white/10 text-white"
                                />
                                <Input
                                  type="number"
                                  placeholder={t("Price Max (AED)")}
                                  value={proposalPriceMax}
                                  onChange={(e) => setProposalPriceMax(e.target.value)}
                                  className="bg-white/5 border-white/10 text-white"
                                />
                              </div>
                            ) : (
                              <div className="grid grid-cols-3 gap-2">
                                <Input type="number" placeholder={t("Labor")} value={breakdownLabor} onChange={(e) => setBreakdownLabor(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                                <Input type="number" placeholder={t("Parts")} value={breakdownParts} onChange={(e) => setBreakdownParts(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                                <Input type="number" placeholder={t("Inspection")} value={breakdownInspection} onChange={(e) => setBreakdownInspection(e.target.value)} className="bg-white/5 border-white/10 text-white" />
                              </div>
                            )}
                            <div className="grid grid-cols-2 gap-2">
                              <div className="flex gap-2">
                                <Input
                                  type="number"
                                  placeholder={t("Estimated Time")}
                                  value={proposalDuration}
                                  onChange={(e) => setProposalDuration(e.target.value)}
                                  className="bg-white/5 border-white/10 text-white"
                                />
                                <Select value={proposalUnit} onValueChange={(v) => setProposalUnit(v as any)}>
                                  <SelectTrigger className="bg-white/5 border-white/10 text-white">
                                    <SelectValue placeholder={t("Unit")} />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                    <SelectItem value="minutes">{t("Minutes")}</SelectItem>
                                    <SelectItem value="hours">{t("Hours")}</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <Input
                                type="text"
                                placeholder={t("Arrival ETA (e.g., 2025-01-01 14:00)") }
                                value={proposalETA}
                                onChange={(e) => setProposalETA(e.target.value)}
                                className="bg-white/5 border-white/10 text-white"
                              />
                            </div>
                            <Textarea
                              placeholder={t("Note (optional)")}
                              value={proposalNote}
                              onChange={(e) => setProposalNote(e.target.value)}
                              className="bg-white/5 border-white/10 text-white"
                            />
                            <div>
                              <Input type="file" multiple accept="image/*,video/*" onChange={async (e) => {
                                const files = Array.from(e.target.files || [])
                                if (!files.length) return
                                const urls: string[] = []
                                for (const f of files) {
                                  try {
                                    if (!storage || isMockMode) {
                                      urls.push(URL.createObjectURL(f))
                                    } else {
                                      const r = ref(storage, `orders/${order.id}/proposal/${Date.now()}_${f.name}`)
                                      await uploadBytes(r, f)
                                      const u = await getDownloadURL(r)
                                      urls.push(u)
                                    }
                                  } catch (err) { logger.error(err) }
                                }
                                setProposalMediaUrls(urls)
                              }} className="bg-white/5 border-white/10 text-white" />
                              {proposalMediaUrls.length > 0 && (
                                <div className="grid grid-cols-3 gap-2 mt-2">
                                  {proposalMediaUrls.map((u, i) => (
                                    <a key={i} href={u} target="_blank" rel="noreferrer" className="block aspect-square rounded border border-white/10 overflow-hidden">
                                      <img src={u} alt="media" className="w-full h-full object-cover" />
                                    </a>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                className="bg-cyan-500 hover:bg-cyan-400 text-black"
                                onClick={async () => {
                                  const dur = parseFloat(proposalDuration)
                                  if (isNaN(dur) || dur <= 0 || !techId) return
                                  let minVal: number | undefined
                                  let maxVal: number | undefined
                                  let breakdown: { labor?: number; parts?: number; inspection?: number } | undefined
                                  if (priceMode === "range") {
                                    const minP = parseFloat(proposalPriceMin)
                                    const maxP = parseFloat(proposalPriceMax)
                                    if (isNaN(minP) || isNaN(maxP) || minP <= 0 || maxP <= 0) return
                                    minVal = minP; maxVal = maxP
                                  } else {
                                    const l = parseFloat(breakdownLabor || "0")
                                    const p = parseFloat(breakdownParts || "0")
                                    const i = parseFloat(breakdownInspection || "0")
                                    if ((l <= 0 && p <= 0 && i <= 0)) return
                                    breakdown = { labor: l || 0, parts: p || 0, inspection: i || 0 }
                                  }
                                  const minutes = proposalUnit === "hours" ? Math.round(dur * 60) : Math.round(dur)
                                  if (isMockMode) {
                                    setAssignedOrders((prev) =>
                                      prev.map((o) =>
                                        o.id === order.id
                                          ? {
                                              ...o,
                                              proposedPrice: maxVal ?? (breakdown ? (breakdown.labor || 0) + (breakdown.parts || 0) + (breakdown.inspection || 0) : null),
                                              proposedPriceMin: minVal ?? null,
                                              proposedPriceMax: maxVal ?? null,
                                              proposedBreakdown: breakdown ?? null,
                                              proposedDurationMinutes: minutes,
                                              proposedArrivalETA: proposalETA || null,
                                              proposalNote: proposalNote || null,
                                              proposedByTechnicianId: user.uid,
                                              proposedAt: new Date().toISOString(),
                                              pricingStatus: "proposed",
                                              proposalMediaUrls: proposalMediaUrls,
                                            }
                                          : o
                                      )
                                    )
                                  } else {
                                    await proposeOrderPricing(order.id, {
                                      proposedPriceMin: minVal ?? null,
                                      proposedPriceMax: maxVal ?? null,
                                      proposedBreakdown: breakdown ?? null,
                                      proposedDurationMinutes: minutes,
                                      proposedArrivalETA: proposalETA || null,
                                      proposalNote: proposalNote || undefined,
                                      proposalMediaUrls,
                                      proposedByTechnicianId: user.uid,
                                    })
                                  }
                                  setOpenProposalId(null)
                                  setProposalPriceMin("")
                                  setProposalPriceMax("")
                                  setBreakdownLabor("")
                                  setBreakdownParts("")
                                  setBreakdownInspection("")
                                  setProposalDuration("")
                                  setProposalUnit("minutes")
                                  setProposalNote("")
                                  setProposalETA("")
                                  setProposalMediaUrls([])
                                }}
                              >
                                {t("Submit Proposal")}
                              </Button>
                              <Button
                                variant="outline"
                                className="bg-white/5 border-white/10 text-white"
                                onClick={() => {
                                  setOpenProposalId(null)
                                  setProposalPriceMin("")
                                  setProposalPriceMax("")
                                  setBreakdownLabor("")
                                  setBreakdownParts("")
                                  setBreakdownInspection("")
                                  setProposalDuration("")
                                  setProposalUnit("minutes")
                                  setProposalNote("")
                                  setProposalETA("")
                                  setProposalMediaUrls([])
                                }}
                              >
                                {t("Cancel")}
                              </Button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card className="bg-white/5 border-white/10 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-white">{t("Notifications")}</CardTitle>
        </CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <div className="text-white/50">{t("No notifications")}</div>
          ) : (
            <div className="space-y-3">
              {notifications.slice(0, 6).map((n) => (
                <div key={n.id} className="p-2 rounded bg-white/5 border border-white/10 text-sm">
                  <div className="text-white">{n.message}</div>
                  <div className="text-white/40 text-[10px]">{new Date(n.createdAt?.toDate?.() || n.createdAt).toLocaleString()}</div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
