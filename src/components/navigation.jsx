"use client"

import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

export function Navigation() {
  const pathname = usePathname()
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-[#0ff]/30 bg-black/80 backdrop-blur-sm">
      <nav className="h-14 flex items-center justify-between px-4">
        <Link href="/" className="text-[#0ff] hover:text-[#0ff] font-mono transition-all duration-300 relative group">
          <span className="opacity-50 group-hover:opacity-100 transition-opacity">[~]$</span> cd /home
          <div className="absolute inset-0 bg-[#0ff]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded blur" />
        </Link>
        
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="text-[#0ff] hover:text-[#0ff] hover:bg-[#0ff]/10 transition-all duration-300">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent className="bg-black/95 border-[#0ff]/30 backdrop-blur-sm">
            <div className="flex flex-col gap-4 mt-8">
              <Link 
                href="/"
                className={`font-mono text-[#0ff]/70 hover:text-[#0ff] transition-all duration-300 relative group ${pathname === "/" ? "text-[#0ff]" : ""}`}
              >
                <span className="opacity-50 group-hover:opacity-100 transition-opacity">[~]$</span> cd /feeds
                <div className="absolute inset-0 bg-[#0ff]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded blur" />
              </Link>
              <Link 
                href="/settings"
                className={`font-mono text-[#0ff]/70 hover:text-[#0ff] transition-all duration-300 relative group ${pathname === "/settings" ? "text-[#0ff]" : ""}`}
              >
                <span className="opacity-50 group-hover:opacity-100 transition-opacity">[~]$</span> cd /settings
                <div className="absolute inset-0 bg-[#0ff]/10 opacity-0 group-hover:opacity-100 transition-opacity rounded blur" />
              </Link>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}