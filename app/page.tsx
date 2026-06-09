"use client"

import { Footer } from "@/components/footer"
import { AnimatedBackground } from "@/components/animated-background"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  Video,
  Sparkles,
  ImageIcon,
  Palette,
  Youtube,
  Gamepad2,
  TrendingUp,
  ArrowRight,
  Star,
  PlayCircle,
  Rocket,
  Award,
  ChevronDown,
  Play,
  ChevronLeft,
  ChevronRight,
  Clock,
  Shield,
  Zap,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useEffect, useRef, useState, useCallback } from "react"

const testimonials = [
  {
    text: "Absolutely love the work M2 Studio did for my YouTube channel. They exceeded my expectations!",
    name: "John Doe",
    role: "YouTube Creator",
    rating: 5,
    channelNumber: 100000,
    channelSuffix: " Subscribers",
  },
  {
    text: "The team at M2 Studio was fantastic to work with. They made my wedding film look beautiful!",
    name: "Jane Smith",
    role: "Wedding Planner",
    rating: 4,
    channelNumber: null,
    channelSuffix: "Wedding Film",
  },
  // Additional testimonials can be added here
]

function AnimatedCounter({
  end,
  duration = 2000,
  suffix = "",
  prefix = "",
}: { end: number; duration?: number; suffix?: string; prefix?: string }) {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let startTime: number
          const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime
            const progress = Math.min((currentTime - startTime) / duration, 1)
            const easeOut = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(easeOut * end))
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 },
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return (
    <span ref={ref}>
      {prefix}
      {count}
      {suffix}
    </span>
  )
}

const faqs = [
  {
    question: "What types of video editing services do you offer?",
    answer:
      "We offer a comprehensive range of services including wedding film editing, YouTube video editing, social media reels & shorts, thumbnail design, logo animation, gaming montages, corporate videos, and more.",
  },
  {
    question: "How long does it take to complete a project?",
    answer:
      "Turnaround time depends on the project complexity. Simple edits take 24-48 hours, while complex projects like wedding films may take 5-7 days. Rush delivery is available for an additional fee.",
  },
  {
    question: "What is your revision policy?",
    answer:
      "We offer unlimited revisions until you're 100% satisfied. Your happiness is our priority, and we'll keep refining until the final product matches your vision perfectly.",
  },
  {
    question: "How do I send my raw footage?",
    answer:
      "You can upload your footage via Google Drive, Dropbox, WeTransfer, or any cloud storage service. We'll provide secure upload links after you place your order.",
  },
  {
    question: "What payment methods do you accept?",
    answer:
      "We accept all major payment methods including UPI, credit/debit cards, net banking, PayPal, and bank transfers. Payment is required upfront before we begin work.",
  },
]

export default function HomePage() {
  const services = [
    { icon: Video, title: "Wedding Film Editing", description: "Cinematic wedding films that capture every emotion" },
    { icon: TrendingUp, title: "Trend Reels & Shorts", description: "Viral-ready content for Instagram and YouTube" },
    { icon: ImageIcon, title: "Thumbnail Design", description: "Click-worthy thumbnails that boost views" },
    { icon: Palette, title: "Logo & Animation", description: "Professional brand identity and motion graphics" },
    { icon: Youtube, title: "YouTube Editing", description: "Full-service YouTube video production" },
    { icon: Gamepad2, title: "Gaming Montages", description: "Epic gaming content and highlights" },
  ]

  const steps = [
    { number: "01", title: "Place Your Order", description: "Tell us about your project and requirements" },
    { number: "02", title: "We Create Magic", description: "Our expert editors bring your vision to life" },
    { number: "03", title: "Receive & Celebrate", description: "Get your polished content ready to share" },
  ]

  const roadmapSteps = [
    {
      stepNumber: 1,
      title: "The Idea",
      year: "Oct 2024",
      description:
        "The idea of M2 Studio was born - a vision to provide premium video editing services to creators worldwide.",
      icon: Rocket,
    },
    {
      stepNumber: 2,
      title: "Official Launch",
      year: "July 1 2025",
      description:
        "M2 Studio officially launches, offering professional video editing services to content creators globally.",
      icon: Zap,
    },
    {
      stepNumber: 3,
      title: "Scale & Grow",
      year: "2026",
      description: "Expanding our team and services to handle more projects while maintaining our quality standards.",
      icon: TrendingUp,
    },
    {
      stepNumber: 4,
      title: "Industry Leader",
      year: "2027+",
      description:
        "Becoming the go-to video editing studio for creators worldwide with cutting-edge AI-assisted editing.",
      icon: Award,
    },
  ]

  const whyChooseUs = [
    { icon: Zap, title: "Lightning Fast", description: "24-48 hour turnaround on most projects" },
    { icon: Shield, title: "Quality Guaranteed", description: "Unlimited revisions until you're satisfied" },
    { icon: Clock, title: "24/7 Support", description: "Always available to answer your questions" },
    { icon: MessageCircle, title: "Direct Communication", description: "Chat directly with your editor" },
  ]

  const [scrollProgress, setScrollProgress] = useState(0)
  const [activeSteps, setActiveSteps] = useState<number[]>([0])
  const roadmapRef = useRef<HTMLDivElement>(null)

  const [currentTestimonial, setCurrentTestimonial] = useState(0)
  const [openFaq, setOpenFaq] = useState<number | null>(null)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [roadmapInView, setRoadmapInView] = useState(false)

  // Fraction of the progress line to fill (0..1). Use (activeSteps-1)/(totalSteps-1)
  // so the line grows between nodes rather than jumping with the node count.
  const filledRatio = (() => {
    if (roadmapSteps.length <= 1) return 0
    const activated = Math.max(0, activeSteps.length - 1)
    return Math.min(1, activated / (roadmapSteps.length - 1))
  })()

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [testimonials.length])

  const nextTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)
  }, [testimonials.length])

  const prevTestimonial = useCallback(() => {
    setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)
  }, [testimonials.length])

  useEffect(() => {
    const handleScroll = () => {
      if (!roadmapRef.current) return

      const rect = roadmapRef.current.getBoundingClientRect()
      const windowHeight = window.innerHeight
      const startOffset = windowHeight * 0.8
      const scrollStart = rect.top - startOffset
      const scrollEnd = rect.bottom - windowHeight * 0.3
      const scrollRange = scrollEnd - scrollStart

      if (scrollStart > 0) {
        setScrollProgress(0)
        setActiveSteps([0])
        setRoadmapInView(false)
      } else if (scrollEnd < 0) {
        setScrollProgress(100)
        setActiveSteps([0, 1, 2, 3])
        setRoadmapInView(true)
      } else {
        const progress = Math.min(100, Math.max(0, (Math.abs(scrollStart) / scrollRange) * 100))
        setScrollProgress(progress)
        setRoadmapInView(true)

        const stepsToActivate: number[] = [0] // First step always visible
        roadmapSteps.forEach((_, index) => {
          if (index === 0) return // Skip first, already added
          const stepThreshold = (index / (roadmapSteps.length - 1)) * 100
          if (progress >= stepThreshold - 10) {
            stepsToActivate.push(index)
          }
        })
        setActiveSteps(stepsToActivate)
      }
    }

    window.addEventListener("scroll", handleScroll)
    handleScroll()

    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <>
      <AnimatedBackground />
      {/* <Navigation /> */}

      <main className="min-h-screen">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 px-4 overflow-hidden min-h-screen flex items-center">
          <div className="absolute inset-0 z-0 w-full h-full overflow-hidden">
            <video
              autoPlay
              loop
              muted
              playsInline
              preload="auto"
              className="absolute top-1/2 left-1/2 min-w-full min-h-full w-auto h-auto -translate-x-1/2 -translate-y-1/2"
              style={{
                filter: "brightness(0.4)",
                objectFit: "cover",
              }}
            >
              <source src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/black%20grid%20background-XqrwT6UXsi27YlSZuubn2goRLqS1w7.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
            <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/60 to-black/80 z-10"></div>
          </div>

          <div className="container mx-auto text-center relative z-20">
            <div className="flex flex-col items-center mb-8">
              <Image
                src="/logo-transparent.png"
                alt="M2 Studio Logo"
                width={200}
                height={200}
                className="mb-3 animate-float"
              />
              <h1 className="text-5xl md:text-7xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
                M2 Studio
              </h1>
              <p className="text-xl md:text-2xl font-semibold" style={{ color: "#FACC15" }}>
                Professional Video Editing & Creative Studio
              </p>
            </div>

            <p className="text-xl mb-8 max-w-2xl mx-auto leading-relaxed mt-6" style={{ color: "#D1D5DB" }}>
              Transform your raw footage into stunning visual stories. Premium editing services for creators,
              businesses, and filmmakers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link href="/order">
                <Button
                  size="lg"
                  className="glow-yellow group btn-lift"
                  style={{ background: "#FACC15", color: "#000000" }}
                >
                  Place an Order
                  <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                </Button>
              </Link>
              <Link href="/portfolio">
                <Button
                  size="lg"
                  variant="outline"
                  className="group btn-lift-outline border-[#FACC15] text-[#FACC15] bg-transparent hover:bg-[#FACC15] hover:text-[#000000] transition-all duration-300"
                >
                  <PlayCircle className="mr-2 group-hover:text-[#000000] transition-colors" size={20} />
                  View Portfolio
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 max-w-4xl mx-auto">
              <div className="glass p-6 rounded-lg hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: "#FACC15" }}>
                  <AnimatedCounter end={500} suffix="+" />
                </div>
                <div className="text-sm" style={{ color: "#9CA3AF" }}>
                  Projects Completed
                </div>
              </div>
              <div className="glass p-6 rounded-lg hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: "#FACC15" }}>
                  <AnimatedCounter end={200} suffix="+" />
                </div>
                <div className="text-sm" style={{ color: "#9CA3AF" }}>
                  Happy Clients
                </div>
              </div>
              <div className="glass p-6 rounded-lg hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: "#FACC15" }}>
                  <AnimatedCounter end={24} suffix="hr" />
                </div>
                <div className="text-sm" style={{ color: "#9CA3AF" }}>
                  Average Delivery
                </div>
              </div>
              <div className="glass p-6 rounded-lg hover:scale-105 transition-transform duration-300">
                <div className="text-3xl md:text-4xl font-bold" style={{ color: "#FACC15" }}>
                  <AnimatedCounter end={5} suffix="★" />
                </div>
                <div className="text-sm" style={{ color: "#9CA3AF" }}>
                  Client Rating
                </div>
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 animate-bounce">
            <ChevronDown size={32} style={{ color: "#FACC15" }} />
          </div>
        </section>

        <section className="py-12 overflow-hidden" style={{ background: "#0a0a0a" }}>
          <div className="text-center mb-8">
            <p className="text-sm uppercase tracking-widest" style={{ color: "#6B7280" }}>
              Trusted by creators and businesses worldwide
            </p>
          </div>
          <div className="relative">
            <div className="flex animate-marquee whitespace-nowrap">
              {[...Array(2)].map((_, setIndex) => (
                <div key={setIndex} className="flex items-center gap-16 mx-8">
                  {[
                    "YouTube Creators",
                    "Wedding Studios",
                    "Gaming Channels",
                    "Instagram Influencers",
                    "Corporate Clients",
                    "Startups",
                    "Podcasters",
                    "E-commerce Brands",
                  ].map((client, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 px-6 py-3 rounded-full"
                      style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
                    >
                      <Star size={16} style={{ color: "#FACC15" }} />
                      <span className="text-sm font-medium" style={{ color: "#9CA3AF" }}>
                        {client}
                      </span>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
                See Our Work in Action
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: "#9CA3AF" }}>
                Watch our showreel to see the quality and creativity we bring to every project
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto rounded-2xl overflow-hidden group">
              <div className="aspect-video relative cursor-pointer" onClick={() => setIsVideoPlaying(!isVideoPlaying)}>
                {!isVideoPlaying ? (
                  <>
                    <Image
                      src="/professional-video-editing-montage-dark-cinematic.jpg"
                      alt="Video Showreel Thumbnail"
                      fill
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center group-hover:bg-black/40 transition-colors">
                      <div
                        className="w-24 h-24 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform"
                        style={{ background: "#FACC15" }}
                      >
                        <Play size={40} className="text-black ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 flex justify-between items-center">
                      <span
                        className="text-sm font-medium px-3 py-1 rounded-full"
                        style={{ background: "rgba(250,204,21,0.2)", color: "#FACC15" }}
                      >
                        2024 Showreel
                      </span>
                      <span className="text-sm" style={{ color: "#9CA3AF" }}>
                        3:45
                      </span>
                    </div>
                  </>
                ) : (
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"
                    title="M2 Studio Showreel"
                    className="absolute inset-0 w-full h-full"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Services Overview */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
                Our Creative Services
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: "#9CA3AF" }}>
                From wedding films to gaming montages, we deliver professional editing across all content types
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <Card
                  key={index}
                  className="glass border-border hover:border-primary transition-all duration-300 p-6 group cursor-pointer hover:-translate-y-2"
                >
                  <service.icon
                    className="w-12 h-12 mb-4 group-hover:scale-110 transition-transform"
                    style={{ color: "#FACC15" }}
                  />
                  <h3 className="text-xl font-semibold mb-2" style={{ color: "#FFFFFF" }}>
                    {service.title}
                  </h3>
                  <p className="text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>
                    {service.description}
                  </p>
                  <Link
                    href="/services"
                    className="inline-flex items-center mt-4 text-sm font-semibold group-hover:translate-x-1 transition-transform"
                    style={{ color: "#FACC15" }}
                  >
                    Learn More <ArrowRight size={16} className="ml-1" />
                  </Link>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-20 px-4" style={{ background: "#050505" }}>
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
                Why Choose M2 Studio?
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: "#9CA3AF" }}>
                We're not just editors - we're your creative partners
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyChooseUs.map((feature, index) => (
                <div
                  key={index}
                  className="text-center p-8 rounded-2xl transition-all duration-300 hover:-translate-y-2"
                  style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
                >
                  <div
                    className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                    style={{ background: "rgba(250,204,21,0.1)" }}
                  >
                    <feature.icon size={28} style={{ color: "#FACC15" }} />
                  </div>
                  <h3 className="text-lg font-semibold mb-2" style={{ color: "#FFFFFF" }}>
                    {feature.title}
                  </h3>
                  <p className="text-sm" style={{ color: "#9CA3AF" }}>
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
                How It Works
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: "#9CA3AF" }}>
                Simple, fast, and professional. Get your content edited in three easy steps
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div
                    className={`glass p-8 rounded-lg text-center hover:-translate-y-2 transition-transform duration-300`}
                    style={{ borderColor: "rgba(250, 204, 21, 0.3)" }}
                  >
                    <div className="text-6xl font-bold mb-4" style={{ color: "#FACC15" }}>
                      {step.number}
                    </div>
                    <h3 className="text-xl font-semibold mb-3" style={{ color: "#FFFFFF" }}>
                      {step.title}
                    </h3>
                    <p className="leading-relaxed" style={{ color: "#9CA3AF" }}>
                      {step.description}
                    </p>
                  </div>
                  {index < steps.length - 1 && (
                    <ArrowRight
                      className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2"
                      style={{ color: "#FACC15" }}
                      size={24}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Our Journey / Roadmap Section */}
        <section className="py-20 px-4" style={{ background: "#050505" }} ref={roadmapRef}>
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
                Our Journey
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: "#9CA3AF" }}>
                From an idea to becoming the preferred choice for creators worldwide
              </p>
            </div>

            <div className="relative max-w-4xl mx-auto">
              {/* Background line - stops at last step */}
              <div
                className="absolute left-10 md:left-1/2 transform md:-translate-x-1/2 w-0.5 z-0"
                style={{
                  top: "24px",
                  height: `calc(100% - 48px - 48px)`, // Total height minus first icon offset and last step margin
                  background: "#1a1a1a",
                }}
              />
              {/* Animated progress line overlay */}
              <div
                className="absolute left-10 md:left-1/2 transform md:-translate-x-1/2 w-0.5 z-0 origin-top"
                style={{
                  top: "24px",
                  height: `calc(100% - 48px - 48px)`,
                  background: "linear-gradient(to bottom, #FACC15, #EAB308)",
                  boxShadow: "0 0 10px rgba(250,204,21,0.5)",
                  transform: `scaleY(${filledRatio})`,
                  transformOrigin: "top",
                  transition: "transform 0.8s ease-out",
                }}
              />

              {roadmapSteps.map((step, index) => {
                const isActive = activeSteps.includes(index)
                const isFirstStep = index === 0
                const isLastStep = index === roadmapSteps.length - 1
                const delayMs = index * 160
                const delay = `${delayMs}ms`
                const ease = "cubic-bezier(0.22,1,0.36,1)"

                return (
                  <div key={index} className="relative">
                    <div
                      className={`relative flex items-center ${isLastStep ? "" : "mb-12"} ${index % 2 === 0 ? "md:flex-row" : "md:flex-row-reverse"}`}
                        style={{
                          opacity: isActive || isFirstStep ? 1 : 0,
                          transform: isActive || isFirstStep ? "translateY(0)" : "translateY(40px)",
                          transition: `opacity 0.65s ${ease} ${delay}, transform 0.85s ${ease} ${delay}`,
                        }}
                    >
                      <div
                        className={`ml-20 md:ml-0 md:w-[calc(50%-40px)] ${index % 2 === 0 ? "md:pr-8 md:text-right" : "md:pl-8 md:text-left"}`}
                      >
                        <div
                          className="p-6 rounded-xl transition-all duration-500"
                          style={{
                            background: isActive ? "#0a0a0a" : "transparent",
                            border: isActive ? "1px solid #1a1a1a" : "1px solid transparent",
                          }}
                        >
                          <span
                            className="text-sm font-semibold px-3 py-1 rounded-full inline-block mb-3"
                            style={{ background: "rgba(250,204,21,0.2)", color: "#FACC15" }}
                          >
                            {step.year}
                          </span>
                          <div className="text-3xl font-bold mb-2" style={{ color: "#FACC15" }}>
                            0{step.stepNumber}
                          </div>
                          <h3 className="text-xl font-semibold mb-2" style={{ color: "#FFFFFF" }}>
                            {step.title}
                          </h3>
                          <p className="text-sm leading-relaxed" style={{ color: "#9CA3AF" }}>
                            {step.description}
                          </p>
                        </div>
                      </div>

                      <div
                        className="absolute left-10 md:left-1/2 transform -translate-x-1/2 w-12 h-12 rounded-full flex items-center justify-center z-10 transition-all duration-500"
                        style={{
                          background: isActive ? "#FACC15" : "#1a1a1a",
                          boxShadow: isActive
                            ? "0 0 20px rgba(250,204,21,0.6), 0 0 40px rgba(250,204,21,0.3)"
                            : "none",
                          transition: `background 0.45s ${ease} ${delay}, box-shadow 0.9s ${ease} ${delay}`,
                        }}
                      >
                        {isActive && (
                          <div
                            className="absolute inset-0 rounded-full animate-ping"
                            style={{
                              background: "rgba(250,204,21,0.3)",
                              animationDuration: "1.2s",
                              animationIterationCount: "1",
                            }}
                          />
                        )}
                        <step.icon
                          size={20}
                          style={{
                            color: isActive ? "#000000" : "#FACC15",
                            transition: `color 0.6s ${ease} ${delay}`,
                          }}
                        />
                      </div>

                      <div className="hidden md:block md:w-[calc(50%-40px)]" />
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </section>

        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
                What Our Clients Say
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: "#9CA3AF" }}>
                Join hundreds of satisfied creators who trust M2 Studio
              </p>
            </div>

            {/* Testimonial Carousel */}
            <div className="relative max-w-4xl mx-auto">
              <div className="overflow-hidden">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentTestimonial * 100}%)` }}
                >
                  {testimonials.map((testimonial, index) => (
                    <div key={index} className="w-full flex-shrink-0 px-4">
                      <div
                        className="p-8 rounded-2xl text-center"
                        style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
                      >
                        <div className="flex justify-center mb-4">
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <Star key={i} size={20} fill="#FACC15" style={{ color: "#FACC15" }} />
                          ))}
                        </div>
                        <p className="text-lg mb-6 italic leading-relaxed" style={{ color: "#E5E7EB" }}>
                          "{testimonial.text}"
                        </p>
                        <div className="flex items-center justify-center gap-4">
                          <div className="relative w-16 h-16 rounded-full overflow-hidden">
                            <Image
                              src={testimonial.avatar || "/placeholder.svg"}
                              alt={testimonial.name}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="text-left">
                            <h4 className="font-semibold" style={{ color: "#FFFFFF" }}>
                              {testimonial.name}
                            </h4>
                            <p className="text-sm" style={{ color: "#9CA3AF" }}>
                              {testimonial.role}
                            </p>
                            <p className="text-sm font-semibold" style={{ color: "#FACC15" }}>
                              {testimonial.channelNumber !== null ? (
                                <>
                                  <AnimatedCounter end={testimonial.channelNumber} duration={1500} />
                                  {testimonial.channelSuffix}
                                </>
                              ) : (
                                testimonial.channelSuffix
                              )}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Carousel Controls */}
              <button
                onClick={prevTestimonial}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                <ChevronLeft size={24} style={{ color: "#FACC15" }} />
              </button>
              <button
                onClick={nextTestimonial}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 rounded-full flex items-center justify-center transition-colors"
                style={{ background: "#1a1a1a", border: "1px solid #2a2a2a" }}
              >
                <ChevronRight size={24} style={{ color: "#FACC15" }} />
              </button>

              {/* Dots Indicator */}
              <div className="flex justify-center gap-2 mt-8">
                {testimonials.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentTestimonial(index)}
                    className="w-3 h-3 rounded-full transition-all duration-300"
                    style={{
                      background: currentTestimonial === index ? "#FACC15" : "#2a2a2a",
                      transform: currentTestimonial === index ? "scale(1.2)" : "scale(1)",
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 px-4" style={{ background: "#050505" }}>
          <div className="container mx-auto max-w-3xl">
            <div className="text-center mb-12">
              <h2 className="text-4xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
                Frequently Asked Questions
              </h2>
              <p className="max-w-2xl mx-auto leading-relaxed" style={{ color: "#9CA3AF" }}>
                Got questions? We've got answers
              </p>
            </div>

            <div className="space-y-4">
              {faqs.map((faq, index) => (
                <div
                  key={index}
                  className="rounded-xl overflow-hidden transition-all duration-300"
                  style={{
                    background: "#0a0a0a",
                    border: openFaq === index ? "1px solid rgba(250, 204, 21, 0.3)" : "1px solid #1a1a1a",
                  }}
                >
                  <button
                    onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    className="w-full flex items-center justify-between p-6 text-left"
                  >
                    <span className="font-semibold text-lg pr-4" style={{ color: "#FFFFFF" }}>
                      {faq.question}
                    </span>
                    <ChevronDown
                      size={24}
                      className="flex-shrink-0 transition-transform duration-300"
                      style={{
                        color: "#FACC15",
                        transform: openFaq === index ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  <div
                    className="overflow-hidden transition-all duration-300"
                    style={{
                      maxHeight: openFaq === index ? "200px" : "0px",
                      opacity: openFaq === index ? 1 : 0,
                    }}
                  >
                    <p className="px-6 pb-6 leading-relaxed" style={{ color: "#9CA3AF" }}>
                      {faq.answer}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <Card
              className="glass p-12 text-center relative overflow-hidden"
              style={{ borderColor: "rgba(250, 204, 21, 0.3)" }}
            >
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(to right, rgba(250, 204, 21, 0.1), rgba(245, 158, 11, 0.1))" }}
              />
              <div className="relative z-10">
                <Sparkles className="w-16 h-16 mx-auto mb-6" style={{ color: "#FACC15" }} />
                <h2 className="text-4xl font-bold mb-4" style={{ color: "#FFFFFF" }}>
                  Ready to Create Something Amazing?
                </h2>
                <p className="mb-8 max-w-xl mx-auto leading-relaxed" style={{ color: "#9CA3AF" }}>
                  Let's transform your vision into stunning reality. Start your project today!
                </p>
                <Link href="/order">
                  <Button
                    size="lg"
                    className="glow-yellow group btn-lift"
                    style={{ background: "#FACC15", color: "#000000" }}
                  >
                    Get Started Now
                    <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" size={20} />
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
