"use client"
import React, { useEffect, useState } from 'react'
import CustomConnectButton from '@/components/ConnectWalletButton'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import CreateProfileDialogue from '@/components/CreateProfileDialogue'

const LoginPage = () => {
    const { status, data: session } = useSession()
    const [openProfile, setOpenProfile] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
      if (status === 'authenticated' && session?.user) {
        const user = session.user as any
        
        // Redirect based on onboarding status
        if (user.onboardingStatus === 'PENDING') {
          redirect('/onboarding/role')
        } else if (user.onboardingStatus === 'ROLE_SELECTED') {
          redirect('/onboarding/profile')
        } else if (user.onboardingStatus === 'COMPLETED') {
          redirect('/timeline')
        }
      }
    }, [status, session])
    useEffect(() => {
      const t = setTimeout(() => setMounted(true), 50)
      return () => clearTimeout(t)
    }, [])
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-black">
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div className="blob absolute -top-24 -left-24 h-72 w-72 rounded-full bg-gradient-to-br from-[#A7EF9E]/40 to-emerald-500/30 blur-3xl" />
        <div className="blob-delay absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-gradient-to-br from-cyan-500/25 to-teal-500/25 blur-3xl" />
      </div>

      <div className="relative z-10 mx-4 w-full max-w-sm md:max-w-md">
        <div className={`group rounded-2xl border border-white/10 bg-white/5 p-8 md:p-10 shadow-2xl backdrop-blur-xl transition-all duration-500 ease-out hover:-translate-y-0.5 ${mounted ? 'card-enter' : 'card-initial'}`}>
          <div className={`pointer-events-none absolute inset-0 overflow-hidden rounded-2xl ${mounted ? '' : 'opacity-0'}`}>
            <div className={`absolute -left-1/3 top-0 h-full w-1/3 rotate-12 bg-gradient-to-r from-transparent via-white/20 to-transparent ${mounted ? 'shimmer' : ''}`} />
          </div>
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-[#A7EF9E]/30 bg-[#A7EF9E]/10 text-[#A7EF9E] shadow-[0_0_30px_-10px_rgba(167,239,158,0.6)]">
              {/* Wallet icon */}
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M3 7.5A2.5 2.5 0 0 1 5.5 5H18a1 1 0 1 1 0 2H5.5A.5.5 0 0 0 5 7.5V9h13.5A2.5 2.5 0 0 1 21 11.5v5A2.5 2.5 0 0 1 18.5 19h-13A2.5 2.5 0 0 1 3 16.5v-9Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M21 12h-3.5a2 2 0 1 0 0 4H21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h1 className="bg-gradient-to-r from-white via-zinc-200 to-[#A7EF9E] bg-clip-text text-3xl md:text-4xl font-semibold tracking-tight text-transparent">
              Login to Debug
            </h1>
            <p className="mt-3 text-sm md:text-base text-zinc-300/80">
              Connect your wallet to continue.
            </p>
          </div>

          <div className="flex justify-center">
            <CustomConnectButton />
          </div>

          <div className="mt-8 h-px w-full bg-gradient-to-r from-transparent via-[#A7EF9E]/40 to-transparent" />

          <p className="mt-6 text-center text-xs text-zinc-400">
            <span className="inline-flex items-center justify-center align-middle text-[#A7EF9E] mr-1">
              <svg className="animate-bounce" width="12" height="12" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2a10 10 0 1 0 10 10A10.011 10.011 0 0 0 12 2Zm-1 15-5-5 1.414-1.414L11 13.172l6.586-6.586L19 8l-8 9Z" />
              </svg>
            </span>
            By continuing, you agree to our Terms and Privacy Policy.
          </p>
        </div>
      </div>

      <CreateProfileDialogue open={openProfile} setOpen={setOpenProfile} />

      <style jsx>{`
        .blob { animation: float 12s ease-in-out infinite; }
        .blob-delay { animation: float 14s ease-in-out infinite; animation-delay: 1.2s; }
        .card-initial { opacity: 0; transform: translateY(8px) scale(0.98); }
        .card-enter { opacity: 1; transform: translateY(0) scale(1); }
        .shimmer { animation: sweep 900ms ease-out 120ms both; }
        @keyframes float {
          0%, 100% { transform: translate(0, 0) scale(1); }
          25% { transform: translate(10px, -20px) scale(1.05); }
          50% { transform: translate(0, -8px) scale(1); }
          75% { transform: translate(-12px, -16px) scale(1.03); }
        }
        @keyframes sweep {
          0% { transform: translateX(-120%) rotate(12deg); opacity: 0; }
          60% { opacity: 1; }
          100% { transform: translateX(220%) rotate(12deg); opacity: 0; }
        }
      `}</style>
    </div>
  )
}

export default LoginPage