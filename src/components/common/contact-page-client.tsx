"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { useLanguage } from "@/components/providers/language-provider"
import { useState } from "react"
import { Phone, MessageCircle, Mail, CalendarClock, Truck, CheckCircle2 } from "lucide-react"

export function ContactPageClient() {
  const { lang } = useLanguage()
  const isAr = lang === "ar"
  const [submitted, setSubmitted] = useState(false)
  const companyEmail = process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@kbi.services"

  return (
    <section className="pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{isAr ? "تواصل معنا" : "Contact Us"}</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard hoverEffect={false} className="p-6">
            {submitted ? (
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-8 h-8 text-green-600" />
                </div>
                <p className="text-lg font-semibold mb-2">{isAr ? "تم إرسال الرسالة بنجاح" : "Message sent successfully"}</p>
                <p className="text-white/70">{isAr ? "سنقوم بالتواصل معك قريبًا" : "We will get back to you shortly"}</p>
              </div>
            ) : (
              <form onSubmit={(e) => { e.preventDefault(); setSubmitted(true) }} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">{isAr ? "الاسم" : "Name"}</label>
                    <input className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">Email</label>
                    <input type="email" className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-2">{isAr ? "رقم الجوال" : "Phone"}</label>
                    <input className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-2">{isAr ? "الرسالة" : "Message"}</label>
                    <input className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-2">{isAr ? "تفاصيل إضافية" : "Additional Details"}</label>
                  <textarea rows={4} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
                </div>
                <div className="flex justify-end">
                  <button className="px-6 py-3 rounded-xl bg-cyan-500 text-black font-semibold hover:bg-cyan-400 transition-colors">{isAr ? "إرسال" : "Send"}</button>
                </div>
              </form>
            )}
          </GlassCard>
          <GlassCard hoverEffect={false} className="p-6">
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2"><Phone className="w-4 h-4" /><a href="tel:+971507313446" className="hover:underline">+971 50 731 3446</a></div>
              <div className="flex items-center gap-2"><MessageCircle className="w-4 h-4" /><a href="https://wa.me/971507313446" target="_blank" rel="noopener noreferrer" className="hover:underline">WhatsApp</a></div>
              <div className="flex items-center gap-2"><Mail className="w-4 h-4" /><a href={`mailto:${companyEmail}`} className="hover:underline">{companyEmail}</a></div>
              <div className="flex items-center gap-2"><CalendarClock className="w-4 h-4" /><span>{isAr ? "متاحون: 24/7" : "Availability: 24/7"}</span></div>
              <div className="flex items-center gap-2"><Truck className="w-4 h-4" /><span>{isAr ? "منطقة الخدمة: جميع الإمارات" : "Service Areas: All UAE"}</span></div>
            </div>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}
