"use client"

import { useEffect, useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog"
import {
  Search,
  MoreHorizontal,
  User,
  Clock,
  Trash2,
  Eye,
  CheckCircle,
  AlertTriangle,
  FileDown,
  Plus,
  MessageCircle
} from "lucide-react"
import { openWhatsApp, WhatsAppTemplates, formatPhoneForWhatsApp } from "@/lib/smsService"
import { logAction, AuditActions } from "@/lib/auditService"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu"
import { collection, onSnapshot, doc, updateDoc, deleteDoc, orderBy, query, Timestamp, arrayUnion, runTransaction } from "firebase/firestore"
import { db, auth, isMockMode } from "@/lib/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"
import { useT } from "@/components/providers/language-provider"
import { FinalInvoice } from "@/components/ui/invoice"
import { toast } from "@/hooks/use-toast"
import { approveOrderPricing, rejectOrderPricing } from "@/lib/firestore/services/orderService"
import { counterOfferPricing } from "@/lib/firestore/services/orderService"
import { getUserRole } from "@/lib/firestore/services/authService"

type Order = {
  id: string
  orderId: string
  customerName: string
  customerPhone: string
  deviceType: string
  brand: string
  model: string
  issue: string
  status: "pending" | "in_progress" | "waiting_parts" | "completed" | "delivered" | "cancelled"
  technicianId?: string
  technicianName?: string
  createdAt: any
  estimatedCompletion?: any
  price?: number
  notes?: string
  statusHistory?: {
    status: string
    timestamp: any
    note?: string
  }[]
}

type Technician = {
  id: string
  name: string
  status: "active" | "inactive" | "busy"
}

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-500 border-yellow-500/50",
  in_progress: "bg-blue-500/20 text-blue-500 border-blue-500/50",
  waiting_parts: "bg-orange-500/20 text-orange-500 border-orange-500/50",
  completed: "bg-green-500/20 text-green-500 border-green-500/50",
  delivered: "bg-purple-500/20 text-purple-500 border-purple-500/50",
  cancelled: "bg-red-500/20 text-red-500 border-red-500/50",
}

export default function AdminOrdersPage() {
  const t = useT()
  const [authorized, setAuthorized] = useState(false)
  const [orders, setOrders] = useState<Order[]>([])
  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [loading, setLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isDetailsOpen, setIsDetailsOpen] = useState(false)
  const [etaMinutes, setEtaMinutes] = useState<string>("")
  const [invoiceDialogOpen, setInvoiceDialogOpen] = useState(false)
  const [invoiceNumber, setInvoiceNumber] = useState<string>("")
  const [invoiceLang, setInvoiceLang] = useState<"en" | "ar" | "both">("en")
  const [invoiceDiscount, setInvoiceDiscount] = useState<string>("0")
  const [vatEnabled, setVatEnabled] = useState<boolean>(false)
  const [vatRate, setVatRate] = useState<string>("0")
  const [warrantyPeriod, setWarrantyPeriod] = useState<string>("3 months")
  const [adminNotesInvoice, setAdminNotesInvoice] = useState<string>("")
  const [disclaimerText, setDisclaimerText] = useState<string>("Payment due upon completion of repair.")
  const [invoiceFinalized, setInvoiceFinalized] = useState<boolean>(false)
  const [overrideReason, setOverrideReason] = useState<string>("")
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "technician" | "customer" | "super_admin" | null>(null)
  const [counterDialogOpen, setCounterDialogOpen] = useState(false)
  const [counterPrice, setCounterPrice] = useState<string>("")
  const [counterDuration, setCounterDuration] = useState<string>("")
  const [counterETA, setCounterETA] = useState<string>("")
  const [counterNote, setCounterNote] = useState<string>("")

  const [itemsPerPage] = useState(10)
  const [currentPage, setCurrentPage] = useState(1)

  useEffect(() => {
    // Auth guard - Firebase mode
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (typeof window !== "undefined") {
          window.location.replace("/admin/login")
        }
      } else {
        setAuthorized(true)
        getUserRole(user.uid).then(setCurrentUserRole)
      }
    })

    if (isMockMode) {
      setOrders([])
      setTechnicians([])
      setLoading(false)
      return () => {
        unsub()
      }
    }

    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"))
    const unsubOrders = onSnapshot(q, (snap) => {
      const mappedOrders = snap.docs.map(d => {
        const data = d.data()
        return {
          id: d.id,
          orderId: data.orderId || d.id,
          customerName: data.customerName || data.name || "Unknown",
          customerPhone: data.customerPhone || data.phone || "",
          deviceType: data.deviceType || "Device",
          brand: data.brand || "",
          model: data.model || "",
          issue: data.issue || data.issueType || "",
          status: normalizeStatus(data.status),
          technicianId: data.technicianId,
          technicianName: data.technicianName || data.technician,
          createdAt: data.createdAt,
          estimatedCompletion: data.estimatedCompletion,
          price: data.price,
          notes: data.notes,
          statusHistory: data.statusHistory
        } as Order
      })
      setOrders(mappedOrders)
      setLoading(false)
    }, (error) => {
      toast({ title: t("Failed to load orders"), description: error?.message || t("Please try again") })
      setLoading(false)
    })

    const unsubTechs = onSnapshot(collection(db, "technicians"), (snap) => {
      setTechnicians(snap.docs.map(d => ({ id: d.id, ...d.data() } as Technician)))
    }, (error) => {
      toast({ title: t("Failed to load technicians"), description: error?.message || t("Please try again") })
    })

    return () => {
      unsub()
      unsubOrders()
      unsubTechs()
    }
  }, [])

  // Helper to normalize status strings
  const normalizeStatus = (status: string): Order["status"] => {
    if (!status) return "pending"
    const s = status.toLowerCase().replace(/\s+/g, "_")
    if (s === "order_created" || s === "pending") return "pending"
    if (s === "in_progress") return "in_progress"
    if (s === "waiting_parts") return "waiting_parts"
    if (s === "completed") return "completed"
    if (s === "delivered") return "delivered"
    if (s === "cancelled") return "cancelled"
    return "pending"
  }

  const getInvoiceItemsForOrder = (o: Order) => {
    const items: any[] = []
    const base = Number(o.price || 0)
    if (base > 0) {
      items.push({ description: o.issue || "Repair Service", category: "service", quantity: 1, unitPrice: base, total: base })
    }
    const extras = (o as any).invoiceItems || []
    return [...items, ...extras]
  }

  const getNextInvoiceNumber = async (): Promise<string> => {
    const ref = doc(db, "counters", "invoices")
    return await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref)
      let current = snap.exists() ? Number((snap.data() as any).current || 0) : 0
      current += 1
      tx.set(ref, { current }, { merge: true })
      return `INV-${String(current).padStart(6, "0")}`
    })
  }

  const openInvoicePreview = async () => {
    if (!selectedOrder) return
    if (!invoiceNumber) {
      const num = await getNextInvoiceNumber()
      setInvoiceNumber(num)
    }
    setInvoiceDialogOpen(true)
  }

  const finalizeInvoice = async () => {
    if (!selectedOrder) return
    const discount = Number(invoiceDiscount || 0)
    const vatR = Number(vatRate || 0)
    const items = getInvoiceItemsForOrder(selectedOrder)
    const subtotal = items.reduce((s, i: any) => s + Number(i.total || i.unitPrice * i.quantity), 0)
    const afterDiscount = subtotal - discount
    const vatAmount = vatEnabled ? afterDiscount * vatR : 0
    const total = afterDiscount + vatAmount

    const ref = doc(db, "orders", selectedOrder.id)
    await updateDoc(ref, {
      invoice: {
        invoiceNumber,
        invoiceDate: Timestamp.now(),
        status: "finalized",
        generatedBy: "admin",
        discount,
        vatRate: vatR,
        vatEnabled,
        warrantyPeriod,
        adminNotes: adminNotesInvoice,
        disclaimerText,
        subtotal,
        total,
        language: invoiceLang,
        history: arrayUnion({ action: "finalized", by: "admin", at: Timestamp.now() })
      },
      updatedAt: Timestamp.now()
    })
    setInvoiceFinalized(true)
  }

  const overrideInvoice = async () => {
    if (!selectedOrder || !overrideReason) return
    const ref = doc(db, "orders", selectedOrder.id)
    await updateDoc(ref, {
      invoice: {
        ...(selectedOrder as any).invoice,
        history: arrayUnion({ action: "override", by: "admin", at: Timestamp.now(), note: overrideReason })
      },
      updatedAt: Timestamp.now()
    })
    setOverrideReason("")
  }

  if (!authorized) return null as any
  const filteredOrders = orders.filter(order => {
    const matchesSearch =
      order.customerName.toLowerCase().includes(search.toLowerCase()) ||
      order.orderId.toLowerCase().includes(search.toLowerCase()) ||
      order.customerPhone.includes(search)

    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    const order = orders.find(o => o.id === orderId)

    const historyItem = {
      status: newStatus,
      timestamp: Timestamp.now(),
      note: `${t("Status updated to")} ${newStatus === "in_progress" ? t("In Progress") :
        newStatus === "waiting_parts" ? t("Waiting Parts") :
          newStatus === "completed" ? t("Completed") :
            newStatus === "delivered" ? t("Delivered") :
              newStatus === "cancelled" ? t("Cancelled") :
                t("Pending")
        }`
    }

    try {
      await updateDoc(doc(db, "orders", orderId), {
        status: newStatus,
        statusHistory: arrayUnion(historyItem)
      })
      toast({ title: t("Status updated"), description: `${t("Order")} ${order?.orderId} ${t("now")} ${statusLabel(newStatus as any)}` })
    } catch (e: any) {
      toast({ title: t("Failed to update status"), description: e?.message || t("Please try again") })
      return
    }

    // Auto send WhatsApp notification
    if (order?.customerPhone) {
      let message = ""
      switch (newStatus) {
        case "in_progress":
          message = WhatsAppTemplates.technicianAssigned(order.orderId, order.technicianName || "Technician", "")
          break
        case "completed":
          message = WhatsAppTemplates.repairComplete(order.orderId, `kbi.ae/rate?orderId=${order.orderId}`)
          break
      }
      if (message) {
        openWhatsApp(order.customerPhone, message)
        toast({ title: t("WhatsApp opened"), description: t("Customer notified") })
      }
    }

    // Audit log
    const user = auth.currentUser
    if (user) {
      logAction(AuditActions.ORDER_UPDATED, "order", user.uid, user.email || "", {
        targetId: orderId,
        targetType: "order",
        details: { newStatus }
      })
    }
  }

  const handleAssignTech = async (orderId: string, techId: string) => {
    const tech = technicians.find(t => t.id === techId)
    if (!tech) return

    const order = orders.find(o => o.id === orderId)

    const historyItem = {
      status: "in_progress",
      timestamp: Timestamp.now(),
      note: `${t("Assigned to technician")} ${tech.name}`
    }

    try {
      await updateDoc(doc(db, "orders", orderId), {
        technicianId: techId,
        technicianName: tech.name,
        status: "in_progress",
        statusHistory: arrayUnion(historyItem)
      })
      toast({ title: t("Technician assigned"), description: `${tech.name} • ${t("Order")} ${order?.orderId}` })
    } catch (e: any) {
      toast({ title: t("Failed to assign"), description: e?.message || t("Please try again") })
      return
    }

    // Auto send WhatsApp notification for technician assignment
    if (order?.customerPhone) {
      const message = WhatsAppTemplates.technicianAssigned(order.orderId, tech.name, "")
      openWhatsApp(order.customerPhone, message)
      toast({ title: t("WhatsApp opened"), description: t("Customer notified") })
    }

    // Audit log
    const user = auth.currentUser
    if (user) {
      logAction(AuditActions.ORDER_UPDATED, "order", user.uid, user.email || "", {
        targetId: orderId,
        targetType: "order",
        details: { assignedTo: tech.name }
      })
    }
  }

  const handleDelete = async (orderId: string) => {
    if (confirm(t("Are you sure you want to delete this order?"))) {
      try {
        await deleteDoc(doc(db, "orders", orderId))
        toast({ title: t("Order deleted"), description: orderId })
        const user = auth.currentUser
        if (user) {
          logAction(AuditActions.ORDER_DELETED, "order", user.uid, user.email || "", {
            targetId: orderId,
            targetType: "order"
          })
        }
      } catch (e: any) {
        toast({ title: t("Delete failed"), description: e?.message || t("Please try again") })
      }
    }
  }

  const handleWhatsAppNotify = (order: Order, messageType: string) => {
    if (!order.customerPhone) {
      toast({ title: t("No phone number available"), description: t("Add customer phone to order") })
      return
    }
    let message = ""
    switch (messageType) {
      case "confirmation":
        message = WhatsAppTemplates.orderConfirmation(order.orderId, order.customerName)
        break
      case "assigned":
        message = WhatsAppTemplates.technicianAssigned(order.orderId, order.technicianName || "Technician", "")
        break
      case "complete":
        message = WhatsAppTemplates.repairComplete(order.orderId, `kbi.ae/rate?orderId=${order.orderId}`)
        break
      default:
        message = `Order #${order.orderId} update`
    }
    openWhatsApp(order.customerPhone, message)
    toast({ title: t("WhatsApp opened"), description: t("Customer notified") })
  }

  const handleEtaUpdate = async () => {
    if (!selectedOrder || !etaMinutes) return
    const minutes = parseInt(etaMinutes, 10)
    if (isNaN(minutes) || minutes < 0) return
    const iso = new Date(Date.now() + minutes * 60000).toISOString()

    await updateDoc(doc(db, "orders", selectedOrder.id), { estimatedCompletion: iso, updatedAt: Timestamp.now() })
    setEtaMinutes("")
  }

  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage)
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  const statusLabel = (s: Order["status"]) => (
    s === "in_progress" ? t("In Progress") :
      s === "waiting_parts" ? t("Waiting Parts") :
        s === "completed" ? t("Completed") :
          s === "delivered" ? t("Delivered") :
            s === "cancelled" ? t("Cancelled") :
              t("Pending")
  )

  const exportCSV = () => {
    const headers = [t("Order ID"), t("Customer"), t("Phone"), t("Device"), t("Issue"), t("Status"), t("Technician"), t("Created"), t("Price")]
    const rows = filteredOrders.map(o => [
      o.orderId,
      o.customerName,
      o.customerPhone,
      `"${o.brand} ${o.model}"`, // Quote to handle commas
      `"${o.issue}"`,
      o.status,
      o.technicianName || t("Unassigned"),
      o.createdAt?.seconds ? new Date(o.createdAt.seconds * 1000).toISOString() : "",
      o.price || ""
    ])

    const csvContent = "data:text/csv;charset=utf-8,"
      + headers.join(",") + "\n"
      + rows.map(e => e.join(",")).join("\n")

    const encodedUri = encodeURI(csvContent)
    const link = document.createElement("a")
    link.setAttribute("href", encodedUri)
    link.setAttribute("download", `orders_export_${new Date().toISOString().slice(0, 10)}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
  const handleApproveProposal = async (order: Order) => {
    try {
      if (isMockMode) {
        setOrders(prev => prev.map(o => o.id === order.id ? ({
          ...o,
          ...(o as any),
          approvedPrice: (o as any).proposedPrice ?? null,
          approvedDurationMinutes: (o as any).proposedDurationMinutes ?? null,
          approvedByAdminId: "mock_admin",
          approvedAt: new Date().toISOString(),
          pricingStatus: "approved",
        }) : o))
        toast({ title: t("Proposal approved"), description: order.orderId })
        return
      }
      const uid = auth.currentUser?.uid || ""
      await approveOrderPricing(order.id, uid)
      toast({ title: t("Proposal approved"), description: order.orderId })
    } catch (e: any) {
      toast({ title: t("Failed to approve"), description: e?.message || t("Please try again") })
    }
  }
  const handleRejectProposal = async (order: Order) => {
    try {
      if (isMockMode) {
        setOrders(prev => prev.map(o => o.id === order.id ? ({
          ...o,
          ...(o as any),
          pricingStatus: "rejected",
        }) : o))
        toast({ title: t("Proposal rejected"), description: order.orderId })
        return
      }
      await rejectOrderPricing(order.id)
      toast({ title: t("Proposal rejected"), description: order.orderId })
    } catch (e: any) {
      toast({ title: t("Failed to reject"), description: e?.message || t("Please try again") })
    }
  }
  const handleCounterOffer = async (order: Order) => {
    try {
      if (currentUserRole !== "super_admin") {
        toast({ title: t("Not allowed"), description: t("Only Super Admin can counter") })
        return
      }
      if (isMockMode) {
        setOrders(prev => prev.map(o => o.id === order.id ? ({
          ...o,
          ...(o as any),
          counterPrice: parseFloat(counterPrice || "0") || null,
          counterDurationMinutes: parseFloat(counterDuration || "0") || null,
          counterArrivalETA: counterETA || null,
          pricingStatus: "countered",
        }) : o))
        setCounterDialogOpen(false)
        setCounterPrice(""); setCounterDuration(""); setCounterETA(""); setCounterNote("")
        toast({ title: t("Counter saved"), description: order.orderId })
        return
      }
      const uid = auth.currentUser?.uid || ""
      await counterOfferPricing(order.id, uid, {
        counterPrice: parseFloat(counterPrice || "0") || null,
        counterDurationMinutes: parseFloat(counterDuration || "0") || null,
        counterArrivalETA: counterETA || null,
        counterNote,
      })
      setCounterDialogOpen(false)
      setCounterPrice(""); setCounterDuration(""); setCounterETA(""); setCounterNote("")
      toast({ title: t("Counter saved"), description: order.orderId })
    } catch (e: any) {
      toast({ title: t("Failed to counter"), description: e?.message || t("Please try again") })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-white">{t("Orders Management")}</h1>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}>
            <FileDown className="mr-2 h-4 w-4" /> {t("Export CSV")}
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" /> {t("New Order")}
          </Button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-white/50" />
          <Input
            placeholder={t("Search orders...")}
            className="pl-9 bg-white/5 border-white/10 text-white"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-white/5 border-white/10 text-white hover:bg-white/10 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/30 outline-none rounded-lg">
            <SelectValue placeholder={t("Filter by status")} />
          </SelectTrigger>
          <SelectContent className="bg-zinc-900 border-white/10 text-white">
            <SelectItem value="all">{t("All")}</SelectItem>
            <SelectItem value="pending">{t("Pending")}</SelectItem>
            <SelectItem value="in_progress">{t("In Progress")}</SelectItem>
            <SelectItem value="waiting_parts">{t("Waiting Parts")}</SelectItem>
            <SelectItem value="completed">{t("Completed")}</SelectItem>
            <SelectItem value="delivered">{t("Delivered")}</SelectItem>
            <SelectItem value="cancelled">{t("Cancelled")}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-md border border-white/10 bg-white/5 overflow-hidden">
        <Table>
          <TableHeader className="bg-white/5">
            <TableRow className="border-white/10 hover:bg-white/5">
              <TableHead className="text-white">{t("Order ID")}</TableHead>
              <TableHead className="text-white">{t("Customer")}</TableHead>
              <TableHead className="text-white">{t("Device")}</TableHead>
              <TableHead className="text-white">{t("Issue")}</TableHead>
              <TableHead className="text-white">{t("Status")}</TableHead>
              <TableHead className="text-white">{t("Technician")}</TableHead>
              <TableHead className="text-white">{t("Created")}</TableHead>
              <TableHead className="text-white text-right">{t("Actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-white/50">
                  {t("No orders found")}
                </TableCell>
              </TableRow>
            ) : (
              paginatedOrders.map((order) => (
                <TableRow key={order.id} className="border-white/10 hover:bg-white/5">
                  <TableCell className="font-medium text-white">{order.orderId}</TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="text-white">{order.customerName}</span>
                      <span className="text-xs text-white/50">{order.customerPhone}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-white">
                    {order.brand} {order.model}
                  </TableCell>
                  <TableCell className="text-white">{order.issue}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className={cn("capitalize", statusColors[order.status as keyof typeof statusColors])}>
                      {statusLabel(order.status)}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-white">
                    {order.technicianName ? (
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3 text-cyan-400" />
                        <span>{order.technicianName}</span>
                      </div>
                    ) : (
                      <span className="text-white/30 italic">{t("Unassigned")}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-white/60">
                    {order.createdAt?.seconds ? formatDistanceToNow(new Date(order.createdAt.seconds * 1000), { addSuffix: true }) : t("Just now")}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0 text-white/70 hover:text-white">
                          <span className="sr-only">{t("Open menu")}</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-zinc-900 border-zinc-800 text-white">
                        <DropdownMenuLabel>{t("Actions")}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => { setSelectedOrder(order); setIsDetailsOpen(true) }}>
                          <Eye className="mr-2 h-4 w-4" /> {t("View Details")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuLabel>{t("Update Status")}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "in_progress")}>
                          <Clock className="mr-2 h-4 w-4" /> {t("In Progress")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleStatusUpdate(order.id, "completed")}>
                          <CheckCircle className="mr-2 h-4 w-4" /> {t("Completed")}
                        </DropdownMenuItem>
                        {((order as any).pricingStatus === "proposed" && currentUserRole === "super_admin") && (
                          <>
                            <DropdownMenuSeparator className="bg-zinc-800" />
                            <DropdownMenuLabel>{t("Pricing Proposal")}</DropdownMenuLabel>
                            <DropdownMenuItem onClick={() => handleApproveProposal(order)}>
                              <CheckCircle className="mr-2 h-4 w-4" /> {t("Approve Proposal")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleRejectProposal(order)}>
                              <AlertTriangle className="mr-2 h-4 w-4" /> {t("Reject Proposal")}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => { setSelectedOrder(order); setCounterDialogOpen(true) }}>
                              <AlertTriangle className="mr-2 h-4 w-4" /> {t("Counter Offer")}
                            </DropdownMenuItem>
                          </>
                        )}
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuLabel>{t("Assign Technician")}</DropdownMenuLabel>
                        {technicians.map(tech => (
                          <DropdownMenuItem key={tech.id} onClick={() => handleAssignTech(order.id, tech.id)}>
                            <User className="mr-2 h-4 w-4" /> {tech.name}
                          </DropdownMenuItem>
                        ))}
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuLabel>{t("Notify Customer")}</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleWhatsAppNotify(order, "confirmation")}>
                          <MessageCircle className="mr-2 h-4 w-4" /> {t("Order Received")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleWhatsAppNotify(order, "assigned")}>
                          <MessageCircle className="mr-2 h-4 w-4" /> {t("Technician Assigned")}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleWhatsAppNotify(order, "complete")}>
                          <MessageCircle className="mr-2 h-4 w-4" /> {t("Repair Complete")}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-zinc-800" />
                        <DropdownMenuItem className="text-red-500 hover:text-red-400" onClick={() => handleDelete(order.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> {t("Delete Order")}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-end gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
          >
            {t("Previous")}
          </Button>
          <span className="text-sm text-white/50">
            {t("Page")} {currentPage} {t("of")} {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="bg-white/5 border-white/10 hover:bg-white/10 text-white"
          >
            {t("Next")}
          </Button>
        </div>
      )}

      {/* Order Details Modal */}
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{t("Order Details")}: {selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-white/50 mb-1">{t("Customer")}</h4>
                  <p className="font-semibold">{selectedOrder.customerName}</p>
                  <p className="text-sm text-white/70">{selectedOrder.customerPhone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white/50 mb-1">{t("Device")}</h4>
                  <p className="font-semibold">{selectedOrder.brand} {selectedOrder.model}</p>
                  <p className="text-sm text-white/70">{selectedOrder.deviceType}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-white/50 mb-1">{t("Issue")}</h4>
                  <p className="font-semibold">{selectedOrder.issue}</p>
                </div>
                  <div>
                    <h4 className="text-sm font-medium text-white/50 mb-1">{t("Status")}</h4>
                    <Badge variant="outline" className={cn("capitalize", statusColors[selectedOrder.status as keyof typeof statusColors])}>
                      {selectedOrder.status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>

                {((selectedOrder as any).pricingStatus) && (
                  <div className="mt-4 grid grid-cols-2 gap-4 p-3 rounded border border-white/10 bg-white/5">
                    <div>
                      <h4 className="text-sm font-medium text-white/50 mb-1">{t("Pricing Status")}</h4>
                      <p className="font-semibold">{(selectedOrder as any).pricingStatus}</p>
                    </div>
                    {(selectedOrder as any).proposedPrice && (
                      <div>
                        <h4 className="text-sm font-medium text-white/50 mb-1">{t("Proposed Price")}</h4>
                        <p className="font-semibold">AED {(selectedOrder as any).proposedPrice}</p>
                      </div>
                    )}
                    {(selectedOrder as any).proposedPriceMin && (
                      <div>
                        <h4 className="text-sm font-medium text-white/50 mb-1">{t("Proposed Range")}</h4>
                        <p className="font-semibold">AED {(selectedOrder as any).proposedPriceMin} - {(selectedOrder as any).proposedPriceMax}</p>
                      </div>
                    )}
                    {(selectedOrder as any).proposedBreakdown && (
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-white/50 mb-1">{t("Breakdown")}</h4>
                        <div className="text-white/80 text-sm">
                          {t("Labor")}: {((selectedOrder as any).proposedBreakdown.labor || 0)} • {t("Parts")}: {((selectedOrder as any).proposedBreakdown.parts || 0)} • {t("Inspection")}: {((selectedOrder as any).proposedBreakdown.inspection || 0)}
                        </div>
                      </div>
                    )}
                    {(selectedOrder as any).proposalMediaUrls?.length > 0 && (
                      <div className="col-span-2 grid grid-cols-3 gap-2">
                        {((selectedOrder as any).proposalMediaUrls || []).map((u: string, i: number) => (
                          <a key={i} href={u} target="_blank" rel="noreferrer" className="block aspect-square rounded border border-white/10 overflow-hidden">
                            <img src={u} alt="media" className="w-full h-full object-cover" />
                          </a>
                        ))}
                      </div>
                    )}
                    {(selectedOrder as any).proposedDurationMinutes && (
                      <div>
                        <h4 className="text-sm font-medium text-white/50 mb-1">{t("Proposed Duration")}</h4>
                        <p className="font-semibold">{(selectedOrder as any).proposedDurationMinutes} {t("minutes")}</p>
                      </div>
                    )}
                    {((selectedOrder as any).proposedExpiresAt) && (
                      <div>
                        <h4 className="text-sm font-medium text-white/50 mb-1">{t("Proposal Expires")}</h4>
                        <p className="font-semibold">
                          {(() => {
                            const v = (selectedOrder as any).proposedExpiresAt
                            const d = v?.toDate?.() ? v.toDate() : (typeof v === "string" ? new Date(v) : null)
                            return d ? d.toLocaleString() : t("N/A")
                          })()}
                        </p>
                      </div>
                    )}
                    <div className="col-span-2">
                      <h4 className="text-sm font-medium text-white/50 mb-1">{t("Approval Tier")}</h4>
                      <p className="font-semibold">
                        {(() => {
                          const data: any = selectedOrder
                          const total = data?.proposedBreakdown
                            ? Number(data.proposedBreakdown.labor || 0) + Number(data.proposedBreakdown.parts || 0) + Number(data.proposedBreakdown.inspection || 0)
                            : (data?.proposedPriceMax ?? data?.proposedPriceMin ?? data?.proposedPrice ?? null)
                          if (total == null) return t("Unknown")
                          if (total < 200) return t("Auto-approve recommended (<200 AED)")
                          if (total <= 500) return t("Admin review (200–500 AED)")
                          return t("Super Admin review (>500 AED)")
                        })()}
                      </p>
                    </div>
                    {(selectedOrder as any).proposalNote && (
                      <div className="col-span-2">
                        <h4 className="text-sm font-medium text-white/50 mb-1">{t("Technician Note")}</h4>
                        <p className="text-white/80">{(selectedOrder as any).proposalNote}</p>
                      </div>
                    )}
                    {((selectedOrder as any).pricingStatus === "proposed" && currentUserRole === "super_admin") && (
                      <div className="col-span-2 flex gap-2">
                        <Button onClick={() => handleApproveProposal(selectedOrder)} className="bg-green-600 text-white">{t("Approve Proposal")}</Button>
                        <Button variant="outline" onClick={() => handleRejectProposal(selectedOrder)}>{t("Reject Proposal")}</Button>
                        <Button variant="outline" onClick={() => setCounterDialogOpen(true)}>{t("Counter Offer")}</Button>
                      </div>
                    )}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="text-sm font-medium text-white/50 mb-1">{t("ETA (minutes)")}</h4>
                    <div className="flex gap-2">
                      <Input
                      type="number"
                      value={etaMinutes}
                      onChange={(e) => setEtaMinutes(e.target.value)}
                      className="bg-white/5 border-white/10 text-white"
                    />
                    <Button onClick={handleEtaUpdate} className="bg-cyan-500 hover:bg-cyan-400 text-black">
                      {t("Save")}
                    </Button>
                  </div>
                </div>
                <div>
                  {selectedOrder.estimatedCompletion && (
                    <div className="p-3 rounded border flex items-center gap-3 transition-colors border-white/10 bg-white/5">
                      <Clock className="w-5 h-5 text-cyan-500" />
                      <div>
                        <p className="text-xs text-white/60">{t("Remaining Time")}</p>
                        <p className="text-sm font-mono text-white">
                          {new Date(selectedOrder.estimatedCompletion).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Timeline */}
              <div className="mt-6 pt-6 border-t border-white/10">
                <h4 className="text-sm font-medium text-white/50 mb-4">{t("Order Timeline")}</h4>
                <div className="space-y-0 relative">
                  {/* Vertical Line */}
                  <div className="absolute left-2.5 top-2 bottom-4 w-0.5 bg-zinc-800" />

                  {(() => {
                    const steps = [
                      { id: "pending", label: t("Order Placed"), description: t("Order has been created") },
                      { id: "in_progress", label: t("In Repair"), description: t("Technician is working on the device") },
                      { id: "completed", label: t("Repair Completed"), description: t("Device is fixed and ready") },
                      { id: "delivered", label: t("Delivered"), description: t("Device returned to customer") }
                    ]

                    // Determine current step index
                    let currentStepIndex = 0
                    if (selectedOrder.status === "delivered") currentStepIndex = 3
                    else if (selectedOrder.status === "completed") currentStepIndex = 2
                    else if (selectedOrder.status === "in_progress" || selectedOrder.status === "waiting_parts") currentStepIndex = 1
                    else currentStepIndex = 0

                    if (selectedOrder.status === "cancelled") {
                      return (
                        <div className="relative flex gap-4 pb-6">
                          <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 ring-4 ring-zinc-950">
                            <AlertTriangle className="h-3 w-3 text-white" />
                          </div>
                          <div className="flex flex-col">
                            <p className="text-sm font-medium text-red-500">{t("Order Cancelled")}</p>
                            <p className="text-xs text-white/50">{t("This order has been cancelled.")}</p>
                          </div>
                        </div>
                      )
                    }

                    return steps.map((step, index) => {
                      const isCompleted = index < currentStepIndex
                      const isCurrent = index === currentStepIndex
                      const isFuture = index > currentStepIndex

                      // Find relevant history item if completed or current
                      // This is a heuristic matching
                      const historyItem = selectedOrder.statusHistory?.find(h => {
                        if (step.id === "pending") return h.status === "pending"
                        if (step.id === "in_progress") return h.status === "in_progress" || h.status === "waiting_parts"
                        if (step.id === "completed") return h.status === "completed"
                        if (step.id === "delivered") return h.status === "delivered"
                        return false
                      })

                      return (
                        <div key={step.id} className={cn("relative flex gap-4 pb-8 last:pb-0", isFuture && "opacity-40")}>
                          <div className={cn(
                            "relative z-10 flex h-6 w-6 items-center justify-center rounded-full ring-4 ring-zinc-950 transition-colors",
                            isCompleted ? "bg-cyan-500 text-black" :
                              isCurrent ? "bg-cyan-500 ring-cyan-500/20 animate-pulse text-black" :
                                "bg-zinc-800 text-white/30"
                          )}>
                            {isCompleted ? <CheckCircle className="h-3 w-3" /> :
                              isCurrent ? <Clock className="h-3 w-3" /> :
                                <div className="h-2 w-2 rounded-full bg-current" />}
                          </div>
                          <div className="flex flex-col -mt-1">
                            <p className={cn("text-sm font-medium", isCurrent ? "text-cyan-400" : "text-white")}>
                              {step.label}
                            </p>
                            <p className="text-xs text-white/50">{step.description}</p>
                            {(isCompleted || isCurrent) && historyItem?.timestamp && (
                              <p className="text-[10px] text-white/30 mt-1">
                                {new Date(historyItem.timestamp.seconds * 1000).toLocaleString()}
                              </p>
                            )}
                          </div>
                        </div>
                      )
                    })
                  })()}
                </div>

                {/* Detailed History Log (Collapsible or Separate) */}
                {selectedOrder.statusHistory && selectedOrder.statusHistory.length > 0 && (
                  <div className="mt-6 pt-4 border-t border-white/5">
                    <h5 className="text-xs font-medium text-white/40 mb-3 uppercase tracking-wider">{t("Detailed History")}</h5>
                    <div className="space-y-3 pl-2 border-l border-white/5">
                      {selectedOrder.statusHistory.slice().reverse().map((h, i) => (
                        <div key={i} className="pl-4 relative">
                          <div className="absolute left-[-5px] top-1.5 h-2 w-2 rounded-full bg-white/10" />
                          <p className="text-xs text-white/70">{h.note || h.status}</p>
                          <p className="text-[10px] text-white/30">
                            {h.timestamp?.seconds ? new Date(h.timestamp.seconds * 1000).toLocaleString() : t("Just now")}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <div className="mt-6 pt-6 border-t border-white/10">
                  <h4 className="text-sm font-medium text-white/50 mb-4">{t("Invoice")}</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Button onClick={openInvoicePreview} className="bg-cyan-500 text-black" disabled={invoiceFinalized || (selectedOrder as any).invoice?.status === "finalized"}>{t("Generate Final Invoice")}</Button>
                        <Button variant="outline" onClick={() => setInvoiceDialogOpen(true)}>{t("Preview Invoice")}</Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => window.print()}>{t("Print Invoice")}</Button>
                        <Button variant="outline" onClick={() => window.print()}>{t("Download as PDF")}</Button>
                      </div>
                      <div className="flex gap-2">
                        <Button variant="outline" onClick={() => {
                          const price = (selectedOrder as any)?.invoice?.total || (selectedOrder as any)?.totalCost || selectedOrder.price || 0
                          const msgEn = `Your repair is completed. Final amount: AED ${price}. Please find your invoice attached. Thank you for choosing KBI.`
                          const msgAr = `تم الانتهاء من صيانة جهازك. المبلغ النهائي: ${price} درهم. تجد الفاتورة مرفقة. شكرًا لاختيارك KBI.`
                          const text = `${msgEn}\n\n${msgAr}`
                          if (selectedOrder.customerPhone) {
                            openWhatsApp(selectedOrder.customerPhone, text)
                            toast({ title: t("WhatsApp opened"), description: t("Invoice sent to customer") })
                          } else {
                            toast({ title: t("No phone number available"), description: t("Add customer phone to order") })
                          }
                        }}>{t("Resend to Customer")}</Button>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="grid grid-cols-2 gap-2">
                        <Input placeholder={t("Discount")} value={invoiceDiscount} onChange={(e) => setInvoiceDiscount(e.target.value)} className="bg-white/5 border-white/10 text-white" disabled={invoiceFinalized || (selectedOrder as any).invoice?.status === "finalized"} />
                        <Input placeholder={t("Warranty Period")} value={warrantyPeriod} onChange={(e) => setWarrantyPeriod(e.target.value)} className="bg-white/5 border-white/10 text-white" disabled={invoiceFinalized || (selectedOrder as any).invoice?.status === "finalized"} />
                        <div className="flex items-center gap-2">
                          <input type="checkbox" checked={vatEnabled} onChange={(e) => setVatEnabled(e.target.checked)} disabled={invoiceFinalized || (selectedOrder as any).invoice?.status === "finalized"} />
                          <span className="text-sm text-white">{t("VAT Enabled")}</span>
                        </div>
                        <Input placeholder={t("VAT Rate")} value={vatRate} onChange={(e) => setVatRate(e.target.value)} className="bg-white/5 border-white/10 text-white" disabled={invoiceFinalized || (selectedOrder as any).invoice?.status === "finalized"} />
                      </div>
                      <Input placeholder={t("Disclaimer")} value={disclaimerText} onChange={(e) => setDisclaimerText(e.target.value)} className="bg-white/5 border-white/10 text-white" disabled={invoiceFinalized || (selectedOrder as any).invoice?.status === "finalized"} />
                      <Input placeholder={t("Admin Notes")} value={adminNotesInvoice} onChange={(e) => setAdminNotesInvoice(e.target.value)} className="bg-white/5 border-white/10 text-white" disabled={invoiceFinalized || (selectedOrder as any).invoice?.status === "finalized"} />
                      <div className="grid grid-cols-3 gap-2">
                        <Button variant={invoiceLang === "en" ? "default" : "outline"} onClick={() => setInvoiceLang("en")} disabled={invoiceFinalized || (selectedOrder as any).invoice?.status === "finalized"}>{t("English")}</Button>
                        <Button variant={invoiceLang === "ar" ? "default" : "outline"} onClick={() => setInvoiceLang("ar")} disabled={invoiceFinalized || (selectedOrder as any).invoice?.status === "finalized"}>{t("Arabic")}</Button>
                        <Button variant={invoiceLang === "both" ? "default" : "outline"} onClick={() => setInvoiceLang("both")} disabled={invoiceFinalized || (selectedOrder as any).invoice?.status === "finalized"}>{t("EN + AR")}</Button>
                      </div>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-2">
                    <Badge variant="outline" className="text-white/70">{t("Invoice Status")}: {((selectedOrder as any).invoice?.status || (invoiceFinalized ? "finalized" : "draft"))}</Badge>
                    <Button onClick={finalizeInvoice} className="bg-green-600 text-white" disabled={invoiceFinalized || (selectedOrder as any).invoice?.status === "finalized"}>{t("Finalize Invoice")}</Button>
                    <Input placeholder={t("Override reason")} value={overrideReason} onChange={(e) => setOverrideReason(e.target.value)} className="bg-white/5 border-white/10 text-white max-w-xs" />
                    <Button variant="outline" onClick={overrideInvoice}>{t("Override Edit")}</Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Dialog open={invoiceDialogOpen} onOpenChange={setInvoiceDialogOpen}>
        <DialogContent className="bg-white text-black sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>{t("Invoice Preview")}</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="max-h-[70vh] overflow-auto">
              <FinalInvoice
                order={selectedOrder}
                items={getInvoiceItemsForOrder(selectedOrder)}
                invoiceNumber={invoiceNumber}
                invoiceDate={new Date().toISOString()}
                language={invoiceLang}
                discount={Number(invoiceDiscount || 0)}
                vatEnabled={vatEnabled}
                vatRate={Number(vatRate || 0)}
                warrantyPeriod={warrantyPeriod}
                adminNotes={adminNotesInvoice}
                disclaimerText={disclaimerText}
              />
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => window.print()}>{t("Print Invoice")}</Button>
            <Button onClick={finalizeInvoice}>{t("Finalize Invoice")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={counterDialogOpen} onOpenChange={setCounterDialogOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{t("Counter Offer")}: {selectedOrder?.orderId}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3">
            <Input type="number" placeholder={t("Counter Price (AED)")} value={counterPrice} onChange={(e) => setCounterPrice(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            <Input type="number" placeholder={t("Counter Duration (minutes)")} value={counterDuration} onChange={(e) => setCounterDuration(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            <Input type="text" placeholder={t("Arrival ETA")} value={counterETA} onChange={(e) => setCounterETA(e.target.value)} className="bg-white/5 border-white/10 text-white" />
            <Input type="text" placeholder={t("Note")} value={counterNote} onChange={(e) => setCounterNote(e.target.value)} className="bg-white/5 border-white/10 text-white" />
          </div>
          <DialogFooter>
            <Button onClick={() => selectedOrder && handleCounterOffer(selectedOrder)}>{t("Save Counter")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
