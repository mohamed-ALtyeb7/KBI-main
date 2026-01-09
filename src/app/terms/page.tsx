import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Service | KBI Repair Services",
  description: "Service terms and conditions.",
}

export const dynamic = "force-static"

export default function TermsPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 pb-16 lg:pb-0">
      <Navbar />
      <section className="container mx-auto px-6 pt-32 pb-16">
        <h1 className="text-3xl font-bold mb-4">Terms of Service</h1>
        <p className="text-white/70">These placeholder terms will be updated with complete information.</p>
      </section>
      <Footer />
    </main>
  )
}
