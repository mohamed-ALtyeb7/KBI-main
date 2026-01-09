"use client"

import { useMemo, useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { useT } from "@/components/providers/language-provider"
import { Check, Trash2, Save, RefreshCw, Plus, Package, CheckCircle, AlertTriangle, Link as LinkIcon } from "lucide-react"
import { db, isMockMode, auth } from "@/lib/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"
import { collection, onSnapshot, addDoc, deleteDoc, updateDoc, doc, query, where, writeBatch } from "firebase/firestore"
import { devices as initialDevices } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface Device {
  id: string
  name: string
  icon: string
}

interface Brand {
  id: string
  deviceId: string
  name: string
}

interface Model {
  id: string
  brandId: string
  name: string
}

interface Issue {
  id: string
  deviceId: string
  name: string
  durationMinutes: number
  recommendedParts?: string[]
}

import { ImageUpload } from "@/components/ui/image-upload"
import { PartsInventory } from "@/components/features/parts-inventory"

export default function AdminInventoryPage() {
  const t = useT()
  const [authorized, setAuthorized] = useState(false)
  const [tab, setTab] = useState<"devices" | "models" | "issues" | "parts">("parts")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<{ totalParts: number; totalValue: number; lowStockCount: number; outOfStockCount: number }>({ totalParts: 0, totalValue: 0, lowStockCount: 0, outOfStockCount: 0 })

  // Firestore Data
  const [devices, setDevices] = useState<Device[]>([])
  const [brands, setBrands] = useState<Brand[]>([])
  const [models, setModels] = useState<Model[]>([])
  const [issues, setIssues] = useState<Issue[]>([])
  const [parts, setParts] = useState<{ id: string; name: string; sku?: string; brand?: string; category?: string }[]>([])

  // UI State
  const [newDeviceName, setNewDeviceName] = useState("")
  const [newDeviceIcon, setNewDeviceIcon] = useState("") // Empty by default

  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("")
  const [selectedBrandId, setSelectedBrandId] = useState<string>("")
  const [newBrandName, setNewBrandName] = useState("")
  const [newModelName, setNewModelName] = useState("")

  const [issueDeviceId, setIssueDeviceId] = useState<string>("")
  const [newIssueName, setNewIssueName] = useState("")
  const [newIssueDuration, setNewIssueDuration] = useState<string>("30")
  const [manageIssue, setManageIssue] = useState<Issue | null>(null)
  const [isManageDialogOpen, setIsManageDialogOpen] = useState(false)
  const [partSearch, setPartSearch] = useState("")

  // Real-time Listeners
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
      const mockDevices = [{ id: "d1", name: "Smartphone", icon: "Smartphone" }]
      const mockBrands = [{ id: "b1", deviceId: "d1", name: "Apple" }]

      setDevices(mockDevices)
      setBrands(mockBrands)
      setModels([{ id: "m1", brandId: "b1", name: "iPhone 13" }])
      setIssues([{ id: "i1", deviceId: "d1", name: "Screen", durationMinutes: 30 }])
      setParts([{ id: "p1", name: "iPhone 13 Screen", sku: "IP13-SCR-001", brand: "Apple", category: "Screens" }])

      setSelectedDeviceId("d1")
      setIssueDeviceId("d1")
      setSelectedBrandId("b1")
      setLoading(false)
      return
    }

    const unsubDevices = onSnapshot(collection(db, "devices"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Device[]
      setDevices(data)
      if (data.length > 0 && !selectedDeviceId) setSelectedDeviceId(data[0].id)
      if (data.length > 0 && !issueDeviceId) setIssueDeviceId(data[0].id)
    })

    const unsubBrands = onSnapshot(collection(db, "brands"), (snap) => {
      const data = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Brand[]
      setBrands(data)
      if (data.length > 0 && !selectedBrandId) setSelectedBrandId(data[0].id)
    })

    const unsubModels = onSnapshot(collection(db, "models"), (snap) => {
      setModels(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Model[])
    })

    const unsubIssues = onSnapshot(collection(db, "issues"), (snap) => {
      setIssues(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Issue[])
      setLoading(false)
    })
    const unsubParts = onSnapshot(collection(db, "parts"), (snap) => {
      setParts(snap.docs.map(d => ({ id: d.id, ...d.data() })) as any[])
    })

    return () => {
      unsubDevices()
      unsubBrands()
      unsubModels()
      unsubIssues()
      unsubParts()
    }
  }, [])

  // Derived State
  const filteredBrands = useMemo(
    () => (selectedDeviceId === "all" || !selectedDeviceId ? brands : brands.filter(b => b.deviceId === selectedDeviceId)),
    [brands, selectedDeviceId]
  )
  const filteredModels = useMemo(() => models.filter(m => m.brandId === selectedBrandId), [models, selectedBrandId])
  const filteredIssues = useMemo(
    () => (issueDeviceId === "all" || !issueDeviceId ? issues : issues.filter(i => i.deviceId === issueDeviceId)),
    [issues, issueDeviceId]
  )
  const filteredPartsForDialog = useMemo(() => {
    const s = partSearch.trim().toLowerCase()
    const list = s
      ? parts.filter(p =>
          (p.name || "").toLowerCase().includes(s) ||
          (p.sku || "").toLowerCase().includes(s) ||
          (p.brand || "").toLowerCase().includes(s) ||
          (p.category || "").toLowerCase().includes(s)
        )
      : parts
    return list.slice(0, 200)
  }, [parts, partSearch])

  // Actions
  const seedData = async () => {
    if (!confirm("This will populate the database with default data. Continue?")) return
    setLoading(true)

    if (isMockMode) {
      await new Promise(r => setTimeout(r, 1000))
      alert("Data seeded successfully! (Mock Mode)")
      setLoading(false)
      return
    }

    try {
      const batch = writeBatch(db)

      for (const d of initialDevices) {
        // Add Device
        const deviceRef = doc(collection(db, "devices"))
        batch.set(deviceRef, { name: d.name, icon: d.icon || "Smartphone" })

        // Add Brands & Models
        for (const b of d.brands) {
          const brandRef = doc(collection(db, "brands"))
          batch.set(brandRef, { deviceId: deviceRef.id, name: b.name })

          for (const m of b.models) {
            const modelRef = doc(collection(db, "models"))
            batch.set(modelRef, { brandId: brandRef.id, name: m })
          }
        }

        // Add Issues
        for (const i of d.issues) {
          const issueRef = doc(collection(db, "issues"))
          batch.set(issueRef, { deviceId: deviceRef.id, name: i, durationMinutes: 30 }) // Default 30 min
        }
      }

      await batch.commit()
      alert("Data seeded successfully!")
    } catch (error) {
      alert("Failed to seed data")
    } finally {
      setLoading(false)
    }
  }

  const addDevice = async () => {
    if (!newDeviceName.trim()) return

    const iconToUse = newDeviceIcon || "Smartphone"

    if (isMockMode) {
      setDevices([...devices, { id: `mock-${Date.now()}`, name: newDeviceName, icon: iconToUse }])
      setNewDeviceName("")
      setNewDeviceIcon("")
      return
    }

    await addDoc(collection(db, "devices"), { name: newDeviceName, icon: iconToUse })
    setNewDeviceName("")
    setNewDeviceIcon("")
  }

  const deleteDevice = async (id: string) => {
    if (!confirm("Delete this device and all its related data?")) return

    if (isMockMode) {
      setDevices(devices.filter(d => d.id !== id))
      return
    }

    await deleteDoc(doc(db, "devices", id))
    // Note: In a real app, you should also delete related brands/models/issues
  }

  const addBrand = async () => {
    if (!selectedDeviceId || !newBrandName.trim()) return

    if (isMockMode) {
      setBrands([...brands, { id: `mock-b-${Date.now()}`, deviceId: selectedDeviceId, name: newBrandName }])
      setNewBrandName("")
      return
    }

    await addDoc(collection(db, "brands"), { deviceId: selectedDeviceId, name: newBrandName })
    setNewBrandName("")
  }

  const deleteBrand = async (id: string) => {
    if (isMockMode) {
      setBrands(brands.filter(b => b.id !== id))
      return
    }
    await deleteDoc(doc(db, "brands", id))
  }

  const addModel = async () => {
    if (!selectedBrandId || !newModelName.trim()) return

    if (isMockMode) {
      setModels([...models, { id: `mock-m-${Date.now()}`, brandId: selectedBrandId, name: newModelName }])
      setNewModelName("")
      return
    }

    await addDoc(collection(db, "models"), { brandId: selectedBrandId, name: newModelName })
    setNewModelName("")
  }

  const deleteModel = async (id: string) => {
    if (isMockMode) {
      setModels(models.filter(m => m.id !== id))
      return
    }
    await deleteDoc(doc(db, "models", id))
  }

  const addIssue = async () => {
    if (!issueDeviceId || !newIssueName.trim()) return

    if (isMockMode) {
      setIssues([...issues, {
        id: `mock-i-${Date.now()}`,
        deviceId: issueDeviceId,
        name: newIssueName,
        durationMinutes: Number(newIssueDuration) || 30
      }])
      setNewIssueName("")
      return
    }

    await addDoc(collection(db, "issues"), {
      deviceId: issueDeviceId,
      name: newIssueName,
      durationMinutes: Number(newIssueDuration) || 30
    })
    setNewIssueName("")
  }

  const updateIssueDuration = async (id: string, minutes: number) => {
    if (isMockMode) {
      setIssues(issues.map(i => i.id === id ? { ...i, durationMinutes: minutes } : i))
      return
    }
    await updateDoc(doc(db, "issues", id), { durationMinutes: minutes })
  }

  const deleteIssue = async (id: string) => {
    if (isMockMode) {
      setIssues(issues.filter(i => i.id !== id))
      return
    }
    await deleteDoc(doc(db, "issues", id))
  }
  const openManageParts = (issue: Issue) => {
    setManageIssue(issue)
    setPartSearch("")
    setIsManageDialogOpen(true)
  }
  const addRecommendedPart = async (issueId: string, partId: string) => {
    const target = issues.find(i => i.id === issueId)
    if (!target) return
    const existing = Array.from(new Set([...(target.recommendedParts || []), partId]))
    if (isMockMode) {
      setIssues(issues.map(i => i.id === issueId ? { ...i, recommendedParts: existing } : i))
      return
    }
    await updateDoc(doc(db, "issues", issueId), { recommendedParts: existing })
  }
  const removeRecommendedPart = async (issueId: string, partId: string) => {
    const target = issues.find(i => i.id === issueId)
    if (!target) return
    const updated = (target.recommendedParts || []).filter(id => id !== partId)
    if (isMockMode) {
      setIssues(issues.map(i => i.id === issueId ? { ...i, recommendedParts: updated } : i))
      return
    }
    await updateDoc(doc(db, "issues", issueId), { recommendedParts: updated })
  }

  if (!authorized) return null
  return (
    <section className="pt-2 pb-8">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <GlassCard>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-cyan-500/20 rounded-lg">
              <Package className="w-5 h-5 text-cyan-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">{t("Total Parts")}</p>
              <p className="text-2xl font-bold text-white">{stats.totalParts}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-500/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">{t("Inventory Value")}</p>
              <p className="text-2xl font-bold text-white">{stats.totalValue.toLocaleString()} AED</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-yellow-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-yellow-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">{t("Low Stock Items")}</p>
              <p className="text-2xl font-bold text-white">{stats.lowStockCount}</p>
            </div>
          </div>
        </GlassCard>
        <GlassCard>
          <div className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-500/20 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <div>
              <p className="text-sm text-white/60">{t("Out of Stock Items")}</p>
              <p className="text-2xl font-bold text-white">{stats.outOfStockCount}</p>
            </div>
          </div>
        </GlassCard>
      </div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setTab("parts")} className={`px-3 py-2 rounded-lg text-sm flex items-center gap-2 ${tab === "parts" ? "bg-cyan-500 text-black" : "bg-white/5 border border-white/10"}`}>
            {t("Spare Parts")}
            {stats.lowStockCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs bg-yellow-500/20 text-yellow-400 border border-yellow-500/40">
                {stats.lowStockCount}
              </span>
            )}
          </button>
          <button onClick={() => setTab("devices")} className={`px-3 py-2 rounded-lg text-sm ${tab === "devices" ? "bg-cyan-500 text-black" : "bg-white/5 border border-white/10"}`}>{t("Devices List")}</button>
          <button onClick={() => setTab("models")} className={`px-3 py-2 rounded-lg text-sm ${tab === "models" ? "bg-cyan-500 text-black" : "bg-white/5 border border-white/10"}`}>{t("Models Management")}</button>
          <button onClick={() => setTab("issues")} className={`px-3 py-2 rounded-lg text-sm ${tab === "issues" ? "bg-cyan-500 text-black" : "bg-white/5 border border-white/10"}`}>{t("Issues Management")}</button>
        </div>
        {devices.length === 0 && !loading && (
          <button onClick={seedData} className="px-3 py-2 rounded-lg text-sm bg-yellow-500/20 text-yellow-400 border border-yellow-500/50 flex items-center gap-2">
            <RefreshCw className="w-4 h-4" /> {t("Seed Default Data")}
          </button>
        )}
        <a href="/admin/inventory/suppliers" className="px-3 py-2 rounded-lg text-sm bg-white/5 border border-white/10 hover:bg-white/10">
          {t("Suppliers")}
        </a>
      </div>

      {tab === "devices" && (
        <div className="grid md:grid-cols-1 gap-6">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4">{t("Devices List")}</h2>
            <div className="flex flex-col md:flex-row gap-6 mb-8 items-start bg-white/5 p-6 rounded-xl border border-white/10">
              <div className="shrink-0">
                <label className="text-xs text-white/50 mb-2 block">{t("Device Icon")}</label>
                <ImageUpload value={newDeviceIcon} onChange={setNewDeviceIcon} path="devices" />
              </div>
              <div className="flex-1 w-full">
                <label className="text-xs text-white/50 mb-2 block">{t("Device Name")}</label>
                <div className="flex gap-2">
                  <input value={newDeviceName} onChange={(e) => setNewDeviceName(e.target.value)} placeholder={t("Device Name")} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
                  <button onClick={addDevice} className="px-6 py-3 bg-cyan-500 text-black rounded-xl font-semibold flex items-center gap-2">
                    <Plus className="w-5 h-5" /> {t("Add")}
                  </button>
                </div>
                <p className="text-xs text-white/30 mt-2">{t("Upload an icon or a default placeholder will be used.")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {devices.map((d) => (
                <div key={d.id} className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10 hover:border-white/20 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                      {d.icon.startsWith("http") ? (
                        <img src={d.icon} alt={d.name} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-xs font-bold text-white/50">{d.icon.substring(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-lg">{d.name}</p>
                      <p className="text-xs text-white/50">
                        {brands.filter(b => b.deviceId === d.id).length} {t("Brand")} •
                        {issues.filter(i => i.deviceId === d.id).length} {t("Issue")}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => deleteDevice(d.id)} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      )}

      {tab === "models" && (
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4">{t("Brands Management")}</h2>
            <div className="mb-4">
              <label className="text-xs text-white/50 mb-1 block">{t("Select Device")}</label>
              <select value={selectedDeviceId} onChange={(e) => setSelectedDeviceId(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 focus:border-cyan-500 focus:ring-cyan-500/30 outline-none">
                <option value="all" className="bg-black">{t("All Devices")}</option>
                {devices.map((d) => (<option key={d.id} value={d.id} className="bg-black">{d.name}</option>))}
              </select>
            </div>

            <div className="flex gap-2 mb-4">
              <input value={newBrandName} onChange={(e) => setNewBrandName(e.target.value)} placeholder={t("New Brand Name")} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
              <button onClick={addBrand} className="px-4 py-3 bg-cyan-500 text-black rounded-xl font-semibold"><Plus className="w-5 h-5" /></button>
            </div>

            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
              {filteredBrands.map((b) => (
                <div key={b.id}
                  className={`flex items-center justify-between rounded-xl p-3 border cursor-pointer transition-all ${selectedBrandId === b.id ? 'bg-cyan-500/10 border-cyan-500/50' : 'bg-white/5 border-white/10 hover:bg-white/10'}`}
                  onClick={() => setSelectedBrandId(b.id)}
                >
                  <span className="font-medium">{b.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); deleteBrand(b.id); }} className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                </div>
              ))}
              {filteredBrands.length === 0 && <p className="text-center text-white/30 py-4">{t("No brands found")}</p>}
            </div>
          </GlassCard>

          <GlassCard>
            <h2 className="text-xl font-semibold mb-4">{t("Models Management")}</h2>
            {selectedBrandId ? (
              <>
                <div className="mb-4">
                  <p className="text-sm text-white/50 mb-2">{t("Adding models for:")} <span className="text-cyan-400">{brands.find(b => b.id === selectedBrandId)?.name}</span></p>
                  <div className="flex gap-2">
                    <input value={newModelName} onChange={(e) => setNewModelName(e.target.value)} placeholder={t("New Model Name")} className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
                    <button onClick={addModel} className="px-4 py-3 bg-cyan-500 text-black rounded-xl font-semibold"><Plus className="w-5 h-5" /></button>
                  </div>
                </div>

                <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                  {filteredModels.map((m) => (
                    <div key={m.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                      <span className="text-sm">{m.name}</span>
                      <button onClick={() => deleteModel(m.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                    </div>
                  ))}
                  {filteredModels.length === 0 && <p className="text-center text-white/30 py-4">{t("No models found")}</p>}
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-white/30">
                {t("Select a brand to manage models")}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {tab === "issues" && (
        <div className="grid md:grid-cols-1 gap-6">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-4">{t("Issues Management")}</h2>
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-xs text-white/50 mb-1 block">{t("Select Device")}</label>
                <select value={issueDeviceId} onChange={(e) => setIssueDeviceId(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 focus:border-cyan-500 focus:ring-cyan-500/30 outline-none">
                  <option value="all" className="bg-black">{t("All Devices")}</option>
                  {devices.map((d) => (<option key={d.id} value={d.id} className="bg-black">{d.name}</option>))}
                </select>
              </div>
              <div className="flex gap-2 items-end">
                <div className="flex-1">
                  <label className="text-xs text-white/50 mb-1 block">{t("Issue Name")}</label>
                  <input value={newIssueName} onChange={(e) => setNewIssueName(e.target.value)} placeholder={t("e.g. Screen Replacement")} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="w-24">
                  <label className="text-xs text-white/50 mb-1 block">{t("Mins")}</label>
                  <input type="number" value={newIssueDuration} onChange={(e) => setNewIssueDuration(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
                </div>
                <button onClick={addIssue} className="px-4 py-3 bg-cyan-500 text-black rounded-xl font-semibold mb-[1px]"><Plus className="w-5 h-5" /></button>
              </div>
            </div>

            <div className="space-y-2">
              {filteredIssues.map((i) => (
                <div key={i.id} className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10">
                  <div className="flex-1">
                    <p className="font-medium">{i.name}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(i.recommendedParts || []).map((pid) => {
                        const p = parts.find(pp => pp.id === pid)
                        return (
                          <Badge key={pid} variant="outline" className="text-xs bg-white/5 border-white/10">
                            {p ? `${p.name}` : pid}
                          </Badge>
                        )
                      })}
                      {(i.recommendedParts || []).length === 0 && (
                        <span className="text-xs text-white/40">{t("No recommended parts linked")}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 bg-black/20 px-3 py-1 rounded-lg">
                      <span className="text-xs text-white/50">{t("Duration:")}</span>
                      <input
                        type="number"
                        defaultValue={i.durationMinutes}
                        onBlur={(e) => updateIssueDuration(i.id, Number(e.target.value))}
                        className="w-12 bg-transparent text-right text-sm focus:outline-none focus:text-cyan-400"
                      />
                      <span className="text-xs text-white/50">{t("min")}</span>
                    </div>
                    <Button onClick={() => openManageParts(i)} variant="outline" className="px-3 py-2 rounded-lg text-sm">
                      <LinkIcon className="w-4 h-4 mr-2" /> {t("Manage Parts")}
                    </Button>
                    <button onClick={() => deleteIssue(i.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              ))}
              {filteredIssues.length === 0 && <p className="text-center text-white/30 py-4">{t("No issues found for this device")}</p>}
            </div>
          </GlassCard>
        </div>
      )}
      <Dialog open={isManageDialogOpen} onOpenChange={setIsManageDialogOpen}>
        <DialogContent className="bg-zinc-900 border-white/10 text-white max-w-2xl">
          <DialogHeader>
            <DialogTitle>{t("Recommended Parts")}</DialogTitle>
          </DialogHeader>
          {manageIssue && (
            <div className="space-y-4">
              <div className="text-sm text-white/70">
                {t("Issue")}: <span className="text-white">{manageIssue.name}</span>
              </div>
              <div className="relative">
                <Input
                  placeholder={t("Search parts by name, SKU, brand")}
                  value={partSearch}
                  onChange={(e) => setPartSearch(e.target.value)}
                  className="pl-3 bg-white/5 border-white/10 text-white"
                />
              </div>
              <div className="grid grid-cols-1 gap-2 max-h-[50vh] overflow-y-auto pr-2">
                {filteredPartsForDialog.map((p) => {
                  const isLinked = (manageIssue.recommendedParts || []).includes(p.id)
                  return (
                    <div key={p.id} className="flex items-center justify-between bg-white/5 rounded-lg p-3 border border-white/10">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{p.name}</div>
                        <div className="text-xs text-white/50 truncate">
                          {(p.brand || "")} {(p.category ? `• ${p.category}` : "")} {(p.sku ? `• ${p.sku}` : "")}
                        </div>
                      </div>
                      <div className="shrink-0">
                        {isLinked ? (
                          <Button onClick={() => removeRecommendedPart(manageIssue.id, p.id)} variant="outline" className="bg-red-500/20 text-red-400 border-red-500/40">
                            {t("Remove")}
                          </Button>
                        ) : (
                          <Button onClick={() => addRecommendedPart(manageIssue.id, p.id)} className="bg-cyan-500 hover:bg-cyan-400">
                            {t("Add")}
                          </Button>
                        )}
                      </div>
                    </div>
                  )
                })}
                {filteredPartsForDialog.length === 0 && (
                  <div className="text-center py-6 text-white/40">{t("No parts found")}</div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {tab === "parts" && (
        <PartsInventory isAdmin={true} onStatsUpdate={(s) => setStats(s)} />
      )}
    </section>
  )
}
