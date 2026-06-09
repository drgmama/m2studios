"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import {
  Send,
  Upload,
  CheckCircle2,
  ArrowRight,
  Star,
  Phone,
  Mail,
  MessageCircle,
  Link2,
  CalendarIcon,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { Footer } from "@/components/footer"
import { ScrollToTop } from "@/components/scroll-to-top"
import { Calendar } from "@/components/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { format } from "date-fns"

const recentProjects = [
  {
    client: "Tech YouTube Channel",
    type: "YouTube Video Editing",
    duration: "Delivered in 24 hrs",
    rating: 5,
  },
  {
    client: "Wedding Studio",
    type: "Wedding Film",
    duration: "Delivered in 3 days",
    rating: 5,
  },
  {
    client: "Fitness Influencer",
    type: "Instagram Reels",
    duration: "Delivered in 12 hrs",
    rating: 5,
  },
]

const steps = [
  {
    step: "01",
    title: "Submit Order",
    description: "Fill out the form with your project details and requirements.",
  },
  {
    step: "02",
    title: "Get Quote",
    description: "Receive a personalized quote and timeline within 1 hour.",
  },
  {
    step: "03",
    title: "We Edit",
    description: "Our experts work on your project with regular updates.",
  },
  {
    step: "04",
    title: "Download",
    description: "Review, request revisions, and download your final video.",
  },
]

export default function OrderPage() {
  const searchParams = useSearchParams()
  const preSelectedService = searchParams.get("service")

  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    whatsapp: "",
    serviceType: "",
    projectDescription: "",
    deadline: "",
    rawFileLink: "",
  })
  const [currentStep, setCurrentStep] = useState(1)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (preSelectedService) {
      setFormData((prev) => ({ ...prev, serviceType: preSelectedService }))
    }
  }, [preSelectedService])

  // Pre-populate name and email if the user is authenticated
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        fullName: prev.fullName || user.displayName || "",
        email: prev.email || user.email || "",
      }))
    }
  }, [user])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date)
    if (date) {
      setFormData((prev) => ({ ...prev, deadline: format(date, "yyyy-MM-dd") }))
    }
  }

  const validateStep1 = () => {
    if (!formData.fullName.trim()) return "Full Name is required."
    if (!formData.email.trim()) return "Email is required."
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(formData.email)) return "Please enter a valid email address."
    if (!formData.whatsapp.trim()) return "WhatsApp Number is required."
    return null
  }

  const validateStep2 = () => {
    if (!formData.serviceType) return "Please select a service type."
    if (!formData.projectDescription.trim()) return "Project Description is required."
    return null
  }

  const handleNextStep = () => {
    setErrorMessage("")
    setSubmitStatus("idle")
    if (currentStep === 1) {
      const err = validateStep1()
      if (err) {
        setErrorMessage(err)
        setSubmitStatus("error")
        return
      }
      setCurrentStep(2)
    } else if (currentStep === 2) {
      const err = validateStep2()
      if (err) {
        setErrorMessage(err)
        setSubmitStatus("error")
        return
      }
      setCurrentStep(3)
    }
  }

  const handlePrevStep = () => {
    setErrorMessage("")
    setSubmitStatus("idle")
    setCurrentStep((prev) => Math.max(prev - 1, 1))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    // Final check on all required fields
    if (
      !formData.fullName ||
      !formData.email ||
      !formData.whatsapp ||
      !formData.serviceType ||
      !formData.projectDescription
    ) {
      setErrorMessage("Please fill in all required fields.")
      setSubmitStatus("error")
      setIsSubmitting(false)
      return
    }

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const result = await response.json()

      if (response.ok) {
        setSubmitStatus("success")
        setFormData({
          fullName: "",
          email: "",
          whatsapp: "",
          serviceType: "",
          projectDescription: "",
          deadline: "",
          rawFileLink: "",
        })
        setSelectedDate(undefined)
        setCurrentStep(1)
        router.push("/thank-you")
      } else {
        setErrorMessage(result.error || "Failed to submit order. Please try again.")
        setSubmitStatus("error")
      }
    } catch (error) {
      setErrorMessage("Network error. Please check your connection and try again.")
      setSubmitStatus("error")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "linear-gradient(to right, #222 1px, transparent 1px), linear-gradient(to bottom, #222 1px, transparent 1px)",
            backgroundSize: "40px 40px",
            animation: "moveGrid 20s linear infinite",
          }}
        />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-96 h-96 bg-yellow-400/10 rounded-full blur-3xl" />
        <div className="absolute top-2/3 right-1/3 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl" />
      </div>

      <style jsx>{`
        @keyframes moveGrid {
          0% { transform: translate(0, 0); }
          100% { transform: translate(-40px, -40px); }
        }
      `}</style>

      <section id="order-form" className="relative z-10 pt-32 pb-16 px-4">
        <div className="max-w-2xl mx-auto">
          <div
            className="rounded-3xl shadow-2xl backdrop-blur-md p-6 md:p-10"
            style={{
              backgroundColor: "rgba(10, 10, 10, 0.9)",
              border: "1px solid rgba(250, 204, 21, 0.3)",
            }}
          >
            <h2 className="text-2xl md:text-3xl font-bold text-center mb-2 text-white">
              Start Your <span className="text-yellow-400">Project</span>
            </h2>
            <p className="text-center text-gray-400 text-sm mb-8">
              Fill out the form below and we'll get back to you within 1 hour.
            </p>

            {submitStatus === "success" && (
              <div className="rounded-xl p-4 mb-6 flex items-center gap-3 bg-green-500/10 border border-green-500/30">
                <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-500" />
                <div>
                  <p className="font-medium text-green-500">Order Submitted Successfully!</p>
                  <p className="text-sm text-gray-400">
                    Thanks for contacting M2 Studio. We'll get back to you within 1 hour.
                  </p>
                </div>
              </div>
            )}

            {submitStatus === "error" && (
              <div className="rounded-xl p-4 mb-6 flex items-center gap-3 bg-red-500/10 border border-red-500/30">
                <Star className="w-6 h-6 flex-shrink-0 text-red-500" />
                <p className="text-red-500">{errorMessage}</p>
              </div>
            )}

            {/* Step Indicator Stepper */}
            <div className="flex items-center justify-between max-w-xs mx-auto mb-8 relative">
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-800 -translate-y-1/2 z-0" />
              <div
                className="absolute top-1/2 left-0 h-0.5 bg-[#FACC15] -translate-y-1/2 z-0 transition-all duration-300"
                style={{ width: `${((currentStep - 1) / 2) * 100}%` }}
              />
              {[1, 2, 3].map((stepNum) => {
                const isActive = stepNum === currentStep
                const isCompleted = stepNum < currentStep
                return (
                  <div
                    key={stepNum}
                    className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm z-10 transition-all duration-300 border ${
                      isCompleted
                        ? "bg-[#FACC15] border-[#FACC15] text-[#000000]"
                        : isActive
                          ? "bg-[#050505] border-[#FACC15] text-[#FACC15] shadow-[0_0_10px_rgba(250,204,21,0.5)]"
                          : "bg-gray-900 border-gray-700 text-gray-500"
                    }`}
                  >
                    {stepNum}
                  </div>
                )
              })}
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Step 1: Contact Details */}
              {currentStep === 1 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label className="block text-sm font-medium mb-2 text-white">
                        Full Name <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleChange}
                        placeholder="Your Name"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-colors"
                      />
                    </div>

                    <div>
                      <Label className="block text-sm font-medium mb-2 text-white">
                        Email <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="your@email.com"
                        required
                        className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="block text-sm font-medium mb-2 text-white">
                      WhatsApp Number <span className="text-red-500">*</span>
                    </Label>
                    <Input
                      type="tel"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="+91 XXXXX XXXXX"
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-yellow-400 focus:outline-none transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Project Specifications */}
              {currentStep === 2 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <Label className="block text-sm font-medium mb-2 text-white">
                      Service Type <span className="text-red-500">*</span>
                    </Label>
                    <select
                      name="serviceType"
                      value={formData.serviceType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white focus:border-yellow-400 focus:outline-none transition-colors appearance-none cursor-pointer"
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239CA3AF'%3E%3Cpath strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "right 12px center",
                        backgroundSize: "20px",
                      }}
                    >
                      <option value="" disabled>
                        Select Service
                      </option>
                      <option value="Wedding Film Editing">Wedding Film Editing</option>
                      <option value="YouTube Video Editing">YouTube Video Editing</option>
                      <option value="Social Media Reels">Social Media Reels</option>
                      <option value="Corporate Video">Corporate Video</option>
                      <option value="Music Video">Music Video</option>
                      <option value="Thumbnail Design">Thumbnail Design</option>
                      <option value="Photo Frames">Photo Frames</option>
                      <option value="Logo & Animation">Logo & Animation</option>
                      <option value="AI Web Development">AI Web Development</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <Label className="block text-sm font-medium mb-2 text-white">
                      Project Description <span className="text-red-500">*</span>
                    </Label>
                    <Textarea
                      name="projectDescription"
                      value={formData.projectDescription}
                      onChange={handleChange}
                      placeholder="Describe your project requirements, style preferences, and any specific instructions..."
                      rows={5}
                      required
                      className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-colors resize-none"
                    />
                  </div>
                </div>
              )}

              {/* Step 3: Files & Timeline */}
              {currentStep === 3 && (
                <div className="space-y-4 animate-in fade-in slide-in-from-right-4 duration-300">
                  <div>
                    <Label className="block text-sm font-medium mb-2 text-white">Deadline Date</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          className="w-full px-4 py-3 rounded-xl bg-gray-900 border border-gray-700 text-left flex items-center justify-between hover:border-yellow-400/50 focus:border-yellow-400 focus:outline-none transition-colors"
                        >
                          <span className={selectedDate ? "text-white" : "text-gray-500"}>
                            {selectedDate ? format(selectedDate, "PPP") : "Select deadline date"}
                          </span>
                          <CalendarIcon className="w-5 h-5 text-gray-500" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-gray-900 border border-gray-700" align="start">
                        <Calendar
                          mode="single"
                          selected={selectedDate}
                          onSelect={handleDateSelect}
                          disabled={(date) => date < new Date()}
                          initialFocus
                          className="bg-gray-900 text-white"
                        />
                      </PopoverContent>
                    </Popover>
                  </div>

                  <div>
                    <Label className="block text-sm font-medium mb-2 text-white">
                      <span className="flex items-center gap-2">
                        <Link2 className="w-4 h-4 text-yellow-400" />
                        Raw File Link
                        <span className="text-gray-500 font-normal">(Google Drive / WeTransfer)</span>
                      </span>
                    </Label>
                    <div className="relative">
                      <Input
                        type="url"
                        name="rawFileLink"
                        value={formData.rawFileLink}
                        onChange={handleChange}
                        placeholder="Paste your file sharing link here..."
                        className="w-full px-4 py-3 pl-11 rounded-xl bg-gray-900 border border-gray-700 text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none transition-colors"
                      />
                      <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Controls */}
              <div className="flex gap-3 pt-4">
                {currentStep > 1 && (
                  <Button
                    type="button"
                    onClick={handlePrevStep}
                    className="flex-1 py-4 font-bold border border-white hover:border-[#FACC15] hover:text-[#FACC15] text-white bg-transparent rounded-xl transition-all"
                  >
                    Back
                  </Button>
                )}
                
                {currentStep < 3 ? (
                  <Button
                    type="button"
                    onClick={handleNextStep}
                    className="flex-1 py-4 font-bold rounded-xl transition-all hover:scale-[1.01] active:scale-[0.99]"
                    style={{ background: "#FACC15", color: "#000000" }}
                  >
                    Next Step
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-grow py-4 font-bold rounded-xl shadow-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-[1.01] active:scale-[0.99]"
                    style={{
                      background: isSubmitting ? "#6B7280" : "#FACC15",
                      color: "#000000",
                    }}
                  >
                    {isSubmitting ? (
                      <>
                        <Upload className="w-5 h-5 animate-spin" />
                        Submitting...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Submit Order
                      </>
                    )}
                  </Button>
                )}
              </div>
            </form>

            <div className="mt-8 pt-8 border-t border-gray-800">
              <p className="text-center text-gray-400 text-sm mb-4">Or contact us directly</p>
              <div className="flex flex-wrap justify-center gap-4">
                <Link
                  href="mailto:support@m2studio.in"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <Mail className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">Email</span>
                </Link>
                <Link
                  href="tel:+918122426212"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                >
                  <Phone className="w-4 h-4 text-yellow-400" />
                  <span className="text-white text-sm">Call</span>
                </Link>
                <Link
                  href="https://wa.me/918122426212"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-600 hover:bg-green-500 transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-white" />
                  <span className="text-white text-sm">WhatsApp</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Recent <span className="text-yellow-400">Success Stories</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentProjects.map((project, index) => (
              <div key={index} className="p-6 rounded-2xl border border-gray-800 bg-gray-900/50">
                <div className="flex items-center justify-between mb-4">
                  <span className="px-3 py-1 rounded-full bg-yellow-400/10 text-yellow-400 text-xs font-medium">
                    {project.type}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(project.rating)].map((_, i) => (
                      <span key={i} className="text-yellow-400 text-sm">
                        ★
                      </span>
                    ))}
                  </div>
                </div>
                <h4 className="font-semibold text-white mb-1">{project.client}</h4>
                <p className="text-gray-500 text-sm flex items-center gap-1">
                  <ArrowRight className="w-3 h-3" />
                  {project.duration}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="relative z-10 py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-4">
            How It <span className="text-yellow-400">Works</span>
          </h2>
          <p className="text-gray-400 text-center mb-12 max-w-2xl mx-auto">
            Simple 4-step process to get your project done professionally.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {steps.map((step, index) => (
              <div
                key={index}
                className="relative p-6 rounded-xl border border-gray-800 bg-gray-900/50 hover:border-yellow-400/50 transition-all duration-300 group"
              >
                <div className="text-4xl font-bold text-yellow-400/20 mb-2">{step.step}</div>
                <h4 className="font-semibold text-white mb-2 group-hover:text-yellow-400 transition-colors">
                  {step.title}
                </h4>
                <p className="text-gray-400 text-sm">{step.description}</p>
                {index < steps.length - 1 && (
                  <ArrowRight className="hidden lg:block absolute top-1/2 -right-3 w-6 h-6 text-gray-700" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
      <ScrollToTop />
    </div>
  )
}
