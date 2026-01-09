"use client"

import { useState } from "react"
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { useLanguage, useT } from "@/components/providers/language-provider"
import { MessageCircle, Send, Wrench, Search, Building2, Sparkles } from "lucide-react"

export function WhatsAppChatbot() {
  const { lang } = useLanguage()
  const t = useT()
  const isAr = lang === "ar"

  const [open, setOpen] = useState(false)
  const [message, setMessage] = useState("")
  const { scrollYProgress } = useScroll()
  const offsetY = useTransform(scrollYProgress, [0, 1], [-18, 18])

  const phone = "971507313446"

  const quickActions = [
    { label: t("Book Technician"), icon: Wrench, preset: t("Hello, I want to book a technician.") },
    { label: t("Track Order"), icon: Search, preset: t("Hello, I want to track my order.") },
    { label: t("Corporate Support"), icon: Building2, preset: t("Hello, I need corporate support.") },
  ]

  const openChatWhatsApp = (text?: string) => {
    const q = (text || message || t("Hello! I need support.")) + "\n" + window.location.href
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(q)}`
    window.open(url, "_blank", "noopener,noreferrer")
  }

  return (
    <div className={`${isAr ? "left-6" : "right-6"} fixed bottom-20 md:bottom-6 z-50`} dir={isAr ? "rtl" : "ltr"}>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            className={`mb-3 ${isAr ? "ml-2" : "mr-2"}`}
          >
            <GlassCard className="w-[92vw] max-w-[360px] p-4 border-white/10">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full bg-green-500/15 flex items-center justify-center">
                  <MessageCircle className="w-4 h-4 text-green-400" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">{t("Support Chat")}</div>
                  <div className="text-xs text-white/60 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-cyan-400" /> {t("We reply fast on WhatsApp")}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mb-3">
                {quickActions.map((qa, i) => (
                  <button
                    key={i}
                    onClick={() => openChatWhatsApp(qa.preset)}
                    className="flex items-center justify-center gap-1.5 px-2 py-2 text-xs rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors"
                    title={qa.label}
                  >
                    <qa.icon className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="truncate">{qa.label}</span>
                  </button>
                ))}
              </div>

              <div className="space-y-2">
                <input
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder={t("Type your message...")}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
                <button
                  onClick={() => openChatWhatsApp()}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-green-500 text-black font-semibold hover:bg-green-400 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  <span>{t("Open WhatsApp")}</span>
                </button>
              </div>
            </GlassCard>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        style={{ y: offsetY }}
        onClick={() => setOpen((v) => !v)}
        className="relative flex items-center justify-center md:gap-2 md:px-4 md:py-2 p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-500 text-black font-bold shadow-[0_10px_30px_rgba(16,185,129,0.35)] hover:shadow-[0_16px_40px_rgba(16,185,129,0.5)] active:scale-95"
        title={t("Chat with Support")}
        aria-label={t("Chat with Support")}
      >
        <motion.span className="absolute -inset-0.5 rounded-full bg-white/20 opacity-0 hover:opacity-10 transition-opacity" style={{ y: offsetY }} />
        <MessageCircle className="w-5 h-5" />
        <span className="text-sm hidden md:inline">{t("Chat with Support")}</span>
      </motion.button>
    </div>
  )
}
