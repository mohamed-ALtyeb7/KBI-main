"use client"

import { GlassCard } from "@/components/ui/glass-card"
import { useLanguage } from "@/components/providers/language-provider"

export function AboutPageClient() {
  const { lang } = useLanguage()
  const isAr = lang === "ar"

  return (
    <section className="pt-28 pb-16">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-2xl md:text-3xl font-bold mb-6">{isAr ? "من نحن" : "About Us"}</h1>
        <div className="grid md:grid-cols-2 gap-6">
          <GlassCard hoverEffect={false} className="p-6">
            <h2 className="text-lg font-semibold mb-2">{isAr ? "من هي KBI" : "Who is KBI"}</h2>
            <p className="text-white/70 text-sm">
              {isAr
                ? "KBI تقدم خدمات إصلاح احترافية في موقع العميل، تغطي الهواتف، الحواسيب المحمولة، الطابعات، الشاشات، التلفزيونات، أنظمة المراقبة، وأجهزة الألعاب في أبوظبي وجميع الإمارات."
                : "KBI provides professional on-site repair services covering phones, laptops, printers, monitors, TVs, CCTV, and gaming consoles across Abu Dhabi and the UAE."}
            </p>
          </GlassCard>
          <GlassCard hoverEffect={false} className="p-6">
            <h2 className="text-lg font-semibold mb-2">{isAr ? "رؤيتنا" : "Our Vision"}</h2>
            <p className="text-white/70 text-sm">
              {isAr
                ? "أن نكون الخيار الأول للشركات والأفراد في خدمات الإصلاح الميدانية مع سرعة الاستجابة والجودة العالية."
                : "To be the first choice for businesses and individuals for on-site repairs with fast response and high quality."}
            </p>
          </GlassCard>
          <GlassCard hoverEffect={false} className="p-6">
            <h2 className="text-lg font-semibold mb-2">{isAr ? "قيمنا" : "Our Values"}</h2>
            <p className="text-white/70 text-sm">
              {isAr
                ? "الاحترافية، الشفافية، الجودة، والالتزام بخدمة العملاء."
                : "Professionalism, transparency, quality, and commitment to customer service."}
            </p>
          </GlassCard>
          <GlassCard hoverEffect={false} className="p-6">
            <h2 className="text-lg font-semibold mb-2">{isAr ? "لماذا اخترتنا؟" : "Why Choose Us?"}</h2>
            <p className="text-white/70 text-sm">
              {isAr
                ? "فنيون معتمدون، خدمة في موقع العميل في نفس اليوم، قطع أصلية، وضمان على الإصلاحات."
                : "Certified technicians, same-day on-site service, genuine parts, and warranty on repairs."}
            </p>
          </GlassCard>
        </div>
      </div>
    </section>
  )
}

