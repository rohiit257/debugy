"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react"

interface SubmitReportDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bountyId: string
  bountyTitle: string
  onSuccess?: () => void
}

export default function SubmitReportDialog({
  open,
  onOpenChange,
  bountyId,
  bountyTitle,
  onSuccess,
}: SubmitReportDialogProps) {
  const { data: session } = useSession()
  const [details, setDetails] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!details.trim()) {
      setError("Please provide vulnerability details")
      return
    }

    if (!session?.user?.id) {
      setError("You must be logged in to submit a report")
      return
    }

    setLoading(true)
    setError("")

    try {
      const response = await fetch("http://localhost:8001/submissions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          bountyId,
          hunterId: session.user.id,
          details: details.trim(),
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to submit report")
      }

      setSuccess(true)
      setDetails("")
      
      // Call success callback after a short delay
      setTimeout(() => {
        setSuccess(false)
        onOpenChange(false)
        onSuccess?.()
      }, 2000)
    } catch (err: any) {
      console.error("Error submitting report:", err)
      setError(err.message || "Failed to submit report. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    if (!loading) {
      setDetails("")
      setError("")
      setSuccess(false)
      onOpenChange(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="bg-popover border-border text-popover-foreground sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-popover-foreground">Submit Vulnerability Report</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Submit your findings for <span className="text-[#A7EF9E] font-medium">{bountyTitle}</span>
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="rounded-full bg-[#A7EF9E]/10 p-3 mb-4">
              <CheckCircle2 className="h-12 w-12 text-[#A7EF9E]" />
            </div>
            <h3 className="text-lg font-semibold text-popover-foreground mb-2">Report Submitted Successfully!</h3>
            <p className="text-sm text-muted-foreground text-center">
              Your vulnerability report has been submitted and is now under review.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="details" className="text-popover-foreground">
                  Vulnerability Details *
                </Label>
                <Textarea
                  id="details"
                  placeholder="Describe the vulnerability, steps to reproduce, impact, and any proof of concept..."
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  className="min-h-[200px] bg-input border-border text-popover-foreground placeholder:text-muted-foreground focus:border-[#A7EF9E]/50 focus:ring-[#A7EF9E]/20"
                  disabled={loading}
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Include: vulnerability type, affected components, reproduction steps, impact assessment, and any supporting evidence.
                </p>
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-400">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={loading}
                className="border-border bg-muted text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={loading || !details.trim()}
                className="bg-[#A7EF9E]/10 border border-[#A7EF9E]/20 text-[#A7EF9E] hover:bg-[#A7EF9E]/20 hover:border-[#A7EF9E]/30"
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting...
                  </>
                ) : (
                  "Submit Report"
                )}
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
