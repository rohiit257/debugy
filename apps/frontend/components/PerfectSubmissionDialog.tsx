"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useContracts } from "@/hooks/useContracts"
import { Award, Loader2, CheckCircle, AlertCircle, Upload } from "lucide-react"
import TransactionHash from "./TransactionHash"

interface PerfectSubmissionDialogProps {
  submissionId: string
  hunterAddress: string
  bountyTitle: string
  submissionDetails: string
  trigger?: React.ReactNode
}

export default function PerfectSubmissionDialog({ 
  submissionId, 
  hunterAddress, 
  bountyTitle, 
  submissionDetails,
  trigger 
}: PerfectSubmissionDialogProps) {
  const [open, setOpen] = useState(false)
  const [rewardAmount, setRewardAmount] = useState("")
  const [tokenName, setTokenName] = useState("")
  const [tokenDescription, setTokenDescription] = useState("")
  const [tokenImage, setTokenImage] = useState("")
  const { approvePerfectSubmission, hash, isPending, isConfirming, isConfirmed, error } = useContracts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!rewardAmount || !submissionId) {
      return
    }

    try {
      // Create token metadata
      const metadata = {
        name: tokenName || `Perfect Bug Bounty Submission #${submissionId}`,
        description: tokenDescription || `Perfect submission for bounty: ${bountyTitle}`,
        image: tokenImage || "",
        attributes: [
          {
            trait_type: "Bounty Title",
            value: bountyTitle
          },
          {
            trait_type: "Reward Amount",
            value: `${rewardAmount} ETH`
          },
          {
            trait_type: "Hunter",
            value: hunterAddress
          },
          {
            trait_type: "Submission Type",
            value: "Perfect"
          }
        ]
      }

      // For now, we'll create a simple data URI for the metadata
      // In production, you'd want to upload this to IPFS
      const tokenURI = `data:application/json,${encodeURIComponent(JSON.stringify(metadata))}`
      
      await approvePerfectSubmission(parseInt(submissionId), rewardAmount, tokenURI)
    } catch (err) {
      console.error("Error approving perfect submission:", err)
    }
  }

  const handleClose = () => {
    if (!isPending && !isConfirming) {
      setOpen(false)
      setRewardAmount("")
      setTokenName("")
      setTokenDescription("")
      setTokenImage("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-400 border border-yellow-500/20 hover:from-yellow-500/20 hover:to-orange-500/20">
            <Award className="h-4 w-4 mr-2" />
            Approve as Perfect
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="h-5 w-5 text-yellow-400" />
            Approve Perfect Submission & Mint NFT
          </DialogTitle>
        </DialogHeader>
        
        {isConfirmed ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-[#A7EF9E] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Perfect Submission Approved!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The submission has been approved as perfect and an NFT has been minted for the hunter.
            </p>
            
            {hash && (
              <TransactionHash 
                hash={hash} 
                variant="green" 
                status="confirmed" 
                className="mb-4" 
              />
            )}
            
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Submission Info */}
            <div className="p-4 rounded-lg bg-muted border">
              <h4 className="font-medium text-foreground mb-2">Submission Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Hunter:</span> {hunterAddress}</p>
                <p><span className="font-medium">Bounty:</span> {bountyTitle}</p>
                <p><span className="font-medium">Details:</span> {submissionDetails}</p>
              </div>
            </div>

            {/* Reward Amount */}
            <div className="space-y-2">
              <Label htmlFor="rewardAmount">Reward Amount (ETH) *</Label>
              <Input
                id="rewardAmount"
                type="number"
                step="0.01"
                placeholder="5.0"
                value={rewardAmount}
                onChange={(e) => setRewardAmount(e.target.value)}
                disabled={isPending || isConfirming}
                required
              />
            </div>

            {/* NFT Metadata */}
            <div className="space-y-4">
              <h4 className="font-medium text-foreground flex items-center gap-2">
                <Award className="h-4 w-4" />
                NFT Token Metadata
              </h4>
              
              <div className="space-y-2">
                <Label htmlFor="tokenName">Token Name</Label>
                <Input
                  id="tokenName"
                  placeholder={`Perfect Bug Bounty Submission #${submissionId}`}
                  value={tokenName}
                  onChange={(e) => setTokenName(e.target.value)}
                  disabled={isPending || isConfirming}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokenDescription">Token Description</Label>
                <Textarea
                  id="tokenDescription"
                  placeholder={`Perfect submission for bounty: ${bountyTitle}`}
                  value={tokenDescription}
                  onChange={(e) => setTokenDescription(e.target.value)}
                  disabled={isPending || isConfirming}
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tokenImage">Token Image URL (optional)</Label>
                <Input
                  id="tokenImage"
                  placeholder="https://example.com/image.png"
                  value={tokenImage}
                  onChange={(e) => setTokenImage(e.target.value)}
                  disabled={isPending || isConfirming}
                />
                <p className="text-xs text-muted-foreground">
                  Leave empty to use default image
                </p>
              </div>
            </div>

            {hash && (isPending || isConfirming) && (
              <TransactionHash 
                hash={hash} 
                variant="yellow" 
                status={isPending ? "pending" : "confirming"}
                label="Transaction Submitted"
              />
            )}

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400">
                <AlertCircle className="h-4 w-4" />
                <span className="text-sm">
                  {error.message || "Transaction failed"}
                </span>
              </div>
            )}

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleClose}
                disabled={isPending || isConfirming}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={!rewardAmount || isPending || isConfirming}
                className="flex-1 bg-gradient-to-r from-yellow-500/10 to-orange-500/10 text-yellow-400 border border-yellow-500/20 hover:from-yellow-500/20 hover:to-orange-500/20"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isPending ? "Confirming..." : "Minting NFT..."}
                  </>
                ) : (
                  <>
                    <Award className="h-4 w-4 mr-2" />
                    Approve & Mint NFT
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
