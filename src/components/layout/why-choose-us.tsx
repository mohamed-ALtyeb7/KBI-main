"use client"

import { motion } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { Award, Clock, BadgeCheck, Wrench, ShieldCheck, Receipt } from "lucide-react"
import { useLanguage, useT } from "@/components/providers/language-provider"

const features = [
  {
    icon: <Award className="w-7 h-7 text-cyan-400" />,
    title: "Professional Certified Technicians",
    description: "Our team consists of trained and certified experts in device repair.",
  },
  {
    icon: <Clock className="w-7 h-7 text-green-400" />,
    title: "Same-Day On-Site Service",
    description: "We come to your location - home or office - on the same day you book.",
  },
  {
    icon: <BadgeCheck className="w-7 h-7 text-blue-400" />,
    title: "Free Diagnosis",
    description: "Free diagnostic check when you approve the repair. No hidden fees.",
  },
  {
    icon: <Wrench className="w-7 h-7 text-orange-400" />,
    title: "Original Spare Parts",
    description: "We use only genuine and high-quality replacement parts.",
  },
  {
    icon: <ShieldCheck className="w-7 h-7 text-purple-400" />,
    title: "3-6 Months Warranty",
    description: "All our repairs come with a solid warranty for peace of mind.",
  },
  {
    icon: <Receipt className="w-7 h-7 text-teal-400" />,
    title: "Transparent Pricing",
    description: "Know the cost upfront. No surprises, no hidden charges.",
  },
]

export function WhyChooseUs() {
  const { lang } = useLanguage()
  const isAr = lang === "ar"
  const t = useT()
  return (
    <section className="py-24 relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="mb-16 text-center">
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-3xl md:text-5xl font-bold mb-4"
          >
            {t("Why Choose KBI?")}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-white/60 text-lg max-w-2xl mx-auto"
          >
            {t("We're committed to providing the best repair experience in Abu Dhabi")}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            whileInView={{ opacity: 1, width: "100px" }}
            viewport={{ once: true }}
            className="h-1 bg-gradient-to-r from-cyan-500 to-teal-500 rounded-full mx-auto mt-6"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
            >
              <GlassCard className="h-full text-center" hoverEffect={false}>
                <div className="mb-4 p-3 rounded-2xl bg-white/5 w-fit mx-auto">{feature.icon}</div>
                <h3 className="text-lg font-semibold mb-2">{t(feature.title)}</h3>
                <p className="text-white/60 text-sm leading-relaxed">{t(feature.description)}</p>
              </GlassCard>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
