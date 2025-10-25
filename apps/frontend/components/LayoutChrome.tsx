"use client"

import { ReactNode } from "react"
import { usePathname } from "next/navigation"
import Sidebar from "@/components/Sidebar"
import Navbar from "@/components/Navbar"

export default function LayoutChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname()
  const hideOn = ["/login",'/']
  const shouldHide = hideOn.includes(pathname)

  return (
    <>
      <div className={shouldHide ? 'hidden' : ''}>
        <Sidebar />
      </div>
      <div className={`${shouldHide ? 'pl-0' : 'pl-16'} min-h-screen w-full`}>
        <div className={shouldHide ? 'hidden' : ''}>
          <Navbar />
        </div>
        <main className="w-full min-h-screen px-0 py-0">
          {children}
        </main>
      </div>
    </>
  )
}


