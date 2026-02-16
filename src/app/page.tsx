import Link from "next/link"
import { Vault, ArrowRight, BarChart3, MessageCircle, Shield } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0F1117]">
      {/* Header */}
      <header className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-2">
          <Vault className="h-7 w-7 text-emerald-500" />
          <span className="text-xl font-bold text-white">
            Vault<span className="text-emerald-500">View</span>
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/login">
            <Button variant="ghost" className="text-[#94A3B8] hover:text-white">
              Sign In
            </Button>
          </Link>
          <Link href="/signup">
            <Button className="bg-emerald-500 text-white hover:bg-emerald-600">
              Get Started
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <main className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="mx-auto max-w-3xl">
          <h1 className="mb-6 text-5xl font-bold leading-tight text-white md:text-6xl" style={{ fontFamily: 'var(--font-playfair)' }}>
            Your finances,{" "}
            <span className="text-emerald-500">beautifully managed</span>
          </h1>
          <p className="mb-8 text-lg text-[#94A3B8] md:text-xl">
            Replace messy spreadsheets with a modern budget dashboard.
            Track expenses, chat with your partner, and stay on top of your money — together.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="bg-emerald-500 text-white hover:bg-emerald-600">
                Start Free <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mx-auto mt-20 grid max-w-4xl grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-6">
            <BarChart3 className="mb-4 h-10 w-10 text-emerald-500" />
            <h3 className="mb-2 text-lg font-semibold text-white">Visual Dashboard</h3>
            <p className="text-sm text-[#94A3B8]">
              Charts, summaries, and insights at a glance. No more scrolling through cells.
            </p>
          </div>
          <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-6">
            <MessageCircle className="mb-4 h-10 w-10 text-emerald-500" />
            <h3 className="mb-2 text-lg font-semibold text-white">Built-in Chat</h3>
            <p className="text-sm text-[#94A3B8]">
              Discuss budget changes in real-time. Get alerts when your partner updates an expense.
            </p>
          </div>
          <div className="rounded-xl border border-[#2A2D3A] bg-[#1A1D27] p-6">
            <Shield className="mb-4 h-10 w-10 text-emerald-500" />
            <h3 className="mb-2 text-lg font-semibold text-white">Secure & Private</h3>
            <p className="text-sm text-[#94A3B8]">
              Row-level security ensures only your household can see your data.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#2A2D3A] px-6 py-6 text-center text-sm text-[#94A3B8]">
        VaultView &copy; {new Date().getFullYear()}. Built with care.
      </footer>
    </div>
  )
}
