import { Navbar } from "@/components/Navbar"
import { TextAnimate } from "@/components/ui/text-animate"
import { motion } from "framer-motion"
import Hero from "@/components/Hero"
import FeatureCard from "@/components/FeatureCard"
import { FeaturesSection } from "@/components/FeaturesSection"
import { TeamsSection } from "@/components/TeamSection"
import { MarqueeDemo } from "@/components/marqee-component"
import { CTASection } from "@/components/CtaSection"
import Footer from "@/components/Footer"

export default function Home() {

  return (
    <div className="min-h-screen bg-white text-black dark:bg-black dark:text-white relative overflow-hidden">
      <Navbar />


      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <main className="flex flex-col items-center w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Section */}
        <div className="w-full">
          <Hero />
        </div>

        {/* Feature Card */}
        <div className="w-full mt-16">
          <FeatureCard />
        </div>

        {/* Features Section */}
        <div className="w-full mt-24">
          <FeaturesSection />
        </div>

        {/* Teams Section */}
        <div className="w-full mt-24">
          <TeamsSection />
        </div>

        {/* Testimonials Section */}
        <div className="w-full mt-24">
          <div className="max-w-3xl mx-auto text-center">
            <TextAnimate
              animation="slideLeft"
              by="character"
              startOnView={true}
              className="text-4xl font-bold text-center underline-offset-2"
            >
              What People Are Saying
            </TextAnimate>
            <p className="mt-4 text-muted-foreground text-lg">
              Don't just take our word for it. Here's what the community thinks.
            </p>
          </div>
        </div>

        {/* Marquee */}
        <div className="w-full mt-12">
          <MarqueeDemo />
        </div>

        {/* CTA Section */}
        <div className="w-full mt-24">
          <CTASection />
        </div>
      </main>

      {/* Footer */}
      <div className="w-full mt-24">
        <Footer />
      </div>
    </div>
  )
}
