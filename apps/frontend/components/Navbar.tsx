"use client"

import Link from "next/link"
import { Bell, Moon, Sun, Award, Shield } from "lucide-react"
import { useSession, signOut } from "next-auth/react"
import { useTheme } from "@/contexts/ThemeContext"
import HackerApprovalDialog from "./HackerApprovalDialog"

export default function Navbar() {
  const { data: session, status } = useSession()
  const { theme, toggleTheme } = useTheme()
  const wallet = (session as any)?.user?.wallet || (session as any)?.user?.id
  const display = wallet ? `${wallet.slice(0, 6)}…${wallet.slice(-4)}` : undefined
  

  return (
    <header className="sticky top-0 z-40 h-12 border-b border-border bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 shadow-sm">
      <div className="mx-auto flex h-full w-full items-center justify-between px-3">
        <div className="flex items-center gap-6">
          <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
            <span className="inline-flex items-center gap-2">
              <span className="h-5 w-5 rounded-md" style={{ backgroundColor: '#A7EF9E' }} />
              <span className="bg-gradient-to-r from-foreground to-[#A7EF9E] bg-clip-text text-transparent">Debug Bounty</span>
            </span>
          </Link>
          
          {status === 'authenticated' && (
            <nav className="flex items-center gap-4">
              <Link 
                href="/nfts" 
                className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-[#A7EF9E] transition-colors"
              >
                <Award className="h-3.5 w-3.5" />
                My NFTs
              </Link>
              
              {/* Show admin features for ORG role */}
              {(session as any)?.user?.role === 'ORG' && (
                <HackerApprovalDialog 
                  trigger={
                    <button className="inline-flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-[#A7EF9E] transition-colors">
                      <Shield className="h-3.5 w-3.5" />
                      Admin
                    </button>
                  }
                />
              )}
            </nav>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={toggleTheme}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-foreground transition-colors" 
            aria-label="Toggle theme"
            title={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>
          <button className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent text-foreground transition-colors" aria-label="Notifications">
            <Bell className="h-4 w-4" />
          </button>
          {status === 'authenticated' && display ? (
            <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs text-foreground shadow-sm backdrop-blur">
              <span className="inline-flex h-2 w-2 rounded-full" style={{ backgroundColor: '#A7EF9E' }} />
              <span className="font-mono">{display}</span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="ml-1 rounded px-1 hover:bg-accent transition-colors"
                title="Sign out"
              >
                Sign out
              </button>
            </div>
          ) : (
            <Link href="/login" className="inline-flex items-center rounded-md border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-sm hover:bg-accent transition-colors">
              <span className="mr-2 inline-block h-2 w-2 rounded-full" style={{ backgroundColor: '#A7EF9E' }} />
              <span>Sign in</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}


