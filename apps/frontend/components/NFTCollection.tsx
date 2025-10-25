"use client"

import { useState, useEffect } from "react"
import { useUserNFTs } from "@/hooks/useContracts"
import { useAccount } from "wagmi"
import { Award, ExternalLink, Calendar, DollarSign } from "lucide-react"
import { Button } from "@/components/ui/button"

interface NFTMetadata {
  name: string
  description: string
  image?: string
  attributes?: Array<{
    trait_type: string
    value: string
  }>
}

interface NFTCardProps {
  tokenId: bigint
}

function NFTCard({ tokenId }: NFTCardProps) {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // In a real implementation, you'd fetch the token URI from the contract
    // and then fetch the metadata from IPFS or the data URI
    const fetchMetadata = async () => {
      try {
        // Mock metadata for demonstration
        const mockMetadata: NFTMetadata = {
          name: `Perfect Bug Bounty Submission #${tokenId}`,
          description: "Perfect submission for a critical security vulnerability",
          image: "https://via.placeholder.com/300x300/A7EF9E/000000?text=Perfect+Submission",
          attributes: [
            { trait_type: "Bounty Title", value: "Critical XSS Vulnerability" },
            { trait_type: "Reward Amount", value: "5.0 ETH" },
            { trait_type: "Submission Type", value: "Perfect" },
            { trait_type: "Hunter", value: "0x1234...5678" }
          ]
        }
        setMetadata(mockMetadata)
      } catch (error) {
        console.error("Error fetching NFT metadata:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMetadata()
  }, [tokenId])

  if (loading) {
    return (
      <div className="rounded-xl border border-border bg-card p-4">
        <div className="animate-pulse">
          <div className="aspect-square bg-muted rounded-lg mb-4"></div>
          <div className="h-4 bg-muted rounded mb-2"></div>
          <div className="h-3 bg-muted rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!metadata) {
    return (
      <div className="rounded-xl border border-border bg-card p-4 text-center">
        <p className="text-sm text-muted-foreground">Failed to load NFT metadata</p>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden hover:border-[#A7EF9E]/30 transition-colors">
      {/* NFT Image */}
      <div className="aspect-square bg-gradient-to-br from-[#A7EF9E]/20 to-yellow-500/20 relative">
        {metadata.image ? (
          <img 
            src={metadata.image} 
            alt={metadata.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Award className="h-16 w-16 text-[#A7EF9E]" />
          </div>
        )}
        <div className="absolute top-2 right-2 bg-gradient-to-r from-yellow-500/90 to-orange-500/90 text-white px-2 py-1 rounded-full text-xs font-medium">
          Perfect
        </div>
      </div>

      {/* NFT Details */}
      <div className="p-4">
        <h3 className="font-semibold text-foreground mb-2 line-clamp-2">
          {metadata.name}
        </h3>
        <p className="text-sm text-muted-foreground mb-4 line-clamp-2">
          {metadata.description}
        </p>

        {/* Attributes */}
        {metadata.attributes && (
          <div className="space-y-2 mb-4">
            {metadata.attributes.slice(0, 3).map((attr, index) => (
              <div key={index} className="flex justify-between items-center text-xs">
                <span className="text-muted-foreground">{attr.trait_type}</span>
                <span className="font-medium text-foreground">{attr.value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            size="sm" 
            variant="outline" 
            className="flex-1"
            onClick={() => {
              // Open in OpenSea or similar marketplace
              window.open(`https://opensea.io/assets/ethereum/${tokenId}`, '_blank')
            }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View
          </Button>
        </div>
      </div>
    </div>
  )
}

export default function NFTCollection() {
  const { address } = useAccount()
  const { tokenIds } = useUserNFTs(address)

  if (!address) {
    return (
      <div className="text-center py-12">
        <Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">Connect Your Wallet</h3>
        <p className="text-sm text-muted-foreground">
          Connect your wallet to view your perfect submission NFTs
        </p>
      </div>
    )
  }

  if (tokenIds.length === 0) {
    return (
      <div className="text-center py-12">
        <Award className="h-12 w-12 text-muted-foreground/40 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-foreground mb-2">No Perfect Submission NFTs</h3>
        <p className="text-sm text-muted-foreground">
          You haven't received any perfect submission NFTs yet. Keep hunting for bugs!
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-foreground mb-2">Your Perfect Submission NFTs</h2>
        <p className="text-muted-foreground">
          Collection of NFTs earned for perfect bug bounty submissions
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {tokenIds.map((tokenId) => (
          <NFTCard key={tokenId.toString()} tokenId={tokenId} />
        ))}
      </div>
    </div>
  )
}
