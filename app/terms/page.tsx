import { Footer } from "@/components/footer"
import { FileText } from "lucide-react"

export default function TermsPage() {
  return (
    <>
      <main className="min-h-screen bg-background pt-24 pb-16">
        {/* Background Effects */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-yellow-400/5 rounded-full blur-3xl" />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-yellow-400/10 border border-yellow-400/20 mb-6">
              <FileText className="w-8 h-8 text-yellow-400" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Terms of <span className="text-yellow-400">Service</span>
            </h1>
            <p className="text-gray-400 max-w-2xl mx-auto">Last updated: December 2024</p>
          </div>

          {/* Content */}
          <div className="max-w-4xl mx-auto">
            <div className="bg-[#0A0A0A] border border-gray-800 rounded-2xl p-8 md:p-12 space-y-8">
              <section>
                <h2 className="text-2xl font-bold text-white mb-4">1. Acceptance of Terms</h2>
                <p className="text-gray-400 leading-relaxed">
                  By accessing and using M2 Studio's services, you accept and agree to be bound by the terms and
                  provisions of this agreement. If you do not agree to abide by these terms, please do not use our
                  services.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">2. Services Description</h2>
                <p className="text-gray-400 leading-relaxed mb-4">
                  M2 Studio provides professional video editing and creative services including but not limited to:
                </p>
                <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4">
                  <li>Wedding video editing</li>
                  <li>YouTube video editing</li>
                  <li>Social media reels and shorts</li>
                  <li>Thumbnail design</li>
                  <li>Logo and animation creation</li>
                  <li>Corporate video production</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">3. User Responsibilities</h2>
                <p className="text-gray-400 leading-relaxed">
                  Users are responsible for providing accurate information, timely communication, and ensuring they have
                  the rights to all materials submitted for editing. Users must not submit content that is illegal,
                  offensive, or infringes on third-party rights.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">4. Payment Terms</h2>
                <p className="text-gray-400 leading-relaxed">
                  Payment is required as per the agreed terms before project delivery. Prices are quoted in Indian
                  Rupees (INR) unless otherwise specified. We reserve the right to modify pricing with prior notice.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">5. Revisions Policy</h2>
                <p className="text-gray-400 leading-relaxed">
                  We offer revisions based on the service package selected. Additional revisions beyond the included
                  amount may incur extra charges. Revision requests must be clearly communicated within 7 days of
                  delivery.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">6. Intellectual Property</h2>
                <p className="text-gray-400 leading-relaxed">
                  Upon full payment, clients retain full ownership of the final delivered content. M2 Studio reserves
                  the right to showcase completed work in our portfolio unless otherwise agreed in writing.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">7. Confidentiality</h2>
                <p className="text-gray-400 leading-relaxed">
                  We treat all client materials and information with strict confidentiality. We will not share, sell, or
                  distribute client data to third parties without explicit consent.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">8. Limitation of Liability</h2>
                <p className="text-gray-400 leading-relaxed">
                  M2 Studio shall not be liable for any indirect, incidental, or consequential damages arising from the
                  use of our services. Our total liability shall not exceed the amount paid for the specific service in
                  question.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-bold text-white mb-4">9. Contact Information</h2>
                <p className="text-gray-400 leading-relaxed">
                  For any questions regarding these terms, please contact us at:
                </p>
                <p className="text-yellow-400 mt-2">support@m2studio.in</p>
              </section>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </>
  )
}
