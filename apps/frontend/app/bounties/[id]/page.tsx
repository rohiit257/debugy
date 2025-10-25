"use client"

import { useSession } from "next-auth/react"
import { useRouter, useParams } from "next/navigation"
import { useEffect, useState } from "react"
import { 
  ArrowLeft, 
  BadgeDollarSign, 
  Calendar, 
  Tag, 
  Clock, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  User,
  Shield,
  Send
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import SubmitReportDialog from "@/components/SubmitReportDialog"

interface Bounty {
  id: string
  title: string
  description: string
  category: string
  reward: number
  deadline: string
  status: string
  orgId: string | null
  createdAt: string
  updatedAt: string
  submissions: Submission[]
}

interface Submission {
  id: string
  bountyId: string
  hunterId: string
  details: string
  status: string
  createdAt: string
  updatedAt: string
  hunter: {
    id: string
    name: string | null
    address: string
    reputation: number
  }
}

export default function BountyDetailPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const params = useParams()
  const bountyId = params?.id as string

  const [bounty, setBounty] = useState<Bounty | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [closingBounty, setClosingBounty] = useState(false)
  const [showSubmitDialog, setShowSubmitDialog] = useState(false)
  const [updatingSubmission, setUpdatingSubmission] = useState<string | null>(null)

  const fetchBounty = async () => {
    try {
      const response = await fetch(`http://localhost:8001/bounties/${bountyId}`)
      
      if (!response.ok) {
        throw new Error("Failed to fetch bounty")
      }

      const data = await response.json()
      setBounty(data.bounty)
    } catch (err: any) {
      console.error("Error fetching bounty:", err)
      setError(err.message || "Failed to load bounty")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (bountyId) {
      fetchBounty()
    }
  }, [bountyId])

  const handleCloseBounty = async () => {
    if (!bounty || !session?.user?.id) return

    setClosingBounty(true)
    try {
      const newStatus = bounty.status === "OPEN" ? "CLOSED" : "OPEN"
      
      const response = await fetch(`http://localhost:8001/bounties/${bountyId}/close`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          orgId: session.user.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update bounty status")
      }

      // Refresh bounty data
      await fetchBounty()
    } catch (err: any) {
      console.error("Error updating bounty:", err)
      alert(err.message || "Failed to update bounty status")
    } finally {
      setClosingBounty(false)
    }
  }

  const handleUpdateSubmissionStatus = async (submissionId: string, newStatus: string) => {
    if (!session?.user?.id) return

    setUpdatingSubmission(submissionId)
    try {
      const response = await fetch(`http://localhost:8001/submissions/${submissionId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status: newStatus,
          orgId: session.user.id,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to update submission status")
      }

      // Refresh bounty data
      await fetchBounty()
    } catch (err: any) {
      console.error("Error updating submission:", err)
      alert(err.message || "Failed to update submission status")
    } finally {
      setUpdatingSubmission(null)
    }
  }

  if (status === "loading" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#A7EF9E] border-t-transparent" />
      </div>
    )
  }

  if (error || !bounty) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h2 className="text-xl font-semibold text-foreground mb-2">Error Loading Bounty</h2>
          <p className="text-muted-foreground mb-4">{error || "Bounty not found"}</p>
          <Link href="/bounties">
            <Button className="bg-[#A7EF9E]/10 border border-[#A7EF9E]/20 text-[#A7EF9E] hover:bg-[#A7EF9E]/20">
              Back to Bounties
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  const isOrg = session?.user?.role === "ORG"
  const isHunter = session?.user?.role === "HUNTER"
  const isOwner = isOrg && session?.user?.id === bounty.orgId
  const isBountyClosed = bounty.status === "CLOSED"
  const isDeadlinePassed = new Date(bounty.deadline) < new Date()

  const getStatusColor = (status: string) => {
    switch (status) {
      case "OPEN":
        return "bg-[#A7EF9E]/10 text-[#A7EF9E] border-[#A7EF9E]/20"
      case "CLOSED":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "IN_REVIEW":
        return "bg-blue-500/10 text-blue-400 border-blue-500/20"
      case "COMPLETED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      default:
        return "bg-white/5 text-white/50 border-white/10"
    }
  }

  const getSubmissionStatusColor = (status: string) => {
    switch (status) {
      case "APPROVED":
        return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
      case "REJECTED":
        return "bg-red-500/10 text-red-400 border-red-500/20"
      case "PENDING":
        return "bg-amber-500/10 text-amber-400 border-amber-500/20"
      default:
        return "bg-white/5 text-white/50 border-white/10"
    }
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link
          href="/bounties"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Bounties
        </Link>

        {/* Header */}
        <div className="mb-8 rounded-xl border border-border bg-card p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex-1">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getStatusColor(bounty.status)}`}>
                  {bounty.status}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70">
                  <Tag className="h-3 w-3" />
                  {bounty.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-foreground mb-2">{bounty.title}</h1>
              <p className="text-muted-foreground">{bounty.description}</p>
            </div>

            <div className="flex flex-col gap-3 sm:items-end">
              <div className="flex items-center gap-2 rounded-lg bg-[#A7EF9E]/10 border border-[#A7EF9E]/20 px-4 py-2">
                <BadgeDollarSign className="h-5 w-5 text-[#A7EF9E]" />
                <span className="text-xl font-bold text-[#A7EF9E]">
                  ${bounty.reward.toLocaleString()}
                </span>
              </div>

              {/* Close Bounty Toggle - Only for Owner */}
              {isOwner && (
                <div className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/5 px-4 py-2">
                  <Label htmlFor="close-bounty" className="text-sm text-muted-foreground cursor-pointer">
                    {bounty.status === "OPEN" ? "Close Bounty" : "Reopen Bounty"}
                  </Label>
                  <Switch
                    id="close-bounty"
                    checked={bounty.status === "CLOSED"}
                    onCheckedChange={handleCloseBounty}
                    disabled={closingBounty}
                    className="data-[state=checked]:bg-red-500"
                  />
                </div>
              )}

              {/* Submit Report Button - Only for Hunters */}
              {isHunter && !isBountyClosed && (
                <Button
                  onClick={() => setShowSubmitDialog(true)}
                  className="w-full sm:w-auto bg-[#A7EF9E]/10 border border-[#A7EF9E]/20 text-[#A7EF9E] hover:bg-[#A7EF9E]/20 hover:border-[#A7EF9E]/30"
                >
                  <Send className="mr-2 h-4 w-4" />
                  Submit Report
                </Button>
              )}
            </div>
          </div>

          {/* Bounty Details */}
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="flex items-center gap-3 text-sm">
              <div className="rounded-lg bg-muted p-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground">Deadline</p>
                <p className="font-medium text-foreground">
                  {new Date(bounty.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="rounded-lg bg-muted p-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground">Time Remaining</p>
                <p className="font-medium text-foreground">
                  {isDeadlinePassed 
                    ? "Expired" 
                    : `${Math.ceil((new Date(bounty.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24))} days`
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-sm">
              <div className="rounded-lg bg-muted p-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-muted-foreground">Submissions</p>
                <p className="font-medium text-foreground">{bounty.submissions.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Submissions Section */}
        <div className="rounded-xl border border-border bg-card p-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-foreground">Submissions</h2>
            <span className="text-sm text-muted-foreground">
              {bounty.submissions.length} {bounty.submissions.length === 1 ? "submission" : "submissions"}
            </span>
          </div>

          {bounty.submissions.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">No submissions yet</h3>
              <p className="text-sm text-muted-foreground">
                {isHunter 
                  ? "Be the first to submit a vulnerability report!" 
                  : "Waiting for hunters to submit their findings."
                }
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bounty.submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="rounded-lg border border-border bg-card p-5 transition-all hover:border-border/50"
                >
                  <div className="mb-4 flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="rounded-lg bg-[#A7EF9E]/10 p-2">
                        <User className="h-4 w-4 text-[#A7EF9E]" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground">
                          {submission.hunter.name || "Anonymous Hunter"}
                        </p>
                        <p className="text-xs text-muted-foreground/60">
                          {submission.hunter.address.slice(0, 6)}...{submission.hunter.address.slice(-4)}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Submitted {new Date(submission.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${getSubmissionStatusColor(submission.status)}`}>
                      {submission.status === "APPROVED" && <CheckCircle2 className="h-3 w-3" />}
                      {submission.status === "REJECTED" && <XCircle className="h-3 w-3" />}
                      {submission.status === "PENDING" && <AlertCircle className="h-3 w-3" />}
                      {submission.status}
                    </span>
                  </div>

                  {/* Show details only to owner or the hunter who submitted */}
                  {(isOwner || (isHunter && session?.user?.id === submission.hunterId)) && (
                    <>
                      <div className="mb-4 rounded-lg bg-muted p-4">
                        <p className="text-sm text-foreground whitespace-pre-wrap">{submission.details}</p>
                      </div>

                      {/* Action buttons for owner */}
                      {isOwner && submission.status === "PENDING" && (
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleUpdateSubmissionStatus(submission.id, "APPROVED")}
                            disabled={updatingSubmission === submission.id}
                            className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                          >
                            <CheckCircle2 className="mr-1 h-3 w-3" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleUpdateSubmissionStatus(submission.id, "REJECTED")}
                            disabled={updatingSubmission === submission.id}
                            className="bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                          >
                            <XCircle className="mr-1 h-3 w-3" />
                            Reject
                          </Button>
                        </div>
                      )}
                    </>
                  )}

                  {/* Limited view for non-owners and non-submitters */}
                  {!isOwner && (!isHunter || session?.user?.id !== submission.hunterId) && (
                    <div className="rounded-lg bg-muted p-4 text-center">
                      <Shield className="mx-auto h-6 w-6 text-muted-foreground/60 mb-2" />
                      <p className="text-xs text-muted-foreground">
                        Submission details are private
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Submit Report Dialog */}
      <SubmitReportDialog
        open={showSubmitDialog}
        onOpenChange={setShowSubmitDialog}
        bountyId={bounty.id}
        bountyTitle={bounty.title}
        onSuccess={fetchBounty}
      />
    </div>
  )
}
