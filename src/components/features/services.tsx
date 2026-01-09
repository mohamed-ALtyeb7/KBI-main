"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { motion } from "framer-motion"
import { Smartphone, Laptop, Printer, Monitor, Tv, Watch, Gamepad2, Camera, MonitorUp, ArrowRight } from "lucide-react"
import Link from "next/link"
import { useLanguage, useT } from "@/components/providers/language-provider"

const services = [
  {
    icon: <Smartphone className="w-8 h-8 text-cyan-400" />,
    title: "Mobile Phone Repair",
    description: "Screen replacement, battery, charging port, camera, speaker/mic fix, and software issues.",
    href: "/services#mobile",
  },
  {
    icon: <Laptop className="w-8 h-8 text-blue-400" />,
    title: "Laptop Repair",
    description: "Fan cleaning, keyboard replacement, screen repair, port fixes, Windows installation.",
    href: "/services#laptop",
  },
  {
    icon: <Printer className="w-8 h-8 text-teal-400" />,
    title: "Printer Repair",
    description: "Ink & toner issues, paper jam fix, cleaning, maintenance, and connectivity fixes.",
    href: "/services#printer",
  },
  {
    icon: <Monitor className="w-8 h-8 text-indigo-400" />,
    title: "Monitor Repair",
    description: "Backlight issues, HDMI/DisplayPort fix, flickering, no display, and dead pixels.",
    href: "/services#monitor",
  },
  {
    icon: <Monitor className="w-8 h-8 text-cyan-400" />,
    title: "PC / Desktop Computer Repair",
    description: "Power, no display, overheating, RAM/SSD, GPU, motherboard, Windows.",
    href: "/services#pc",
  },
  {
    icon: <Tv className="w-8 h-8 text-purple-400" />,
    title: "TV Repair",
    description: "TV not turning on, lines on screen, HDMI port repair, sound issues, software fix.",
    href: "/services#tv",
  },
  {
    icon: <Watch className="w-8 h-8 text-pink-400" />,
    title: "Apple Watch Repair",
    description: "Screen replacement, battery replacement, crown repair, sensor and pairing issues.",
    href: "/services#apple-watch",
  },
  {
    icon: <Camera className="w-8 h-8 text-orange-400" />,
    title: "CCTV Installation & Repair",
    description: "Full installation, DVR/NVR setup, camera fixes, night vision, WiFi connectivity.",
    href: "/services#cctv",
  },
  {
    icon: <MonitorUp className="w-8 h-8 text-green-400" />,
    title: "TV Wall Mounting",
    description: "Professional TV wall mount installation, smart TV setup, and cable management.",
    href: "/services#tv-install",
  },
  {
    icon: <Gamepad2 className="w-8 h-8 text-red-400" />,
    title: "Gaming Console Repair",
    description: "PlayStation & Xbox: HDMI port, overheating fix, disc drive, controller sync issues.",
    href: "/services#gaming",
  },
]

export function Services() {
  const { lang } = useLanguage()
  const isAr = lang === "ar"
  const t = useT()
  return (
    <section id="services" className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-20 -left-20 w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-20 -right-20 w-[35vw] h-[35vw] bg-blue-500/10 rounded-full blur-[120px]" />
      </div>
      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            {isAr ? "خدماتنا الرئيسية" : "Our Main Services"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            {isAr ? "خدمات إصلاح ميدانية احترافية لجميع أجهزتك" : "Professional on-site repair services for all your devices"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "120px" }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 rounded-full mx-auto mt-6 shadow-[0_0_20px_rgba(6,182,212,0.35)]"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              whileHover={{ y: -6 }}
            >
              <Link href={service.href}>
                <GlassCard className="h-full flex flex-col justify-between group cursor-pointer relative overflow-hidden border border-white/10">
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff12_1px,transparent_1px),linear-gradient(to_bottom,#ffffff12_1px,transparent_1px)] bg-[size:24px_24px] opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div>
                    <div className="mb-5 p-3 rounded-2xl bg-white/5 w-fit group-hover:bg-white/10 transition-colors ring-1 ring-white/10 group-hover:ring-cyan-500/30">
                      {service.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{isAr ? t(service.title) : service.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{isAr ? t(service.description) : service.description}</p>
                  </div>
                  <div className="mt-6 flex items-center gap-2 text-sm font-medium text-cyan-400/80 group-hover:text-cyan-400 transition-colors">
                    {t("Book Now")} <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" /> <div className="w-4 h-[1px] bg-current transition-all group-hover:w-8" />
                  </div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
