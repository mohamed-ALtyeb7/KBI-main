"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, isMockMode } from "@/lib/firebaseConfig"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const { lang } = useLanguage()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    if (isMockMode) {
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      if (email === "admin@kbi.com" && password === "admin123") {
        localStorage.setItem("mock_admin_user", email)
        router.push("/admin")
      } else {
        setError("Invalid credentials (Mock Mode: use admin@kbi.com / admin123)")
      }
      setLoading(false)
      return
    }

    try {
      await signInWithEmailAndPassword(auth, email, password)
      router.push("/admin")
  } catch (err: any) {
      setError("Invalid email or password")
  } finally {
      setLoading(false)
  }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-black">
      <div className="w-full max-w-md">
        <GlassCard className="p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">KBI Admin</h1>
            <p className="text-white/60">Sign in to access the dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="admin@kbi.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </div>

            {error && (
              <div className="text-red-400 text-sm text-center bg-red-500/10 p-2 rounded">
                {error}
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full bg-cyan-500 hover:bg-cyan-400 text-black font-semibold"
              disabled={loading}
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Sign In
            </Button>
          </form>
        </GlassCard>
      </div>
    </div>
  )
}
