"use client"

import { useEffect, useState } from "react"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { TechnicianSidebar } from "@/components/technician/technician-sidebar"
import { useLanguage, useT } from "@/components/providers/language-provider"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "@/lib/firebaseConfig"
import { Loader2, LayoutDashboard, ShoppingCart, User, Calendar, Package } from "lucide-react"
import { cn } from "@/lib/utils"

export default function TechnicianLayout({ children }: { children: React.ReactNode }) {
  const { lang, setLang } = useLanguage()
  const t = useT()
  const isAr = lang === "ar"
  const pathname = usePathname()
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)

  const handleLogout = async () => {
    try {
      await signOut(auth)
    } finally {
      router.replace("/technician/login")
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setLoading(false)

      if (!currentUser && pathname !== "/technician/login") {
        router.push("/technician/login")
      }
      if (currentUser && pathname === "/technician/login") {
        router.push("/technician/dashboard")
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
  if (pathname === "/technician/login") {
    return <div className={cn("min-h-screen bg-black", isAr && "[direction:rtl]")}>{children}</div>
  }

  // If not authenticated and not on login page, return null (redirection handled in useEffect)
  if (!user && pathname !== "/technician/login") return null

  return (
    <div className={cn("min-h-screen bg-black text-white", isAr && "[direction:rtl]")}>
      <SidebarProvider defaultOpen={true}>
        <div className="hidden lg:block">
          <TechnicianSidebar />
        </div>
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <header className="relative flex items-center gap-4 border-b border-white/10 bg-gradient-to-r from-black/70 via-black/60 to-black/70 px-4 py-3 md:px-6 backdrop-blur-xl sticky top-0 z-10 rounded-b-2xl md:rounded-b-none shadow-[0_12px_40px_-20px_rgba(6,182,212,0.35)]">
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute -inset-1 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:18px_18px] opacity-10" />
              <div className="absolute -top-10 -left-16 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl" />
              <div className="absolute -bottom-12 -right-20 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl" />
            </div>
            <SidebarTrigger
              className="hidden lg:inline-flex size-9! rounded-xl bg-gradient-to-r from-cyan-500/10 to-blue-600/10 border border-white/10 text-white shadow-[0_8px_24px_-10px_rgba(6,182,212,0.45)] hover:shadow-[0_12px_32px_-10px_rgba(6,182,212,0.65)] ring-1 ring-white/10 hover:ring-cyan-400/40 transition-all duration-300 active:scale-95"
              title="Menu"
            />
            <span className="md:hidden text-sm font-semibold text-white/80">Menu</span>
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
          <div className="flex-1 overflow-auto p-4 md:p-6 pb-16 lg:pb-6">
            {children}
          </div>
          <nav className="lg:hidden fixed inset-x-0 bottom-0 z-20 border-t border-white/10 bg-black/80 backdrop-blur-xl">
            <div className="flex items-stretch justify-between">
              {[
                { href: "/technician/dashboard", label: "Dashboard", icon: LayoutDashboard },
                { href: "/technician/orders", label: "Orders", icon: ShoppingCart },
                { href: "/technician/inventory", label: "Parts", icon: Package },
                { href: "/technician/calendar", label: "Calendar", icon: Calendar },
                { href: "/technician/profile", label: "Profile", icon: User },
              ].map((item) => {
                const active = pathname.startsWith(item.href)
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
      </SidebarProvider>
    </div>
  )
}
