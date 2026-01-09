"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { onAuthStateChanged } from "firebase/auth"
import { auth } from "@/lib/firebaseConfig"
import { PartsInventory } from "@/components/features/parts-inventory"
import { useLanguage } from "@/lib/i18n"
import { Package } from "lucide-react"

export default function TechnicianInventoryPage() {
    const router = useRouter()
    const { t } = useLanguage()
    const [authorized, setAuthorized] = useState(false)

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.replace("/technician/login")
            } else {
                setAuthorized(true)
            }
        })
        return () => unsub()
    }, [router])

    if (!authorized) return null

    return (
        <div className="space-y-6 pb-20">
            <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                    <Package className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold text-white">{t("Parts Inventory")}</h1>
                    <p className="text-white/60 text-sm">{t("View and track spare parts")}</p>
                </div>
            </div>

            {/* Technician view - no add/edit/delete */}
            <PartsInventory isAdmin={false} />
        </div>
    )
}
