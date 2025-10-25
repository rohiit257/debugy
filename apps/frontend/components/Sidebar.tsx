"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession } from "next-auth/react"
import { Home, Clock, User, Settings, Activity, BarChart3, Bug } from "lucide-react"

type NavItem = {
  href: string
  label: string
  Icon: React.ComponentType<React.SVGProps<SVGSVGElement>>
}

const organizerItems: NavItem[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/timeline", label: "Timeline", Icon: Clock },
  { href: "/bounties", label: "Bounties", Icon: Bug },
  { href: "/settings", label: "Settings", Icon: Settings },
]

const hunterItems: NavItem[] = [
  { href: "/", label: "Home", Icon: Home },
  { href: "/timeline", label: "Timeline", Icon: Clock },
  { href: "/profile", label: "Profile", Icon: User },
  { href: "/settings", label: "Settings", Icon: Settings },
]

export default function Sidebar() {
  const pathname = usePathname()
  const { data: session } = useSession()
  console.log(session)
  
  // Determine which items to show based on user role
  const userRole = session?.user?.role
  const items = userRole === "ORG" ? organizerItems : hunterItems

  // Get user's initial
  const userName = session?.user?.name || session?.user?.wallet || "U"
  const userInitial = userName.charAt(0).toUpperCase()

  return (
    <aside
      className="fixed left-0 top-0 h-dvh w-16 border-r border-border bg-background text-foreground flex flex-col items-center py-4 gap-3"
      aria-label="Sidebar"
    >
      <div className="h-10 w-10 rounded-md grid place-items-center text-lg font-bold border border-[#A7EF9E]/30 bg-[#A7EF9E]/10 text-[#A7EF9E]">
        {userInitial}
      </div>
      
      <nav className="mt-2 flex flex-col items-center gap-1">
        {items.map(({ href, label, Icon }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={
                "group relative flex h-10 w-10 items-center justify-center rounded-md transition-colors " +
                (active
                  ? "bg-[#A7EF9E]/20 text-[#A7EF9E] border border-[#A7EF9E]/30"
                  : "hover:bg-accent text-muted-foreground hover:text-foreground border border-transparent")
              }
              aria-label={label}
              title={label}
            >
              <Icon className="h-5 w-5" />
              <span className="pointer-events-none absolute left-16 z-10 hidden rounded-md border border-border bg-popover px-2 py-1 text-xs text-popover-foreground shadow-sm group-hover:block">
                {label}
              </span>
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}


