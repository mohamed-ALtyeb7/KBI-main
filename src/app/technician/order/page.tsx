"use client"

import { Suspense, useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import {
  ArrowLeft, Phone, MessageCircle, MapPin, Clock, Camera, CheckCircle, AlertTriangle, FileText, Send, Upload, Calendar,
  User, Smartphone, Navigation, Timer
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select"
import { doc, getDoc, updateDoc, onSnapshot, arrayUnion, Timestamp, collection, addDoc, query, where, onSnapshot as onSnapshotCol } from "firebase/firestore"
import { db, auth, storage, isMockMode } from "@/lib/firebaseConfig"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { useLanguage } from "@/lib/i18n"
import { cn, logger } from "@/lib/utils"
import { getCurrentLocation, formatLocation } from "@/lib/gpsService"

const mockUpload = async (file: File) => {
  return new Promise<string>((resolve) => {
    setTimeout(() => {
      resolve(URL.createObjectURL(file))
    }, 1000)
  })
}

function TechnicianOrderClient() {
  const search = useSearchParams()
  const id = search.get("id") || ""
  const router = useRouter()
  const { t, language } = useLanguage()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [note, setNote] = useState("")
  const [uploading, setUploading] = useState(false)
  const [statusDialogOpen, setStatusDialogOpen] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [etaMinutes, setEtaMinutes] = useState<string>("")
  const [reqDialogOpen, setReqDialogOpen] = useState(false)
  const [reqName, setReqName] = useState("")
  const [reqCategory, setReqCategory] = useState<"spare_part" | "additional_service" | "">("")
  const [reqQty, setReqQty] = useState<string>("1")
  const [reqPrice, setReqPrice] = useState<string>("")
  const [reqReason, setReqReason] = useState("")
  const [reqPhoto, setReqPhoto] = useState<string>("")
  const [hasPendingRequests, setHasPendingRequests] = useState(false)
  const [checkingIn, setCheckingIn] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

  useEffect(() => {
    if (!id) {
      setLoading(false)
      return
    }
    setLoading(true)
    if (isMockMode) {
      setOrder({
        id,
        device: "Device",
        issue: "Issue",
        status: "pending",
        customerPhone: "",
        location: "",
        createdAt: new Date().toISOString()
      })
      setHasPendingRequests(false)
      setLoading(false)
      return
    }
    const docRef = doc(db, "orders", id as string)
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() })
      }
      setLoading(false)
    }, (error) => {
      logger.error("Order subscription error:", error)
      setLoading(false)
    })
    const reqQ = query(collection(db, "tech_requests"), where("orderId", "==", id), where("status", "==", "pending"))
    const unsubReq = onSnapshotCol(reqQ, (snap) => {
      setHasPendingRequests(snap.size > 0)
    }, (error) => {
      logger.error("Tech requests subscription error:", error)
    })
    return () => { unsubscribe(); unsubReq() }
  }, [id])

  const handleStatusUpdate = async () => {
    if (!newStatus || !order) return
    if (newStatus === "completed" && hasPendingRequests) {
      alert(t("Pending Admin Approval"))
      return
    }
    if (isMockMode) {
      setOrder((prev: any) => {
        if (!prev) return prev
        const timeline = Array.isArray(prev.timeline) ? prev.timeline : []
        return {
          ...prev,
          status: newStatus,
          timeline: [...timeline, { status: newStatus, time: new Date().toISOString() }],
          updatedAt: new Date().toISOString()
        }
      })
      setStatusDialogOpen(false)
      return
    }
    const u = auth.currentUser
    if (!u || (order.technicianId && order.technicianId !== u.uid)) {
      alert(t("Missing or insufficient permissions"))
      return
    }
    try {
      const docRef = doc(db, "orders", id as string)
      await updateDoc(docRef, {
        status: newStatus,
        timeline: arrayUnion({ status: newStatus, time: new Date().toISOString() }),
        updatedAt: Timestamp.now()
      })
      setStatusDialogOpen(false)
    } catch {
      alert(t("Status update failed"))
    }
  }

  const handleSubmitRequest = async () => {
    if (!order || !reqName || !reqCategory || !reqQty || !reqPrice || !reqReason) return
    const qty = parseInt(reqQty, 10)
    const price = parseFloat(reqPrice)
    if (isNaN(qty) || qty <= 0 || isNaN(price) || price < 0) return
    if (isMockMode) {
      setHasPendingRequests(true)
      setReqDialogOpen(false)
      setReqName(""); setReqCategory(""); setReqQty("1"); setReqPrice(""); setReqReason(""); setReqPhoto("")
      alert(t("Pending Admin Approval"))
      return
    }
    const u = auth.currentUser
    if (!u || (order.technicianId && order.technicianId !== u.uid)) {
      alert(t("Missing or insufficient permissions"))
      return
    }
    try {
      await addDoc(collection(db, "tech_requests"), {
        orderId: order.id,
        technicianId: order.technicianId,
        technicianName: order.technicianName,
        partOrServiceName: reqName,
        category: reqCategory,
        quantity: qty,
        estimatedPrice: price,
        reason: reqReason,
        photoUrl: reqPhoto || null,
        status: "pending",
        createdAt: Timestamp.now(),
        history: [{ action: "submitted", by: "technician", at: Timestamp.now(), note: reqReason }]
      })
      const docRef = doc(db, "orders", order.id)
      await updateDoc(docRef, {
        status: order.status === "in_progress" ? "waiting_parts" : order.status,
        pendingRequestsCount: (order.pendingRequestsCount || 0) + 1,
        updatedAt: Timestamp.now()
      })
      setReqDialogOpen(false)
      setReqName(""); setReqCategory(""); setReqQty("1"); setReqPrice(""); setReqReason(""); setReqPhoto("")
      alert(t("Pending Admin Approval"))
    } catch {
      alert(t("Submit request failed"))
    }
  }

  const handleAddNote = async () => {
    if (!note.trim() || !order) return
    const newNote = { text: note, time: new Date().toISOString(), user: "Technician" }
    if (isMockMode) {
      setOrder((prev: any) => {
        if (!prev) return prev
        const notes = Array.isArray(prev.notes) ? prev.notes : prev.notes ? Object.values(prev.notes) : []
        return { ...prev, notes: [...notes, newNote] }
      })
      setNote("")
      return
    }
    const u = auth.currentUser
    if (!u || (order.technicianId && order.technicianId !== u.uid)) {
      alert(t("Missing or insufficient permissions"))
      return
    }
    try {
      const docRef = doc(db, "orders", id as string)
      await updateDoc(docRef, { notes: arrayUnion(newNote) })
      setNote("")
    } catch {
      alert(t("Add note failed"))
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return
    setUploading(true)
    const file = e.target.files[0]
    try {
      let downloadURL = ""
      if (!storage) {
        downloadURL = await mockUpload(file)
      } else {
        if (isMockMode) {
          downloadURL = await mockUpload(file)
        } else {
          const u = auth.currentUser
          if (!u || (order?.technicianId && order.technicianId !== u.uid)) {
            alert(t("Missing or insufficient permissions"))
            setUploading(false)
            return
          }
          const storageRef = ref(storage, `orders/${id}/${file.name}`)
          await uploadBytes(storageRef, file)
          downloadURL = await getDownloadURL(storageRef)
        }
      }
      const newAttachment = { url: downloadURL, name: file.name, type: file.type, time: new Date().toISOString() }
      if (isMockMode) {
        setOrder((prev: any) => {
          if (!prev) return prev
          const attachments = Array.isArray(prev.attachments) ? prev.attachments : prev.attachments ? Object.values(prev.attachments) : []
          return { ...prev, attachments: [newAttachment, ...attachments] }
        })
      } else {
        const docRef = doc(db, "orders", id as string)
        await updateDoc(docRef, { attachments: arrayUnion(newAttachment) })
      }
    } catch {
      alert(t("File upload failed"))
    } finally {
      setUploading(false)
    }
  }

  const handleEtaSave = async () => {
    if (!etaMinutes || !order) return
    const minutes = parseInt(etaMinutes, 10)
    if (isNaN(minutes) || minutes < 0) return
    const iso = new Date(Date.now() + minutes * 60000).toISOString()
    if (isMockMode) {
      setOrder((prev: any) => ({ ...prev, estimatedCompletion: iso, updatedAt: new Date().toISOString() }))
      setEtaMinutes("")
      return
    }
    const u = auth.currentUser
    if (!u || (order.technicianId && order.technicianId !== u.uid)) {
      alert(t("Missing or insufficient permissions"))
      return
    }
    try {
      const docRef = doc(db, "orders", id as string)
      await updateDoc(docRef, { estimatedCompletion: iso, updatedAt: Timestamp.now() })
      setEtaMinutes("")
    } catch {
      alert(t("ETA save failed"))
    }
  }

  const handleCheckIn = async () => {
    setCheckingIn(true)
    try {
      const location = await getCurrentLocation()
      if (isMockMode) {
        setOrder((prev: any) => {
          if (!prev) return prev
          const notes = Array.isArray(prev.notes) ? prev.notes : prev.notes ? Object.values(prev.notes) : []
          return {
            ...prev,
            checkIn: { lat: location.lat, lng: location.lng, address: location.address || "", timestamp: new Date().toISOString() },
            notes: [...notes, { text: `Checked in at: ${location.address || `${location.lat}, ${location.lng}`}`, time: new Date().toISOString(), user: "Technician" }],
            updatedAt: new Date().toISOString()
          }
        })
        setCheckedIn(true)
        alert(t("Check-in successful!"))
      } else {
        const u = auth.currentUser
        if (!u || (order?.technicianId && order.technicianId !== u.uid)) {
          alert(t("Missing or insufficient permissions"))
          setCheckingIn(false)
          return
        }
        const docRef = doc(db, "orders", id as string)
        await updateDoc(docRef, {
          checkIn: { lat: location.lat, lng: location.lng, address: location.address || "", timestamp: Timestamp.now() },
          notes: arrayUnion({ text: `Checked in at: ${location.address || `${location.lat}, ${location.lng}`}`, time: new Date().toISOString(), user: "Technician" }),
          updatedAt: Timestamp.now()
        })
        setCheckedIn(true)
        alert(t("Check-in successful!"))
      }
    } catch (error: any) {
      alert(t("Check-in failed: ") + error.message)
    } finally {
      setCheckingIn(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending": return "text-yellow-500 bg-yellow-500/10"
      case "in_progress": return "text-blue-500 bg-blue-500/10"
      case "on_way": return "text-purple-500 bg-purple-500/10"
      case "completed": return "text-green-500 bg-green-500/10"
      default: return "text-gray-500 bg-gray-500/10"
    }
  }

  return (
    <div className="min-h-screen bg-black text-white p-4">
      <div className="text-center text-white/60">Order details page requires ?id=ORDER_DOC_ID</div>
    </div>
  )
}

export default function TechnicianOrderDetails() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-black text-white p-4">
          <div className="text-center text-white/60">Loading...</div>
        </div>
      }
    >
      <TechnicianOrderClient />
    </Suspense>
  )
}
