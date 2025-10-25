"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { User, Mail, MapPin, Globe, Twitter, Github, Linkedin, MessageCircle, Send, Building2, Award } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function ProfileSetupPage() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    bio: "",
    location: "",
    website: "",
    twitter: "",
    github: "",
    linkedin: "",
    discord: "",
    telegram: "",
    orgName: "",
    orgWebsite: "",
  })

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user) {
      // If user hasn't selected a role, redirect to role selection
      if (!session.user.role || session.user.onboardingStatus === "PENDING") {
        router.push("/onboarding/role")
      }
      // If already completed onboarding, redirect to timeline
      if (session.user.onboardingStatus === "COMPLETED") {
        router.push("/timeline")
      }
    }
  }, [status, session, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!session?.user?.wallet) return

    setLoading(true)
    try {
      const response = await fetch("http://localhost:8000/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: session.user.wallet,
          ...formData,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        // Update session with new profile data
        await update({
          ...session.user,
          ...data.user,
        })

        // Redirect to timeline
        router.push("/timeline")
      } else {
        const error = await response.json()
        alert(error.message || "Failed to complete profile")
      }
    } catch (error) {
      console.error("Error completing profile:", error)
      alert("Failed to complete profile")
    } finally {
      setLoading(false)
    }
  }

  const handleSkip = async () => {
    if (!session?.user?.wallet) return

    setLoading(true)
    try {
      const response = await fetch("http://localhost:8000/api/auth/complete-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          address: session.user.wallet,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        
        await update({
          ...session.user,
          onboardingStatus: data.user.onboardingStatus,
        })

        router.push("/timeline")
      }
    } catch (error) {
      console.error("Error skipping profile:", error)
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

  const isOrg = session?.user?.role === "ORG"

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mb-4 flex justify-center">
            <div className="rounded-full bg-[#A7EF9E]/10 p-4">
              <User className="h-12 w-12 text-[#A7EF9E]" />
            </div>
          </div>
          <h1 className="mb-3 text-4xl font-bold text-foreground">
            Complete Your Profile
          </h1>
          <p className="text-lg text-muted-foreground">
            Tell us more about yourself to get started
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Basic Information</h2>
            <div className="space-y-4">
              <div>
                <label htmlFor="name" className="mb-2 block text-sm font-medium text-foreground">
                  {isOrg ? "Contact Name" : "Display Name"} *
                </label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder={isOrg ? "John Doe" : "Your name"}
                  className="bg-background"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-medium text-foreground">
                  Email Address *
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your@email.com"
                  className="bg-background"
                />
              </div>

              <div>
                <label htmlFor="bio" className="mb-2 block text-sm font-medium text-foreground">
                  Bio
                </label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder={isOrg ? "Tell us about your organization..." : "Tell us about yourself..."}
                  rows={3}
                  className="bg-background"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="location" className="mb-2 block text-sm font-medium text-foreground">
                    Location
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="location"
                      name="location"
                      type="text"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="City, Country"
                      className="bg-background pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="website" className="mb-2 block text-sm font-medium text-foreground">
                    Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="website"
                      name="website"
                      type="url"
                      value={formData.website}
                      onChange={handleInputChange}
                      placeholder="https://yourwebsite.com"
                      className="bg-background pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Organization Details (only for ORG role) */}
          {isOrg && (
            <div className="rounded-xl border border-border bg-card p-6">
              <h2 className="mb-4 text-xl font-semibold text-foreground">Organization Details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="orgName" className="mb-2 block text-sm font-medium text-foreground">
                    Organization Name *
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="orgName"
                      name="orgName"
                      type="text"
                      required={isOrg}
                      value={formData.orgName}
                      onChange={handleInputChange}
                      placeholder="Your Company Name"
                      className="bg-background pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="orgWebsite" className="mb-2 block text-sm font-medium text-foreground">
                    Organization Website
                  </label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="orgWebsite"
                      name="orgWebsite"
                      type="url"
                      value={formData.orgWebsite}
                      onChange={handleInputChange}
                      placeholder="https://company.com"
                      className="bg-background pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Social Links */}
          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Social Links</h2>
            <div className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="twitter" className="mb-2 block text-sm font-medium text-foreground">
                    Twitter
                  </label>
                  <div className="relative">
                    <Twitter className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="twitter"
                      name="twitter"
                      type="text"
                      value={formData.twitter}
                      onChange={handleInputChange}
                      placeholder="@username"
                      className="bg-background pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="github" className="mb-2 block text-sm font-medium text-foreground">
                    GitHub
                  </label>
                  <div className="relative">
                    <Github className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="github"
                      name="github"
                      type="text"
                      value={formData.github}
                      onChange={handleInputChange}
                      placeholder="username"
                      className="bg-background pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="linkedin" className="mb-2 block text-sm font-medium text-foreground">
                    LinkedIn
                  </label>
                  <div className="relative">
                    <Linkedin className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="linkedin"
                      name="linkedin"
                      type="text"
                      value={formData.linkedin}
                      onChange={handleInputChange}
                      placeholder="username"
                      className="bg-background pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="discord" className="mb-2 block text-sm font-medium text-foreground">
                    Discord
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="discord"
                      name="discord"
                      type="text"
                      value={formData.discord}
                      onChange={handleInputChange}
                      placeholder="username#0000"
                      className="bg-background pl-10"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="telegram" className="mb-2 block text-sm font-medium text-foreground">
                    Telegram
                  </label>
                  <div className="relative">
                    <Send className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="telegram"
                      name="telegram"
                      type="text"
                      value={formData.telegram}
                      onChange={handleInputChange}
                      placeholder="@username"
                      className="bg-background pl-10"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleSkip}
              disabled={loading}
              className="border-border text-muted-foreground hover:bg-accent"
            >
              Skip for now
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-[#A7EF9E] text-black hover:bg-[#A7EF9E]/90"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
                  <span>Completing...</span>
                </div>
              ) : (
                "Complete Profile"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
