"use client"

import { useState } from "react"
import { motion, useScroll, useMotionValueEvent } from "framer-motion"
import { Menu, Phone, MessageCircle, Wrench, CalendarDays, Search, Info, Mail, Building2, Home, Languages } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet"
import { useLanguage, useT } from "@/components/providers/language-provider"
import { WhatsAppChatbot } from "@/components/features/whatsapp-chatbot"

export function Navbar() {
  const { lang, setLang } = useLanguage()
  const t = useT()
  const [isScrolled, setIsScrolled] = useState(false)
  const { scrollY } = useScroll()
  const pathname = usePathname()
  const [scrollOffset, setScrollOffset] = useState(0)
  const [lastSY, setLastSY] = useState(0)

  useMotionValueEvent(scrollY, "change", (latest) => {
    setIsScrolled(latest > 50)
    const dy = latest - lastSY
    setLastSY(latest)
    setScrollOffset((prev) => {
      const next = prev + (dy > 0 ? -1 : 1)
      return Math.max(-6, Math.min(6, next))
    })
  })

  

  const navLinks = [
    { name: t("Services"), raw: "Services", href: "/services" },
    { name: t("Corporate Services"), raw: "Corporate Services", href: "/corporate" },
    { name: t("Book Now"), raw: "Book Now", href: "/book" },
    { name: t("Track Order"), raw: "Track Order", href: "/track" },
    { name: t("About"), raw: "About", href: "/about" },
    { name: t("Contact"), raw: "Contact", href: "/contact" },
  ]

  const isAr = lang === "ar"

  const desktopLogo = (
    <Link href="/" className="group relative z-50 hidden md:flex">
      <div dir="ltr" className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
      <span dir="ltr" className="relative text-xl md:text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-100 group-hover:from-cyan-400 group-hover:via-blue-400 group-hover:to-purple-500 transition-all duration-300">
        KBI<span className="text-cyan-400 group-hover:text-blue-400 transition-colors">.</span>
      </span>
    </Link>
  )

  const desktopLogoRight = (
    <Link href="/" className="group relative z-50 hidden md:flex ml-3">
      <div dir="ltr" className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
      <span dir="ltr" className="relative text-xl md:text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-100 group-hover:from-cyan-400 group-hover:via-blue-400 group-hover:to-purple-500 transition-all duration-300">
        KBI<span className="text-cyan-400 group-hover:text-blue-400 transition-colors">.</span>
      </span>
    </Link>
  )

  const languageSwitcher = (
    <div className="hidden md:flex relative group items-center gap-1 bg-white/5 border border-white/10 rounded-full p-1 overflow-hidden">
      <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-full blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500 pointer-events-none" />
      <button
        onClick={() => setLang("en")}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold",
          lang === "en" ? "bg-cyan-500 text-black" : "text-white/70 hover:text-white"
        )}
      >
        EN
      </button>
      <button
        onClick={() => setLang("ar")}
        className={cn(
          "px-3 py-1 rounded-full text-xs font-semibold",
          lang === "ar" ? "bg-cyan-500 text-black" : "text-white/70 hover:text-white"
        )}
      >
        AR
      </button>
    </div>
  )

  return (
    <>
    <motion.nav
      initial={false}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 px-4 md:px-6 py-4",
        isScrolled ? "py-3" : "py-4",
      )}
    >
      <motion.div
        className={cn(
          "max-w-7xl mx-auto relative overflow-hidden rounded-full flex items-center justify-center md:justify-between px-4 md:px-6 py-3 transition-all duration-300 group ring-1",
          isScrolled
            ? "bg-white/10 backdrop-blur-2xl ring-white/20 shadow-[0_24px_64px_-24px_rgba(6,182,212,0.45)]"
            : "bg-white/5 backdrop-blur-xl ring-white/15 shadow-[0_16px_48px_-24px_rgba(6,182,212,0.35)]",
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-70" />
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -inset-1 rounded-full bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff10_1px,transparent_1px)] bg-[size:18px_18px] opacity-10" />
          <div className="absolute -top-10 -left-16 w-40 h-40 rounded-full bg-cyan-500/10 blur-2xl" />
          <div className="absolute -bottom-12 -right-20 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl" />
        </div>
        <div className="pointer-events-none absolute inset-0 rounded-full opacity-0 group-hover:opacity-100">
          <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 blur-xl" />
        </div>
        <Link href="/" className="group relative z-50 md:hidden">
          <div dir="ltr" className="absolute -inset-2 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-lg blur-lg opacity-0 group-hover:opacity-100 transition-all duration-500" />
          <span dir="ltr" className="relative text-xl md:text-2xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-100 group-hover:from-cyan-400 group-hover:via-blue-400 group-hover:to-purple-500 transition-all duration-300">
            KBI<span className="text-cyan-400 group-hover:text-blue-400 transition-colors">.</span>
          </span>
        </Link>
        {isAr ? languageSwitcher : desktopLogo}

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className="text-sm font-medium text-white/70 hover:text-white transition-colors"
            >
              {link.name}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-3">
          <a
            href="https://wa.me/971507313446"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold hover:bg-green-600 transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden xl:inline">{t("WhatsApp")}</span>
          </a>
          <a
            href="tel:+971507313446"
            className="flex items-center gap-2 bg-cyan-500 text-black px-4 py-2 rounded-full text-sm font-semibold hover:bg-cyan-400 transition-colors"
          >
            <Phone className="w-4 h-4" />
            <span className="hidden xl:inline">{t("Call Now")}</span>
          </a>
          {isAr ? desktopLogoRight : <div className="ml-3">{languageSwitcher}</div>}
        </div>

        
        <div className="hidden" />
      </motion.div>
    </motion.nav>
    <nav className="lg:hidden fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/80 backdrop-blur-xl">
      <div className="flex items-stretch justify-between">
        {[
          { href: "/", label: "Home", icon: Home },
          { href: "/services", label: "Services", icon: Wrench },
          { href: "/book", label: "Book Now", icon: CalendarDays },
          { href: "/track", label: "Track Order", icon: Search },
          { href: "/contact", label: "Contact", icon: Mail },
        ].map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href)
          const Icon = item.icon as any
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn("group relative overflow-hidden flex-1 py-2 px-2 flex flex-col items-center justify-center gap-1", active ? "text-cyan-400" : "text-white/70")}
            >
              <motion.span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyan-500/0 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" animate={{ y: scrollOffset }} />
              <Icon className={cn("w-5 h-5", active ? "text-cyan-400" : "text-white/50")} />
              <span className="text-[11px] font-semibold">{t(item.label)}</span>
            </Link>
          )
        })}
        <button
          onClick={() => setLang(lang === "ar" ? "en" : "ar")}
          className="group relative overflow-hidden flex-1 py-2 px-2 flex flex-col items-center justify-center gap-1 text-white/70"
          aria-label={t("Change Language")}
        >
          <motion.span className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-cyan-500/0 via-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" animate={{ y: scrollOffset }} />
          <Languages className="w-5 h-5 text-white/50" />
          <span className="text-[11px] font-semibold">{lang === "ar" ? "AR" : "EN"}</span>
        </button>
      </div>
    </nav>
    <WhatsAppChatbot />
    </>
  )
}
