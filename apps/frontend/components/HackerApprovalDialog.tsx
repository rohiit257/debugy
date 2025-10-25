"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useContracts } from "@/hooks/useContracts"
import { Shield, Loader2, CheckCircle, AlertCircle } from "lucide-react"
import { useAccount } from "wagmi"
import TransactionHash from "./TransactionHash"

interface HackerApprovalDialogProps {
  trigger?: React.ReactNode
}

export default function HackerApprovalDialog({ trigger }: HackerApprovalDialogProps) {
  const [open, setOpen] = useState(false)
  const [hackerAddress, setHackerAddress] = useState("")
  const [fundLimit, setFundLimit] = useState("")
  const { address } = useAccount()
  const { approveHacker, hash, isPending, isConfirming, isConfirmed, error } = useContracts()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hackerAddress || !fundLimit) {
      return
    }

    try {
      await approveHacker(hackerAddress, fundLimit)
    } catch (err) {
      console.error("Error approving hacker:", err)
    }
  }

  const handleClose = () => {
    if (!isPending && !isConfirming) {
      setOpen(false)
      setHackerAddress("")
      setFundLimit("")
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-[#A7EF9E]/10 text-[#A7EF9E] border border-[#A7EF9E]/20 hover:bg-[#A7EF9E]/20">
            <Shield className="h-4 w-4 mr-2" />
            Approve Hacker
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-[#A7EF9E]" />
            Approve Hacker for Funding
          </DialogTitle>
        </DialogHeader>
        
        {isConfirmed ? (
          <div className="text-center py-6">
            <CheckCircle className="h-12 w-12 text-[#A7EF9E] mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">Hacker Approved!</h3>
            <p className="text-sm text-muted-foreground mb-4">
              The hacker has been successfully approved for funding.
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
            <div className="space-y-2">
              <Label htmlFor="hackerAddress">Hacker Address</Label>
              <Input
                id="hackerAddress"
                placeholder="0x..."
                value={hackerAddress}
                onChange={(e) => setHackerAddress(e.target.value)}
                disabled={isPending || isConfirming}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="fundLimit">Fund Limit (ETH)</Label>
              <Input
                id="fundLimit"
                type="number"
                step="0.01"
                placeholder="10.0"
                value={fundLimit}
                onChange={(e) => setFundLimit(e.target.value)}
                disabled={isPending || isConfirming}
              />
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
                disabled={!hackerAddress || !fundLimit || isPending || isConfirming}
                className="flex-1 bg-[#A7EF9E]/10 text-[#A7EF9E] border border-[#A7EF9E]/20 hover:bg-[#A7EF9E]/20"
              >
                {isPending || isConfirming ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {isPending ? "Confirming..." : "Processing..."}
                  </>
                ) : (
                  "Approve Hacker"
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
