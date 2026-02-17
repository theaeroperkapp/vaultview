"use client"

import { useState, useEffect } from "react"
import Image from "next/image"

export function SplashOverlay() {
  const [visible, setVisible] = useState(false)
  const [fadeOut, setFadeOut] = useState(false)

  useEffect(() => {
    const justLoggedIn = sessionStorage.getItem("just-logged-in")
    if (justLoggedIn) {
      sessionStorage.removeItem("just-logged-in")
      setVisible(true)

      const timer = setTimeout(() => {
        setFadeOut(true)
        setTimeout(() => setVisible(false), 500)
      }, 3500)

      return () => clearTimeout(timer)
    }
  }, [])

  if (!visible) return null

  return (
    <div
      className={`fixed inset-0 z-[100] flex flex-col items-center justify-center bg-[#0F1117] transition-opacity duration-500 ${
        fadeOut ? "opacity-0" : "opacity-100"
      }`}
      onClick={() => { setFadeOut(true); setTimeout(() => setVisible(false), 500) }}
    >
      {/* Speech bubble */}
      <div className="animate-bounce-in relative mb-4 rounded-2xl bg-white px-6 py-3 shadow-lg">
        <p className="text-lg font-bold text-[#0F1117]">You gotta save money!</p>
        {/* Bubble tail */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 h-0 w-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-white" />
      </div>

      {/* Dog image */}
      <div className="animate-scale-in relative h-64 w-64 md:h-80 md:w-80 overflow-hidden rounded-3xl shadow-2xl shadow-emerald-500/20 border-2 border-emerald-500/30">
        <Image
          src="/splash-dog.webp"
          alt="Save money dog"
          fill
          className="object-cover"
          priority
        />
      </div>

      {/* VaultView branding */}
      <p className="mt-6 animate-fade-in text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair)' }}>
        Vault<span className="text-emerald-500">View</span>
      </p>

      <p className="mt-3 animate-fade-in text-xs text-[#64748B]">Tap anywhere to continue</p>
    </div>
  )
}
