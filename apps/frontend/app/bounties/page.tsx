"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import BountyCard, { Bounty } from "@/components/BountyCard"
import { TrendingUp, DollarSign, Bug, Users, Plus } from "lucide-react"
import Link from "next/link"

export default function BountiesPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [bounties, setBounties] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Redirect if not organizer
    if (status === "authenticated" && session?.user?.role !== "ORG") {
      router.push("/")
    }
  }, [session, status, router])

  useEffect(() => {
    // Fetch bounties for this organizer
    const fetchBounties = async () => {
      try {
        const orgId = session?.user?.id
        const url = orgId 
          ? `http://localhost:8001/bounties?orgId=${orgId}`
          : "http://localhost:8001/bounties"
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error("Failed to fetch bounties")
        }

        const data = await response.json()
        
        // Transform API data to match Bounty interface
        const transformedBounties: Bounty[] = (data.bounties || []).map((b: any) => ({
          id: b.id,
          title: b.title,
          company: "Bug Bounty Platform",
          description: b.description,
          rewardUsd: b.reward,
          tags: [b.category],
          status: b.status === "OPEN" ? "ongoing" : b.status === "CLOSED" ? "closed" : "new",
          postedAt: new Date(b.createdAt).toLocaleDateString(),
          applicants: b.submissions?.length || 0,
          endsInDays: Math.ceil((new Date(b.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          difficulty: "medium",
          rating: 4.5,
          verified: true,
          programType: "public",
          responseTimeHours: 24,
          lastActivity: new Date(b.updatedAt).toLocaleDateString(),
        }))

        setBounties(transformedBounties)
      } catch (error) {
        console.error("Error fetching bounties:", error)
        setBounties([])
      } finally {
        setLoading(false)
      }
    }

    if (status === "authenticated" && session?.user?.id) {
      fetchBounties()
    } else if (status === "authenticated") {
      setLoading(false)
    }
  }, [session, status])

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#A7EF9E] border-t-transparent" />
      </div>
    )
  }

  if (session?.user?.role !== "ORG") {
    return null
  }

  // Calculate analytics
  const totalBounties = bounties.length
  const activeBounties = bounties.filter((b) => b.status === "ongoing" || b.status === "new").length
  const totalRewards = bounties.reduce((sum, b) => sum + b.rewardUsd, 0)
  const totalApplicants = bounties.reduce((sum, b) => sum + (b.applicants || 0), 0)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Bounties</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage and track your bug bounty programs</p>
          </div>
          <Link
            href="/bounties/create_bounties"
            className="inline-flex items-center gap-2 rounded-lg border border-[#A7EF9E]/20 bg-[#A7EF9E]/10 px-4 py-2 text-sm font-medium text-[#A7EF9E] transition-all hover:bg-[#A7EF9E]/20 hover:border-[#A7EF9E]/30"
          >
            <Plus className="h-4 w-4" />
            Create Bounty
          </Link>
        </div>

        {/* Analytics Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Bounties</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{totalBounties}</p>
              </div>
              <div className="rounded-lg bg-[#A7EF9E]/10 p-3">
                <Bug className="h-5 w-5 text-[#A7EF9E]" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Programs</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{activeBounties}</p>
              </div>
              <div className="rounded-lg bg-blue-500/10 p-3">
                <TrendingUp className="h-5 w-5 text-blue-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Rewards</p>
                <p className="mt-1 text-2xl font-bold text-foreground">
                  ${totalRewards.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 p-3">
                <DollarSign className="h-5 w-5 text-emerald-400" />
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Applicants</p>
                <p className="mt-1 text-2xl font-bold text-foreground">{totalApplicants}</p>
              </div>
              <div className="rounded-lg bg-purple-500/10 p-3">
                <Users className="h-5 w-5 text-purple-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Bounties List */}
        <div>
          <h2 className="mb-4 text-xl font-semibold text-foreground">Your Programs</h2>
          {bounties.length === 0 ? (
            <div className="rounded-xl border border-border bg-card p-12 text-center">
              <Bug className="mx-auto h-12 w-12 text-muted-foreground/40" />
              <h3 className="mt-4 text-lg font-medium text-foreground">No bounties yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">Create your first bug bounty program to get started</p>
              <Link
                href="/bounties/create_bounties"
                className="mt-6 inline-flex items-center gap-2 rounded-lg border border-[#A7EF9E]/20 bg-[#A7EF9E]/10 px-4 py-2 text-sm font-medium text-[#A7EF9E] transition-all hover:bg-[#A7EF9E]/20"
              >
                <Plus className="h-4 w-4" />
                Create Bounty
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
              {bounties.map((bounty) => (
                <BountyCard key={bounty.id} bounty={bounty} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}