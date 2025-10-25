"use client"

import { useSession } from "next-auth/react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { 
  User, Mail, Shield, Trophy, FileText, CheckCircle2, XCircle, Clock, 
  TrendingUp, Award, Target, DollarSign, Calendar, Edit, Bug, MapPin, Globe,
  Twitter, Github, Linkedin, MessageCircle, Send
} from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface UserProfile {
  id: string
  address: string
  email?: string
  name?: string
  role?: "HUNTER" | "ORG" | "ADMIN"
  bio?: string
  reputation: number
  onboardingStatus?: string
  avatar?: string
  location?: string
  website?: string
  twitter?: string
  github?: string
  linkedin?: string
  discord?: string
  telegram?: string
  badges?: any
  orgName?: string
  orgWebsite?: string
  createdAt: string
  updatedAt: string
}

interface Submission {
  id: string
  status: "PENDING" | "APPROVED" | "REJECTED"
  createdAt: string
  bounty: {
    id: string
    title: string
    reward: number
    status: string
  }
}

interface Bounty {
  id: string
  title: string
  reward: number
  status: string
  deadline: string
  submissions: { id: string }[]
  createdAt: string
}

export default function ProfilePage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login")
    } else if (status === "authenticated" && session?.user) {
      fetchProfileData()
    }
  }, [status, session, router])

  const fetchProfileData = async () => {
    try {
      // Fetch by wallet address if available, otherwise by ID
      const identifier = session?.user?.wallet || session?.user?.id
      const endpoint = session?.user?.wallet 
        ? `http://localhost:8000/api/users/wallet/${session.user.wallet}`
        : `http://localhost:8000/api/users/${session?.user?.id}`
      
      const userResponse = await fetch(endpoint)
      if (userResponse.ok) {
        const userData = await userResponse.json()
        setProfile(userData.user)
        
        // If wallet endpoint was used, we already have submissions
        if (userData.submissions) {
          setSubmissions(userData.submissions)
        }
      }

      // Fetch additional data for ORG users
      if (session?.user?.role === "ORG") {
        const bountiesResponse = await fetch(`http://localhost:8001/bounties?orgId=${session?.user?.id}`)
        if (bountiesResponse.ok) {
          const bountiesData = await bountiesResponse.json()
          setBounties(bountiesData.bounties || [])
        }
      }
    } catch (error) {
      console.error("Error fetching profile data:", error)
    } finally {
      setLoading(false)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#A7EF9E] border-t-transparent" />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Profile Not Found</h2>
          <p className="text-muted-foreground">Unable to load profile data</p>
        </div>
      </div>
    )
  }

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "HUNTER": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "ORG": return "bg-purple-500/10 text-purple-400 border-purple-500/20"
      case "ADMIN": return "bg-red-500/10 text-red-400 border-red-500/20"
      default: return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "REJECTED": return "bg-red-500/10 text-red-400 border-red-500/20"
      case "PENDING": return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      case "OPEN": return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "CLOSED": return "bg-muted text-muted-foreground border-border"
      default: return "bg-muted text-muted-foreground border-border"
    }
  }

  const hunterStats = profile.role === "HUNTER" ? {
    totalSubmissions: submissions.length,
    approved: submissions.filter(s => s.status === "APPROVED").length,
    pending: submissions.filter(s => s.status === "PENDING").length,
    rejected: submissions.filter(s => s.status === "REJECTED").length,
    totalEarnings: submissions.filter(s => s.status === "APPROVED").reduce((sum, s) => sum + s.bounty.reward, 0)
  } : null

  const orgStats = profile.role === "ORG" ? {
    totalBounties: bounties.length,
    activeBounties: bounties.filter(b => b.status === "OPEN").length,
    totalSubmissions: bounties.reduce((sum, b) => sum + b.submissions.length, 0),
    totalRewards: bounties.reduce((sum, b) => sum + b.reward, 0)
  } : null

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Profile Header */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              <div className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-[#A7EF9E]/30 bg-[#A7EF9E]/10 text-3xl font-bold text-[#A7EF9E]">
                {profile.name?.charAt(0).toUpperCase() || profile.address.slice(0, 2).toUpperCase()}
              </div>
              <div className="flex-1">
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-foreground">
                    {profile.name || "Anonymous User"}
                  </h1>
                  {profile.role && (
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getRoleBadgeColor(profile.role)}`}>
                      <Shield className="h-3 w-3" />
                      {profile.role}
                    </span>
                  )}
                </div>
                <div className="space-y-1 text-sm text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4" />
                    <span className="font-mono">{profile.address.slice(0, 6)}...{profile.address.slice(-4)}</span>
                  </div>
                  {profile.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      <span>{profile.email}</span>
                    </div>
                  )}
                  {profile.role === "HUNTER" && (
                    <div className="flex items-center gap-2">
                      <Trophy className="h-4 w-4" />
                      <span>Reputation: {profile.reputation}</span>
                    </div>
                  )}
                </div>
                {profile.bio && <p className="mt-3 text-sm text-muted-foreground">{profile.bio}</p>}
              </div>
            </div>
            <Button variant="outline" className="border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground">
              <Edit className="mr-2 h-4 w-4" />
              Edit Profile
            </Button>
          </div>
        </div>

        {/* HUNTER View */}
        {profile.role === "HUNTER" && hunterStats && (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{hunterStats.totalSubmissions}</p>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <FileText className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Approved</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{hunterStats.approved}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-3">
                    <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Pending</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{hunterStats.pending}</p>
                  </div>
                  <div className="rounded-lg bg-amber-500/10 p-3">
                    <Clock className="h-5 w-5 text-amber-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Earnings</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">${hunterStats.totalEarnings.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-[#A7EF9E]/10 p-3">
                    <DollarSign className="h-5 w-5 text-[#A7EF9E]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">My Submissions</h2>
                <span className="text-sm text-muted-foreground">{submissions.length} total</span>
              </div>
              {submissions.length === 0 ? (
                <div className="py-12 text-center">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No submissions yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Start hunting for vulnerabilities</p>
                  <Link href="/timeline">
                    <Button className="bg-[#A7EF9E]/10 border border-[#A7EF9E]/20 text-[#A7EF9E] hover:bg-[#A7EF9E]/20">
                      <Target className="mr-2 h-4 w-4" />Browse Bounties
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <Link key={submission.id} href={`/bounties/${submission.bounty.id}`} className="block">
                      <div className="rounded-lg border border-border bg-muted p-4 transition-all hover:border-[#A7EF9E]/30 hover:bg-accent/20">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-foreground mb-1">{submission.bounty.title}</h3>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />{new Date(submission.createdAt).toLocaleDateString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />${submission.bounty.reward.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(submission.status)}`}>
                            {submission.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                            {submission.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                            {submission.status === "PENDING" && <Clock className="h-3 w-3" />}
                            {submission.status}
                          </span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* ORG View */}
        {profile.role === "ORG" && orgStats && (
          <>
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Bounties</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{orgStats.totalBounties}</p>
                  </div>
                  <div className="rounded-lg bg-purple-500/10 p-3">
                    <Bug className="h-5 w-5 text-purple-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Active Programs</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{orgStats.activeBounties}</p>
                  </div>
                  <div className="rounded-lg bg-blue-500/10 p-3">
                    <TrendingUp className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Submissions</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">{orgStats.totalSubmissions}</p>
                  </div>
                  <div className="rounded-lg bg-emerald-500/10 p-3">
                    <FileText className="h-5 w-5 text-emerald-400" />
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Rewards</p>
                    <p className="mt-1 text-2xl font-bold text-foreground">${orgStats.totalRewards.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-[#A7EF9E]/10 p-3">
                    <Award className="h-5 w-5 text-[#A7EF9E]" />
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-border bg-card p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold text-foreground">My Bounty Programs</h2>
                <Link href="/bounties/create_bounties">
                  <Button className="bg-[#A7EF9E]/10 border border-[#A7EF9E]/20 text-[#A7EF9E] hover:bg-[#A7EF9E]/20">
                    Create New Bounty
                  </Button>
                </Link>
              </div>
              {bounties.length === 0 ? (
                <div className="py-12 text-center">
                  <Bug className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
                  <h3 className="text-lg font-medium text-foreground mb-2">No bounties yet</h3>
                  <p className="text-sm text-muted-foreground mb-4">Create your first bug bounty program</p>
                  <Link href="/bounties/create_bounties">
                    <Button className="bg-[#A7EF9E]/10 border border-[#A7EF9E]/20 text-[#A7EF9E] hover:bg-[#A7EF9E]/20">
                      Create Bounty
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {bounties.map((bounty) => (
                    <Link key={bounty.id} href={`/bounties/${bounty.id}`} className="block">
                      <div className="rounded-lg border border-border bg-muted p-4 transition-all hover:border-[#A7EF9E]/30 hover:bg-accent/20">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-foreground">{bounty.title}</h3>
                              <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-xs font-medium ${getStatusColor(bounty.status)}`}>
                                {bounty.status}
                              </span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />${bounty.reward.toLocaleString()}
                              </span>
                              <span className="flex items-center gap-1">
                                <FileText className="h-3 w-3" />{bounty.submissions.length} submissions
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />Deadline: {new Date(bounty.deadline).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Social Links & Additional Info */}
        {(profile.location || profile.website || profile.twitter || profile.github || profile.linkedin || profile.discord || profile.telegram || profile.orgName) && (
          <div className="mt-8 rounded-xl border border-border bg-card p-6">
            <h2 className="mb-4 text-xl font-semibold text-foreground">Additional Information</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {profile.location && (
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{profile.location}</span>
                </div>
              )}
              {profile.website && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={profile.website} target="_blank" rel="noopener noreferrer" className="text-[#A7EF9E] hover:underline">
                    {profile.website}
                  </a>
                </div>
              )}
              {profile.twitter && (
                <div className="flex items-center gap-2 text-sm">
                  <Twitter className="h-4 w-4 text-muted-foreground" />
                  <a href={`https://twitter.com/${profile.twitter.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-[#A7EF9E]">
                    {profile.twitter}
                  </a>
                </div>
              )}
              {profile.github && (
                <div className="flex items-center gap-2 text-sm">
                  <Github className="h-4 w-4 text-muted-foreground" />
                  <a href={`https://github.com/${profile.github}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-[#A7EF9E]">
                    {profile.github}
                  </a>
                </div>
              )}
              {profile.linkedin && (
                <div className="flex items-center gap-2 text-sm">
                  <Linkedin className="h-4 w-4 text-muted-foreground" />
                  <a href={`https://linkedin.com/in/${profile.linkedin}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-[#A7EF9E]">
                    {profile.linkedin}
                  </a>
                </div>
              )}
              {profile.discord && (
                <div className="flex items-center gap-2 text-sm">
                  <MessageCircle className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground">{profile.discord}</span>
                </div>
              )}
              {profile.telegram && (
                <div className="flex items-center gap-2 text-sm">
                  <Send className="h-4 w-4 text-muted-foreground" />
                  <a href={`https://t.me/${profile.telegram.replace('@', '')}`} target="_blank" rel="noopener noreferrer" className="text-foreground hover:text-[#A7EF9E]">
                    {profile.telegram}
                  </a>
                </div>
              )}
              {profile.orgName && (
                <div className="flex items-center gap-2 text-sm">
                  <Award className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">{profile.orgName}</span>
                </div>
              )}
              {profile.orgWebsite && (
                <div className="flex items-center gap-2 text-sm">
                  <Globe className="h-4 w-4 text-muted-foreground" />
                  <a href={profile.orgWebsite} target="_blank" rel="noopener noreferrer" className="text-[#A7EF9E] hover:underline">
                    {profile.orgWebsite}
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Account Details */}
        <div className="mt-8 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-xl font-semibold text-foreground">Account Details</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm text-muted-foreground">Member Since</p>
              <p className="mt-1 font-medium text-foreground">
                {new Date(profile.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Last Updated</p>
              <p className="mt-1 font-medium text-foreground">
                {new Date(profile.updatedAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Wallet Address</p>
              <p className="mt-1 font-mono text-sm font-medium text-foreground break-all">{profile.address}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">User ID</p>
              <p className="mt-1 font-mono text-sm font-medium text-foreground break-all">{profile.id}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
