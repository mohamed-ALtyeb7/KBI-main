import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import { BookingForm } from "@/components/features/booking-form"
import { Suspense } from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Book a Technician | KBI Repair Services Abu Dhabi",
  description: "Book a professional technician for on-site device repair. Same-day service available in Abu Dhabi.",
}

export const dynamic = "force-static"

export default function BookPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 pb-16 lg:pb-0">
      <Navbar />
      <Suspense fallback={<div className="container mx-auto px-6 pt-32 pb-16">Loading booking form...</div>}>
        <BookingForm />
      </Suspense>
      <Footer />
    </main>
  )
}
