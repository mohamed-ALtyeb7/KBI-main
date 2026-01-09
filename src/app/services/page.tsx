import type React from "react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { ServicesHero } from "@/components/layout/services-hero"
import { ServiceCategory } from "@/components/features/service-category"
import { CTASection } from "@/components/layout/cta-section"
import { devices } from "@/lib/data"
import { Smartphone, Laptop, Printer, Monitor, Tv, Watch, Gamepad2, Camera, MonitorUp } from "lucide-react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Our Services | KBI Repair Services Abu Dhabi",
  description:
    "Professional on-site repair services for phones, laptops, printers, monitors, TVs, Apple Watch, CCTV, gaming consoles, and TV installation in Abu Dhabi.",
}

const iconMap: Record<string, React.ReactNode> = {
  Smartphone: <Smartphone className="w-8 h-8" />,
  Laptop: <Laptop className="w-8 h-8" />,
  Printer: <Printer className="w-8 h-8" />,
  Monitor: <Monitor className="w-8 h-8" />,
  Tv: <Tv className="w-8 h-8" />,
  Watch: <Watch className="w-8 h-8" />,
  Gamepad2: <Gamepad2 className="w-8 h-8" />,
  Camera: <Camera className="w-8 h-8" />,
  MonitorUp: <MonitorUp className="w-8 h-8" />,
}

const colorMap: Record<string, string> = {
  mobile: "cyan",
  laptop: "blue",
  pc: "cyan",
  printer: "teal",
  monitor: "indigo",
  tv: "purple",
  "apple-watch": "pink",
  gaming: "red",
  cctv: "orange",
  "tv-install": "green",
}

export default function ServicesPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 pb-16 lg:pb-0">
      <Navbar />
      <ServicesHero />

      <div className="container mx-auto px-6 py-12">
        {devices.map((device) => (
          <ServiceCategory
            key={device.id}
            id={device.id}
            name={device.name}
            icon={iconMap[device.icon]}
            brands={device.brands}
            issues={device.issues}
            accentColor={colorMap[device.id] || "cyan"}
          />
        ))}
      </div>

      <CTASection />
      <Footer />
    </main>
  )
}
