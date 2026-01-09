import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy | KBI Repair Services",
  description: "Our commitment to your privacy and data protection.",
}

export const dynamic = "force-static"

export default function PrivacyPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 pb-16 lg:pb-0">
      <Navbar />
      <section className="container mx-auto px-6 pt-32 pb-16">
        <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
        <p className="text-white/70">We respect your privacy. This placeholder page will be updated with full details.</p>
      </section>
      <Footer />
    </main>
  )
}
