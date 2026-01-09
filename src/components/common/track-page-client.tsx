"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { useState } from "react"
import { motion } from "framer-motion"
import { CheckCircle2, Truck, Wrench, UserCheck, ClipboardList, Loader2, AlertCircle, Search as SearchIcon, Clock, Copy } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { db } from "@/lib/firebaseConfig"
import { logger } from "@/lib/utils"
import { collection, query, where, getDocs } from "firebase/firestore"

export function TrackPageClient() {
  const { lang } = useLanguage()
  const isAr = lang === "ar"
  const [searchQuery, setSearchQuery] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [orderData, setOrderData] = useState<any>(null)
  const [allOrders, setAllOrders] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const exampleIds = ["KBI-1234", "0501234567"]

  const handleTrack = async () => {
    if (!searchQuery.trim()) return
    setLoading(true)
    setError("")
    setOrderData(null)
    setAllOrders([])

    try {
      const query_text = searchQuery.trim()

      // Check if it looks like a phone number (digits only or starts with 0/+)
      const isPhoneNumber = /^[\d\s+-]+$/.test(query_text) && query_text.length >= 7

      let snapshot
      if (isPhoneNumber) {
        // Search by phone number
        const q1 = query(collection(db, "orders"), where("phone", "==", query_text))
        const q2 = query(collection(db, "orders"), where("customerPhone", "==", query_text))

        const [snap1, snap2] = await Promise.all([getDocs(q1), getDocs(q2)])
        const allDocs = [...snap1.docs, ...snap2.docs]

        // Remove duplicates
        const uniqueDocs = allDocs.filter((doc, index, self) =>
          index === self.findIndex(d => d.id === doc.id)
        )

        if (uniqueDocs.length === 0) {
          setError(isAr ? "لم يتم العثور على طلبات لهذا الرقم" : "No orders found for this phone number")
        } else if (uniqueDocs.length === 1) {
          setOrderData(uniqueDocs[0].data())
        } else {
          // Multiple orders - show list
          setAllOrders(uniqueDocs.map(d => ({ id: d.id, ...d.data() })))
        }
      } else {
        // Search by order ID  
        const q = query(collection(db, "orders"), where("orderId", "==", query_text))
        snapshot = await getDocs(q)

        if (snapshot.empty) {
          setError(isAr ? "لم يتم العثور على الطلب" : "Order not found")
        } else {
          setOrderData(snapshot.docs[0].data())
        }
      }
    } catch (err) {
      logger.error("Track error:", err)
      setError(isAr ? "حدث خطأ ما" : "Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const statuses = isAr
    ? [
      { icon: ClipboardList, title: "تم إنشاء الطلب", status: "Order Created" },
      { icon: UserCheck, title: "تعيين فني", status: "Technician Assigned" }, // Simplified status mapping
      { icon: Truck, title: "الفني في الطريق", status: "On the Way" },
      { icon: Wrench, title: "الإصلاح جارٍ", status: "In Progress" },
      { icon: CheckCircle2, title: "اكتمل", status: "Completed" },
    ]
    : [
      { icon: ClipboardList, title: "Order Created", status: "Order Created" },
      { icon: UserCheck, title: "Technician Assigned", status: "Technician Assigned" },
      { icon: Truck, title: "On the Way", status: "On the Way" },
      { icon: Wrench, title: "Repair In Progress", status: "In Progress" },
      { icon: CheckCircle2, title: "Completed", status: "Completed" },
    ]

  const getStatusIndex = (status: string) => {
    // Simple mapping logic - can be expanded based on actual status values
    if (status === "Order Created") return 0
    if (status === "Waiting for Parts") return 1
    if (status === "In Progress") return 3
    if (status === "Completed") return 4
    if (status === "Delivered") return 4
    return 0
  }

  const currentStatusIndex = orderData ? getStatusIndex(orderData.status) : -1
  const progressPercent = orderData ? Math.round((Math.max(0, Math.min(statuses.length - 1, currentStatusIndex)) / (statuses.length - 1)) * 100) : 0
  const etaStr = orderData?.estimatedCompletion ? new Date(orderData.estimatedCompletion).toLocaleString(isAr ? "ar-AE" : undefined, { year: "numeric", month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }) : ""
  const copyOrderId = () => {
    if (!orderData?.orderId) return
    navigator.clipboard.writeText(orderData.orderId)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  return (
    <section className="relative pt-28 pb-16 overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -left-24 w-[45vw] h-[45vw] bg-cyan-600/10 rounded-full blur-[140px]" />
        <div className="absolute -bottom-24 -right-24 w-[40vw] h-[40vw] bg-blue-600/10 rounded-full blur-[140px]" />
      </div>
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <motion.h1
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="text-2xl md:text-3xl font-bold mb-3"
        >
          {isAr ? "تتبّع الطلب" : "Order Tracking"}
        </motion.h1>
        <div className="h-1 w-24 bg-gradient-to-r from-cyan-500 via-blue-500 to-transparent rounded-full mb-6" />
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <GlassCard hoverEffect={false} className="p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
            <div className="grid md:grid-cols-[2fr_auto] gap-4 items-center">
              <input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && !loading) handleTrack() }}
                placeholder={isAr ? "أدخل رقم الطلب أو رقم الهاتف" : "Enter order ID or phone number"}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500"
              />
              <button
                onClick={handleTrack}
                disabled={loading}
                className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-50 flex items-center gap-2"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <SearchIcon className="w-4 h-4" />}
                {isAr ? "تتبّع الطلب" : "Track Order"}
              </button>
            </div>
            <div className="mt-3 text-xs text-white/50">
              {isAr ? "نصيحة: يمكنك البحث برقم الطلب أو رقم الهاتف" : "Tip: Search by order ID (KBI-XXXX) or phone number"}
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {exampleIds.map((id) => (
                <button
                  key={id}
                  onClick={() => setSearchQuery(id)}
                  className="px-3 py-1.5 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 text-white/70"
                >
                  {id}
                </button>
              ))}
            </div>
            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}
          </GlassCard>
        </motion.div>

        {/* Multiple orders found (when searching by phone) */}
        {allOrders.length > 0 && (
          <div className="mt-8 space-y-4">
            <h2 className="text-lg font-semibold text-white/80">
              {isAr ? `تم العثور على ${allOrders.length} طلبات` : `Found ${allOrders.length} orders`}
            </h2>
            {allOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.01 }}
                className="cursor-pointer"
                onClick={() => {
                  setOrderData(order)
                  setAllOrders([])
                }}
              >
                <GlassCard className="p-4 hover:border-cyan-500/50 transition-all">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-cyan-400">{order.orderId}</p>
                      <p className="text-sm text-white/60">{order.deviceType || order.device} - {order.model}</p>
                      <p className="text-xs text-white/40">{order.issueType || order.issue}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${order.status === "Completed" || order.status === "completed" ? "bg-green-500/20 text-green-400" :
                          order.status === "In Progress" || order.status === "in_progress" ? "bg-blue-500/20 text-blue-400" :
                            "bg-yellow-500/20 text-yellow-400"
                        }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        )}

        {orderData && (
          <div className="mt-8 space-y-6">
            <GlassCard className="p-6">
              <div className="flex flex-wrap gap-4 justify-between items-center mb-6 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-lg font-semibold">{orderData.deviceType} - {orderData.model}</h3>
                  <p className="text-white/60 text-sm">{orderData.issueType}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-white/60">{isAr ? "الحالة الحالية" : "Current Status"}</div>
                  <div className="text-cyan-400 font-semibold">{orderData.status}</div>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 mb-6">
                {orderData.orderId && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70">
                    <ClipboardList className="w-4 h-4 text-cyan-400" />
                    <span dir="ltr">{orderData.orderId}</span>
                    <button onClick={copyOrderId} className="p-1 rounded bg-white/5 hover:bg-white/10">
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-white/60" />}
                    </button>
                  </div>
                )}
                {orderData.estimatedCompletion && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/70">
                    <Clock className="w-4 h-4 text-cyan-400" />
                    <span>{isAr ? "الإنهاء المتوقع" : "ETA"}</span>
                    <span>{etaStr}</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
                <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-white/10 -z-10 -translate-y-1/2" />
                <div className={`hidden md:block absolute top-1/2 -translate-y-1/2 ${isAr ? "right-0" : "left-0"} h-0.5 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 -z-10`} style={{ width: `${progressPercent}%` }} />
                {statuses.map((s, i) => {
                  const isActive = i <= currentStatusIndex
                  const isCurrent = i === currentStatusIndex
                  return (
                    <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} whileHover={{ y: -2 }} className={`relative p-4 rounded-xl border transition-all duration-300 ${isActive ? "bg-cyan-500/10 border-cyan-500/50" : "bg-black/40 border-white/5 opacity-50"} ${isCurrent ? "shadow-[0_0_20px_rgba(6,182,212,0.35)]" : ""}`}>
                      <div className={`w-10 h-10 rounded-full mx-auto mb-3 flex items-center justify-center ${isActive ? "bg-cyan-500 text-black" : "bg-white/10 text-white/30"}`}>
                        <s.icon className="w-5 h-5" />
                      </div>
                      <div className={`text-xs md:text-sm font-semibold text-center ${isActive ? "text-cyan-400" : "text-white/50"}`}>{s.title}</div>
                    </motion.div>
                  )
                })}
              </div>
            </GlassCard>
          </div>
        )}
      </div>
    </section>
  )
}
