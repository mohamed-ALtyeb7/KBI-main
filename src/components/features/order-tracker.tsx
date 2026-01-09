"use client"

import type React from "react"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { GlassCard } from "@/components/ui/glass-card"
import { orderStatuses } from "@/lib/data"
import {
  Search,
  Package,
  UserCheck,
  Truck,
  Stethoscope,
  Wrench,
  ClipboardCheck,
  CheckCircle2,
  Phone,
  MessageCircle,
  AlertCircle,
} from "lucide-react"

const statusIcons = [
  <Package key={0} className="w-6 h-6" />,
  <UserCheck key={1} className="w-6 h-6" />,
  <Truck key={2} className="w-6 h-6" />,
  <Stethoscope key={3} className="w-6 h-6" />,
  <Wrench key={4} className="w-6 h-6" />,
  <ClipboardCheck key={5} className="w-6 h-6" />,
  <CheckCircle2 key={6} className="w-6 h-6" />,
]

// Demo orders for testing
const demoOrders: Record<
  string,
  { status: number; device: string; brand: string; model: string; issue: string; date: string }
> = {
  "KBI-TEST-001": {
    status: 3,
    device: "Mobile Phone",
    brand: "Apple",
    model: "iPhone 15 Pro",
    issue: "Screen Replacement",
    date: "2025-01-08",
  },
  "KBI-DEMO-123": {
    status: 5,
    device: "Laptop",
    brand: "Dell",
    model: "XPS 15",
    issue: "Fan Cleaning & Thermal Paste",
    date: "2025-01-07",
  },
  "KBI-PC-001": {
    status: 2,
    device: "PC / Desktop Computer",
    brand: "Lenovo",
    model: "ThinkCentre (2020)",
    issue: "Hardware: Power Supply Issue",
    date: "2025-01-09",
  },
}

import { useLanguage, useT } from "@/components/providers/language-provider"

export function OrderTracker() {
  const { lang } = useLanguage()
  const isAr = lang === "ar"
  const t = useT()
  const [trackingNumber, setTrackingNumber] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  const [orderData, setOrderData] = useState<(typeof demoOrders)[string] | null>(null)
  const [notFound, setNotFound] = useState(false)

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSearching(true)
    setNotFound(false)

    // Simulate API call
    setTimeout(() => {
      const order = demoOrders[trackingNumber.toUpperCase()]
      if (order) {
        setOrderData(order)
        setNotFound(false)
      } else {
        setOrderData(null)
        setNotFound(true)
      }
      setIsSearching(false)
    }, 1000)
  }

  return (
    <section className="relative pt-32 pb-16 min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[30vw] h-[30vw] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {t("Track Order")} <span className="text-cyan-400">{isAr ? t("Order") : "Order"}</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            {t("Enter your tracking number to see the live status of your repair order.")}
          </p>
        </div>

        <div className="max-w-2xl mx-auto">
          {/* Search Form */}
          <GlassCard className="mb-8">
            <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                <input
                  type="text"
                  value={trackingNumber}
                  onChange={(e) => setTrackingNumber(e.target.value)}
                  placeholder={isAr ? "أدخل رقم التتبّع (مثال: KBI-TEST-001)" : "Enter tracking number (e.g., KBI-TEST-001)"}
                  className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                />
              </div>
              <button
                type="submit"
                disabled={!trackingNumber || isSearching}
                className="px-8 py-4 bg-cyan-500 text-black rounded-xl font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSearching ? (isAr ? "جاري البحث..." : "Searching...") : t("Track Order")}
              </button>
            </form>

            <p className="mt-4 text-xs text-white/40 text-center">{isAr ? "أرقام تتبّع تجريبية: KBI-TEST-001, KBI-DEMO-123" : "Demo tracking numbers: KBI-TEST-001, KBI-DEMO-123"}</p>
          </GlassCard>

          <AnimatePresence mode="wait">
            {/* Not Found */}
            {notFound && (
              <motion.div
                key="notfound"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard className="text-center">
                  <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500/30 flex items-center justify-center mx-auto mb-4">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">{t("Order Not Found")}</h3>
                  <p className="text-white/60 mb-6">
                    {isAr ? `لم نعثر على طلب برقم التتبّع "${trackingNumber}". يرجى التحقق والمحاولة مرة أخرى.` : `We couldn't find an order with tracking number "${trackingNumber}". Please check and try again.`}
                  </p>
                  <a
                    href="https://wa.me/971507313446"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
                  >
                    <MessageCircle className="w-5 h-5" />
                    {t("Contact Support")}
                  </a>
                </GlassCard>
              </motion.div>
            )}

            {/* Order Found */}
            {orderData && (
              <motion.div
                key="found"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <GlassCard>
                  {/* Order Info */}
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8 pb-6 border-b border-white/10">
                    <div>
                      <p className="text-sm text-white/50 mb-1">{t("Tracking Number")}</p>
                      <p className="text-xl font-mono font-bold text-cyan-400">{trackingNumber.toUpperCase()}</p>
                    </div>
                    <div className="text-left sm:text-right">
                      <p className="text-sm text-white/50 mb-1">{t("Order Date")}</p>
                      <p className="font-medium">{orderData.date}</p>
                    </div>
                  </div>

                  {/* Device Info */}
                  <div className="grid grid-cols-2 gap-4 mb-8 text-sm">
                    <div>
                      <p className="text-white/50 mb-1">{t("Device")}</p>
                      <p className="font-medium">{orderData.device}</p>
                    </div>
                    <div>
                      <p className="text-white/50 mb-1">{t("Brand")}</p>
                      <p className="font-medium">{orderData.brand}</p>
                    </div>
                    <div>
                      <p className="text-white/50 mb-1">{t("Model")}</p>
                      <p className="font-medium">{orderData.model}</p>
                    </div>
                    <div>
                      <p className="text-white/50 mb-1">{t("Issue")}</p>
                      <p className="font-medium">{orderData.issue}</p>
                    </div>
                  </div>

                  {/* Status Timeline */}
                  <div className="mb-8">
                    <h3 className="text-lg font-semibold mb-6">{t("Order Status")}</h3>
                    <div className="relative">
                      {/* Vertical line */}
                      <div className="absolute left-[23px] top-0 bottom-0 w-0.5 bg-white/10" />

                      <div className="space-y-4">
                        {orderStatuses.map((status, index) => {
                          const isCompleted = index < orderData.status
                          const isCurrent = index === orderData.status - 1
                          const isPending = index >= orderData.status

                          return (
                            <motion.div
                              key={status.id}
                              initial={{ opacity: 0, x: -20 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: index * 0.1 }}
                              className={`flex items-start gap-4 relative ${isPending ? "opacity-40" : ""}`}
                            >
                              <div
                                className={`relative z-10 w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${
                                  isCompleted
                                    ? "bg-cyan-500 text-black"
                                    : isCurrent
                                      ? "bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400 animate-pulse"
                                      : "bg-white/5 border border-white/20 text-white/30"
                                }`}
                              >
                                {statusIcons[index]}
                              </div>
                              <div className="pt-2">
                                <p
                                  className={`font-semibold ${isCurrent ? "text-cyan-400" : isCompleted ? "text-white" : "text-white/50"}`}
                                >
                                  {isAr ? t(status.name) : status.name}
                                </p>
                                <p className="text-sm text-white/50">{isAr ? t(status.description) : status.description}</p>
                              </div>
                            </motion.div>
                          )
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Contact Options */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <a
                      href="https://wa.me/971507313446"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
                    >
                      <MessageCircle className="w-5 h-5" />
                      {t("Chat on WhatsApp")}
                    </a>
                    <a
                      href="tel:+971507313446"
                      className="flex-1 flex items-center justify-center gap-2 py-3 glass rounded-full font-semibold hover:bg-white/10 transition-colors"
                    >
                      <Phone className="w-5 h-5" />
                      {isAr ? "اتصل بالدعم" : "Call Support"}
                    </a>
                  </div>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
