"use client"

import React from "react"
import { Footer } from "@/components/footer"
import { AnimatedBackground } from "@/components/animated-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Video,
  TrendingUp,
  Youtube,
  ImageIcon,
  Palette,
  Gamepad2,
  Image as FrameIcon,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Shield,
  Clock,
  Star,
  MessageCircle,
  Code,
} from "lucide-react"
import Link from "next/link"

const servicesList = [
  {
    icon: Video,
    title: "Wedding Film Editing",
    serviceValue: "Wedding Film Editing",
    description: "Cinematic, emotional storytelling. We turn raw wedding footage into a timeless family heirloom that captures every feeling.",
    features: [
      "Cinematic color grading & LUTs",
      "Multi-camera & audio synchronization",
      "Speech & background sound enhancement",
      "Dynamic highlight reels (3-5 minutes)",
      "Full celebration edits (30-60 minutes)",
    ],
    startingPrice: "₹3,000",
    badge: "Cinematic",
    badgeColor: "from-yellow-500/20 to-amber-500/20 text-yellow-400 border-yellow-500/30",
    thumbnail: "/romantic-wedding-cinematography.jpg",
  },
  {
    icon: TrendingUp,
    title: "Trend Reels & Shorts",
    serviceValue: "Social Media Reels",
    description: "High-retention, fast-paced editing designed for social algorithms. Grow your audience on Instagram, TikTok, and YouTube Shorts.",
    features: [
      "Engaging dynamic captions & subtitles",
      "Sound effects & audio design (SFX)",
      "Zoom-ins, sound-syncs & transitions",
      "Hook-focused pacing to minimize drops",
      "Delivered in optimal 9:16 aspect ratio",
    ],
    startingPrice: "₹500",
    badge: "Viral-Ready",
    badgeColor: "from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/30",
    thumbnail: "/viral-instagram-reel.jpg",
  },
  {
    icon: Youtube,
    title: "YouTube Video Editing",
    serviceValue: "YouTube Video Editing",
    description: "Full-length vlog, review, tutorial, or documentary editing. Keeps your viewers hooked from the intro hook to the end screen.",
    features: [
      "A-roll & B-roll sequencing & cleaning",
      "Interactive pop-ups, lower-thirds & assets",
      "Copyright-free music & SFX sourcing",
      "Pacing optimization (retention mapping)",
      "Up to 4K resolution output support",
    ],
    startingPrice: "₹1,500",
    badge: "Retention-Pro",
    badgeColor: "from-red-500/20 to-rose-500/20 text-red-400 border-red-500/30",
    thumbnail: "/tech-review-youtube.jpg",
  },
  {
    icon: FrameIcon,
    title: "Premium Photo Frames",
    serviceValue: "Photo Frames",
    description: "Transform your online memories into tangible physical prints in beautiful premium frames for walls and tables.",
    features: [
      "Popular sizes (12x8, 10x8, 8x6, 6x4)",
      "Thick premium 1-inch & 1.25-inch frames",
      "Ultra-clear print quality on matte/glossy paper",
      "Sturdy backing with wall/table mounts",
      "Safely packaged & shipped nationwide",
    ],
    startingPrice: "₹150",
    badge: "Top Seller",
    badgeColor: "from-purple-500/20 to-pink-500/20 text-purple-400 border-purple-500/30",
    thumbnail: "/elegant-wooden-photo-frame-4x6-with-family-photo.jpg",
  },
  {
    icon: ImageIcon,
    title: "Thumbnail Design",
    serviceValue: "Thumbnail Design",
    description: "Click-worthy, high-contrast thumbnails designed to maximize your click-through rate (CTR) and grab instant user attention.",
    features: [
      "Expressive, high-impact text layouts",
      "Face/object retouching & glow styling",
      "High-contrast color themes for feed standout",
      "Optimized file compression & 1080p output",
      "A/B testing variations upon request",
    ],
    startingPrice: "₹300",
    badge: "High CTR",
    badgeColor: "from-green-500/20 to-emerald-500/20 text-green-400 border-green-500/30",
    thumbnail: "/creative-video-editor.jpg",
  },
  {
    icon: Palette,
    title: "Logo & Animation",
    serviceValue: "Logo & Animation",
    description: "Professional brand identity design, animated intros/outros, lower thirds, and customized motion graphics overlays.",
    features: [
      "Custom vector logo design concepts",
      "Sleek intro & outro animations",
      "Animated social media overlay panels",
      "Transparent web-ready alpha channel formats",
      "Vector source files (.AI, .EPS, .SVG)",
    ],
    startingPrice: "₹1,000",
    badge: "Identity",
    badgeColor: "from-indigo-500/20 to-violet-500/20 text-indigo-400 border-indigo-500/30",
    thumbnail: "/adobe-after-effects-logo-purple-blue.jpg",
  },
  {
    icon: Gamepad2,
    title: "Gaming Montages",
    serviceValue: "Gaming Montages",
    description: "High-energy gameplay recaps, highlight edits, and sync-to-beat montages with custom overlays and gaming-related effects.",
    features: [
      "Beat-synced flow & frame-rate controls",
      "Killfeed highlighting & audio ducking",
      "Cinematic game camera angle pans",
      "Custom HUD and 3D tracker text effects",
      "Clutch moment slow-motion visual accenting",
    ],
    startingPrice: "₹1,000",
    badge: "High-Energy",
    badgeColor: "from-orange-500/20 to-amber-500/20 text-orange-400 border-orange-500/30",
    thumbnail: "/gaming-montage-highlights.jpg",
  },
  {
    icon: Code,
    title: "AI-Powered Web Dev",
    serviceValue: "AI Web Development",
    description: "High-speed frontend and full-stack web development powered by state-of-the-art AI generation tools (like Antigravity and Vercel). Secure, responsive, and completed in record time.",
    features: [
      "Rapid AI-driven prototyping",
      "Tailwind CSS & responsive design",
      "Clean Next.js/React code structure",
      "Vercel cloud hosting deployment",
      "Full-stack integrations & API setup",
    ],
    startingPrice: "₹5,000",
    badge: "High-Tech",
    badgeColor: "from-teal-500/20 to-emerald-500/20 text-teal-400 border-teal-500/30",
    thumbnail: "/ai-web-development-thumbnail.png",
  },
]

const faqs = [
  {
    question: "How do I choose the correct service for my project?",
    answer: "You can browse our list above to find the service that matches your footage. If you're editing a standard YouTube vlog, select 'YouTube Video Editing'. If you're building short vertical clips, select 'Trend Reels & Shorts'. If your project falls outside these categories, select 'Other' on our order form, and our team will guide you.",
  },
  {
    question: "How long does a typical service take?",
    answer: "Reels and thumbnails are usually delivered within 24 to 48 hours. Standard YouTube videos and logos take about 2-3 days, while complex cinematic wedding films require 5-7 days. Rush deliveries can be arranged if specified in your order.",
  },
  {
    question: "Do you offer discounts for bulk or monthly orders?",
    answer: "Yes, we offer custom monthly packages for creators who need recurring content (e.g. 10 reels/month or 4 YouTube videos/month). Contact us on WhatsApp or select 'Other' in the form to get a custom discounted quote.",
  },
  {
    question: "What is your revision process?",
    answer: "We offer unlimited revisions to ensure you're completely happy with the outcome. Once we deliver the draft, you can submit your feedback directly in your Client Dashboard or via chat, and we'll update it promptly.",
  },
]

export default function ServicesPage() {
  return (
    <>
      <AnimatedBackground />

      <main className="min-h-screen pt-24 pb-20">
        {/* Header Section */}
        <section className="py-16 px-4 relative">
          <div className="container mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 glass rounded-full border border-[#FACC15]/30">
              <Sparkles className="w-4 h-4 text-[#FACC15]" />
              <span className="text-[#FACC15] text-sm font-semibold">Our Offerings</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
              <span className="text-white">Professional Creative</span>
              <br />
              <span className="text-[#FACC15] text-glow-yellow">Services & Pricing</span>
            </h1>

            <p className="text-xl max-w-3xl mx-auto leading-relaxed text-[#9CA3AF]">
              Select from our curated list of services designed to help creators, brands, and individuals stand out. Start your order directly from the cards below.
            </p>
          </div>
        </section>

        {/* Services Grid Section */}
        <section className="px-4 mb-20 relative z-10">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
              {servicesList.map((service, index) => {
                const IconComponent = service.icon
                return (
                  <Card
                    key={index}
                    className="glass border-border hover:border-[#FACC15]/50 transition-all duration-300 flex flex-col h-full group rounded-2xl relative overflow-hidden"
                  >
                    {/* Thumbnail Image */}
                    <div className="relative aspect-video w-full overflow-hidden bg-black/20">
                      <img
                        src={service.thumbnail}
                        alt={service.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      {/* Badge overlay on image */}
                      <span className={`absolute top-4 right-4 text-xs px-2.5 py-1 rounded-full border font-semibold ${service.badgeColor} backdrop-blur-md`}>
                        {service.badge}
                      </span>
                    </div>

                    {/* Glowing effect on hover */}
                    <div className="absolute top-[56.25%] left-0 right-0 h-1 bg-gradient-to-r from-transparent via-[#FACC15]/20 to-transparent group-hover:via-[#FACC15]/50 transition-all duration-300" />

                    <div className="p-6 flex flex-col flex-grow">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-[#FACC15]/10 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                          <IconComponent className="w-5 h-5 text-[#FACC15]" />
                        </div>
                        <h3 className="text-xl font-bold text-white group-hover:text-[#FACC15] transition-colors">
                          {service.title}
                        </h3>
                      </div>

                      <p className="text-[#9CA3AF] text-sm mb-6 leading-relaxed flex-grow">
                        {service.description}
                      </p>

                      {/* Features list */}
                      <div className="mb-6 pt-4 border-t border-border/50">
                        <p className="text-xs font-bold text-white uppercase tracking-wider mb-3">What's included:</p>
                        <ul className="space-y-2">
                          {service.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2.5 text-xs text-[#D1D5DB]">
                              <CheckCircle2 className="w-4 h-4 text-[#FACC15] flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="mt-auto pt-6 border-t border-border/50">
                        <div className="flex items-end justify-between mb-4">
                          <div>
                            <p className="text-xs text-[#9CA3AF]">Pricing starts at</p>
                            <p className="text-2xl font-bold text-[#FACC15]">{service.startingPrice}</p>
                          </div>
                          <p className="text-xs text-[#9CA3AF]">Revisions included</p>
                        </div>

                        <Link href={`/order?service=${encodeURIComponent(service.serviceValue)}`}>
                          <Button className="w-full border border-white bg-transparent text-white hover:bg-white hover:text-[#050505] hover:border-white font-bold py-5 rounded-xl text-sm transition-all duration-300">
                            Order This Service
                            <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                )
              })}
            </div>
          </div>
        </section>

        {/* Feature Highlights */}
        <section className="py-16 px-4 relative z-10 bg-[#070707] border-y border-border/50">
          <div className="container mx-auto max-w-5xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#FACC15]/10 flex items-center justify-center flex-shrink-0">
                  <Shield className="w-5 h-5 text-[#FACC15]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Secure Submissions</h4>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">
                    Your raw footage, credentials, and files are stored and transferred securely with strict privacy.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#FACC15]/10 flex items-center justify-center flex-shrink-0">
                  <Clock className="w-5 h-5 text-[#FACC15]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Fast Turnaround</h4>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">
                    Most content deliverables are processed and finalized within 24 to 48 hours to match your schedule.
                  </p>
                </div>
              </div>
              <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full bg-[#FACC15]/10 flex items-center justify-center flex-shrink-0">
                  <Star className="w-5 h-5 text-[#FACC15]" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white mb-2">Unlimited Revisions</h4>
                  <p className="text-sm text-[#9CA3AF] leading-relaxed">
                    We keep modifying the cut until it matches your exact aesthetic goals and technical requirements.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQs Section */}
        <section className="py-20 px-4 relative z-10">
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold text-white mb-4">Service FAQ</h2>
              <p className="text-[#9CA3AF]">Common questions about our video services, editing pipelines, and workflows.</p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <Card key={index} className="glass border-border p-6 rounded-xl">
                  <h4 className="text-lg font-bold text-[#FACC15] mb-2">{faq.question}</h4>
                  <p className="text-[#9CA3AF] text-sm leading-relaxed">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Call to Action */}
        <section className="px-4 py-8 relative z-10">
          <div className="container mx-auto">
            <Card className="glass border-[#FACC15]/30 p-12 text-center max-w-4xl mx-auto rounded-3xl relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-[#FACC15]/5 to-transparent pointer-events-none" />
              <div className="relative z-10">
                <h2 className="text-4xl font-bold text-white mb-4">Have a Custom Project?</h2>
                <p className="mb-8 max-w-2xl mx-auto leading-relaxed text-[#9CA3AF]">
                  Need dedicated editors, monthly retainers, bulk deliveries, or complex custom motion graphics? Get in touch with us on WhatsApp or submit a query.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <Link href="/order">
                    <Button size="lg" className="glow-yellow btn-lift bg-[#FACC15] text-[#050505] font-bold px-8 py-6 rounded-xl">
                      Get a Custom Quote
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </Link>
                  <a href="https://wa.me/918122426212" target="_blank" rel="noopener noreferrer">
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white hover:border-[#FACC15] hover:bg-[#FACC15] hover:text-[#050505] text-white bg-transparent px-8 py-6 rounded-xl transition-all duration-300"
                    >
                      <MessageCircle className="w-5 h-5 mr-2 text-green-500" />
                      Chat on WhatsApp
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}