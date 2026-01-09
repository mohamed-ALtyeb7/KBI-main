"use client"

import Link from "next/link"
import { Phone, Mail, MapPin, Clock, MessageCircle, ArrowRight, Github, Twitter, Linkedin } from "lucide-react"
import { useLanguage, useT } from "@/components/providers/language-provider"
import CircularText from "@/components/ui/circular-text"

export function Footer() {
  const { lang } = useLanguage()
  const isAr = lang === "ar"
  const t = useT()

  return (
    <footer className="relative pt-32 pb-12 overflow-hidden bg-black">
      {/* Creative Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />

      {/* Gradient Line Top */}
      <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-cyan-500/50 to-transparent" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-20">
          {/* Brand Column (4 cols) */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-block mb-6 group relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 rounded-xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500" />
              <h2 className="relative text-5xl font-bold tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-cyan-100 group-hover:from-cyan-400 group-hover:via-blue-400 group-hover:to-purple-500 transition-all duration-300">
                KBI<span className="text-cyan-500 group-hover:text-blue-400 transition-colors">.</span>
              </h2>
            </Link>
            
            <div className="pl-4 border-l-2 border-white/10 mb-8 hover:border-cyan-500/50 transition-colors duration-300">
              <p className="text-white/60 leading-relaxed max-w-sm">
                {isAr
                  ? "شريكك التقني الموثوق للإصلاح الميداني. نصلك أينما كنت في الإمارات."
                  : "Your trusted technical partner for on-site repairs. We reach you anywhere in the UAE."}
              </p>
            </div>

            <div className="flex gap-4">
              {/* Socials with glow */}
              {[
                {
                  icon: MessageCircle,
                  href: "https://wa.me/971507313446",
                  color: "group-hover:text-green-400",
                  bg: "group-hover:bg-green-500/10",
                  border: "group-hover:border-green-500/20",
                  shadow: "group-hover:shadow-green-500/20",
                },
                {
                  icon: Phone,
                  href: "tel:+971507313446",
                  color: "group-hover:text-cyan-400",
                  bg: "group-hover:bg-cyan-500/10",
                  border: "group-hover:border-cyan-500/20",
                  shadow: "group-hover:shadow-cyan-500/20",
                },
                {
                  icon: Mail,
                  href: `mailto:${process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@kbi.services"}`,
                  color: "group-hover:text-blue-400",
                  bg: "group-hover:bg-blue-500/10",
                  border: "group-hover:border-blue-500/20",
                  shadow: "group-hover:shadow-blue-500/20",
                },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`group relative w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/70 transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:shadow-lg ${item.bg} ${item.border} ${item.color} ${item.shadow}`}
                >
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                  <item.icon className="w-5 h-5 relative z-10" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-white mb-8 relative inline-block">
              {isAr ? "روابط سريعة" : "Quick Links"}
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-cyan-500 rounded-full" />
            </h4>
            <ul className="space-y-4">
              {[
                { label: "Services", href: "/services" },
                { label: "Book Now", href: "/book" },
                { label: "Track Order", href: "/track" },
                { label: "About Us", href: "/about" },
                { label: "Contact", href: "/contact" },
              ].map((item) => (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    className="text-white/60 hover:text-cyan-400 transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-white/20 group-hover:bg-cyan-400 transition-colors" />
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Services (3 cols) */}
          <div className="lg:col-span-3">
            <h4 className="font-bold text-white mb-8 relative inline-block">
              {t("Services")}
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-blue-500 rounded-full" />
            </h4>
            <ul className="space-y-4">
              {[
                "Mobile Phone Repair",
                "Laptop Repair",
                "TV Repair",
                "CCTV Installation",
                "Gaming Console Repair",
              ].map((service, i) => (
                <li key={i}>
                  <Link
                    href={`/services#${service.split(" ")[0].toLowerCase()}`}
                    className="text-white/60 hover:text-blue-400 transition-colors flex items-center gap-2 group"
                  >
                    <ArrowRight className="w-3 h-3 opacity-0 -ml-3 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300 text-blue-400" />
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact (2 cols) */}
          <div className="lg:col-span-2">
            <h4 className="font-bold text-white mb-8 relative inline-block">
              {isAr ? "اتصل بنا" : t("Contact")}
              <span className="absolute -bottom-2 left-0 w-1/2 h-1 bg-purple-500 rounded-full" />
            </h4>
            <ul className="space-y-6">
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{t("Hotline 24/7")}</p>
                  <a href="tel:+971507313446" dir="ltr" className="text-white font-semibold hover:underline">+971 50 731 3446</a>
                </div>
              </li>
              <li className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
                  <MapPin className="w-4 h-4 text-purple-400" />
                </div>
                <div>
                  <p className="text-xs text-white/40 uppercase tracking-wider mb-1">{t("Location")}</p>
                  <p className="text-white font-semibold">{t("Abu Dhabi, UAE")}</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-6 relative">
          <p className="text-white/40 text-sm">
            © 2025 KBI Repair Services. All rights reserved.
          </p>

          {/* Center Circular Text - Absolute centered on Desktop */}
          <div className="md:absolute md:left-1/2 md:top-8 md:-translate-x-1/2 md:-translate-y-1/2 flex justify-center">
            <div className="relative group">
              <div className="absolute inset-0 bg-cyan-500/20 blur-xl rounded-full group-hover:bg-cyan-500/40 transition-colors" />
              <CircularText
                text="KBI*TECHNOLOGY*KBI*TECHNOLOGY*"
                onHover="speedUp"
                spinDuration={20}
                className="w-20 h-20 md:w-24 md:h-24 text-cyan-400"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  aria-hidden="true"
                  className="relative w-7 h-7 md:w-8 md:h-8 scale-100 group-hover:scale-105 transition-transform"
                >
                  <div
                    className="absolute inset-0 rounded-full bg-cyan-500/20 blur-sm animate-ping"
                    style={{ animationDuration: "2.8s" }}
                  />
                  <div
                    className="absolute inset-0 rounded-full border-2 border-cyan-400/30 border-t-cyan-400 animate-spin"
                    style={{ animationDuration: "1.8s" }}
                  />
                  <div className="absolute -inset-2 rounded-full bg-gradient-to-b from-cyan-500/10 to-transparent blur-md opacity-70 group-hover:opacity-100 transition-opacity" />
                  <div
                    className="absolute inset-0 animate-spin"
                    style={{ animationDuration: "6s" }}
                  >
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)]" />
                  </div>
                  <div
                    className="absolute inset-0 animate-spin"
                    style={{ animationDuration: "10s", animationDirection: "reverse" }}
                  >
                    <div className="absolute left-1/2 top-0 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-400 opacity-90 shadow-[0_0_8px_rgba(59,130,246,0.7)]" />
                  </div>
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-2.5 h-2.5 rounded-full bg-white shadow-[0_0_14px_rgba(255,255,255,0.9)]" />
                </div>
              </div>
            </div>
          </div>

          <div className="flex gap-6 text-sm text-white/40">
            <Link href="/privacy" className="hover:text-white transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
