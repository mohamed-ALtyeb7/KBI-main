import { cn } from "@/lib/utils"
import { ReactNode } from "react"

interface GlassCardProps {
  children: ReactNode
  className?: string
  hoverEffect?: boolean
}

export function GlassCard({ children, className, hoverEffect = true }: GlassCardProps) {
  return (
    <div
      className={cn(
        "glass rounded-3xl p-6 sm:p-8 lg:p-10 relative overflow-hidden group transition-transform duration-300 will-change-transform",
        hoverEffect && "glass-hover hover:-translate-y-1 hover:shadow-2xl",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
      {children}
    </div>
  )
}
