"use client"

import { ExternalLink, Copy } from "lucide-react"
import { useState } from "react"

interface TransactionHashProps {
  hash: string
  label?: string
  variant?: "default" | "blue" | "yellow" | "green"
  status?: "pending" | "confirming" | "confirmed"
  className?: string
}

export default function TransactionHash({ 
  hash, 
  label = "Transaction Hash", 
  variant = "default",
  status,
  className = "" 
}: TransactionHashProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(hash)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      console.error("Failed to copy:", error)
    }
  }

  const handleExplorerOpen = () => {
    window.open(`https://explorer.monad.xyz/tx/${hash}`, '_blank')
  }

  const getVariantStyles = () => {
    switch (variant) {
      case "blue":
        return {
          container: "bg-blue-500/10 border-blue-500/20",
          text: "text-blue-400",
          button: "hover:bg-blue-500/20"
        }
      case "yellow":
        return {
          container: "bg-yellow-500/10 border-yellow-500/20",
          text: "text-yellow-400",
          button: "hover:bg-yellow-500/20"
        }
      case "green":
        return {
          container: "bg-[#A7EF9E]/10 border-[#A7EF9E]/20",
          text: "text-[#A7EF9E]",
          button: "hover:bg-[#A7EF9E]/20"
        }
      default:
        return {
          container: "bg-muted border",
          text: "text-foreground",
          button: "hover:bg-accent"
        }
    }
  }

  const styles = getVariantStyles()

  const getStatusMessage = () => {
    switch (status) {
      case "pending":
        return "Waiting for confirmation..."
      case "confirming":
        return "Confirming transaction..."
      case "confirmed":
        return "Transaction confirmed"
      default:
        return null
    }
  }

  return (
    <div className={`p-3 rounded-lg border ${styles.container} ${className}`}>
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className={`text-xs font-medium ${styles.text}`}>
          {label}:
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className={`p-1 rounded transition-colors ${styles.button}`}
            title={copied ? "Copied!" : "Copy hash"}
          >
            <Copy className={`h-3 w-3 ${styles.text}`} />
          </button>
          <button
            onClick={handleExplorerOpen}
            className={`p-1 rounded transition-colors ${styles.button}`}
            title="View on explorer"
          >
            <ExternalLink className={`h-3 w-3 ${styles.text}`} />
          </button>
        </div>
      </div>
      
      <p className={`text-xs font-mono break-all ${styles.text}`}>
        {hash}
      </p>
      
      {status && (
        <p className="text-xs text-muted-foreground mt-1">
          {getStatusMessage()}
        </p>
      )}
      
      {copied && (
        <p className="text-xs text-green-400 mt-1">
          Copied to clipboard!
        </p>
      )}
    </div>
  )
}
