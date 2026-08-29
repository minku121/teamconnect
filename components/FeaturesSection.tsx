import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Rocket, MessageSquare, Target, Shield, Zap } from 'lucide-react'
import { motion } from "framer-motion"

const featureVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.5,
    },
  }),
}

export function FeaturesSection() {
  const features = [
    { icon: Users, title: "Event Creation", description: "Create and schedule events in minutes. Set details, dates, and cover images.", color: "text-blue-500" },
    { icon: Rocket, title: "Live Streaming", description: "High-quality, low-latency live streaming to reach your audience anywhere.", color: "text-purple-500" },
    { icon: MessageSquare, title: "Interactive Chat", description: "Built-in messaging system for engaging with your attendees in real-time.", color: "text-green-500" },
    { icon: Target, title: "Instant Certificates", description: "Automatically issue digital certificates to users who attend your sessions.", color: "text-red-500" },
    { icon: Shield, title: "Host Controls", description: "Advanced stream controls, moderation, and attendee management.", color: "text-yellow-500" },
    { icon: Zap, title: "One-Click Join", description: "Attendees can join your events instantly with our streamlined process.", color: "text-orange-500" },
  ]

  return (
    <section id="features" className="container py-24 sm:py-32 max-w-[95%] mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">
          Everything you need to host great events
        </h2>
        <p className="mt-4 text-muted-foreground">
          We handle the logistics so you can focus on delivering a great experience.
        </p>
      </motion.div>
      <motion.div initial={{opacity:0,y:-20}} whileInView={{opacity:1,y:0}} transition={{duration:0.3}} className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
        {features.map((feature, index) => (
          <motion.div
            key={feature.title}
            variants={featureVariants}
            initial={{ opacity: 0, y: 20 }}
            //@ts-ignore
            whileInView={(i) => featureVariants.visible(i)}
            custom={index}
            
          >
            <Card className="bg-background/50 backdrop-blur-sm">
              <CardHeader>
                <feature.icon className={`h-10 w-10 mb-4 ${feature.color}`} />
                <CardTitle>{feature.title}</CardTitle>
                <CardDescription>
                  {feature.description}
                </CardDescription>
              </CardHeader>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </section>
  )
}

