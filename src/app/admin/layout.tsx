"use client"

import { useEffect, useState, useRef } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AdminAppSidebar } from "@/components/admin/admin-app-sidebar"
import { useLanguage, useT } from "@/components/providers/language-provider"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebaseConfig"
import { Loader2, LayoutDashboard, ShoppingCart, Users, Smartphone, Inbox, Settings, Building2, ClipboardList, BarChart3 } from "lucide-react"
import { cn } from "@/lib/utils"
import { NotificationBell } from "@/components/features/notification-bell"
import { Toaster } from "@/components/ui/toaster"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useLanguage()
  const t = useT()
  const isAr = lang === "ar"
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const navigatingRef = useRef(false)

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } finally {
      router.replace("/admin/login")
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)

      if (!currentUser && pathname !== "/admin/login" && !navigatingRef.current) {
        navigatingRef.current = true
        router.replace("/admin/login")
      }
      if (currentUser && pathname === "/admin/login" && !navigatingRef.current) {
        navigatingRef.current = true
        router.replace("/admin")
      }
    })

    return () => unsubscribe()
  }, [pathname, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center text-white">
        <Loader2 className="w-8 h-8 animate-spin text-cyan-500" />
      </div>
    )
  }

  // If on login page, render without sidebar
  if (pathname === "/admin/login") {
    return (
      <div className={cn("min-h-screen bg-black text-white", isAr && "[direction:rtl]")}>
        <header className="flex items-center gap-4 border-b border-white/10 bg-black/50 px-6 py-3 backdrop-blur-md sticky top-0 z-10">
          <div className="flex-1" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setLang("en")}
              className={cn("px-3 py-1 rounded-full text-xs font-semibold border border-white/10 transition-colors", lang === "en" ? "bg-cyan-500 text-black border-cyan-500" : "text-white/70 hover:bg-white/10")}
            >
              EN
            </button>
            <button
              onClick={() => setLang("ar")}
              className={cn("px-3 py-1 rounded-full text-xs font-semibold border border-white/10 transition-colors", lang === "ar" ? "bg-cyan-500 text-black border-cyan-500" : "text-white/70 hover:bg-white/10")}
            >
              AR
            </button>
            <button
              onClick={handleLogout}
              className="px-3 py-1 rounded-full text-xs font-semibold border border-white/10 transition-colors text-white/70 hover:bg-white/10"
            >
              {t("Logout")}
            </button>
          </div>
        </header>
        {children}
      </div>
    )
  }

  // If not authenticated and not on login page, return null (redirection handled in useEffect)
  if (!user && pathname !== "/admin/login") return null

  return (
    <div className={cn("min-h-screen bg-black text-white", isAr && "[direction:rtl]")}>
      <SidebarProvider defaultOpen={true}>
        <div className="hidden lg:block">
          <AdminAppSidebar />
        </div>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="flex items-center gap-4 border-b border-white/10 bg-black/50 px-6 py-3 backdrop-blur-md sticky top-0 z-10">
            <SidebarTrigger
              className="hidden lg:inline-flex size-9! rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-white/10 text-white shadow-[0_8px_24px_-10px_rgba(6,182,212,0.45)] hover:shadow-[0_12px_32px_-10px_rgba(6,182,212,0.65)] ring-1 ring-white/10 hover:ring-cyan-400/40 transition-all duration-300 active:scale-95"
              title="Menu"
            />
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <NotificationBell role="admin" />
              <button
                onClick={() => setLang("en")}
                className={cn("px-3 py-1 rounded-full text-xs font-semibold border border-white/10 transition-colors", lang === "en" ? "bg-cyan-500 text-black border-cyan-500" : "text-white/70 hover:bg-white/10")}
              >
                EN
              </button>
              <button
                onClick={() => setLang("ar")}
                className={cn("px-3 py-1 rounded-full text-xs font-semibold border border-white/10 transition-colors", lang === "ar" ? "bg-cyan-500 text-black border-cyan-500" : "text-white/70 hover:bg-white/10")}
              >
                AR
              </button>
              <button
                onClick={handleLogout}
                className="px-3 py-1 rounded-full text-xs font-semibold border border-white/10 transition-colors text-white/70 hover:bg-white/10"
              >
                {t("Logout")}
              </button>
            </div>
          </header>
          <div className="flex-1 overflow-auto p-6 pb-16 lg:pb-6">
            {children}
          </div>
          <nav className="lg:hidden fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/80 backdrop-blur-xl">
            <div className="flex items-stretch justify-between">
              {[
                { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
                { href: "/admin/orders", label: "Orders", icon: ShoppingCart },
                { href: "/admin/technicians", label: "Technicians", icon: Users },
                { href: "/admin/inventory", label: "Inventory", icon: Smartphone },
                { href: "/admin/inbox/contact", label: "Inbox", icon: Inbox },
                { href: "/admin/inbox/corporate", label: "Corporate Inbox", icon: Building2 },
                { href: "/admin/requests", label: "Technician Requests", icon: ClipboardList },
                { href: "/admin/settings", label: "Settings", icon: Settings },
              ].map((item) => {
                const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href)
                const Icon = item.icon as any
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn("group relative overflow-hidden flex-1 py-2 px-2 flex flex-col items-center justify-center gap-1", active ? "text-cyan-400" : "text-white/70")}
                  >
                    <span className="absolute -inset-0.5 rounded-xl bg-gradient-to-r from-cyan-500/0 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Icon className={cn("w-5 h-5", active ? "text-cyan-400" : "text-white/50")} />
                    <span className="text-[11px] font-semibold">{t(item.label)}</span>
                  </Link>
                )
              })}
            </div>
          </nav>
        </main>
        <Toaster />
      </SidebarProvider>
    </div>
  )
}
