"use client"

import { motion } from "framer-motion"
import { ArrowRight, MessageCircle, Phone } from "lucide-react"
import Link from "next/link"
import { useT } from "@/components/providers/language-provider"

export function CTASection() {
  const t = useT()
  return (
    <section className="py-24 relative">
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="glass rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 pointer-events-none" />

          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">{t("Ready to Fix Your Device?")}</h2>
            <p className="text-xl text-white/60 mb-8 max-w-2xl mx-auto">
              {t("Book a technician now and get your device repaired at your doorstep. Fast, reliable, and guaranteed.")}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/book"
                className="group px-8 py-4 bg-cyan-500 text-black rounded-full font-semibold text-lg transition-all hover:scale-105 hover:bg-cyan-400 flex items-center gap-2"
              >
                {t("Book a Technician")} <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/971507313446"
                target="_blank"
                rel="noopener noreferrer"
                className="px-8 py-4 bg-green-500 rounded-full font-semibold text-lg text-white hover:bg-green-600 transition-all hover:scale-105 flex items-center gap-2"
              >
                <MessageCircle className="w-5 h-5" />
                {t("WhatsApp")}
              </a>
              <a
                href="tel:+971507313446"
                className="px-8 py-4 glass rounded-full font-semibold text-lg text-white hover:bg-white/10 transition-all hover:scale-105 flex items-center gap-2"
              >
                <Phone className="w-5 h-5" />
                {t("Call Us")}
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
