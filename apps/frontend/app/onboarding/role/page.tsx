"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Shield, Users, Building2, Target, Zap, Award } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function RoleSelectionPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [selectedRole, setSelectedRole] = useState<"HUNTER" | "ORG" | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user) {
      // If user already has a role, redirect to profile setup
      if (session.user.role && session.user.onboardingStatus !== "PENDING") {
        router.push("/onboarding/profile")
      }
    }
  }, [status, session, router])

  const handleRoleSelection = async () => {
    if (!selectedRole || !session?.user?.wallet) return

    setLoading(true)
    try {
      const response = await fetch("http://localhost:8000/api/auth/select-role", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: session.user.wallet,
          role: selectedRole,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update session with new role
        await update({
          ...session.user,
          role: data.user.role,
          onboardingStatus: data.user.onboardingStatus,
        })

        // Redirect to profile setup
        router.push("/onboarding/profile")
      } else {
        const error = await response.json()
        alert(error.message || "Failed to select role")
      }
    } catch (error) {
      console.error("Error selecting role:", error)
      alert("Failed to select role")
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#A7EF9E] border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-[#A7EF9E]/10 p-4">
              <Shield className="h-12 w-12 text-[#A7EF9E]" />
            </div>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-foreground">
            Choose Your Role
          </h1>
          <p className="text-lg text-muted-foreground">
            Select how you want to participate in the bug bounty ecosystem
          </p>
        </div>

        {/* Role Cards */}
        <div className="mb-8 grid gap-6 md:grid-cols-2">
          {/* Hunter Role */}
          <button
            onClick={() => setSelectedRole("HUNTER")}
            className={`group relative overflow-hidden rounded-2xl border-2 p-8 text-left transition-all ${
              selectedRole === "HUNTER"
                ? "border-[#A7EF9E] bg-[#A7EF9E]/5 shadow-lg shadow-[#A7EF9E]/20"
                : "border-border bg-card hover:border-[#A7EF9E]/50 hover:bg-[#A7EF9E]/5"
            }`}
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-blue-500/10 p-3">
                  <Target className="h-8 w-8 text-blue-400" />
                </div>
                {selectedRole === "HUNTER" && (
                  <div className="rounded-full bg-[#A7EF9E] p-1">
                    <svg className="h-5 w-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <h3 className="mb-2 text-2xl font-bold text-foreground">Bug Hunter</h3>
              <p className="mb-6 text-muted-foreground">
                Find vulnerabilities, submit reports, and earn rewards for your discoveries
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Zap className="mt-1 h-5 w-5 flex-shrink-0 text-[#A7EF9E]" />
                  <div>
                    <p className="font-medium text-foreground">Hunt for Bugs</p>
                    <p className="text-sm text-muted-foreground">Search for vulnerabilities in various programs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="mt-1 h-5 w-5 flex-shrink-0 text-[#A7EF9E]" />
                  <div>
                    <p className="font-medium text-foreground">Earn Rewards</p>
                    <p className="text-sm text-muted-foreground">Get paid for valid vulnerability reports</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-1 h-5 w-5 flex-shrink-0 text-[#A7EF9E]" />
                  <div>
                    <p className="font-medium text-foreground">Build Reputation</p>
                    <p className="text-sm text-muted-foreground">Grow your profile in the security community</p>
                  </div>
                </div>
              </div>
            </div>
          </button>

          {/* Organization Role */}
          <button
            onClick={() => setSelectedRole("ORG")}
            className={`group relative overflow-hidden rounded-2xl border-2 p-8 text-left transition-all ${
              selectedRole === "ORG"
                ? "border-[#A7EF9E] bg-[#A7EF9E]/5 shadow-lg shadow-[#A7EF9E]/20"
                : "border-border bg-card hover:border-[#A7EF9E]/50 hover:bg-[#A7EF9E]/5"
            }`}
          >
            <div className="relative z-10">
              <div className="mb-4 flex items-center justify-between">
                <div className="rounded-lg bg-purple-500/10 p-3">
                  <Building2 className="h-8 w-8 text-purple-400" />
                </div>
                {selectedRole === "ORG" && (
                  <div className="rounded-full bg-[#A7EF9E] p-1">
                    <svg className="h-5 w-5 text-black" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              
              <h3 className="mb-2 text-2xl font-bold text-foreground">Organization</h3>
              <p className="mb-6 text-muted-foreground">
                Create bug bounty programs and leverage the security community
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Shield className="mt-1 h-5 w-5 flex-shrink-0 text-[#A7EF9E]" />
                  <div>
                    <p className="font-medium text-foreground">Launch Programs</p>
                    <p className="text-sm text-muted-foreground">Create and manage bug bounty programs</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Users className="mt-1 h-5 w-5 flex-shrink-0 text-[#A7EF9E]" />
                  <div>
                    <p className="font-medium text-foreground">Access Talent</p>
                    <p className="text-sm text-muted-foreground">Connect with skilled security researchers</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Award className="mt-1 h-5 w-5 flex-shrink-0 text-[#A7EF9E]" />
                  <div>
                    <p className="font-medium text-foreground">Improve Security</p>
                    <p className="text-sm text-muted-foreground">Strengthen your product's security posture</p>
                  </div>
                </div>
              </div>
            </div>
          </button>
        </div>

        {/* Continue Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleRoleSelection}
            disabled={!selectedRole || loading}
            className="min-w-[200px] bg-[#A7EF9E] text-black hover:bg-[#A7EF9E]/90 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                <span>Processing...</span>
              </div>
            ) : (
              "Continue"
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
