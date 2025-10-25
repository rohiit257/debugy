"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContracts, useHackerStatus } from "@/hooks/useContracts"
import { Wallet, Loader2, CheckCircle, AlertCircle, Info } from "lucide-react"
import { useAccount } from "wagmi"
import TransactionHash from "./TransactionHash"

interface HackerFundingDialogProps {
  bountyId: string
  bountyTitle: string
  trigger?: React.ReactNode
}

export default function HackerFundingDialog({ bountyId, bountyTitle, trigger }: HackerFundingDialogProps) {
  const [open, setOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const { address } = useAccount()
  const { isApproved, availableFunds } = useHackerStatus(address)
  const { fundBountyAsHacker, hash, isPending, isConfirming, isConfirmed, error } = useContracts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!amount || !bountyId) {
      return
    }

    try {
      await fundBountyAsHacker(parseInt(bountyId), amount)
    } catch (err) {
      console.error("Error funding bounty:", err)
    }
  }

  const handleClose = () => {
    if (!isPending && !isConfirming) {
      setOpen(false)
      setAmount("")
    }
  }

  const maxAmount = parseFloat(availableFunds)
  const requestedAmount = parseFloat(amount || "0")

  if (!isApproved) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="outline" disabled>
              <Wallet className="h-4 w-4 mr-2" />
              Fund Bounty
            </Button>
          )}
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-amber-500" />
              Not Approved for Funding
            </DialogTitle>
          </DialogHeader>
          <div className="text-center py-6">
            <p className="text-sm text-muted-foreground mb-4">
              You are not approved to fund bounties. Please contact an administrator to get approval.
            </p>
            <Button onClick={handleClose} className="w-full">
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20">
            <Wallet className="h-4 w-4 mr-2" />
            Fund Bounty
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wallet className="h-5 w-5 text-blue-400" />
            Fund Bounty as Approved Hacker
          </DialogTitle>
        </DialogHeader>
        
        {isConfirmed ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-[#A7EF9E] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Funding Successful!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              You have successfully funded the bounty "{bountyTitle}".
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="p-3 rounded-lg bg-blue-500/10 border border-blue-500/20">
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <Info className="h-4 w-4" />
                <span className="text-sm font-medium">Available Funds</span>
              </div>
              <p className="text-sm text-muted-foreground">
                You have <span className="font-semibold text-blue-400">{availableFunds} ETH</span> available for funding bounties.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bountyTitle">Bounty</Label>
              <Input
                id="bountyTitle"
                value={bountyTitle}
                disabled
                className="bg-muted"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount (ETH)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="1.0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                disabled={isPending || isConfirming}
                max={maxAmount}
              />
              {requestedAmount > maxAmount && (
                <p className="text-sm text-red-400">
                  Amount exceeds available funds ({availableFunds} ETH)
                </p>
              )}
            </div>

            {hash && (isPending || isConfirming) && (
              <TransactionHash 
                hash={hash} 
                variant="blue" 
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
                disabled={!amount || requestedAmount > maxAmount || isPending || isConfirming}
                className="flex-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500/20"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isPending ? "Confirming..." : "Processing..."}
                  </>
                ) : (
                  "Fund Bounty"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
