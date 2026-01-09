"use client"

import { useEffect, useMemo, useState } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { useT } from "@/components/providers/language-provider"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Pencil, Save as SaveIcon, Trash2, Plus, Shield, Image as ImageIcon, Phone } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { collection, onSnapshot, doc, updateDoc, deleteDoc, addDoc, query, setDoc } from "firebase/firestore"
import { db, auth } from "@/lib/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"
import { Technician, TechnicianPermissions } from "@/lib/types"
import { logger } from "@/lib/utils"
import { ImageUpload } from "@/components/ui/image-upload"

type Order = {
  id: string
  technician: string
  status: string
}

const defaultPermissions: TechnicianPermissions = {
  viewOrders: true,
  editOrders: true,
  updateStatus: true,
  uploadAttachments: true,
  chat: true,
  viewCorporateRequests: false
}

const specializationOptions = [
  "Smartphone",
  "Laptop",
  "PC / Desktop",
  "Printer",
  "Monitor",
  "TV",
  "Apple Watch",
  "CCTV",
  "TV Installation",
  "Gaming Console",
]

export default function AdminTechniciansPage() {
  const t = useT()
  const [authorized, setAuthorized] = useState(false)

  const [technicians, setTechnicians] = useState<Technician[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [selected, setSelected] = useState<Technician | null>(null)
  const [isNew, setIsNew] = useState(false)

  // New Tech Form State
  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [newPhone, setNewPhone] = useState("")
  const [newPhone2, setNewPhone2] = useState("")
  const [newAvatar, setNewAvatar] = useState<string>("")
  const [newSpecs, setNewSpecs] = useState<string[]>([])
  const [newStatus, setNewStatus] = useState<"Active" | "Inactive">("Active")
  const [newPermissions, setNewPermissions] = useState<TechnicianPermissions>(defaultPermissions)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        if (typeof window !== "undefined") {
          window.location.replace("/admin/login")
        }
      } else {
        setAuthorized(true)
      }
    })
    return () => unsub()
  }, [])

  // Fetch Technicians
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "technicians"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Technician[]
      setTechnicians(data)
    }, (error) => {
      logger.error("technicians subscription failed", error)
    })
    return () => unsubscribe()
  }, [])

  // Fetch Orders for Job Counts
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "orders"), (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[]
      setOrders(data)
    }, (error) => {
      logger.error("orders subscription failed", error)
    })
    return () => unsubscribe()
  }, [])

  const assignedCounts = useMemo(() => {
    const map: Record<string, number> = {}
    for (const o of orders) {
      if (o.technician && o.status !== "Completed" && o.status !== "Delivered" && o.status !== "Cancelled") {
        map[o.technician] = (map[o.technician] || 0) + 1
      }
    }
    return map
  }, [orders])

  const handleAddTech = async () => {
    if (!newName.trim() || !newEmail.trim() || !newPassword.trim()) {
      alert("Name, Email and Password are required")
      return
    }

    try {
      const techData = {
        name: newName,
        email: newEmail,
        phone: newPhone,
        phone2: newPhone2,
        role: "technician",
        specialization: newSpecs,
        status: newStatus,
        permissions: newPermissions,
        avatar: newAvatar,
        createdAt: new Date()
      }

      const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || ""
      if (!apiKey) {
        alert("Missing Firebase configuration")
        return
      }

      const signupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail, password: newPassword, returnSecureToken: false })
      })

      const signupJson = await signupRes.json()
      if (!signupRes.ok) {
        const msg =
          signupJson?.error?.message === "EMAIL_EXISTS" ? "Email is already registered" :
          signupJson?.error?.message === "WEAK_PASSWORD : Password should be at least 6 characters" ? "Password should be at least 6 characters" :
          signupJson?.error?.message || "Failed to create account"
        alert(msg)
        return
      }

      const uid = String(signupJson.localId || "")
      if (!uid) {
        alert("Failed to create account")
        return
      }

      const techRef = await addDoc(collection(db, "technicians"), { ...techData, uid })
      await setDoc(doc(db, "users", uid), {
        email: newEmail,
        role: "technician",
        technicianId: techRef.id,
        createdAt: new Date()
      })

      resetForm()
    } catch (error) {
      alert("Failed to add technician")
    }
  }

  const resetForm = () => {
    setNewName("")
    setNewEmail("")
    setNewPassword("")
    setNewPhone("")
    setNewPhone2("")
    setNewAvatar("")
    setNewSpecs([])
    setNewStatus("Active")
    setNewPermissions(defaultPermissions)
    setIsNew(false)
  }

  const toggleNewSpec = (spec: string) => {
    setNewSpecs(prev => prev.includes(spec) ? prev.filter(s => s !== spec) : [...prev, spec])
  }

  const handleUpdateTech = async () => {
    if (!selected) return
    try {
      const techRef = doc(db, "technicians", selected.id)
      const { id, ...data } = selected
      await updateDoc(techRef, data)
      setSelected(null)
    } catch (error) {
      alert("Failed to update technician")
    }
  }

  const handleDeleteTech = async (id: string) => {
    if (confirm(t("Are you sure you want to delete this technician?"))) {
      try {
        await deleteDoc(doc(db, "technicians", id))
      } catch (error) {
        alert("Failed to delete technician")
      }
    }
  }

  const toggleNewPermission = (key: keyof TechnicianPermissions) => {
    setNewPermissions(prev => ({ ...prev, [key]: !prev[key] }))
  }

  const toggleEditPermission = (key: keyof TechnicianPermissions) => {
    if (!selected) return
    setSelected(prev => {
      if (!prev) return null
      return {
        ...prev,
        permissions: {
          ...prev.permissions,
          [key]: !prev.permissions[key]
        }
      }
    })
  }

  if (!authorized) return null
  return (
    <section className="pt-2 pb-8">
      <div className="flex items-center justify-between gap-3 mb-6">
        <h2 className="text-2xl font-bold">{t("Technicians")}</h2>
        <Button onClick={() => setIsNew(true)} className="bg-cyan-500 hover:bg-cyan-400 text-black">
          <Plus className="w-4 h-4 mr-2" />
          {t("Add Technician")}
        </Button>
      </div>

      <div className="grid gap-6">
        {/* New Tech Dialog */}
        <Dialog open={isNew} onOpenChange={(open) => !open && resetForm()}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("Add New Technician")}</DialogTitle>
              <DialogDescription>{t("Enter technician details and permissions")}</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("Name")}</Label>
                  <Input value={newName} onChange={e => setNewName(e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>{t("Phone")}</Label>
                  <Input value={newPhone} onChange={e => setNewPhone(e.target.value)} className="bg-white/5 border-white/10" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{t("Secondary Phone")}</Label>
                  <Input value={newPhone2} onChange={e => setNewPhone2(e.target.value)} className="bg-white/5 border-white/10" />
                </div>
                <div className="space-y-2">
                  <Label>{t("Photo")}</Label>
                  <ImageUpload value={newAvatar} onChange={setNewAvatar} path="technicians" />
                </div>
              </div>

              <div className="space-y-2">
                <Label>{t("Email")}</Label>
                <Input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} className="bg-white/5 border-white/10" />
              </div>

              <div className="space-y-2">
                <Label>{t("Password")}</Label>
                <Input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="bg-white/5 border-white/10" />
              </div>

              <div className="space-y-2">
                <Label>{t("Specialization")}</Label>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {specializationOptions.map((opt) => (
                    <div key={opt} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                      <Checkbox
                        id={`new-spec-${opt}`}
                        checked={newSpecs.includes(opt)}
                        onCheckedChange={() => toggleNewSpec(opt)}
                        className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-black"
                      />
                      <label htmlFor={`new-spec-${opt}`} className="text-xs text-white/80">{opt}</label>
                    </div>
                  ))}
                </div>
                {newSpecs.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {newSpecs.map((s, i) => (
                      <span key={`${s}-${i}`} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs">{s}</span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label>{t("Status")}</Label>
                <Select value={newStatus} onValueChange={(v: any) => setNewStatus(v)}>
                  <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/30 outline-none rounded-lg"><SelectValue /></SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-white/10 text-white">
                    <SelectItem value="Active">{t("Active")}</SelectItem>
                    <SelectItem value="Inactive">{t("Inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3 pt-4 border-t border-white/10">
                <Label className="flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-500" /> {t("Permissions")}</Label>
                <div className="grid grid-cols-2 gap-3">
                  {Object.keys(defaultPermissions).map((key) => (
                    <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                      <Checkbox
                        id={`new-perm-${key}`}
                        checked={newPermissions[key as keyof TechnicianPermissions]}
                        onCheckedChange={() => toggleNewPermission(key as keyof TechnicianPermissions)}
                        className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 data-[state=checked]:text-black"
                      />
                      <label
                        htmlFor={`new-perm-${key}`}
                        className="text-sm text-white/80"
                      >
                        {t(key.replace(/([A-Z])/g, ' $1').trim())}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm} className="border-white/10 text-white hover:bg-white/10">
                {t("Cancel")}
              </Button>
              <Button onClick={handleAddTech} className="bg-cyan-500 hover:bg-cyan-400 text-black">
                {t("Add")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Technicians List */}
        <GlassCard className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-white/80">
              <thead className="bg-white/5 text-white border-b border-white/10">
                <tr>
                  <th className="p-4 font-medium">{t("Name")}</th>
                  <th className="p-4 font-medium">{t("Phone")}</th>
                  <th className="p-4 font-medium">{t("Specialization")}</th>
                  <th className="p-4 font-medium">{t("Status")}</th>
                  <th className="p-4 font-medium">{t("Active Jobs")}</th>
                  <th className="p-4 font-medium text-right">{t("Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {technicians.map((tch) => (
                  <tr key={tch.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        {tch.avatar ? (
                          <img src={tch.avatar} alt={tch.name} className="w-8 h-8 rounded-full object-cover border border-white/10" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                            <ImageIcon className="w-4 h-4 text-white/40" />
                          </div>
                        )}
                        <div className="flex flex-col">
                          <span className="font-medium text-white">{tch.name}</span>
                          <span className="text-xs text-white/50">{tch.email}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1">
                        <span className="flex items-center gap-1 text-white/80"><Phone className="w-3 h-3 text-cyan-400" /> {tch.phone}</span>
                        {tch.phone2 && (
                          <span className="flex items-center gap-1 text-white/60"><Phone className="w-3 h-3 text-cyan-400" /> {tch.phone2}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {tch.specialization?.map((s, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white/10 rounded-full text-xs">{s}</span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4">
                      <span className={tch.status === "Active" ? "text-green-400" : "text-red-400"}>
                        {t(tch.status)}
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="font-mono bg-cyan-500/10 text-cyan-400 px-2 py-1 rounded">
                        {assignedCounts[tch.id] || 0}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-white/10" onClick={() => setSelected(tch)}>
                          <Pencil className="w-4 h-4 text-cyan-400" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-8 w-8 hover:bg-red-500/20" onClick={() => handleDeleteTech(tch.id)}>
                          <Trash2 className="w-4 h-4 text-red-400" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {technicians.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-white/40">
                      {t("No technicians found")}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </GlassCard>

        {/* Edit Dialog */}
        <Dialog open={!!selected} onOpenChange={(open) => !open && setSelected(null)}>
          <DialogContent className="bg-zinc-950 border-white/10 text-white max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{t("Edit Technician")}</DialogTitle>
              <DialogDescription>{t("Update technician details and permissions")}</DialogDescription>
            </DialogHeader>
            {selected && (
              <div className="space-y-4 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("Name")}</Label>
                    <Input
                      value={selected.name}
                      onChange={e => setSelected({ ...selected, name: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Phone")}</Label>
                    <Input
                      value={selected.phone || ""}
                      onChange={e => setSelected({ ...selected, phone: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>{t("Secondary Phone")}</Label>
                    <Input
                      value={selected.phone2 || ""}
                      onChange={e => setSelected({ ...selected, phone2: e.target.value })}
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("Photo")}</Label>
                    <ImageUpload value={selected.avatar || ""} onChange={(url) => setSelected({ ...selected, avatar: url })} path="technicians" />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>{t("Email")}</Label>
                  <Input
                    value={selected.email || ""}
                    onChange={e => setSelected({ ...selected, email: e.target.value })}
                    className="bg-white/5 border-white/10"
                  />
                </div>

                <div className="space-y-2">
                  <Label>{t("Specialization")}</Label>
                  <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
                    {specializationOptions.map((opt) => (
                      <div key={opt} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                        <Checkbox
                          id={`edit-spec-${opt}`}
                          checked={selected.specialization?.includes(opt) || false}
                          onCheckedChange={() => {
                            const has = selected.specialization?.includes(opt)
                            const next = has
                              ? (selected.specialization || []).filter(s => s !== opt)
                              : [...(selected.specialization || []), opt]
                            setSelected({ ...selected, specialization: next })
                          }}
                          className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:text-black"
                        />
                        <label htmlFor={`edit-spec-${opt}`} className="text-xs text-white/80">{opt}</label>
                      </div>
                    ))}
                  </div>
                  {selected.specialization && selected.specialization.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {selected.specialization.map((s, i) => (
                        <span key={`${s}-${i}`} className="px-2 py-0.5 bg-cyan-500/10 text-cyan-400 rounded-full text-xs">{s}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{t("Status")}</Label>
                  <Select
                    value={selected.status}
                    onValueChange={(v: any) => setSelected({ ...selected, status: v })}
                  >
                    <SelectTrigger className="bg-white/5 border-white/10 text-white hover:bg-white/10 focus-visible:border-cyan-500 focus-visible:ring-cyan-500/30 outline-none rounded-lg"><SelectValue /></SelectTrigger>
                    <SelectContent className="bg-zinc-900 border-white/10 text-white">
                      <SelectItem value="Active">{t("Active")}</SelectItem>
                      <SelectItem value="Inactive">{t("Inactive")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-3 pt-4 border-t border-white/10">
                  <Label className="flex items-center gap-2"><Shield className="w-4 h-4 text-cyan-500" /> {t("Permissions")}</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {Object.keys(defaultPermissions).map((key) => (
                      <div key={key} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                        <Checkbox
                          id={`edit-perm-${key}`}
                          checked={selected.permissions?.[key as keyof TechnicianPermissions] ?? defaultPermissions[key as keyof TechnicianPermissions]}
                          onCheckedChange={() => toggleEditPermission(key as keyof TechnicianPermissions)}
                          className="border-white/20 data-[state=checked]:bg-cyan-500 data-[state=checked]:border-cyan-500 data-[state=checked]:text-black"
                        />
                        <label
                          htmlFor={`edit-perm-${key}`}
                          className="text-sm text-white/80"
                        >
                          {t(key.replace(/([A-Z])/g, ' $1').trim())}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setSelected(null)} className="border-white/10 text-white hover:bg-white/10">
                {t("Cancel")}
              </Button>
              <Button onClick={handleUpdateTech} className="bg-cyan-500 hover:bg-cyan-400 text-black">
                <SaveIcon className="w-4 h-4 mr-2" />
                {t("Save Changes")}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  )
}
