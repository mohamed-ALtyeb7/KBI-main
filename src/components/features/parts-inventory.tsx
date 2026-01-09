"use client"

import { useEffect, useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/components/ui/dialog"
import {
    Search,
    Plus,
    Package,
    AlertTriangle,
    Edit,
    Trash2,
    Filter,
    Download,
    ArrowUpDown,
    CheckCircle,
    QrCode
} from "lucide-react"
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, Timestamp, query, orderBy, where, arrayUnion } from "firebase/firestore"
import { db, auth, isMockMode } from "@/lib/firebaseConfig"
import { cn } from "@/lib/utils"
import { exportInventoryCSV } from "@/lib/exportService"

interface Part {
    id: string
    name: string
    sku: string
    category: string
    brand: string
    compatibleDevices: string[]
    quantity: number
    minStock: number
    price: number
    cost: number
    location: string
    supplier: string
    description: string
    createdAt: any
    updatedAt: any
}

interface Supplier {
    id: string
    name: string
    phone: string
    email?: string
    partsIds?: string[]
}

const CATEGORIES = [
    "Screens",
    "Batteries",
    "Charging Ports",
    "Speakers",
    "Cameras",
    "Motherboards",
    "Flex Cables",
    "Buttons",
    "Housings",
    "Tools",
    "Adhesives",
    "Other"
]

const BRANDS = [
    "Apple",
    "Samsung",
    "Huawei",
    "Xiaomi",
    "OnePlus",
    "Google",
    "Sony",
    "LG",
    "Universal",
    "Other"
]

type InventoryStats = { totalParts: number; totalValue: number; lowStockCount: number; outOfStockCount: number }
type Movement = { id?: string; partId: string; type: "IN" | "OUT"; quantity: number; reason: "repair" | "adjustment" | "purchase"; orderId?: string | null; userId: string; createdAt: any }

export function PartsInventory({ isAdmin = true, onStatsUpdate }: { isAdmin?: boolean; onStatsUpdate?: (stats: InventoryStats) => void }) {
    const [parts, setParts] = useState<Part[]>([])
    const [suppliers, setSuppliers] = useState<Supplier[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState("")
    const [categoryFilter, setCategoryFilter] = useState("all")
    const [brandFilter, setBrandFilter] = useState("all")
    const [stockFilter, setStockFilter] = useState<"all" | "low" | "out">("all")
    const [sortBy, setSortBy] = useState<"name" | "quantity" | "category">("name")
    const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
    const [editingPart, setEditingPart] = useState<Part | null>(null)
    const [dialogTab, setDialogTab] = useState<"details" | "history">("details")
    const [movements, setMovements] = useState<Movement[]>([])
    const [currentPartMovements, setCurrentPartMovements] = useState<Movement[]>([])
    const [qrPart, setQrPart] = useState<Part | null>(null)
    const [isQrOpen, setIsQrOpen] = useState(false)

    // Form state
    const [formData, setFormData] = useState({
        name: "",
        sku: "",
        category: "Screens",
        brand: "Apple",
        compatibleDevices: "",
        quantity: 0,
        minStock: 5,
        price: 0,
        cost: 0,
        location: "",
        supplier: "",
        description: ""
    })

    useEffect(() => {
        if (isMockMode) {
            setParts([])
            setLoading(false)
            onStatsUpdate?.({ totalParts: 0, totalValue: 0, lowStockCount: 0, outOfStockCount: 0 })
            return
        }
        const q = query(collection(db, "parts"), orderBy("name", "asc"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const data = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Part[]
            setParts(data)
            setLoading(false)
            const totalParts = data.length
            const totalValue = data.reduce((sum, p) => sum + (p.quantity * p.cost), 0)
            const lowStockCount = data.filter(p => p.quantity <= p.minStock && p.quantity > 0).length
            const outOfStockCount = data.filter(p => p.quantity === 0).length
            onStatsUpdate?.({ totalParts, totalValue, lowStockCount, outOfStockCount })
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        if (isMockMode) {
            setSuppliers((prev) => prev.length ? prev : [
                { id: "mock-s1", name: "Default Supplier", phone: "971500000000", email: "supplier@example.com", partsIds: [] }
            ])
            return
        }
        const unsub = onSnapshot(collection(db, "suppliers"), (snap) => {
            const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Supplier[]
            setSuppliers(data)
        })
        return () => unsub()
    }, [])

    useEffect(() => {
        let unsub: any
        if (isAddDialogOpen && editingPart) {
            if (isMockMode) {
                const filtered = movements
                    .filter(m => m.partId === editingPart.id)
                    .sort((a, b) => {
                        const aTime = a.createdAt?.seconds ?? 0
                        const bTime = b.createdAt?.seconds ?? 0
                        return bTime - aTime
                    })
                setCurrentPartMovements(filtered)
            } else {
                const q = query(
                    collection(db, "stock_movements"),
                    where("partId", "==", editingPart.id),
                    orderBy("createdAt", "desc")
                )
                unsub = onSnapshot(q, (snapshot) => {
                    const data = snapshot.docs.map(d => ({
                        id: d.id,
                        ...d.data()
                    })) as Movement[]
                    setCurrentPartMovements(data)
                })
            }
        } else {
            setCurrentPartMovements([])
        }
        return () => {
            if (typeof unsub === "function") unsub()
        }
    }, [isAddDialogOpen, editingPart, isMockMode, movements])

    const filteredParts = parts.filter(part => {
        const matchesSearch = search === "" ||
            part.name.toLowerCase().includes(search.toLowerCase()) ||
            part.sku.toLowerCase().includes(search.toLowerCase()) ||
            part.brand.toLowerCase().includes(search.toLowerCase())

        const matchesCategory = categoryFilter === "all" || part.category === categoryFilter
        const matchesBrand = brandFilter === "all" || part.brand === brandFilter

        const matchesStock =
            stockFilter === "all" ? true :
                stockFilter === "low" ? part.quantity <= part.minStock && part.quantity > 0 :
                    stockFilter === "out" ? part.quantity === 0 : true

        return matchesSearch && matchesCategory && matchesBrand && matchesStock
    }).sort((a, b) => {
        if (sortBy === "name") return a.name.localeCompare(b.name)
        if (sortBy === "quantity") return a.quantity - b.quantity
        if (sortBy === "category") return a.category.localeCompare(b.category)
        return 0
    })

    const handleAddPart = async () => {
        if (!formData.name.trim()) return

        const newPart = {
            ...formData,
            compatibleDevices: formData.compatibleDevices.split(",").map(d => d.trim()).filter(Boolean),
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        }

        if (editingPart) {
            await updateDoc(doc(db, "parts", editingPart.id), {
                ...newPart,
                updatedAt: Timestamp.now()
            })
            const delta = newPart.quantity - editingPart.quantity
            if (delta !== 0) {
                const m = {
                    partId: editingPart.id,
                    type: delta > 0 ? "IN" as const : "OUT" as const,
                    quantity: Math.abs(delta),
                    reason: "adjustment" as const,
                    orderId: null,
                    userId: auth.currentUser?.uid || "system",
                    createdAt: Timestamp.now()
                }
                if (isMockMode) {
                    setMovements(prev => [m, ...prev])
                } else {
                    await addDoc(collection(db, "stock_movements"), m)
                }
            }
            if (newPart.supplier) {
                const supId = newPart.supplier
                try {
                    if (isMockMode) {
                        setSuppliers(prev => prev.map(s => s.id === supId ? { ...s, partsIds: Array.from(new Set([...(s.partsIds || []), editingPart.id])) } : s))
                    } else {
                        await updateDoc(doc(db, "suppliers", supId), { partsIds: arrayUnion(editingPart.id) })
                    }
                } catch { /* noop */ }
            }
        } else {
            const ref = await addDoc(collection(db, "parts"), newPart)
            if (newPart.quantity > 0) {
                const m = {
                    partId: ref.id,
                    type: "IN" as const,
                    quantity: newPart.quantity,
                    reason: "purchase" as const,
                    orderId: null,
                    userId: auth.currentUser?.uid || "system",
                    createdAt: Timestamp.now()
                }
                if (isMockMode) {
                    setMovements(prev => [m, ...prev])
                } else {
                    await addDoc(collection(db, "stock_movements"), m)
                }
            }
            if (newPart.supplier) {
                const supId = newPart.supplier
                try {
                    if (isMockMode) {
                        setSuppliers(prev => prev.map(s => s.id === supId ? { ...s, partsIds: Array.from(new Set([...(s.partsIds || []), ref.id])) } : s))
                    } else {
                        await updateDoc(doc(db, "suppliers", supId), { partsIds: arrayUnion(ref.id) })
                    }
                } catch { /* noop */ }
            }
        }

        resetForm()
        setIsAddDialogOpen(false)
        setEditingPart(null)
    }

    const handleEdit = (part: Part) => {
        setFormData({
            name: part.name,
            sku: part.sku,
            category: part.category,
            brand: part.brand,
            compatibleDevices: part.compatibleDevices.join(", "),
            quantity: part.quantity,
            minStock: part.minStock,
            price: part.price,
            cost: part.cost,
            location: part.location,
            supplier: part.supplier,
            description: part.description
        })
        setEditingPart(part)
        setDialogTab("details")
        setIsAddDialogOpen(true)
    }

    const handleDelete = async (id: string) => {
        if (confirm("Delete this part?")) {
            await deleteDoc(doc(db, "parts", id))
        }
    }

    const handleUpdateQuantity = async (id: string, delta: number) => {
        const part = parts.find(p => p.id === id)
        if (!part) return
        const newQty = Math.max(0, part.quantity + delta)
        await updateDoc(doc(db, "parts", id), {
            quantity: newQty,
            updatedAt: Timestamp.now()
        })
        if (delta !== 0) {
            const m = {
                partId: id,
                type: delta > 0 ? "IN" as const : "OUT" as const,
                quantity: Math.abs(delta),
                reason: delta > 0 ? "purchase" as const : "repair" as const,
                orderId: null,
                userId: auth.currentUser?.uid || "system",
                createdAt: Timestamp.now()
            }
            if (isMockMode) {
                setMovements(prev => [m, ...prev])
            } else {
                await addDoc(collection(db, "stock_movements"), m)
            }
        }
    }

    const resetForm = () => {
        setFormData({
            name: "",
            sku: "",
            category: "Screens",
            brand: "Apple",
            compatibleDevices: "",
            quantity: 0,
            minStock: 5,
            price: 0,
            cost: 0,
            location: "",
            supplier: "",
            description: ""
        })
    }

    const getStockStatus = (part: Part) => {
        if (part.quantity === 0) return { color: "bg-red-500/20 text-red-400", label: "Out of Stock" }
        if (part.quantity <= part.minStock) return { color: "bg-yellow-500/20 text-yellow-400", label: "Low Stock" }
        return { color: "bg-green-500/20 text-green-400", label: "In Stock" }
    }

    const isSuperAdmin = useMemo(() => {
        const localRole = typeof window !== "undefined" ? window.localStorage.getItem("mock_admin_role") : null
        if (localRole === "super") return true
        const email = auth.currentUser?.email?.toLowerCase() || ""
        return email.includes("super") || email.includes("founder")
    }, [])

    const getMarginInfo = (part: Part) => {
        const profit = (part.price || 0) - (part.cost || 0)
        const margin = part.cost > 0 ? (profit / part.cost) * 100 : 0
        let color = "bg-green-500/20 text-green-400"
        if (margin < 15) color = "bg-red-500/20 text-red-400"
        else if (margin >= 15 && margin <= 30) color = "bg-yellow-500/20 text-yellow-400"
        return { profit, margin, color }
    }

    // Stats
    const totalParts = parts.length
    const totalValue = parts.reduce((sum, p) => sum + (p.quantity * p.cost), 0)
    const lowStockCount = parts.filter(p => p.quantity <= p.minStock && p.quantity > 0).length
    const outOfStockCount = parts.filter(p => p.quantity === 0).length

    if (loading) {
        return (
            <Card className="bg-white/5 border-white/10">
                <CardContent className="p-8 text-center text-white/50">
                    Loading inventory...
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-cyan-500/20 rounded-lg">
                                <Package className="w-5 h-5 text-cyan-400" />
                            </div>
                            <div>
                                <p className="text-sm text-white/60">Total Parts</p>
                                <p className="text-2xl font-bold text-white">{totalParts}</p>
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
                                <p className="text-sm text-white/60">Inventory Value</p>
                                <p className="text-2xl font-bold text-white">{totalValue.toLocaleString()} AED</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="bg-white/5 border-white/10">
                    <CardContent className="pt-6">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-500/20 rounded-lg">
                                <AlertTriangle className="w-5 h-5 text-yellow-400" />
                            </div>
                            <div>
                                <p className="text-sm text-white/60">Low Stock</p>
                                <p className="text-2xl font-bold text-white">{lowStockCount}</p>
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
                                <p className="text-sm text-white/60">Out of Stock</p>
                                <p className="text-2xl font-bold text-white">{outOfStockCount}</p>
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
                                placeholder="Search parts by name, SKU, or brand..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-white/5 border-white/10 text-white"
                            />
                        </div>

                        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                            <SelectTrigger className="w-[150px] bg-white/5 border-white/10 text-white hover:bg-white/10 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/30 outline-none rounded-lg">
                                <SelectValue placeholder="Category" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                <SelectItem value="all">All Categories</SelectItem>
                                {CATEGORIES.map(cat => (
                                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={brandFilter} onValueChange={setBrandFilter}>
                            <SelectTrigger className="w-[130px] bg-white/5 border-white/10 text-white hover:bg-white/10 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/30 outline-none rounded-lg">
                                <SelectValue placeholder="Brand" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                <SelectItem value="all">All Brands</SelectItem>
                                {BRANDS.map(brand => (
                                    <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select value={stockFilter} onValueChange={(v) => setStockFilter(v as any)}>
                            <SelectTrigger className="w-[130px] bg-white/5 border-white/10 text-white hover:bg-white/10 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/30 outline-none rounded-lg">
                                <SelectValue placeholder="Stock" />
                            </SelectTrigger>
                            <SelectContent className="bg-zinc-900 border-white/10 text-white">
                                <SelectItem value="all">All Stock</SelectItem>
                                <SelectItem value="low">Low Stock</SelectItem>
                                <SelectItem value="out">Out of Stock</SelectItem>
                            </SelectContent>
                        </Select>

                        <Button
                            onClick={() => exportInventoryCSV(filteredParts)}
                            className="bg-white/10 hover:bg-white/20 border border-white/20 text-white"
                        >
                            <Download className="w-4 h-4 mr-2" /> Export CSV
                        </Button>

                        {isAdmin && (
                            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                                <DialogTrigger asChild>
                                    <Button onClick={() => { resetForm(); setEditingPart(null); }} className="bg-cyan-500 hover:bg-cyan-400">
                                        <Plus className="w-4 h-4 mr-2" /> Add Part
                                    </Button>
                                </DialogTrigger>
                                <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
                                    <DialogHeader>
                                        <DialogTitle>{editingPart ? "Edit Part" : "Add New Part"}</DialogTitle>
                                    </DialogHeader>
                                    {editingPart && (
                                        <div className="space-y-2 px-1">
                                            <div className="flex gap-2">
                                                <Button variant={dialogTab === "details" ? "default" : "outline"} onClick={() => setDialogTab("details")} className={dialogTab === "details" ? "bg-cyan-500 text-black hover:bg-cyan-400" : ""}>Details</Button>
                                                <Button variant={dialogTab === "history" ? "default" : "outline"} onClick={() => setDialogTab("history")} className={dialogTab === "history" ? "bg-cyan-500 text-black hover:bg-cyan-400" : ""}>Stock History</Button>
                                            </div>
                                        </div>
                                    )}
                                    {dialogTab === "history" && editingPart ? (
                                        <div className="space-y-3">
                                            {currentPartMovements.length === 0 ? (
                                                <div className="text-white/50">No stock movements for this part yet</div>
                                            ) : (
                                                currentPartMovements.map((m) => {
                                                    const dateStr =
                                                        m.createdAt?.toDate
                                                            ? m.createdAt.toDate().toLocaleString()
                                                            : new Date().toLocaleString()
                                                    return (
                                                        <div key={(m.id ?? "") + dateStr} className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/10">
                                                            <div className="flex items-center gap-3">
                                                                <Badge variant="outline" className={m.type === "IN" ? "text-xs bg-green-500/20 text-green-400 border-white/10" : "text-xs bg-red-500/20 text-red-400 border-white/10"}>
                                                                    {m.type}
                                                                </Badge>
                                                                <div className="text-white">
                                                                    {m.quantity}
                                                                </div>
                                                                <div className="text-white/70">
                                                                    {m.reason}
                                                                </div>
                                                                {m.orderId ? (
                                                                    <Badge variant="outline" className="text-xs bg-white/5 border-white/10 text-white/70">
                                                                        Order {m.orderId}
                                                                    </Badge>
                                                                ) : null}
                                                            </div>
                                                            <div className="text-right text-xs text-white/60">
                                                                <div>{dateStr}</div>
                                                                <div>{m.userId}</div>
                                                            </div>
                                                        </div>
                                                    )
                                                })
                                            )}
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-white/60">Part Name *</label>
                                                    <Input
                                                        value={formData.name}
                                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                        className="bg-white/5 border-white/10"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-white/60">SKU</label>
                                                    <Input
                                                        value={formData.sku}
                                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                                        className="bg-white/5 border-white/10"
                                                        placeholder="e.g. IP13-SCR-001"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-white/60">Category</label>
                                                    <Select value={formData.category} onValueChange={(v) => setFormData({ ...formData, category: v })}>
                                                        <SelectTrigger className="bg-white/5 border-white/10">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {CATEGORIES.map(cat => (
                                                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                                <div>
                                                    <label className="text-sm text-white/60">Brand</label>
                                                    <Select value={formData.brand} onValueChange={(v) => setFormData({ ...formData, brand: v })}>
                                                        <SelectTrigger className="bg-white/5 border-white/10">
                                                            <SelectValue />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {BRANDS.map(brand => (
                                                                <SelectItem key={brand} value={brand}>{brand}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm text-white/60">Compatible Devices (comma separated)</label>
                                                <Input
                                                    value={formData.compatibleDevices}
                                                    onChange={(e) => setFormData({ ...formData, compatibleDevices: e.target.value })}
                                                    className="bg-white/5 border-white/10"
                                                    placeholder="e.g. iPhone 13, iPhone 13 Pro"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-white/60">Quantity</label>
                                                    <Input
                                                        type="number"
                                                        value={formData.quantity}
                                                        onChange={(e) => setFormData({ ...formData, quantity: Number(e.target.value) })}
                                                        className="bg-white/5 border-white/10"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-white/60">Min Stock Alert</label>
                                                    <Input
                                                        type="number"
                                                        value={formData.minStock}
                                                        onChange={(e) => setFormData({ ...formData, minStock: Number(e.target.value) })}
                                                        className="bg-white/5 border-white/10"
                                                    />
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                {isSuperAdmin && (
                                                    <div>
                                                        <label className="text-sm text-white/60">Cost (AED)</label>
                                                        <Input
                                                            type="number"
                                                            value={formData.cost}
                                                            onChange={(e) => setFormData({ ...formData, cost: Number(e.target.value) })}
                                                            className="bg-white/5 border-white/10"
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <label className="text-sm text-white/60">Sell Price (AED)</label>
                                                    <Input
                                                            type="number"
                                                            value={formData.price}
                                                            onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                                            className="bg-white/5 border-white/10"
                                                        />
                                                    <div className="mt-1 text-xs text-white/50">
                                                        {(() => {
                                                            const tmp = { cost: formData.cost, price: formData.price } as any
                                                            const info = getMarginInfo(tmp as Part)
                                                            return `Margin: ${Number.isFinite(info.margin) ? Math.round(info.margin) : 0}%`
                                                        })()}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-sm text-white/60">Storage Location</label>
                                                    <Input
                                                        value={formData.location}
                                                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                                                        className="bg-white/5 border-white/10"
                                                        placeholder="e.g. Shelf A-1"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-sm text-white/60">Supplier</label>
                                                    <Select value={formData.supplier} onValueChange={(v) => setFormData({ ...formData, supplier: v })}>
                                                        <SelectTrigger className="bg-white/5 border-white/10">
                                                            <SelectValue placeholder="Select supplier" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            {suppliers.map(s => (
                                                                <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                            ))}
                                                        </SelectContent>
                                                    </Select>
                                                    {formData.supplier && suppliers.find(s => s.id === formData.supplier) && (
                                                        <div className="mt-2 p-2 rounded bg-white/5 border border-white/10 text-xs text-white/70">
                                                            <div>{suppliers.find(s => s.id === formData.supplier)?.name}</div>
                                                            <div>{suppliers.find(s => s.id === formData.supplier)?.phone}</div>
                                                            {suppliers.find(s => s.id === formData.supplier)?.email && (
                                                                <div>{suppliers.find(s => s.id === formData.supplier)?.email}</div>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            <div>
                                                <label className="text-sm text-white/60">Description</label>
                                                <Input
                                                    value={formData.description}
                                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                                    className="bg-white/5 border-white/10"
                                                />
                                            </div>
                                        </div>
                                    )}
                                    <DialogFooter>
                                        <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>Cancel</Button>
                                        <Button className="bg-cyan-500 hover:bg-cyan-400" onClick={handleAddPart}>
                                            {editingPart ? "Update" : "Add"} Part
                                        </Button>
                                    </DialogFooter>
                                </DialogContent>
                            </Dialog>
                        )}
                    </div>
                </CardContent>
            </Card>

            {/* Parts List */}
            <Card className="bg-white/5 border-white/10">
                <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                        <span className="flex items-center gap-2">
                            <Package className="w-5 h-5 text-cyan-400" />
                            Parts Inventory ({filteredParts.length})
                            {lowStockCount > 0 && (
                                <Badge variant="outline" className="text-xs bg-yellow-500/20 text-yellow-400 border-yellow-500/40">
                                    Low: {lowStockCount}
                                </Badge>
                            )}
                        </span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {filteredParts.length === 0 ? (
                        <div className="text-center py-8 text-white/40">
                            {parts.length === 0 ? "No parts in inventory yet" : "No parts match your filters"}
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {filteredParts.map((part) => {
                                const status = getStockStatus(part)
                                const marginInfo = getMarginInfo(part)
                                const isLow = part.quantity === 0 || part.quantity <= part.minStock
                                return (
                                    <div
                                        key={part.id}
                                        className={cn(
                                            "flex items-center gap-4 p-4 rounded-lg bg-white/5 hover:bg-white/10 transition-colors border border-white/10",
                                            isLow && (part.quantity === 0 ? "ring-2 ring-red-500/40 border-red-500/30" : "ring-2 ring-yellow-500/40 border-yellow-500/30")
                                        )}
                                    >
                                        <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center shrink-0">
                                            <Package className="w-6 h-6 text-cyan-400" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <h4 className="font-medium text-white truncate">{part.name}</h4>
                                                <Badge variant="outline" className="text-xs bg-white/5 border-white/10">
                                                    {part.sku || "No SKU"}
                                                </Badge>
                                                <Badge variant="outline" className={cn("text-xs", marginInfo.color)}>
                                                    {Number.isFinite(marginInfo.margin) ? `${Math.round(marginInfo.margin)}%` : "—"}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap gap-2 text-xs text-white/50">
                                                <span>{part.category}</span>
                                                <span>•</span>
                                                <span>{part.brand}</span>
                                                {part.location && (
                                                    <>
                                                        <span>•</span>
                                                        <span>📍 {part.location}</span>
                                                    </>
                                                )}
                                                {part.supplier && (
                                                    <>
                                                        <span>•</span>
                                                        <span>Supplier: {suppliers.find(s => s.id === part.supplier)?.name || part.supplier}</span>
                                                    </>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-4">
                                            <div className="text-right">
                                                <p className="text-lg font-bold text-white">{part.quantity}</p>
                                                <Badge className={cn("text-xs", status.color)}>{status.label}</Badge>
                                            </div>

                                            <div className="flex items-center gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleUpdateQuantity(part.id, -1)}
                                                    className="h-8 w-8 text-white/60 hover:text-white"
                                                >
                                                    -
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleUpdateQuantity(part.id, 1)}
                                                    className="h-8 w-8 text-white/60 hover:text-white"
                                                >
                                                    +
                                                </Button>
                                            </div>

                                            {isAdmin && (
                                                <div className="flex items-center gap-1">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => { setQrPart(part); setIsQrOpen(true) }}
                                                        className="h-8 w-8 text-white/60 hover:text-cyan-400"
                                                        title="View QR"
                                                    >
                                                        <QrCode className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(part)}
                                                        className="h-8 w-8 text-white/60 hover:text-cyan-400"
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(part.id)}
                                                        className="h-8 w-8 text-white/60 hover:text-red-400"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* QR Modal */}
            <Dialog open={isQrOpen} onOpenChange={setIsQrOpen}>
                <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Part QR Code</DialogTitle>
                    </DialogHeader>
                    {qrPart && (
                        <div className="space-y-3">
                            <div className="text-sm text-white/60">
                                {qrPart.name} • {qrPart.sku || "No SKU"}
                            </div>
                            <div className="flex items-center justify-center p-3 bg-white/5 rounded-lg border border-white/10">
                                <img
                                    alt="QR Code"
                                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${qrPart.id}|${qrPart.sku || ""}`)}`}
                                    className="rounded"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" onClick={() => window.print()}>Print</Button>
                                <Button variant="outline" onClick={() => handleUpdateQuantity(qrPart.id, 1)}>Scan (Add 1)</Button>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
