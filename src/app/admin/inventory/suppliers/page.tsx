"use client"

import { useEffect, useMemo, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { useT } from "@/components/providers/language-provider"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { db, isMockMode } from "@/lib/firebaseConfig"
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc, arrayUnion, arrayRemove } from "firebase/firestore"
import { Trash2, Plus, Package, Users } from "lucide-react"

type Supplier = {
  id: string
  name: string
  phone: string
  email?: string
  partsIds: string[]
}

type Part = {
  id: string
  name: string
  sku: string
  supplier?: string
}

export default function SuppliersPage() {
  const t = useT()
  const [authorized, setAuthorized] = useState(true)
  const [suppliers, setSuppliers] = useState<Supplier[]>([])
  const [parts, setParts] = useState<Part[]>([])
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Supplier | null>(null)

  const [form, setForm] = useState<{ name: string; phone: string; email: string; partsIds: string[] }>({
    name: "",
    phone: "",
    email: "",
    partsIds: []
  })

  useEffect(() => {
    if (isMockMode) {
      setSuppliers(prev => prev.length ? prev : [{ id: "mock-s1", name: "Default Supplier", phone: "971500000000", email: "supplier@example.com", partsIds: [] }])
      setParts(prev => prev.length ? prev : [{ id: "mock-p1", name: "Sample Part", sku: "SAMPLE-001" }])
      return
    }
    const unsubSup = onSnapshot(collection(db, "suppliers"), (snap) => {
      setSuppliers(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Supplier[])
    })
    const unsubParts = onSnapshot(collection(db, "parts"), (snap) => {
      setParts(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Part[])
    })
    return () => { unsubSup(); unsubParts() }
  }, [])

  const resetForm = () => {
    setForm({ name: "", phone: "", email: "", partsIds: [] })
    setEditing(null)
  }

  const openNew = () => {
    resetForm()
    setIsDialogOpen(true)
  }

  const openEdit = (s: Supplier) => {
    setForm({ name: s.name, phone: s.phone, email: s.email || "", partsIds: s.partsIds || [] })
    setEditing(s)
    setIsDialogOpen(true)
  }

  const toggleLinkPart = (id: string) => {
    setForm(prev => {
      const next = prev.partsIds.includes(id) ? prev.partsIds.filter(x => x !== id) : [...prev.partsIds, id]
      return { ...prev, partsIds: next }
    })
  }

  const saveSupplier = async () => {
    if (!form.name.trim() || !form.phone.trim()) return
    if (editing) {
      if (isMockMode) {
        setSuppliers(prev => prev.map(s => s.id === editing.id ? { ...s, ...form } : s))
      } else {
        await updateDoc(doc(db, "suppliers", editing.id), { name: form.name, phone: form.phone, email: form.email || "", partsIds: form.partsIds })
        // Link parts to supplier
        for (const p of parts) {
          const shouldLink = form.partsIds.includes(p.id)
          if (shouldLink) {
            await updateDoc(doc(db, "parts", p.id), { supplier: editing.id })
          } else if (p.supplier === editing.id) {
            await updateDoc(doc(db, "parts", p.id), { supplier: "" })
          }
        }
      }
    } else {
      if (isMockMode) {
        const id = `mock-${Date.now()}`
        setSuppliers(prev => [...prev, { id, name: form.name, phone: form.phone, email: form.email || "", partsIds: form.partsIds }])
      } else {
        const ref = await addDoc(collection(db, "suppliers"), { name: form.name, phone: form.phone, email: form.email || "", partsIds: form.partsIds })
        for (const partId of form.partsIds) {
          await updateDoc(doc(db, "parts", partId), { supplier: ref.id })
        }
      }
    }
    setIsDialogOpen(false)
    resetForm()
  }

  const deleteSupplier = async (id: string) => {
    if (!confirm(t("Delete this supplier?"))) return
    if (isMockMode) {
      setSuppliers(prev => prev.filter(s => s.id !== id))
    } else {
      await deleteDoc(doc(db, "suppliers", id))
      // Unlink parts
      const linked = parts.filter(p => p.supplier === id)
      for (const p of linked) {
        await updateDoc(doc(db, "parts", p.id), { supplier: "" })
      }
    }
  }

  const linkedCount = useMemo(() => {
    const map: Record<string, number> = {}
    for (const p of parts) {
      if (p.supplier) map[p.supplier] = (map[p.supplier] || 0) + 1
    }
    return map
  }, [parts])

  if (!authorized) return null
  return (
    <section className="pt-2 pb-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold flex items-center gap-2"><Users className="w-5 h-5 text-cyan-400" /> {t("Suppliers")}</h2>
        <Button onClick={openNew} className="bg-cyan-500 hover:bg-cyan-400 text-black"><Plus className="w-4 h-4 mr-2" /> {t("Add Supplier")}</Button>
      </div>

      <GlassCard className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-white/80">
            <thead className="bg-white/5 text-white border-b border-white/10">
              <tr>
                <th className="p-4 font-medium">{t("Name")}</th>
                <th className="p-4 font-medium">{t("Phone")}</th>
                <th className="p-4 font-medium">{t("Email")}</th>
                <th className="p-4 font-medium">{t("Linked Parts")}</th>
                <th className="p-4 font-medium text-right">{t("Actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {suppliers.map((s) => (
                <tr key={s.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4">
                    <span className="font-medium text-white">{s.name}</span>
                  </td>
                  <td className="p-4">{s.phone}</td>
                  <td className="p-4">{s.email || "-"}</td>
                  <td className="p-4">
                    <span className="font-mono bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded">
                      {linkedCount[s.id] || 0}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="sm" variant="ghost" className="hover:bg-white/10" onClick={() => openEdit(s)}>{t("Edit")}</Button>
                      <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-500/20" onClick={() => deleteSupplier(s.id)}>
                        <Trash2 className="w-4 h-4 text-red-400" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {suppliers.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-white/40">{t("No suppliers found")}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </GlassCard>

      <Dialog open={isDialogOpen} onOpenChange={(open) => !open && setIsDialogOpen(false)}>
        <DialogContent className="bg-zinc-950 border-white/10 text-white max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? t("Edit Supplier") : t("Add Supplier")}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-white/50 mb-1 block">{t("Name")} *</label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
              <div>
                <label className="text-xs text-white/50 mb-1 block">{t("Phone")} *</label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="bg-white/5 border-white/10" />
              </div>
            </div>
            <div>
              <label className="text-xs text-white/50 mb-1 block">{t("Email")}</label>
              <Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="bg-white/5 border-white/10" />
            </div>
            <div className="space-y-2">
              <label className="text-xs text-white/50 mb-1 block">{t("Link Parts")}</label>
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                {parts.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                    <Checkbox id={`part-${p.id}`} checked={form.partsIds.includes(p.id)} onCheckedChange={() => toggleLinkPart(p.id)} />
                    <label htmlFor={`part-${p.id}`} className="text-xs text-white/80 flex-1 truncate">
                      <span className="inline-flex items-center gap-1"><Package className="w-3 h-3 text-cyan-400" /> {p.name}</span>
                      <span className="text-white/40"> • {p.sku}</span>
                    </label>
                  </div>
                ))}
                {parts.length === 0 && <div className="text-white/40 text-sm">{t("No parts available")}</div>}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="border-white/10 text-white hover:bg-white/10">{t("Cancel")}</Button>
            <Button onClick={saveSupplier} className="bg-cyan-500 hover:bg-cyan-400 text-black">{editing ? t("Save") : t("Add")}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  )
}
