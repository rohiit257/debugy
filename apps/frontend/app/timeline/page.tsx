"use client"
import { useEffect, useState } from "react"
import BountyCard, { type Bounty } from "@/components/BountyCard"
import SearchFilters, { type Filters } from "@/components/SearchFilters"
import { StickyBanner } from "@/components/ui/sticky-banner"
import { StickyBannerComp } from "@/components/StickyBanner"

export default function Page() {
  const [mounted, setMounted] = useState(false)
  const [ongoing, setOngoing] = useState<Bounty[]>([])
  const [newOpps, setNewOpps] = useState<Bounty[]>([])
  const [topPaying, setTopPaying] = useState<Bounty[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 50)
    return () => clearTimeout(t)
  }, [])

  useEffect(() => {
    fetchBounties()
  }, [])

  const fetchBounties = async () => {
    try {
      const response = await fetch("http://localhost:8001/bounties")
      
      if (!response.ok) {
        throw new Error("Failed to fetch bounties")
      }

      const data = await response.json()
      
      // Transform API data to match Bounty interface
      const transformedBounties: Bounty[] = (data.bounties || []).map((b: any) => {
        const daysAgo = Math.floor((Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60 * 24))
        const hoursAgo = Math.floor((Date.now() - new Date(b.createdAt).getTime()) / (1000 * 60 * 60))
        
        let postedAt = "Recently"
        if (daysAgo === 0) {
          if (hoursAgo === 0) postedAt = "Just now"
          else if (hoursAgo < 24) postedAt = `${hoursAgo}h ago`
        } else if (daysAgo === 1) {
          postedAt = "Yesterday"
        } else if (daysAgo < 7) {
          postedAt = `${daysAgo}d ago`
        } else {
          const weeksAgo = Math.floor(daysAgo / 7)
          postedAt = `${weeksAgo}w ago`
        }

        return {
          id: b.id,
          title: b.title,
          company: "Bug Bounty Platform",
          description: b.description,
          rewardUsd: b.reward,
          tags: [b.category],
          status: b.status === "OPEN" ? "ongoing" : b.status === "CLOSED" ? "closed" : "new",
          postedAt,
          applicants: b.submissions?.length || 0,
          endsInDays: Math.ceil((new Date(b.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
          difficulty: "medium",
          rating: 4.5,
          verified: true,
          programType: "public",
          responseTimeHours: 24,
          lastActivity: new Date(b.updatedAt).toLocaleDateString(),
        }
      })

      // Filter bounties by status and creation time
      const now = Date.now()
      const oneDayAgo = now - (24 * 60 * 60 * 1000)

      // Ongoing: OPEN status bounties
      const ongoingBounties = transformedBounties.filter(b => b.status === "ongoing")
      setOngoing(ongoingBounties)

      // New: Bounties created in last 24 hours
      const newBounties = transformedBounties.filter(b => {
        const posted = b.postedAt || ""
        return posted.includes("h ago") || posted === "Just now" || posted === "Today"
      })
      setNewOpps(newBounties.slice(0, 6))

      // Top Paying: Sort by reward amount
      const topPayingBounties = [...transformedBounties]
        .sort((a, b) => b.rewardUsd - a.rewardUsd)
        .slice(0, 6)
      setTopPaying(topPayingBounties)

    } catch (error) {
      console.error("Error fetching bounties:", error)
      // Keep empty arrays on error
    } finally {
      setLoading(false)
    }
  }

  function handleSearch(filters: Filters) {
    // TODO: Implement search with filters
    console.log("search:", filters)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="relative overflow-hidden">
      <StickyBannerComp/>
        <div className="relative px-4 py-16 sm:px-6 lg:px-8">
        
          <div className="mx-auto max-w-5xl text-center">
            <h1 className="mb-4 bg-gradient-to-r from-foreground via-muted-foreground to-[#A7EF9E] bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl lg:text-6xl font-mono">
              Security Bounties
            </h1>
            <p className="mx-auto mb-10 max-w-3xl text-lg leading-relaxed text-muted-foreground font-mono">
              Discover high-impact security opportunities, connect with leading companies, and earn rewards for your
              expertise.
            </p>

            <div className="mx-auto max-w-3xl">
              <SearchFilters onSearch={handleSearch} variant="onDark" />
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#A7EF9E] border-t-transparent" />
          </div>
        ) : (
          <div className="space-y-16">
            <section>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Ongoing Bounties</h2>
                <p className="mt-2 text-muted-foreground">
                  Active security programs currently accepting submissions
                </p>
              </div>
              {ongoing.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <p className="text-muted-foreground">No ongoing bounties at the moment</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {ongoing.map((bounty, index) => (
                    <div
                      key={bounty.id}
                      className={`transform transition duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                      style={{ transitionDelay: `${index * 60}ms` }}
                    >
                      <BountyCard bounty={bounty} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">New Opportunities</h2>
                <p className="mt-2 text-muted-foreground">Fresh bounties posted in the last 24 hours</p>
              </div>
              {newOpps.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <p className="text-muted-foreground">No new bounties in the last 24 hours</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {newOpps.map((bounty, index) => (
                    <div
                      key={bounty.id}
                      className={`transform transition duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                      style={{ transitionDelay: `${index * 60}ms` }}
                    >
                      <BountyCard bounty={bounty} />
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-foreground">Top Paying Programs</h2>
                <p className="mt-2 text-muted-foreground">High-value bounties with substantial rewards</p>
              </div>
              {topPaying.length === 0 ? (
                <div className="rounded-xl border border-border bg-card p-12 text-center">
                  <p className="text-muted-foreground">No bounties available</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {topPaying.map((bounty, index) => (
                    <div
                      key={bounty.id}
                      className={`transform transition duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"}`}
                      style={{ transitionDelay: `${index * 60}ms` }}
                    >
                      <BountyCard bounty={bounty} />
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}
