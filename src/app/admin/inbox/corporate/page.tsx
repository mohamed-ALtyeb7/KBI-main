"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { useT } from "@/components/providers/language-provider"
import { Building2, Phone, Mail, Trash2, CheckCircle, Clock } from "lucide-react"
import { db, isMockMode, auth } from "@/lib/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"
import { collection, onSnapshot, doc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore"
import { Badge } from "@/components/ui/badge"

interface CorporateRequest {
  id: string
  companyName: string
  contactPerson: string
  email: string
  phone: string
  deviceCount: string
  message: string
  createdAt: any
  status: "New" | "Contacted" | "Closed"
}

export default function CorporateInboxPage() {
  const t = useT()
  const [authorized, setAuthorized] = useState(false)
  const [requests, setRequests] = useState<CorporateRequest[]>([])
  const [selectedRequest, setSelectedRequest] = useState<CorporateRequest | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Auth guard
    if (isMockMode) {
      const u = typeof window !== "undefined" ? window.localStorage.getItem("mock_admin_user") : null
      if (!u) {
        if (typeof window !== "undefined") window.location.replace("/admin/login")
        return
      }
      setAuthorized(true)
    } else {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (!user) {
          if (typeof window !== "undefined") window.location.replace("/admin/login")
        } else {
          setAuthorized(true)
        }
      })
      return () => unsub()
    }
    if (isMockMode) {
      setRequests([
        {
          id: "corp1",
          companyName: "Tech Solutions Ltd",
          contactPerson: "Mike Ross",
          email: "mike@techsolutions.com",
          phone: "0501112233",
          deviceCount: "50+",
          message: "We need regular maintenance for our office laptops (approx 50 units).",
          createdAt: new Date().toISOString(),
          status: "New"
        },
        {
          id: "corp2",
          companyName: "Creative Agency",
          contactPerson: "Sarah Lee",
          email: "sarah@creative.com",
          phone: "0554445566",
          deviceCount: "10-20",
          message: "Looking for a service contract for our iMacs.",
          createdAt: new Date(Date.now() - 172800000).toISOString(),
          status: "Contacted"
        }
      ])
      setLoading(false)
      return
    }

    const q = query(collection(db, "corporate_requests"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setRequests(snap.docs.map(d => ({ id: d.id, ...d.data() })) as CorporateRequest[])
      setLoading(false)
    })

    return () => unsub()
  }, [])

  const updateStatus = async (id: string, status: "New" | "Contacted" | "Closed") => {
    if (isMockMode) {
      setRequests(requests.map(r => r.id === id ? { ...r, status } : r))
      if (selectedRequest?.id === id) setSelectedRequest(prev => prev ? { ...prev, status } : null)
      return
    }
    await updateDoc(doc(db, "corporate_requests", id), { status })
    if (selectedRequest?.id === id) setSelectedRequest(prev => prev ? { ...prev, status } : null)
  }

  const deleteRequest = async (id: string) => {
    if (!confirm(t("Delete this request?"))) return
    
    if (isMockMode) {
      setRequests(requests.filter(r => r.id !== id))
      if (selectedRequest?.id === id) setSelectedRequest(null)
      return
    }

    await deleteDoc(doc(db, "corporate_requests", id))
    if (selectedRequest?.id === id) setSelectedRequest(null)
  }

  if (!authorized) return null
  return (
    <section className="pt-2 pb-8">
      <div className="flex items-center gap-2 mb-6">
        <h1 className="text-2xl font-bold">{t("Corporate Requests")}</h1>
        {requests.filter(r => r.status === "New").length > 0 && (
          <Badge variant="destructive" className="ml-2">
            {requests.filter(r => r.status === "New").length} {t("New")}
          </Badge>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6 h-[600px]">
        <GlassCard className="overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {requests.length === 0 && <p className="text-white/30 text-center py-10">{t("No requests")}</p>}
            {requests.map((r) => (
              <div 
                key={r.id} 
                onClick={() => setSelectedRequest(r)}
                className={`p-4 rounded-xl border cursor-pointer transition-colors ${selectedRequest?.id === r.id ? "bg-cyan-500/10 border-cyan-500/50" : r.status === "New" ? "bg-white/10 border-white/20 font-semibold" : "bg-white/5 border-white/10"}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-medium flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-cyan-400" />
                    {r.companyName}
                  </span>
                  <span className="text-xs text-white/50">{r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString() : t("Just now")}</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <p className="text-sm text-white/70">{r.contactPerson}</p>
                  <Badge variant="outline" className={
                    r.status === "New" ? "border-green-500 text-green-500" : 
                    r.status === "Contacted" ? "border-blue-500 text-blue-500" : 
                    "border-white/30 text-white/50"
                  }>
                    {t(r.status)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
        
        <GlassCard className="flex flex-col">
          {selectedRequest ? (
            <>
              <div className="flex justify-between items-start mb-6 border-b border-white/10 pb-4">
                <div>
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    {selectedRequest.companyName}
                  </h3>
                  <div className="mt-2 space-y-1">
                    <p className="text-sm flex items-center gap-2 text-white/70">
                        <span className="text-white/40">{t("Contact:")}</span> {selectedRequest.contactPerson}
                    </p>
                    <p className="text-sm flex items-center gap-2 text-white/70">
                        <Mail className="w-3 h-3" /> {selectedRequest.email}
                    </p>
                    <p className="text-sm flex items-center gap-2 text-white/70">
                        <Phone className="w-3 h-3" /> {selectedRequest.phone}
                    </p>
                    <p className="text-sm flex items-center gap-2 text-white/70">
                        <span className="text-white/40">{t("Devices:")}</span> {selectedRequest.deviceCount}
                    </p>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                    <button onClick={() => deleteRequest(selectedRequest.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors self-end">
                        <Trash2 className="w-5 h-5" />
                    </button>
                    <div className="flex gap-2 mt-2">
                        {selectedRequest.status === "New" && (
                            <button onClick={() => updateStatus(selectedRequest.id, "Contacted")} className="text-xs bg-blue-500/20 text-blue-400 px-3 py-1 rounded-full border border-blue-500/50 hover:bg-blue-500/30 transition-colors">
                                {t("Mark Contacted")}
                            </button>
                        )}
                        {selectedRequest.status !== "Closed" && (
                            <button onClick={() => updateStatus(selectedRequest.id, "Closed")} className="text-xs bg-white/5 text-white/50 px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition-colors">
                                {t("Close Request")}
                            </button>
                        )}
                    </div>
                </div>
              </div>
              
              <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 text-sm whitespace-pre-wrap overflow-y-auto">
                <h4 className="text-xs text-white/40 uppercase tracking-wider mb-2">{t("Message")}</h4>
                {selectedRequest.message}
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-white/30">
              {t("Select a request to view details")}
            </div>
          )}
        </GlassCard>
      </div>
    </section>
  )
}
