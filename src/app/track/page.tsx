import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { TrackPageClient } from "@/components/common/track-page-client"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Order Tracking | KBI Repair Services",
  description: "Track your repair order status with live updates.",
}

export const dynamic = "force-static"

export default function TrackPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 pb-16 lg:pb-0">
      <Navbar />
      <TrackPageClient />
      <Footer />
    </main>
  )
}
