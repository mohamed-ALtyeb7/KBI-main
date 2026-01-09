"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import Link from "next/link"
import { useSearchParams } from "next/navigation"
import { GlassCard } from "@/components/ui/glass-card"
import { devices, getRepairTime } from "@/lib/data"
import { useLanguage, useT } from "@/components/providers/language-provider"
import { db } from "@/lib/firebaseConfig"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import {
  Smartphone,
  Laptop,
  Printer,
  Monitor,
  Tv,
  Watch,
  Gamepad2,
  Camera,
  MonitorUp,
  ChevronRight,
  ChevronLeft,
  Check,
  User,
  Phone,
  MapPin,
  MessageSquare,
  Calendar,
  Clock,
  CheckCircle2,
  Copy,
  Loader2,
  Plus,
  Trash2,
} from "lucide-react"
import type { ReactNode } from "react"

const iconMap: Record<string, ReactNode> = {
  Smartphone: <Smartphone className="w-6 h-6" />,
  Laptop: <Laptop className="w-6 h-6" />,
  Printer: <Printer className="w-6 h-6" />,
  Monitor: <Monitor className="w-6 h-6" />,
  Tv: <Tv className="w-6 h-6" />,
  Watch: <Watch className="w-6 h-6" />,
  Gamepad2: <Gamepad2 className="w-6 h-6" />,
  Camera: <Camera className="w-6 h-6" />,
  MonitorUp: <MonitorUp className="w-6 h-6" />,
}

const steps = [
  { id: 1, name: "Device", icon: <Smartphone className="w-4 h-4" /> },
  { id: 2, name: "Brand", icon: <Check className="w-4 h-4" /> },
  { id: 3, name: "Model", icon: <Check className="w-4 h-4" /> },
  { id: 4, name: "Issue", icon: <Check className="w-4 h-4" /> },
  { id: 5, name: "Details", icon: <User className="w-4 h-4" /> },
]

interface DeviceEntry {
  id: string
  deviceId: string
  deviceName: string
  brandId: string
  brandName: string
  model: string
  issues: string[]
}

export function BookingForm() {
  const { lang } = useLanguage()
  const isAr = lang === "ar"
  const t = useT()
  const ChevronIcon = isAr ? ChevronLeft : ChevronRight
  const searchParams = useSearchParams()
  const preselectedDevice = searchParams.get("device")

  const [currentStep, setCurrentStep] = useState(1)
  const [selectedDevice, setSelectedDevice] = useState<string | null>(preselectedDevice)
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null)
  const [selectedModel, setSelectedModel] = useState<string | null>(null)
  const [selectedIssues, setSelectedIssues] = useState<string[]>([])

  const [deviceEntries, setDeviceEntries] = useState<DeviceEntry[]>([])

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    whatsapp: "",
    address: "",
    notes: "",
    preferredDate: "",
    preferredTime: "",
  })
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState("")
  const [copied, setCopied] = useState(false)
  const [isOtherModel, setIsOtherModel] = useState(false)
  const [customModel, setCustomModel] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDetectingLocation, setIsDetectingLocation] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)

  // Handle preselected device from URL
  useEffect(() => {
    if (preselectedDevice && devices.find((d) => d.id === preselectedDevice)) {
      setSelectedDevice(preselectedDevice)
      setCurrentStep(2)
    }
  }, [preselectedDevice])

  const currentDeviceData = devices.find((d) => d.id === selectedDevice)
  const currentBrandData = currentDeviceData?.brands.find((b) => b.id === selectedBrand)

  const handleDeviceSelect = (deviceId: string) => {
    setSelectedDevice(deviceId)
    setSelectedBrand(null)
    setSelectedModel(null)
    setSelectedIssues([])
    setCurrentStep(2)
  }

  const handleBrandSelect = (brandId: string) => {
    setSelectedBrand(brandId)
    setSelectedModel(null)
    setCurrentStep(3)
  }

  const handleModelSelect = (model: string) => {
    setSelectedModel(model)
    setIsOtherModel(false)
    setCurrentStep(4)
  }

  const handleIssueToggle = (issue: string) => {
    setSelectedIssues(prev =>
      prev.includes(issue)
        ? prev.filter(i => i !== issue)
        : [...prev, issue]
    )
  }

  const generateYearRangeModels = (prefix: string, start: number, end: number) => {
    const list: string[] = []
    for (let y = start; y <= end; y++) {
      list.push(`${prefix} (${y})`)
    }
    return list
  }

  const generateIphoneModelsUpTo2025 = (): string[] => {
    return [
      "iPhone 6 (2014)",
      "iPhone 7 (2016)",
      "iPhone 8 (2017)",
      "iPhone X (2017)",
      "iPhone XR (2018)",
      "iPhone XS (2018)",
      "iPhone 11 (2019)",
      "iPhone 12 (2020)",
      "iPhone 13 (2021)",
      "iPhone 14 (2022)",
      "iPhone 15 (2023)",
      "iPhone 16 (2024)",
      "iPhone 17 (2025)",
      "iPhone 17 Pro Max (2025)",
    ]
  }

  const generateSamsungSModelsUpTo2025 = (): string[] => {
    return [
      "Galaxy S10 (2019)",
      "Galaxy S20 (2020)",
      "Galaxy S21 (2021)",
      "Galaxy S22 (2022)",
      "Galaxy S23 (2023)",
      "Galaxy S24 (2024)",
      "Galaxy S25 (2025)",
    ]
  }

  const addDeviceToList = () => {
    if (selectedDevice && selectedBrand && selectedModel && selectedIssues.length > 0 && currentDeviceData && currentBrandData) {
      const newEntry: DeviceEntry = {
        id: Date.now().toString(),
        deviceId: selectedDevice,
        deviceName: currentDeviceData.name,
        brandId: selectedBrand,
        brandName: currentBrandData.name,
        model: selectedModel,
        issues: selectedIssues,
      }
      setDeviceEntries([...deviceEntries, newEntry])
      // Reset selections for adding another device
      setSelectedDevice(null)
      setSelectedBrand(null)
      setSelectedModel(null)
      setSelectedIssues([])
      setCurrentStep(1)
    }
  }

  const removeDeviceEntry = (id: string) => {
    setDeviceEntries(deviceEntries.filter((entry) => entry.id !== id))
  }

  const proceedToDetails = () => {
    if (selectedDevice && selectedBrand && selectedModel && selectedIssues.length > 0 && currentDeviceData && currentBrandData) {
      const newEntry: DeviceEntry = {
        id: Date.now().toString(),
        deviceId: selectedDevice,
        deviceName: currentDeviceData.name,
        brandId: selectedBrand,
        brandName: currentBrandData.name,
        model: selectedModel,
        issues: selectedIssues,
      }
      setDeviceEntries([...deviceEntries, newEntry])
    }
    setCurrentStep(5)
  }

  const detectLocation = async () => {
    setIsDetectingLocation(true)
    setLocationError(null)

    if (!navigator.geolocation) {
      setLocationError(t("Geolocation is not supported by your browser"))
      setIsDetectingLocation(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords

          // Use OpenStreetMap Nominatim for reverse geocoding (free, no API key needed)
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&addressdetails=1`,
            {
              headers: {
                'Accept-Language': lang === 'ar' ? 'ar' : 'en'
              }
            }
          )

          if (!response.ok) throw new Error("Failed to get address")

          const data = await response.json()

          // Build a readable address
          let address = ""
          if (data.address) {
            const parts = []
            if (data.address.road) parts.push(data.address.road)
            if (data.address.neighbourhood) parts.push(data.address.neighbourhood)
            if (data.address.suburb) parts.push(data.address.suburb)
            if (data.address.city || data.address.town) parts.push(data.address.city || data.address.town)
            if (data.address.state) parts.push(data.address.state)
            address = parts.join(", ")
          } else {
            address = data.display_name || ""
          }

          setFormData(prev => ({ ...prev, address }))
        } catch (error) {
          setLocationError(t("Failed to detect address. Please enter manually."))
        } finally {
          setIsDetectingLocation(false)
        }
      },
      (error) => {
        let message = t("Failed to get location")
        if (error.code === error.PERMISSION_DENIED) {
          message = t("Location permission denied. Please allow access or enter address manually.")
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          message = t("Location unavailable. Please enter address manually.")
        }
        setLocationError(message)
        setIsDetectingLocation(false)
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    )
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const generateTrackingNumber = () => {
    const num = Math.floor(1000 + Math.random() * 9000)
    return `KBI-${num}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const createdTrackingNumbers: string[] = []

      for (const entry of deviceEntries) {
        const newTracking = generateTrackingNumber()
        createdTrackingNumbers.push(newTracking)

        // Save to Firestore
        await addDoc(collection(db, "orders"), {
          orderId: newTracking,
          name: formData.name,
          phone: formData.phone,
          whatsapp: formData.whatsapp || "",
          address: formData.address,
          notes: formData.notes || "",
          preferredDate: formData.preferredDate || "",
          preferredTime: formData.preferredTime || "",

          // Device Details
          deviceType: entry.deviceName,
          brand: entry.brandName,
          model: entry.model,
          issueType: entry.issues.join(", "),

          // Status & Metadata
          status: "Order Created",
          technician: "unassigned",
          createdAt: new Date().toISOString(),
          price: 0,
        })
      }

      setTrackingNumber(createdTrackingNumbers.join(", "))
      setIsSubmitted(true)
    } catch (error) {
      alert("Failed to create order. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const copyTrackingNumber = () => {
    navigator.clipboard.writeText(trackingNumber)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const goToStep = (step: number) => {
    if (step < currentStep) {
      setCurrentStep(step)
    }
  }

  if (isSubmitted) {
    return (
      <section className="relative pt-32 pb-16 min-h-screen">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] right-[-10%] w-[40vw] h-[40vw] bg-green-600/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[10%] left-[-10%] w-[30vw] h-[30vw] bg-cyan-600/10 rounded-full blur-[120px]" />
        </div>

        <div className="container mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="max-w-lg mx-auto text-center"
          >
            <GlassCard className="p-8">
              <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10 text-green-400" />
              </div>

              <h2 className="text-2xl font-bold mb-2">{t("Order Created Successfully!")}</h2>
              <p className="text-white/60 mb-6">
                {isAr ? `تم إنشاء طلبك بنجاح. رقم التتبع الخاص بك هو: ${trackingNumber}.` : `Your order has been created successfully. Tracking Number: ${trackingNumber}.`}
              </p>

              <div className="bg-white/5 rounded-2xl p-6 mb-6">
                <p className="text-sm text-white/50 mb-2">{t("Your Tracking Number")}</p>
                <div className="flex items-center justify-center gap-3">
                  <span className="text-2xl font-mono font-bold text-cyan-400">{trackingNumber}</span>
                  <button
                    onClick={copyTrackingNumber}
                    className="p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                  >
                    {copied ? <Check className="w-5 h-5 text-green-400" /> : <Copy className="w-5 h-5 text-white/60" />}
                  </button>
                </div>
              </div>

              <div className="space-y-3 text-left mb-6">
                <h4 className="text-sm font-semibold text-white/80">
                  {deviceEntries.length > 1 ? `${t("Device(s)")} (${deviceEntries.length})` : t("Device")}
                </h4>
                {deviceEntries.map((entry, index) => (
                  <div key={entry.id} className="bg-white/5 rounded-xl p-3 space-y-1">
                    {deviceEntries.length > 1 && (
                      <p className="text-xs text-cyan-400 font-medium">{t("Device")} {index + 1}</p>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">{t("Type")}:</span>
                      <span className="text-white">{isAr ? t(entry.deviceName) : entry.deviceName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">{t("Brand")}:</span>
                      <span className="text-white">{entry.brandName}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">{t("Model")}:</span>
                      <span className="text-white">{entry.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-white/50">{t("Issue")}:</span>
                      <span className="text-white">{isAr ? entry.issues.map(i => t(i)).join(", ") : entry.issues.join(", ")}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-3">
                <Link
                  href="/track"
                  className="w-full py-3 bg-cyan-500 text-black rounded-full font-semibold hover:bg-cyan-400 transition-colors"
                >
                  {t("Track Your Order")}
                </Link>
                <a
                  href={`https://wa.me/971507313446?text=Hi! I just booked a repair for ${deviceEntries.length} device(s). My tracking number is ${trackingNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition-colors"
                >
                  {t("Chat on WhatsApp")}
                </a>
              </div>
            </GlassCard>
          </motion.div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative pt-32 pb-16 min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[40vw] h-[40vw] bg-cyan-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[30vw] h-[30vw] bg-blue-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 relative z-10">
        <div className="text-center mb-10">
          <h1 className="text-3xl md:text-5xl font-bold mb-4">
            {isAr ? (
              <>
                {t("Book a")} <span className="text-cyan-400">{t("Technician")}</span>
              </>
            ) : (
              <>Book a <span className="text-cyan-400">Technician</span></>
            )}
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            {t("Select your device, tell us the problem, and we'll send a certified technician to your location.")}
          </p>
        </div>

        {deviceEntries.length > 0 && currentStep < 5 && (
          <div className="max-w-4xl mx-auto mb-6">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/80">{t("Devices Added")} ({deviceEntries.length})</h3>
              </div>
              <div className="space-y-2">
                {deviceEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {entry.brandName} {entry.model}
                        </p>
                        <p className="text-xs text-white/50">{isAr ? entry.issues.map(i => t(i)).join(", ") : entry.issues.join(", ")}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDeviceEntry(entry.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        {/* Progress Steps */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex items-center justify-between">
            {steps.map((step, index) => (
              <div key={step.id} className="flex items-center">
                <button
                  onClick={() => goToStep(step.id)}
                  disabled={step.id > currentStep}
                  className={`flex flex-col items-center gap-2 ${step.id <= currentStep ? "cursor-pointer" : "cursor-not-allowed"}`}
                >
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${step.id < currentStep
                      ? "bg-cyan-500 text-black"
                      : step.id === currentStep
                        ? "bg-cyan-500/20 border-2 border-cyan-500 text-cyan-400"
                        : "bg-white/5 text-white/30"
                      }`}
                  >
                    {step.id < currentStep ? <Check className="w-5 h-5" /> : step.id}
                  </div>
                  <span
                    className={`text-xs hidden sm:block ${step.id <= currentStep ? "text-white" : "text-white/30"}`}
                  >
                    {t(step.name)}
                  </span>
                </button>
                {index < steps.length - 1 && (
                  <div
                    className={`w-8 md:w-16 lg:w-24 h-0.5 mx-2 ${step.id < currentStep ? "bg-cyan-500" : "bg-white/10"
                      }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {deviceEntries.length > 0 && currentStep < 5 && (
          <div className="max-w-4xl mx-auto mb-10">
            <GlassCard className="p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white/80">{t("Devices Added")} ({deviceEntries.length})</h3>
              </div>
              <div className="space-y-2">
                {deviceEntries.map((entry, index) => (
                  <div
                    key={entry.id}
                    className="flex items-center justify-between bg-white/5 rounded-xl p-3 border border-white/10"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                        {index + 1}
                      </div>
                      <div>
                        <p className="text-sm font-medium">
                          {entry.brandName} {entry.model}
                        </p>
                        <p className="text-xs text-white/50">{entry.issues.join(", ")}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeDeviceEntry(entry.id)}
                      className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </GlassCard>
          </div>
        )}

        <div className="max-w-4xl mx-auto">
          <AnimatePresence mode="wait">
            {/* Step 1: Device Selection */}
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard>
                  <h2 className="text-xl font-semibold mb-6">
                    {t(deviceEntries.length > 0 ? "Add Another Device" : "Select Your Device")}
                  </h2>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {devices.map((device) => (
                      <button
                        key={device.id}
                        onClick={() => handleDeviceSelect(device.id)}
                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center gap-3 ${selectedDevice === device.id
                          ? "bg-cyan-500/20 border-cyan-500"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                          }`}
                      >
                        <div className={selectedDevice === device.id ? "text-cyan-400" : "text-white/60"}>
                          {iconMap[device.icon]}
                        </div>
                        <span className="text-sm font-medium text-center">{isAr ? t(device.name) : device.name}</span>
                      </button>
                    ))}
                  </div>

                  {deviceEntries.length > 0 && (
                    <div className="mt-6 pt-6 border-t border-white/10">
                      <button
                        onClick={() => setCurrentStep(5)}
                        className="w-full py-3 bg-cyan-500 text-black rounded-full font-semibold hover:bg-cyan-400 transition-colors"
                      >
                        {t("Continue with")} {deviceEntries.length} {t("Device(s)")}
                      </button>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* Step 2: Brand Selection */}
            {currentStep === 2 && currentDeviceData && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-2 mb-6">
                    <button onClick={() => setCurrentStep(1)} className="text-white/50 hover:text-white">
                      {isAr ? t(currentDeviceData.name) : currentDeviceData.name}
                    </button>
                    <ChevronIcon className="w-4 h-4 text-white/30" />
                    <span className="text-cyan-400">{t("Select Brand")}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                    {currentDeviceData.brands.map((brand) => (
                      <button
                        key={brand.id}
                        onClick={() => handleBrandSelect(brand.id)}
                        className={`p-4 rounded-xl border transition-all text-center ${selectedBrand === brand.id
                          ? "bg-cyan-500/20 border-cyan-500"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                          }`}
                      >
                        <span className="text-sm font-medium">{brand.name}</span>
                      </button>
                    ))}
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 3: Model Selection */}
            {currentStep === 3 && currentBrandData && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <button onClick={() => setCurrentStep(1)} className="text-white/50 hover:text-white">
                      {currentDeviceData?.name ? (isAr ? t(currentDeviceData.name) : currentDeviceData.name) : ""}
                    </button>
                    <ChevronIcon className="w-4 h-4 text-white/30" />
                    <button onClick={() => setCurrentStep(2)} className="text-white/50 hover:text-white">
                      {currentBrandData.name}
                    </button>
                    <ChevronIcon className="w-4 h-4 text-white/30" />
                    <span className="text-cyan-400">{t("Select Model")}</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {(() => {
                      let modelsToShow: string[] = []
                      if (selectedDevice === "mobile" && selectedBrand === "apple") {
                        modelsToShow = generateIphoneModelsUpTo2025()
                      } else if (selectedDevice === "mobile" && selectedBrand === "samsung") {
                        modelsToShow = generateSamsungSModelsUpTo2025()
                      } else if (selectedDevice === "tablet" && selectedBrand === "apple-ipad") {
                        modelsToShow = generateYearRangeModels("iPad", 2011, 2025)
                      } else if (selectedDevice === "tablet" && selectedBrand === "samsung-tab") {
                        modelsToShow = generateYearRangeModels("Galaxy Tab", 2012, 2025)
                      } else if (selectedDevice === "pc") {
                        modelsToShow = [
                          ...currentBrandData.models,
                          ...generateYearRangeModels("Model Year", 2015, 2025),
                        ]
                      } else {
                        modelsToShow = currentBrandData.models
                      }
                      return (
                        <>
                          {modelsToShow.map((model) => (
                            <button
                              key={model}
                              onClick={() => handleModelSelect(model)}
                              className={`p-4 rounded-xl border transition-all text-center ${selectedModel === model
                                ? "bg-cyan-500/20 border-cyan-500"
                                : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                                }`}
                            >
                              <span className="text-sm font-medium">{model}</span>
                            </button>
                          ))}
                          <button
                            onClick={() => setIsOtherModel(true)}
                            className="p-4 rounded-xl border transition-all text-center bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                          >
                            <span className="text-sm font-medium">{t("Other Model (Enter Manually)")}</span>
                          </button>
                        </>
                      )
                    })()}
                  </div>
                  {isOtherModel && (
                    <div className="mt-4 flex items-center gap-3">
                      <input
                        type="text"
                        value={customModel}
                        onChange={(e) => setCustomModel(e.target.value)}
                        placeholder={t("Enter Model Name")}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500"
                      />
                      <button
                        onClick={() => customModel && handleModelSelect(`Other: ${customModel}`)}
                        className="px-5 py-3 bg-cyan-500 text-black rounded-full font-semibold hover:bg-cyan-400 transition-colors disabled:opacity-50"
                        disabled={!customModel}
                      >
                        {t("Use This Model")}
                      </button>
                    </div>
                  )}
                </GlassCard>
              </motion.div>
            )}

            {/* Step 4: Issue Selection - Updated with Add Another Device option */}
            {currentStep === 4 && currentDeviceData && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard>
                  <div className="flex items-center gap-2 mb-6 flex-wrap">
                    <button onClick={() => setCurrentStep(1)} className="text-white/50 hover:text-white">
                      {isAr ? t(currentDeviceData.name) : currentDeviceData.name}
                    </button>
                    <ChevronIcon className="w-4 h-4 text-white/30" />
                    <button onClick={() => setCurrentStep(2)} className="text-white/50 hover:text-white">
                      {currentBrandData?.name}
                    </button>
                    <ChevronIcon className="w-4 h-4 text-white/30" />
                    <button onClick={() => setCurrentStep(3)} className="text-white/50 hover:text-white">
                      {selectedModel}
                    </button>
                    <ChevronIcon className="w-4 h-4 text-white/30" />
                    <span className="text-cyan-400">{t("Select Issue")}</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {currentDeviceData.issues.map((issue) => (
                      <button
                        key={issue}
                        onClick={() => handleIssueToggle(issue)}
                        className={`p-4 rounded-2xl border transition-all text-left flex items-center gap-3 ${selectedIssues.includes(issue)
                          ? "bg-cyan-500/20 border-cyan-500"
                          : "bg-white/5 border-white/10 hover:bg-white/10 hover:border-white/20"
                          }`}
                      >
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center ${selectedIssues.includes(issue) ? "bg-cyan-500 border-cyan-500" : "border-white/30"}`}>
                          {selectedIssues.includes(issue) && <Check className="w-3 h-3 text-black" />}
                        </div>
                        <span className="text-sm font-medium">{isAr ? t(issue) : issue}</span>
                        <span className="ml-auto text-xs text-white/50">~{getRepairTime(selectedDevice as string, issue)} {isAr ? "دقيقة" : "min"}</span>
                      </button>
                    ))}
                  </div>

                  {selectedIssues.length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30">
                      <p className="text-sm text-cyan-400 font-medium">
                        {t("Selected Issues")} ({selectedIssues.length}): {selectedIssues.join(", ")}
                      </p>
                    </div>
                  )}

                  <div className="mt-6 pt-6 border-t border-white/10">
                    {selectedIssues.length > 0 && (
                      <button
                        onClick={proceedToDetails}
                        className="w-full py-3 bg-cyan-500 text-black rounded-full font-semibold hover:bg-cyan-400 transition-colors"
                      >
                        {t("Continue to Details")}
                      </button>
                    )}
                  </div>

                  <div className="mt-10">
                    <GlassCard hoverEffect={false} className="bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 border border-white/10">
                      <div className="flex flex-col items-center text-center gap-4">
                        <div className="flex items-center gap-2 text-white/80 text-sm">
                          <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center">
                            <Plus className="w-4 h-4" />
                          </div>
                          <span className="font-semibold">{t("Add Another Device")}</span>
                        </div>
                        <p className="text-white/60 text-sm">{t("One visit, all devices • Single tracking number • Priority scheduling")}</p>
                        <button
                          onClick={addDeviceToList}
                          disabled={selectedIssues.length === 0}
                          className="px-6 py-3 bg-white/10 text-white border border-white/20 rounded-full font-semibold hover:bg-white/20 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-5 h-5" />
                          {t("Add Another Device")}
                        </button>
                      </div>
                    </GlassCard>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            {/* Step 5: Contact Details - Updated to show all devices */}
            {currentStep === 5 && (
              <motion.div
                key="step5"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
              >
                <GlassCard>
                  <h2 className="text-xl font-semibold mb-6">{t("Your Details")}</h2>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">{t("Full Name *")}</label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                          <input
                            type="text"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder={t("Your full name")}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-2">{t("Phone Number *")}</label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                          <input
                            type="tel"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="050 XXX XXXX"
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">{t("WhatsApp")}</label>
                        <div className="relative">
                          <MessageSquare className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                          <input
                            type="tel"
                            name="whatsapp"
                            value={formData.whatsapp}
                            onChange={handleInputChange}
                            placeholder={t("WhatsApp number (optional)")}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-2">{t("Address / Location *")}</label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-4 w-5 h-5 text-white/30" />
                        <input
                          type="text"
                          name="address"
                          required
                          value={formData.address}
                          onChange={handleInputChange}
                          placeholder={t("Your address in Abu Dhabi")}
                          className="w-full pl-12 pr-32 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                        />
                        <button
                          type="button"
                          onClick={detectLocation}
                          disabled={isDetectingLocation}
                          className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-500/50 rounded-lg text-cyan-400 text-xs font-medium transition-colors disabled:opacity-50 flex items-center gap-1.5"
                        >
                          {isDetectingLocation ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              {t("Detecting...")}
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3 h-3" />
                              {t("Detect")}
                            </>
                          )}
                        </button>
                      </div>
                      {locationError && (
                        <p className="text-xs text-red-400 mt-1">{locationError}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-white/60 mb-2">{t("Preferred Date")}</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                          <input
                            type="date"
                            name="preferredDate"
                            value={formData.preferredDate}
                            onChange={handleInputChange}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm text-white/60 mb-2">{t("Preferred Time")}</label>
                        <div className="relative">
                          <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/30" />
                          <select
                            name="preferredTime"
                            value={formData.preferredTime}
                            onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors appearance-none"
                          >
                            <option value="" className="bg-black">
                              {t("Select time")}
                            </option>
                            <option value="morning" className="bg-black">
                              {t("Morning (9AM - 12PM)")}
                            </option>
                            <option value="afternoon" className="bg-black">
                              {t("Afternoon (12PM - 5PM)")}
                            </option>
                            <option value="evening" className="bg-black">
                              {t("Evening (5PM - 9PM)")}
                            </option>
                            <option value="asap" className="bg-black">
                              {t("As Soon As Possible")}
                            </option>
                          </select>
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm text-white/60 mb-2">{t("Additional Notes")}</label>
                      <div className="relative">
                        <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-white/30" />
                        <textarea
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder={t("Describe the issue in more detail (optional)")}
                          rows={3}
                          className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 transition-colors resize-none"
                        />
                      </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-semibold text-white/80">
                          {t("Order Summary")} ({deviceEntries.length} {t("Device(s)")})
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setCurrentStep(1)
                          }}
                          className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          {t("Add More")}
                        </button>
                      </div>
                      <div className="space-y-3">
                        {deviceEntries.map((entry, index) => (
                          <div key={entry.id} className="flex items-start justify-between bg-white/5 rounded-lg p-3">
                            <div className="space-y-1 text-sm flex-1">
                              {deviceEntries.length > 1 && (
                                <p className="text-xs text-cyan-400 font-medium mb-1">{t("Device")} {index + 1}</p>
                              )}
                              <div className="flex justify-between">
                                <span className="text-white/50">{t("Type")}:</span>
                                <span>{isAr ? t(entry.deviceName) : entry.deviceName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/50">{t("Brand")}:</span>
                                <span>{entry.brandName}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/50">{t("Model")}:</span>
                                <span>{entry.model}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-white/50">{t("Issue")}:</span>
                                <span>{isAr ? entry.issues.map(i => t(i)).join(", ") : entry.issues.join(", ")}</span>
                              </div>
                            </div>
                            {deviceEntries.length > 1 && (
                              <button
                                type="button"
                                onClick={() => removeDeviceEntry(entry.id)}
                                className="ml-3 p-1.5 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={deviceEntries.length === 0 || isSubmitting}
                      className="w-full py-4 bg-cyan-500 text-black rounded-full font-semibold text-lg hover:bg-cyan-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                      {t("Create Order")}
                    </button>

                    <p className="text-center text-sm text-white/40">
                      {t("By booking, you agree to our terms. Payment is only after successful repair.")}
                    </p>
                  </form>
                </GlassCard>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}
