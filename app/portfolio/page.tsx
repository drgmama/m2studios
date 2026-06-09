"use client"

import { useState, useRef, useEffect } from "react"
import { createPortal } from "react-dom"
import Image from "next/image"
import { Footer } from "@/components/footer"
import { AnimatedBackground } from "@/components/animated-background"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  PlayCircle,
  X,
  Clock,
  TrendingUp,
  Star,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Eye,
  ImageIcon,
} from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

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

const projects = [
  {
    id: 1,
    title: "Romantic Wedding Film",
    category: "wedding",
    type: "video" as const,
    thumbnail: "/romantic-wedding-cinematography.jpg",
    mediaUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID_1",
    views: "25K",
    duration: "8:30",
  },
  {
    id: 2,
    title: "Viral Instagram Reel",
    category: "reels",
    type: "video" as const,
    thumbnail: "/viral-instagram-reel.jpg",
    mediaUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID_2",
    views: "150K",
    duration: "0:30",
  },
  {
    id: 3,
    title: "Tech Review YouTube Video",
    category: "youtube",
    type: "video" as const,
    thumbnail: "/tech-review-youtube.jpg",
    mediaUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID_3",
    views: "500K",
    duration: "12:45",
  },
  {
    id: 4,
    title: "Gaming Montage",
    category: "gaming",
    type: "video" as const,
    thumbnail: "/gaming-montage-highlights.jpg",
    mediaUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID_4",
    views: "75K",
    duration: "5:20",
  },
  {
    id: 5,
    title: "Corporate Brand Video",
    category: "corporate",
    type: "image" as const,
    thumbnail: "/corporate-brand-video.jpg",
    mediaUrl: "/corporate-brand-video.jpg",
    views: "30K",
    duration: "",
  },
  {
    id: 6,
    title: "Destination Wedding",
    category: "wedding",
    type: "video" as const,
    thumbnail: "/destination-wedding-film.jpg",
    mediaUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID_6",
    views: "40K",
    duration: "10:00",
  },
  {
    id: 7,
    title: "Fashion Reel",
    category: "reels",
    type: "image" as const,
    thumbnail: "/fashion-instagram-reel.jpg",
    mediaUrl: "/fashion-instagram-reel.jpg",
    views: "200K",
    duration: "",
  },
  {
    id: 8,
    title: "Vlog Edit",
    category: "youtube",
    type: "video" as const,
    thumbnail: "/travel-vlog-editing.jpg",
    mediaUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID_8",
    views: "120K",
    duration: "15:30",
  },
  {
    id: 9,
    title: "FPS Highlights",
    category: "gaming",
    type: "video" as const,
    thumbnail: "/fps-gaming-highlights.jpg",
    mediaUrl: "https://www.youtube.com/embed/YOUR_VIDEO_ID_9",
    views: "90K",
    duration: "4:50",
  },
]

const caseStudies = [
  {
    id: 1,
    title: "Destination Wedding Cinematic Film",
    client: "Sarah & James",
    category: "wedding",
    thumbnail: "/luxury-destination-wedding.jpg",
    result: "2M+ Views on Instagram",
    deliveryTime: "5 days",
    rating: 5,
    description:
      "Created a breathtaking cinematic wedding film for a luxury destination wedding in Bali. The project included drone footage, slow-motion sequences, and emotional storytelling.",
    challenge:
      "Capturing the essence of a multi-day celebration across various locations while maintaining a cohesive narrative.",
    solution:
      "We used advanced color grading techniques and seamless transitions to create a timeless film that perfectly captured every emotional moment.",
    testimonial:
      "M2 Studio exceeded our expectations! The final video was absolutely stunning and captured our special day perfectly.",
  },
  {
    id: 2,
    title: "Viral Product Launch Reel",
    client: "TechBrand Co.",
    category: "corporate",
    thumbnail: "/tech-product-launch-video.jpg",
    result: "500K+ Reach in 24hrs",
    deliveryTime: "3 days",
    rating: 5,
    description:
      "Produced a high-energy product launch reel for a tech startup's flagship product. The video went viral and significantly boosted pre-orders.",
    challenge: "Creating engaging content that would stand out in a competitive tech market.",
    solution:
      "We combined dynamic motion graphics, upbeat music, and fast-paced editing to create a reel that captured attention within the first 3 seconds.",
    testimonial: "The reel drove incredible engagement. Our pre-orders doubled within the first week!",
  },
  {
    id: 3,
    title: "Gaming Tournament Highlights",
    client: "ESports Arena",
    category: "gaming",
    thumbnail: "/esports-gaming-highlights.jpg",
    result: "1M+ YouTube Views",
    deliveryTime: "2 days",
    rating: 5,
    description:
      "Edited an epic highlight reel for a major gaming tournament featuring the best plays, reactions, and crowd moments.",
    challenge: "Processing hours of footage to find the most exciting moments and syncing them to music.",
    solution:
      "We used AI-assisted editing to identify key moments, combined with manual refinement to create the perfect flow and energy.",
    testimonial: "The best tournament recap we've ever had. M2 Studio knows how to build hype!",
  },
]

/** ✅ UPDATED: Top sellers based on your offline moving (12×8) */
const topSellers = [
  {
    rank: 1,
    badge: "TOP SELLER",
    badgeColor: "from-yellow-500 to-orange-500",
    size: '12" × 8" (1")',
    name: "Most Moving",
    price: "₹400",
    subtitle: "Offline best seller",
    usedFor: ["Wall frames", "Family photos", "Couple portraits"],
    features: ["Most ordered size offline"],
    tag: "Best seller",
  },
  {
    rank: 2,
    badge: "HIGH DEMAND",
    badgeColor: "from-blue-500 to-cyan-500",
    size: '12" × 8" (1.25")',
    name: "Thick Premium",
    price: "₹450",
    subtitle: "Premium look",
    usedFor: ["Premium wall frames", "Gifting", "Big portrait display"],
    features: ["Thicker frame = premium feel"],
    tag: "Premium choice",
  },
  {
    rank: 3,
    badge: "FAST MOVING",
    badgeColor: "from-purple-500 to-pink-500",
    size: '10" × 8"',
    name: "Popular",
    price: "₹300",
    subtitle: "Next best moving",
    usedFor: ["Wall + table frames", "Portraits", "Home display"],
    features: ["Good balance of size & price"],
    tag: "Value pick",
  },
]

/** ✅ UPDATED: Frame sizes + prices (your new list) */
const photoSizes = [
  {
    size: '6" × 4"',
    price: "₹150",
    popular: false,
    image: "/frame-4x6-sample-1.jpg",
    gallery: [
      "/frame-4x6-sample-1.jpg",
      "/frame-4x6-sample-2.jpg",
      "/frame-4x6-sample-3.jpg",
      "/frame-4x6-sample-4.jpg",
      "/frame-4x6-sample-5.jpg",
    ],
    description: "Small classic size for regular photos.",
  },
  {
    size: '8" × 6"',
    price: "₹200",
    popular: true,
    image: "/frame-6x8-sample-1.jpg",
    gallery: [
      "/frame-6x8-sample-1.jpg",
      "/frame-6x8-sample-2.jpg",
      "/frame-6x8-sample-3.jpg",
      "/frame-6x8-sample-4.jpg",
    ],
    description: "Best for gifts & table frames.",
  },
  {
    size: '10" × 8"',
    price: "₹300",
    popular: true,
    image: "/frame-8x10-sample-1.jpg",
    gallery: [
      "/frame-8x10-sample-1.jpg",
      "/frame-8x10-sample-2.jpg",
      "/frame-8x10-sample-3.jpg",
      "/frame-8x10-sample-4.jpg",
      "/frame-8x10-sample-5.jpg",
      "/frame-8x10-sample-6.jpg",
    ],
    description: "Big and premium for home display.",
  },
  {
    size: '12" × 8" (1")',
    price: "₹400",
    popular: true, // ✅ YES set panniten
    image: "/frame-5x7-sample-1.jpg",
    gallery: [
      "/frame-5x7-sample-1.jpg",
      "/frame-5x7-sample-2.jpg",
      "/frame-5x7-sample-3.jpg",
      "/frame-5x7-sample-4.jpg",
      "/frame-5x7-sample-5.jpg",
    ],
    description: "Offline most moving wall frame size.",
  },
  {
    size: '12" × 8" (1.25")',
    price: "₹450",
    popular: true,
    image: "/frame-5x5-sample-1.jpg",
    gallery: [
      "/frame-5x5-sample-1.jpg",
      "/frame-5x5-sample-2.jpg",
      "/frame-5x5-sample-3.jpg",
      "/frame-5x5-sample-4.jpg",
    ],
    description: "Extra thick premium frame for bold look.",
  },
]

const categories = [
  { id: "all", label: "All" },
  { id: "wedding", label: "Weddings" },
  { id: "reels", label: "Reels" },
  { id: "youtube", label: "YouTube" },
  { id: "gaming", label: "Gaming" },
  { id: "corporate", label: "Corporate" },
  { id: "frames", label: "Frames" },
]

export default function PortfolioPage() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [selectedCase, setSelectedCase] = useState<number | null>(null)
  const [selectedVideo, setSelectedVideo] = useState<number | null>(null)
  const [selectedFrame, setSelectedFrame] = useState<string | null>(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (selectedVideo || selectedFrame || selectedCase) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }

    return () => {
      document.body.style.overflow = ""
    }
  }, [selectedVideo, selectedFrame, selectedCase])

  const getSelectedFrameData = () => photoSizes.find((p) => p.size === selectedFrame)

  const handleNextImage = () => {
    const frameData = getSelectedFrameData()
    if (frameData) {
      setCurrentImageIndex((prev) => (prev + 1) % frameData.gallery.length)
    }
  }

  const handlePrevImage = () => {
    const frameData = getSelectedFrameData()
    if (frameData) {
      setCurrentImageIndex((prev) => (prev - 1 + frameData.gallery.length) % frameData.gallery.length)
    }
  }

  const handleCardClick = (id: number) => {
    setSelectedVideo(id)
  }

  const handleCloseModal = () => {
    setSelectedVideo(null)
  }

  const filteredPortfolio =
    selectedCategory === "all" ? projects : projects.filter((item) => item.category === selectedCategory)

  const selectedProjectData = selectedVideo ? projects.find((p) => p.id === selectedVideo) : null

  return (
    <div className="relative min-h-screen">
      <AnimatedBackground />

      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-40 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-pulse" />
        <div
          className="absolute top-[600px] right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="absolute top-[1200px] left-20 w-80 h-80 bg-primary/10 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        />
      </div>

      <main className="min-h-screen pt-24 pb-20 relative z-10">
        {/* Header */}
        <section className="py-20 px-4 relative">
          <div className="container mx-auto text-center relative">
            <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 glass rounded-full border border-primary/30">
              <Sparkles className="w-4 h-4 text-[#FACC15]" />
              <span className="text-[#FACC15] text-sm font-semibold">Our Work</span>
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-6 text-balance leading-tight">
              <span className="text-white">Portfolio of</span>
              <br />
              <span className="text-[#FACC15] text-glow-yellow">Amazing Projects</span>
            </h1>

            <p className="text-xl max-w-3xl mx-auto leading-relaxed text-[#9CA3AF]">
              Explore our collection of professionally edited videos across various genres and styles
            </p>
          </div>
        </section>

        {/* Stats Section */}
        <section className="px-4 mb-16 relative">
          <div className="container mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="glass border-border hover:border-primary/30 transition-colors p-6 text-center">
                <p className="text-3xl md:text-4xl font-bold mb-2 text-[#FACC15]">
                  <AnimatedCounter end={500} duration={2000} suffix="+" />
                </p>
                <p className="text-sm text-[#9CA3AF]">Projects Completed</p>
              </Card>
              <Card className="glass border-border hover:border-primary/30 transition-colors p-6 text-center">
                <p className="text-3xl md:text-4xl font-bold mb-2 text-[#FACC15]">
                  <AnimatedCounter end={200} duration={2000} suffix="+" />
                </p>
                <p className="text-sm text-[#9CA3AF]">Happy Clients</p>
              </Card>
              <Card className="glass border-border hover:border-primary/30 transition-colors p-6 text-center">
                <p className="text-3xl md:text-4xl font-bold mb-2 text-[#FACC15]">
                  <AnimatedCounter end={24} duration={2000} suffix="M+" />
                </p>
                <p className="text-sm text-[#9CA3AF]">Total Views</p>
              </Card>
              <Card className="glass border-border hover:border-primary/30 transition-colors p-6 text-center">
                <p className="text-3xl md:text-4xl font-bold mb-2 text-[#FACC15]">
                  <AnimatedCounter end={24} duration={1500} suffix="hr" />
                </p>
                <p className="text-sm text-[#9CA3AF]">Average Delivery</p>
              </Card>
            </div>
          </div>
        </section>

        {/* Case Studies Section */}
        <section className="px-4 mb-20 relative">
          <div className="container mx-auto">
            <div className="text-center mb-12">
              <div className="inline-block mb-4 px-4 py-2 glass rounded-full border border-primary/30">
                <span className="text-[#FACC15] text-sm font-semibold">Success Stories</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Featured <span className="text-[#FACC15]">Case Studies</span>
              </h2>
              <p className="text-lg max-w-2xl mx-auto text-[#9CA3AF]">
                Deep dive into our most successful projects and see how we helped our clients achieve their goals
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
              {caseStudies.map((study) => (
                <Card
                  key={study.id}
                  className="glass border-border hover:border-primary/50 transition-all duration-300 overflow-hidden flex flex-col cursor-pointer"
                  onClick={() => setSelectedCase(study.id)}
                >
                  <div className="relative aspect-video w-full">
                    <img
                      src={study.thumbnail || "/placeholder.svg"}
                      alt={study.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                    <Badge className="absolute top-4 right-4 bg-[#FACC15]/20 text-[#FACC15] border-[#FACC15]/50">
                      Case Study
                    </Badge>
                  </div>

                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-center gap-2 mb-3">
                      {[...Array(study.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-[#FACC15] text-[#FACC15]" />
                      ))}
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2">{study.title}</h3>
                    <p className="text-sm text-[#9CA3AF] mb-4">{study.client}</p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-sm text-[#9CA3AF]">
                        <TrendingUp className="w-4 h-4 text-[#FACC15]" />
                        {study.result}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-[#9CA3AF]">
                        <Clock className="w-4 h-4 text-[#FACC15]" />
                        {study.deliveryTime}
                      </div>
                    </div>

                    <p className="text-sm text-[#9CA3AF] mb-4 line-clamp-2 flex-1">{study.description}</p>

                    <Button
                      variant="ghost"
                      className="w-full text-[#FACC15] hover:bg-[#FACC15]/10 group/btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        setSelectedCase(study.id)
                      }}
                    >
                      Read Full Case Study
                      <ArrowRight className="w-4 h-4 ml-2 group-hover/btn:translate-x-1 transition-transform" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Category Filter */}
        <section className="px-4 mb-8 relative">
          <div className="container mx-auto">
            <div className="text-center mb-8">
              <div className="inline-block mb-4 px-4 py-2 glass rounded-full border border-primary/30">
                <span className="text-[#FACC15] text-sm font-semibold">Browse by Category</span>
              </div>
              <h2 className="text-4xl md:text-5xl font-bold mb-4 text-white">
                Our <span className="text-[#FACC15]">Portfolio</span>
              </h2>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={cn(
                    "px-6 py-3 rounded-full font-medium transition-all duration-300",
                    selectedCategory === category.id
                      ? "bg-[#FACC15] text-black"
                      : "glass border border-border text-white hover:border-primary/50",
                  )}
                >
                  {category.label}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Portfolio Grid */}
        <section className="px-4 mb-20 relative">
          <div className="container mx-auto relative">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredPortfolio.map((item) => (
                <div
                  key={item.id}
                  className="glass border border-border hover:border-[#FACC15]/50 transition-all duration-300 overflow-hidden cursor-pointer group relative rounded-lg"
                  onClick={() => handleCardClick(item.id)}
                >
                  <div className="relative aspect-video">
                    <img
                      src={item.thumbnail || "/placeholder.svg"}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.type === "video" ? (
                        <PlayCircle className="w-16 h-16 text-[#FACC15]" />
                      ) : (
                        <ImageIcon className="w-16 h-16 text-[#FACC15]" />
                      )}
                    </div>

                    <div className="absolute top-4 left-4">
                      <span
                        className={cn(
                          "px-2 py-1 rounded text-xs font-medium",
                          item.type === "video" ? "bg-red-500/80 text-white" : "bg-[#FACC15]/80 text-black",
                        )}
                      >
                        {item.type === "video" ? "VIDEO" : "IMAGE"}
                      </span>
                    </div>

                    <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-sm text-white">
                      {item.views} views
                    </div>

                    {item.duration && (
                      <div className="absolute bottom-4 right-4 bg-black/70 px-3 py-1 rounded-full text-sm text-white">
                        {item.duration}
                      </div>
                    )}
                  </div>

                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="text-sm capitalize text-[#9CA3AF]">{item.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Photo Frames Section */}
        {(selectedCategory === "all" || selectedCategory === "frames") && (
          <section className="px-4 mb-20 relative">
            <div className="container mx-auto">
              <div className="text-center mb-12">
                <div className="inline-block mb-4 px-4 py-2 rounded-full border bg-[#FACC15]/10 border-[#FACC15]/30">
                  <span className="text-[#FACC15] text-sm font-semibold">Premium Photo Frames</span>
                </div>
                <h2 className="text-4xl font-bold text-white mb-4">Transform Your Memories</h2>
                <p className="text-[#9CA3AF] max-w-2xl mx-auto">
                  High-quality photo frames available in multiple sizes. From classic photo prints to A4 documents - we
                  have the perfect frame for you.
                </p>
              </div>

              {/* Top Sellers */}
              <div className="mb-16">
                <h3 className="text-2xl font-bold text-white mb-8 text-center">
                  <span className="text-[#FACC15]">★</span> Top Selling Sizes <span className="text-[#FACC15]">★</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {topSellers.map((seller, index) => (
                    <Card
                      key={index}
                      className="relative glass border-border hover:border-[#FACC15] transition-all duration-300 overflow-hidden flex flex-col"
                    >
                      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${seller.badgeColor}`} />

                      <div className="p-6 flex flex-col flex-1">
                        <div className="flex items-center gap-3 mb-4">
                          <div className="w-10 h-10 rounded-full bg-[#FACC15]/10 flex items-center justify-center">
                            <span className="text-lg">
                              {seller.rank === 1 ? "🥇" : seller.rank === 2 ? "🥈" : "🥉"}
                            </span>
                          </div>
                          <div>
                            <p className="text-xs text-[#FACC15] font-bold">
                              #{seller.rank} {seller.badge}
                            </p>
                            <p className="text-2xl font-bold text-white">{seller.size}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 mb-3">
                          <span>🏆</span>
                          <span className="text-[#FACC15] font-semibold">{seller.subtitle}</span>
                        </div>

                        <div className="mb-4">
                          <p className="text-sm text-[#9CA3AF] mb-2">Used for:</p>
                          <ul className="space-y-1 ml-4">
                            {seller.usedFor.map((use, i) => (
                              <li key={i} className="text-sm text-white list-disc">
                                {use}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {seller.features.map((feature, i) => (
                          <p key={i} className="text-sm text-[#9CA3AF] mb-2">
                            • {feature}
                          </p>
                        ))}

                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded border border-[#FACC15]/30 bg-[#FACC15]/10 mt-3 w-fit">
                          <span className="text-[#FACC15]">✓</span>
                          <span className="text-sm font-medium text-[#FACC15]">{seller.tag}</span>
                        </div>

                        <div className="mt-auto pt-6">
                          <div className="pt-4 border-t border-border">
                            <div className="flex items-center justify-between mb-4">
                              <span className="text-[#9CA3AF]">Starting at</span>
                              <span className="text-2xl font-bold text-[#FACC15]">{seller.price}</span>
                            </div>
                            <Link href="/order">
                              <Button className="w-full bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#050505] font-semibold">
                                Order Now
                              </Button>
                            </Link>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>

              {/* All Photo Sizes */}
              <div className="mb-12">
                <h3 className="text-xl font-bold text-white mb-6 text-center">All Available Sizes</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                  {photoSizes.map((photo, index) => (
                    <div
                      key={index}
                      onClick={() => {
                        setSelectedFrame(photo.size)
                        setCurrentImageIndex(0)
                      }}
                    >
                      <Card className="glass border-border hover:border-[#FACC15] transition-all duration-300 cursor-pointer group h-full flex flex-col">
                        <div className="relative aspect-[3/4] overflow-hidden bg-black/20">
                          <img
                            src={photo.image || "/placeholder.svg?height=300&width=225&query=photo frame"}
                            alt={`Photo frame ${photo.size}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {photo.popular && (
                            <span className="absolute top-2 left-2 px-2 py-0.5 rounded bg-[#FACC15] text-[#050505] text-xs font-bold">
                              Popular
                            </span>
                          )}
                          <div className="absolute bottom-2 right-2 px-2 py-1 rounded bg-black/70 text-white text-xs flex items-center gap-1">
                            <ImageIcon className="w-3 h-3" />
                            {photo.gallery.length}
                          </div>
                        </div>

                        <div className="p-3 text-center flex flex-col gap-2">
                          <div>
                            <p className="text-base md:text-lg font-bold text-white">{photo.size}</p>
                            {photo.name && <p className="text-xs text-[#9CA3AF]">{photo.name}</p>}
                          </div>
                          <p className="text-lg md:text-xl font-bold text-[#FACC15]">{photo.price}</p>
                          <div className="w-full bg-[#FACC15] text-[#050505] py-2 px-3 rounded font-bold text-xs md:text-sm group-hover:bg-[#FACC15]/90 transition-colors text-center">
                            View Gallery
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>

              <div className="text-center mt-12">
                <Link href="/order">
                  <Button className="bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#050505] font-bold px-8 py-6 text-lg">
                    Order Your Custom Frame Now
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="px-4 py-20 relative">
          <div className="container mx-auto">
            <div className="relative glass rounded-3xl border border-primary/30 p-12 md:p-16 text-center overflow-hidden">
              <div className="absolute top-0 left-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl" />
              <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 mb-6 px-4 py-2 rounded-full border border-primary/30 bg-primary/10">
                  <Star className="w-4 h-4 text-[#FACC15]" />
                  <span className="text-[#FACC15] text-sm font-semibold">Ready to Create?</span>
                </div>

                <h2 className="text-4xl md:text-5xl font-bold mb-6 text-white">
                  Like What You See? <br />
                  <span className="text-[#FACC15]">{"Let's Work Together"}</span>
                </h2>

                <p className="text-lg mb-10 max-w-2xl mx-auto text-[#9CA3AF]">
                  Join hundreds of satisfied creators who trust M2 Studio for their video editing needs. Start your
                  project today and see the difference professional editing makes.
                </p>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/order">
                    <Button size="lg" className="glow-yellow btn-lift text-lg px-10 py-6 bg-[#FACC15] text-black">
                      Start Your Project
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Link href="/services">
                    <Button
                      size="lg"
                      variant="outline"
                      className="btn-lift text-lg px-10 py-6 border-white hover:border-[#FACC15] hover:bg-[#FACC15] hover:text-[#050505] text-white bg-transparent transition-all duration-300"
                    >
                      View Services
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* Video/Image Preview Modal */}
      {mounted &&
        selectedVideo &&
        selectedProjectData &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={handleCloseModal}
          >
            <div
              className="relative max-w-4xl w-full glass rounded-lg overflow-hidden border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <div
                className={`${
                  selectedProjectData.type === "image" ? "" : "aspect-video"
                } bg-black/50 flex items-center justify-center`}
              >
                {selectedProjectData.type === "video" ? (
                  selectedProjectData.mediaUrl && !selectedProjectData.mediaUrl.includes("YOUR_VIDEO_ID") ? (
                    <iframe
                      width="100%"
                      height="100%"
                      src={selectedProjectData.mediaUrl}
                      title={selectedProjectData.title}
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="aspect-video"
                    ></iframe>
                  ) : (
                    <div className="text-center py-12">
                      <PlayCircle className="w-20 h-20 mx-auto mb-4 text-[#FACC15]" />
                      <h3 className="text-xl font-semibold text-white mb-2">{selectedProjectData.title}</h3>
                      <p className="text-[#9CA3AF]">Add your YouTube/Vimeo embed URL to mediaUrl</p>
                      <p className="text-[#6B7280] text-sm mt-2">Example: https://www.youtube.com/embed/dQw4w9WgXcQ</p>
                    </div>
                  )
                ) : (
                  <div className="relative w-full">
                    <Image
                      src={selectedProjectData.mediaUrl || selectedProjectData.thumbnail || "/placeholder.svg"}
                      alt={selectedProjectData.title}
                      width={1200}
                      height={800}
                      className="w-full h-auto max-h-[70vh] object-contain"
                    />
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-medium ${
                          selectedProjectData.type === "video"
                            ? "bg-red-500/20 text-red-400"
                            : "bg-[#FACC15]/20 text-[#FACC15]"
                        }`}
                      >
                        {selectedProjectData.type === "video" ? "VIDEO" : "IMAGE"}
                      </span>
                      <p className="text-sm text-[#9CA3AF] capitalize">{selectedProjectData.category}</p>
                    </div>
                    <p className="text-white font-medium">{selectedProjectData.title}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 text-[#9CA3AF] text-sm">
                      <Eye className="w-4 h-4" />
                      {selectedProjectData.views} views
                    </div>
                    {selectedProjectData.type === "video" && selectedProjectData.duration && (
                      <div className="flex items-center gap-1 text-[#9CA3AF] text-sm">
                        <Clock className="w-4 h-4" />
                        {selectedProjectData.duration}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}

      {/* Case Study Modal */}
      {mounted &&
        selectedCase &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm overflow-y-auto"
            onClick={() => setSelectedCase(null)}
          >
            <div
              className="relative max-w-4xl w-full glass border border-border rounded-lg overflow-hidden my-8"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => setSelectedCase(null)}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              {caseStudies
                .filter((s) => s.id === selectedCase)
                .map((study) => (
                  <div key={study.id}>
                    <div className="relative aspect-video">
                      <img
                        src={study.thumbnail || "/placeholder.svg"}
                        alt={study.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent" />
                    </div>

                    <div className="p-8">
                      <div className="flex items-center gap-2 mb-4">
                        {[...Array(study.rating)].map((_, i) => (
                          <Star key={i} className="w-5 h-5 fill-[#FACC15] text-[#FACC15]" />
                        ))}
                      </div>

                      <h2 className="text-3xl font-bold text-white mb-2">{study.title}</h2>
                      <p className="text-[#9CA3AF] mb-6">Client: {study.client}</p>

                      <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 border border-border p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <TrendingUp className="w-5 h-5 text-[#FACC15]" />
                            <span className="text-sm text-[#9CA3AF]">Result</span>
                          </div>
                          <p className="text-lg font-semibold text-white">{study.result}</p>
                        </div>
                        <div className="bg-white/5 border border-border p-4 rounded-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <Clock className="w-5 h-5 text-[#FACC15]" />
                            <span className="text-sm text-[#9CA3AF]">Delivery Time</span>
                          </div>
                          <p className="text-lg font-semibold text-white">{study.deliveryTime}</p>
                        </div>
                      </div>

                      <div className="space-y-6">
                        <div>
                          <h3 className="text-xl font-bold text-white mb-3">Overview</h3>
                          <p className="text-[#9CA3AF] leading-relaxed">{study.description}</p>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white mb-3">The Challenge</h3>
                          <p className="text-[#9CA3AF] leading-relaxed">{study.challenge}</p>
                        </div>

                        <div>
                          <h3 className="text-xl font-bold text-white mb-3">Our Solution</h3>
                          <p className="text-[#9CA3AF] leading-relaxed">{study.solution}</p>
                        </div>

                        <div className="bg-white/5 border border-border p-6 rounded-lg border-l-4 border-l-[#FACC15]">
                          <p className="text-white italic mb-2">{`"${study.testimonial}"`}</p>
                          <p className="text-sm text-[#9CA3AF]">- {study.client}</p>
                        </div>
                      </div>

                      <div className="mt-8 flex gap-4">
                        <Link href="/order" className="flex-1">
                          <Button className="w-full bg-[#FACC15] hover:bg-[#FACC15]/90 text-[#050505] font-semibold">
                            Start Your Project
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          className="flex-1 border-white hover:border-[#FACC15] hover:text-[#FACC15] text-white bg-transparent"
                          onClick={() => setSelectedCase(null)}
                        >
                          Close
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>,
          document.body,
        )}

      {/* Frame Gallery Modal */}
      {mounted &&
        selectedFrame &&
        getSelectedFrameData() &&
        createPortal(
          <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
            onClick={() => {
              setSelectedFrame(null)
              setCurrentImageIndex(0)
            }}
          >
            <div
              className="relative max-w-4xl w-full glass rounded-lg overflow-hidden border border-border"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                onClick={() => {
                  setSelectedFrame(null)
                  setCurrentImageIndex(0)
                }}
                className="absolute top-4 right-4 z-10 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
              >
                <X className="w-6 h-6 text-white" />
              </button>

              <div className="relative aspect-[4/3] bg-black/50">
                <img
                  src={getSelectedFrameData()?.gallery[currentImageIndex] || "/placeholder.svg"}
                  alt={`${getSelectedFrameData()?.size} frame`}
                  className="w-full h-full object-contain"
                />

                {(getSelectedFrameData()?.gallery.length || 0) > 1 && (
                  <>
                    <button
                      onClick={handlePrevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronLeft className="w-6 h-6 text-white" />
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/50 rounded-full hover:bg-black/70 transition-colors"
                    >
                      <ChevronRight className="w-6 h-6 text-white" />
                    </button>
                  </>
                )}
              </div>

              <div className="p-4 border-t border-border">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-white">{getSelectedFrameData()?.size} Frame</h3>
                    <p className="text-sm text-[#9CA3AF]">{getSelectedFrameData()?.description}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[#FACC15] font-bold text-xl">{getSelectedFrameData()?.price}</p>
                    {(getSelectedFrameData()?.gallery.length || 0) > 1 && (
                      <p className="text-sm text-[#9CA3AF]">
                        {currentImageIndex + 1} / {getSelectedFrameData()?.gallery.length}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )}
    </div>
  )
}
