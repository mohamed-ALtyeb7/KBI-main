"use client"

import { motion } from "framer-motion"
import { ArrowRight, MessageCircle, MapPin, Clock, Users, Zap, ShieldCheck } from "lucide-react"
import Link from "next/link"
import { useLanguage } from "@/components/providers/language-provider"
import { cn } from "@/lib/utils"

export function Hero() {
  const { lang } = useLanguage()
  const isAr = lang === "ar"

  const features = [
    {
      icon: <Users className="w-6 h-6 text-blue-600" />,
      title: isAr ? "فنيون محترفون" : "Professional Technicians",
      desc: isAr ? "فريق معتمد وذو خبرة عالية" : "Certified and highly experienced team"
    },
    {
      icon: <Zap className="w-6 h-6 text-amber-500" />,
      title: isAr ? "استجابة سريعة" : "Fast Response",
      desc: isAr ? "نصل إليك في أسرع وقت ممكن" : "We reach you as quickly as possible"
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-green-500" />,
      title: isAr ? "ضمان الإصلاح" : "Warranty on Repairs",
      desc: isAr ? "ضمان شامل على جميع الخدمات" : "Comprehensive warranty on all services"
    }
  ]

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden py-20 md:py-32 bg-black">
      {/* Background Gradient */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[70vw] h-[50vw] bg-blue-600/20 rounded-full blur-[120px] mix-blend-screen animate-pulse duration-[4000ms]" />
        <div className="absolute top-[20%] left-[20%] w-[40vw] h-[40vw] bg-cyan-500/10 rounded-full blur-[100px] mix-blend-screen" />
        <div className="absolute bottom-[-10%] right-[10%] w-[50vw] h-[50vw] bg-purple-600/10 rounded-full blur-[120px] mix-blend-screen" />
        <div className="absolute inset-0 opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            {/* Badge */}
            <div className="flex justify-center mb-10">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.3, ease: "backOut" }}
                whileHover={{ scale: 1.05 }}
                className="inline-flex items-center gap-3 px-6 py-2.5 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl cursor-default shadow-[0_0_40px_-10px_rgba(34,197,94,0.5)] hover:bg-white/10 hover:border-green-500/30 transition-all duration-300 group"
              >
                <div className="relative flex h-3 w-3 items-center justify-center">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500 shadow-[0_0_15px_rgba(34,197,94,1)]"></span>
                </div>
                <span className="text-sm font-semibold text-green-100/90 tracking-wide group-hover:text-white transition-colors">
                  {isAr ? "نخدم جميع مناطق أبوظبي" : "Serving All Abu Dhabi"}
                </span>
              </motion.div>
            </div>

            {/* Headings */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-br from-white via-blue-50 to-white/60 mb-6 tracking-tighter text-balance leading-[1.1] drop-shadow-2xl">
              {isAr ? (
                <span>نصل إليك<br /><span className="text-blue-400 inline-block mt-2">إصلاح فوري في موقعك</span></span>
              ) : (
                <span>We Come to You<br /><span className="text-blue-400 inline-block mt-2">Fast On-Site Repair</span></span>
              )}
            </h1>

            <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto mb-10 leading-relaxed font-light tracking-wide">
              {isAr 
                ? "خدمات إصلاح سريعة ومحترفة ومضمونة في منزلك أو مكتبك — نغطي جميع مناطق أبوظبي." 
                : "Fast, professional, and guaranteed repairs at your home or office — anywhere in Abu Dhabi."}
            </p>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link
                href="/book"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-black font-semibold text-lg hover:bg-gray-100 transition-all duration-300 flex items-center justify-center gap-2 group shadow-[0_0_20px_rgba(255,255,255,0.1)]"
              >
                {isAr ? "حجز فني الآن" : "Book a Technician"}
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <a
                href="https://wa.me/971507313446"
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-white/5 text-white font-medium text-lg hover:bg-white/10 border border-white/10 transition-all duration-300 flex items-center justify-center gap-2"
              >
                {isAr ? "تواصل معنا" : "Contact Us"}
              </a>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
