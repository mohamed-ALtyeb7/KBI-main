"use client"

import { useState } from "react"
import { useT } from "@/components/providers/language-provider"
import { GlassCard } from "@/components/ui/glass-card"
import { CheckCircle2 } from "lucide-react"

export function CorporateBookingForm() {
  const t = useT()
  const [form, setForm] = useState({
    companyName: "",
    companyEmail: "",
    contactName: "",
    mobileNumber: "",
    location: "",
    deviceCount: "",
    deviceTypes: "",
    urgency: "",
    preferredTime: "",
    notes: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>,
  ) => {
    const { name, value } = e.target
    setForm((f) => ({ ...f, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
  }

  return (
    <div className="relative group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-3xl opacity-20 group-hover:opacity-40 blur transition duration-500"></div>
      <GlassCard hoverEffect={false} className="relative border border-white/10 bg-black/50 backdrop-blur-xl">
        {submitted ? (
          <div className="text-center p-12 text-white">
            <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-green-500/20 to-emerald-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <CheckCircle2 className="w-10 h-10 text-green-400" />
            </div>
            <h3 className="text-2xl font-bold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">{t("Request Received")}</h3>
            <p className="text-white/60 max-w-md mx-auto leading-relaxed">{t("Thank you for choosing KBI Corporate. Our enterprise team has received your request and will contact you within 2 hours.")}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 text-white p-2">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="group/input">
                <label className="block text-xs font-medium text-cyan-400/80 mb-2 uppercase tracking-wider ml-1">{t("Company Name")}</label>
                <input
                  name="companyName"
                  value={form.companyName}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300 placeholder:text-white/20"
                  placeholder={t("e.g. Tech Solutions Ltd")}
                />
              </div>
              <div className="group/input">
                <label className="block text-xs font-medium text-cyan-400/80 mb-2 uppercase tracking-wider ml-1">{t("Company Email")}</label>
                <input
                  type="email"
                  name="companyEmail"
                  value={form.companyEmail}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300 placeholder:text-white/20"
                  placeholder={t("contact@company.com")}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="group/input">
                <label className="block text-xs font-medium text-cyan-400/80 mb-2 uppercase tracking-wider ml-1">{t("Contact Person")}</label>
                <input
                  name="contactName"
                  value={form.contactName}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300 placeholder:text-white/20"
                  placeholder={t("Full Name")}
                />
              </div>
              <div className="group/input">
                <label className="block text-xs font-medium text-cyan-400/80 mb-2 uppercase tracking-wider ml-1">{t("Mobile Number")}</label>
                <input
                  name="mobileNumber"
                  value={form.mobileNumber}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300 placeholder:text-white/20"
                  placeholder={t("+971 50 000 0000")}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="group/input">
                <label className="block text-xs font-medium text-cyan-400/80 mb-2 uppercase tracking-wider ml-1">{t("Location")}</label>
                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300 placeholder:text-white/20"
                  placeholder={t("Office Location / Area")}
                />
              </div>
              <div className="group/input">
                <label className="block text-xs font-medium text-cyan-400/80 mb-2 uppercase tracking-wider ml-1">{t("Device Count")}</label>
                <input
                  name="deviceCount"
                  value={form.deviceCount}
                  onChange={handleChange}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300 placeholder:text-white/20"
                  placeholder={t("Approx. number of devices")}
                />
              </div>
            </div>

            <div className="group/input">
              <label className="block text-xs font-medium text-cyan-400/80 mb-2 uppercase tracking-wider ml-1">{t("Device Types")}</label>
              <input
                name="deviceTypes"
                value={form.deviceTypes}
                onChange={handleChange}
                placeholder={t("Phones, Laptops, PC / Desktop, Printers, CCTV, TVs")}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300 placeholder:text-white/20"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="group/input">
                <label className="block text-xs font-medium text-cyan-400/80 mb-2 uppercase tracking-wider ml-1">{t("Urgency")}</label>
                <div className="relative">
                  <select
                    name="urgency"
                    value={form.urgency}
                    onChange={handleChange}
                    className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300 appearance-none text-white/80"
                  >
                    <option value="" className="bg-zinc-900">{t("Select Urgency Level")}</option>
                    <option value="Normal" className="bg-zinc-900">{t("Normal (24-48h)")}</option>
                    <option value="High" className="bg-zinc-900">{t("High (Same Day)")}</option>
                    <option value="Critical" className="bg-zinc-900">{t("Critical (Immediate - 2h)")}</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/40">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                  </div>
                </div>
              </div>
              <div className="group/input">
                <label className="block text-xs font-medium text-cyan-400/80 mb-2 uppercase tracking-wider ml-1">{t("Preferred Time")}</label>
                <input
                  name="preferredTime"
                  value={form.preferredTime}
                  onChange={handleChange}
                  placeholder={t("e.g. Tomorrow 10AM")}
                  className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300 placeholder:text-white/20"
                />
              </div>
            </div>

            <div className="group/input">
              <label className="block text-xs font-medium text-cyan-400/80 mb-2 uppercase tracking-wider ml-1">{t("Additional Notes")}</label>
              <textarea
                name="notes"
                value={form.notes}
                onChange={handleChange}
                rows={4}
                className="w-full px-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:border-cyan-500/50 focus:bg-cyan-500/5 transition-all duration-300 placeholder:text-white/20 resize-none"
                placeholder={t("Describe specific issues or requirements...")}
              />
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="submit"
                className="relative px-8 py-4 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold tracking-wide hover:shadow-[0_0_30px_rgba(6,182,212,0.5)] transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0"
              >
                {t("Submit Request")}
              </button>
            </div>
          </form>
        )}
      </GlassCard>
    </div>
  )
}
