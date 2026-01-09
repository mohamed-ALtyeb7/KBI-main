"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Smartphone, Calendar, MapPin, Filter, Search } from "lucide-react"
import { collection, onSnapshot, query, where, orderBy } from "firebase/firestore"
import { db, auth, isMockMode } from "@/lib/firebaseConfig"
import { useLanguage } from "@/lib/i18n"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getTechnicianIdFromUser } from "@/lib/firestore/services/technicianService"

export default function TechnicianOrdersPage() {
  const { t } = useLanguage()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [orders, setOrders] = useState<any[]>([])
  const [filteredOrders, setFilteredOrders] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [techId, setTechId] = useState<string | null>(null)

  // Filters
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((u) => setUser(u))
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
      setOrders([])
      setFilteredOrders([])
      setLoading(false)
      return
    }
    setLoading(true)
    const ordersRef = collection(db, "orders")
    const q = query(ordersRef, where("technicianId", "==", user.uid), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setOrders(data)
      setFilteredOrders(data)
      setLoading(false)
    })
    return () => unsubscribe()
  }, [user])

  useEffect(() => {
    let result = orders

    if (searchQuery) {
      const lower = searchQuery.toLowerCase()
      result = result.filter(o =>
        o.id.toLowerCase().includes(lower) ||
        o.device?.toLowerCase().includes(lower) ||
        o.customerName?.toLowerCase().includes(lower)
      )
    }

    if (statusFilter !== "all") {
      result = result.filter(o => o.status === statusFilter)
    }

    setFilteredOrders(result)
  }, [searchQuery, statusFilter, orders])

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

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">{t("Assigned Orders")}</h1>
          <p className="text-white/60 mt-1">{t("Manage your daily tasks")}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 bg-white/5 p-4 rounded-lg border border-white/10 backdrop-blur-sm">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/50" />
          <Input
            placeholder={t("Search by ID, Device, Customer...")}
            className="pl-9 bg-black/20 border-white/10 text-white placeholder:text-white/40 focus:border-cyan-500/50"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="w-full md:w-48">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="bg-black/20 border-white/10 text-white">
              <SelectValue placeholder={t("Filter by Status")} />
            </SelectTrigger>
            <SelectContent className="bg-zinc-900 border-white/10 text-white">
              <SelectItem value="all">{t("All Statuses")}</SelectItem>
              <SelectItem value="pending">{t("Pending")}</SelectItem>
              <SelectItem value="on_way">{t("On the Way")}</SelectItem>
              <SelectItem value="in_progress">{t("In Progress")}</SelectItem>
              <SelectItem value="completed">{t("Completed")}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Orders List */}
      <div className="grid gap-4">
        {loading ? (
          <div className="text-center py-20 text-white/50">{t("Loading orders...")}</div>
        ) : filteredOrders.length === 0 ? (
          <div className="text-center py-20 text-white/50 border border-dashed border-white/10 rounded-lg">
            <p>{t("No orders found matching your criteria.")}</p>
          </div>
        ) : (
          filteredOrders.map((order) => (
            <Card
              key={order.id}
              className="bg-white/5 border-white/10 hover:bg-white/10 transition-all cursor-pointer group"
              onClick={() => router.push(`/technician/order/${order.id}`)}
            >
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex gap-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center shrink-0 border border-white/5 group-hover:border-cyan-500/30 transition-colors">
                      <Smartphone className="h-7 w-7 text-cyan-400" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-white text-lg">{order.device}</h3>
                        <Badge variant="outline" className="bg-white/5 border-white/10 text-white/60 text-[10px] h-5">
                          {order.id}
                        </Badge>
                      </div>
                      <p className="text-white/70 mb-2">{order.issue}</p>
                      <div className="flex flex-wrap gap-3 text-sm text-white/50">
                        <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(order.date || order.createdAt).toLocaleDateString()}</span>
                        <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {order.location || "N/A"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-3 pl-0 md:pl-4 md:border-l border-white/10">
                    <Badge className={`${getStatusColor(order.status)} px-3 py-1 text-sm capitalize`}>
                      {order.status.replace('_', ' ')}
                    </Badge>
                    <span className="text-xl font-bold text-white">{order.price} <span className="text-sm font-normal text-white/50">AED</span></span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
