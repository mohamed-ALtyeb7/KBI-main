import { Navbar } from "@/components/layout/navbar"
import { Hero } from "@/components/layout/hero"
import { Services } from "@/components/features/services"
import { WhyChooseUs } from "@/components/layout/why-choose-us"
import { HowItWorks } from "@/components/layout/how-it-works"
import { SlidingLogoMarquee } from "@/components/features/sliding-logo-marquee"
import { CTASection } from "@/components/layout/cta-section"
import { Footer } from "@/components/layout/footer"

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-cyan-500/30 pb-16 lg:pb-0">
      <Navbar />
      <Hero />
      <Services />
      <WhyChooseUs />
      <HowItWorks />
      <section className="container mx-auto px-6 py-12">
        <h2 className="text-2xl md:text-3xl font-bold mb-6">Trusted by</h2>
        <SlidingLogoMarquee
          items={[
            { id: "samsung", content: <span className="text-white/70">Samsung</span>, href: "https://www.samsung.com" },
            { id: "apple", content: <span className="text-white/70">Apple</span>, href: "https://www.apple.com" },
            { id: "dell", content: <span className="text-white/70">Dell</span>, href: "https://www.dell.com" },
            { id: "hp", content: <span className="text-white/70">HP</span>, href: "https://www.hp.com" },
            { id: "lg", content: <span className="text-white/70">LG</span>, href: "https://www.lg.com" },
            { id: "sony", content: <span className="text-white/70">Sony</span>, href: "https://www.sony.com" },
            { id: "xiaomi", content: <span className="text-white/70">Xiaomi</span>, href: "https://www.mi.com" },
            { id: "lenovo", content: <span className="text-white/70">Lenovo</span>, href: "https://www.lenovo.com" },
          ]}
          speed={40}
          pauseOnHover
          enableBlur
          blurIntensity={1}
          height="110px"
          width="100%"
          gap="1rem"
          scale={1}
          direction="horizontal"
          autoPlay
          showGridBackground
          enableSpillEffect={false}
          animationSteps={8}
          showControls={true}
        />
      </section>
      <CTASection />
      <Footer />
    </main>
  )
}
