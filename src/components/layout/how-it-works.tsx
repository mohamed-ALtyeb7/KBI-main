"use client"

import { motion } from "framer-motion"
import { ClipboardList, UserCheck, Truck, Search, Wrench, CreditCard } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

const stepsEn = [
  { icon: <ClipboardList className="w-8 h-8" />, title: "Submit Request", description: "Book online or via WhatsApp with your device details" },
  { icon: <UserCheck className="w-8 h-8" />, title: "Technician Assigned", description: "We assign a certified technician to your order" },
  { icon: <Truck className="w-8 h-8" />, title: "We Come to You", description: "Technician arrives at your home or office" },
  { icon: <Search className="w-8 h-8" />, title: "On-Spot Diagnosis", description: "Free diagnosis to identify the issue" },
  { icon: <Wrench className="w-8 h-8" />, title: "Repair Completed", description: "Professional repair with quality parts" },
  { icon: <CreditCard className="w-8 h-8" />, title: "Pay After Repair", description: "Only pay when you're satisfied with the work" },
]
const stepsAr = [
  { icon: <ClipboardList className="w-8 h-8" />, title: "إرسال الطلب", description: "احجز عبر الموقع أو واتساب مع تفاصيل الجهاز" },
  { icon: <UserCheck className="w-8 h-8" />, title: "تعيين فني", description: "نقوم بتعيين فني معتمد لطلبك" },
  { icon: <Truck className="w-8 h-8" />, title: "نأتي إلى موقعك", description: "الفني يصل إلى منزلك أو مكتبك" },
  { icon: <Search className="w-8 h-8" />, title: "تشخيص فوري", description: "تشخيص مجاني لتحديد المشكلة" },
  { icon: <Wrench className="w-8 h-8" />, title: "إتمام الإصلاح", description: "إصلاح احترافي باستخدام قطع عالية الجودة" },
  { icon: <CreditCard className="w-8 h-8" />, title: "الدفع بعد الإصلاح", description: "تدفع فقط عند رضاك عن العمل" },
]

export function HowItWorks() {
  const { lang } = useLanguage()
  const isAr = lang === "ar"
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-cyan-900/10 via-transparent to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative z-10">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            {isAr ? "كيف تعمل خدمتنا" : "How Our Service Works"}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            {isAr ? "عملية إصلاح بسيطة وسريعة بدون تعقيد" : "Simple, fast, and hassle-free repair process"}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100px" }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full mx-auto mt-6"
          />
        </div>

        <div className="relative">
          {/* Connection line */}
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent -translate-y-1/2" />

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {(isAr ? stepsAr : stepsEn).map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="flex flex-col items-center text-center"
              >
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-cyan-500 text-black text-sm font-bold flex items-center justify-center">
                    {index + 1}
                  </div>
                </div>
                <h3 className="text-base font-semibold mb-1">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
