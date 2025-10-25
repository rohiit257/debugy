"use client"

import NFTCollection from "@/components/NFTCollection"

export default function NFTsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <NFTCollection />
      </div>
    </div>
  )
}
