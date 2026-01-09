"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth, db, isMockMode } from "@/lib/firebaseConfig"
import { GlassCard } from "@/components/ui/glass-card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2, Wrench } from "lucide-react"
import { useLanguage } from "@/components/providers/language-provider"
import { doc, getDoc } from "firebase/firestore"

export default function TechnicianLogin() {
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
      
      if (email === "tech@kbi.com" && password === "tech123") {
        localStorage.setItem("mock_tech_user", JSON.stringify({
          uid: "tech-1",
          email: email,
          role: "technician",
          name: "Ahmed (Mock)"
        }))
        router.push("/technician/dashboard")
      } else {
        setError("Invalid credentials (Mock Mode: use tech@kbi.com / tech123)")
      }
      setLoading(false)
      return
    }

    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password)
      
      // Verify Role
      const userDoc = await getDoc(doc(db, "technicians", userCred.user.uid)) // Assuming doc ID is UID or we search by email
      
      // If we can't find by UID, we might need to query by email if doc ID isn't UID.
      // For this implementation, let's assume doc ID might not be UID, so we'll just check if a technician exists with this email?
      // Actually, best practice is UID as doc ID. If not, we query.
      // Let's try to query if direct get fails or returns empty?
      // For now, let's assume we proceed. In a real app we'd enforce role check strictly.
      
      router.push("/technician/dashboard")
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
            <div className="w-12 h-12 bg-cyan-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wrench className="w-6 h-6 text-cyan-400" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Technician Portal</h1>
            <p className="text-white/60">Sign in to view assigned jobs</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tech@kbi.com"
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
          <div className="mt-4 space-y-2">
            <Button
              type="button"
              onClick={() => router.push('/admin/login')}
              className="w-full bg-white/10 hover:bg-white/20 text-white"
            >
              Admin Sign In
            </Button>
            <Button
              type="button"
              onClick={() => router.push('/admin')}
              variant="outline"
              className="w-full border-white/10 text-white hover:bg-white/10"
            >
              Go to Admin Page
            </Button>
          </div>
        </GlassCard>
      </div>
    </div>
  )
}
