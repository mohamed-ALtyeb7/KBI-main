"use client"

import { motion } from "framer-motion"
import { Wrench } from "lucide-react"
import { useLanguage, useT } from "@/components/providers/language-provider"

export function ServicesHero() {
  const { lang } = useLanguage()
  const isAr = lang === "ar"
  const t = useT()
  return (
    <section className="relative pt-32 pb-16 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-6">
            <Wrench className="w-4 h-4 text-cyan-400" />
            <span className="text-xs font-medium text-white/80 uppercase tracking-wider">
              {isAr ? "خدمات إصلاح احترافية" : "Professional Repair Services"}
            </span>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
            {isAr ? "خدماتنا" : "Our"} <span className="text-cyan-400">{t("Services")}</span>
          </h1>

          <p className="text-lg text-white/60 max-w-2xl mx-auto leading-relaxed">
            {isAr
              ? "إصلاح ميداني احترافي لجميع أجهزتك. اختر جهازك أدناه للاطلاع على الخدمات التي نقدمها والعلامات التجارية التي ندعمها."
              : "Expert on-site repair for all your devices. Select your device below to see the services we offer and the brands we support."}
          </p>
        </motion.div>
      </div>
    </section>
  )
}
