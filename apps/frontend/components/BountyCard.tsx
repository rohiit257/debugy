"use client"

import { BadgeDollarSign, ChevronRight, Tag, Star, Clock, Users, Shield, Activity, CheckCircle, Wallet } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import HackerFundingDialog from "./HackerFundingDialog"
import { useHackerStatus } from "@/hooks/useContracts"
import { useAccount } from "wagmi"

export type Bounty = {
  id: string
  title: string
  company: string
  description?: string
  requirements?: string[]
  rewardUsd: number
  tags?: string[]
  status?: "ongoing" | "new" | "closed"
  postedAt?: string
  applicants?: number
  endsInDays?: number
  difficulty?: "easy" | "medium" | "hard"
  rating?: number
  companyLogo?: string
  programType?: "public" | "private"
  verified?: boolean
  responseTimeHours?: number
  lastActivity?: string
  rewardRangeUsd?: [number, number]
}

function HackerFundingButton({ bountyId, bountyTitle }: { bountyId: string, bountyTitle: string }) {
  const { address } = useAccount()
  const { isApproved } = useHackerStatus(address)

  if (!address || !isApproved) {
    return null
  }

  return (
    <HackerFundingDialog 
      bountyId={bountyId} 
      bountyTitle={bountyTitle}
      trigger={
        <div className="inline-flex items-center gap-1 rounded-lg border border-blue-500/20 bg-blue-500/10 px-2 py-1 text-xs font-medium text-blue-400 transition-all hover:bg-blue-500/20">
          <Wallet className="h-3 w-3" />
          Fund
        </div>
      }
    />
  )
}

export default function BountyCard({ bounty }: { bounty: Bounty }) {
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(bounty.rewardUsd)

  const getStatusColor = (status?: string) => {
    switch (status) {
      case "ongoing":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "new":
        return "bg-[#A7EF9E]/10 text-[#A7EF9E] border-[#A7EF9E]/20"
      default:
        return "bg-white/5 text-white/50 border-white/10"
    }
  }

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-200 hover:border-[#A7EF9E]/30 hover:bg-accent/20">
        <div className="p-5">
        <div className="mb-4 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <div className="mb-2 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#A7EF9E]/10 border border-[#A7EF9E]/20 text-sm font-bold text-[#A7EF9E]">
                {bounty.company.charAt(0)}
              </div>
              <div className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground">
                <span>{bounty.company}</span>
                {bounty.verified && <CheckCircle className="h-3.5 w-3.5 text-[#A7EF9E]" />}
              </div>
            </div>
            <h3 className="text-[15px] font-semibold leading-tight text-foreground transition-colors group-hover:text-[#A7EF9E]">
              {bounty.title}
            </h3>
          </div>

          <div className="flex shrink-0 items-center gap-1.5 rounded-lg bg-[#A7EF9E]/10 border border-[#A7EF9E]/20 px-3 py-1.5 text-sm font-semibold text-[#A7EF9E]">
            <BadgeDollarSign className="h-4 w-4" />
            <span>
              {Array.isArray(bounty.rewardRangeUsd) && bounty.rewardRangeUsd.length === 2
                ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                    bounty.rewardRangeUsd[0],
                  ) +
                  " – " +
                  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(bounty.rewardRangeUsd[1])
                : formatted}
            </span>
          </div>
        </div>

        {bounty.description ? (
          <p className="mb-4 line-clamp-2 text-sm text-muted-foreground">
            {bounty.description}
          </p>
        ) : null}

        <div className="mb-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-4">
          {bounty.programType && (
            <span className="inline-flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5" />
              {bounty.programType === "public" ? "Public program" : "Private program"}
            </span>
          )}
          {typeof bounty.responseTimeHours === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {Math.round(bounty.responseTimeHours)}h response
            </span>
          )}
          {bounty.lastActivity && (
            <span className="inline-flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" />
              {bounty.lastActivity}
            </span>
          )}
          {typeof bounty.rating === "number" && (
            <span className="inline-flex items-center gap-1.5">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              {Math.round(bounty.rating * 10) / 10}
            </span>
          )}
        </div>

        {bounty.tags?.length ? (
          <div className="mb-4 flex flex-wrap gap-2">
            {bounty.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground"
              >
                <Tag className="h-2.5 w-2.5" />
                {tag}
              </span>
            ))}
            {bounty.tags.length > 4 && <span className="text-xs text-muted-foreground/60">+{bounty.tags.length - 4}</span>}
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {typeof bounty.endsInDays === "number" ? (
                <span>Ends in {bounty.endsInDays}d</span>
              ) : (
                <span>{bounty.postedAt ?? "Recently"}</span>
              )}
            </span>
            {typeof bounty.applicants === "number" && (
              <span className="inline-flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {bounty.applicants}
              </span>
            )}
            {bounty.difficulty && (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize",
                  bounty.difficulty === "easy" && "border-emerald-500/20 bg-emerald-500/10 text-emerald-400",
                  bounty.difficulty === "medium" && "border-amber-500/20 bg-amber-500/10 text-amber-400",
                  bounty.difficulty === "hard" && "border-rose-500/20 bg-rose-500/10 text-rose-400",
                )}
              >
                {bounty.difficulty}
              </span>
            )}
            {bounty.status && (
              <span className={cn("rounded-full border px-2 py-0.5 text-[10px] font-medium capitalize", getStatusColor(bounty.status))}>
                {bounty.status}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <HackerFundingButton bountyId={bounty.id} bountyTitle={bounty.title} />
            <Link href={`/bounties/${bounty.id}`}>
              <div className="group/btn inline-flex items-center gap-1 rounded-lg border border-border bg-muted px-3 py-1.5 text-sm font-medium text-muted-foreground transition-all hover:border-[#A7EF9E]/30 hover:bg-[#A7EF9E]/10 hover:text-[#A7EF9E] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A7EF9E]/50">
                View Program
                <ChevronRight className="h-3.5 w-3.5 transition-transform group-hover/btn:translate-x-0.5" />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
