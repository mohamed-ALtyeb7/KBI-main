"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { useT } from "@/components/providers/language-provider"
import { Save, Globe, Settings as SettingsIcon, Upload, Trash2, FileText, Lock, Eye, EyeOff } from "lucide-react"
import { db, isMockMode, storage, auth } from "@/lib/firebaseConfig"
import { onAuthStateChanged, updatePassword } from "firebase/auth"
import { ref, uploadBytes, getDownloadURL } from "firebase/storage"
import { doc, onSnapshot, setDoc } from "firebase/firestore"
import { getUserRole } from "@/lib/firestore/services/authService"
import { changePassword, signOut as signOutUser } from "@/lib/firestore/services/authService"
import { logAction, AuditActions } from "@/lib/auditService"
import { toast } from "@/hooks/use-toast"

interface SiteSettings {
  companyName: string
  mainPhone: string
  email: string
  address: string
  footerText: string
  socialLinks: {
    facebook: string
    instagram: string
    twitter: string
    linkedin: string
  }
  enableCountdown: boolean
  enableCorporatePage: boolean
  enableOtherModel: boolean
  companyPresentationUrl?: string
}

export default function AdminSettingsPage() {
  const t = useT()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)
  const [currentUserRole, setCurrentUserRole] = useState<"admin" | "super_admin" | "technician" | "customer" | null>(null)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [changing, setChanging] = useState(false)
  const [failureCount, setFailureCount] = useState(0)
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(null)
  const [otpEmail, setOtpEmail] = useState<string>("")
  const [otpCode, setOtpCode] = useState<string>("")
  const [otpNewPassword, setOtpNewPassword] = useState<string>("")
  const [otpConfirmPassword, setOtpConfirmPassword] = useState<string>("")
  const [otpSending, setOtpSending] = useState(false)
  const [otpVerifying, setOtpVerifying] = useState(false)
  const [otpCountdown, setOtpCountdown] = useState<number>(0)
  const [otpResendLock, setOtpResendLock] = useState<number>(0)
  const [settings, setSettings] = useState<SiteSettings>({
    companyName: "",
    mainPhone: "",
    email: "",
    address: "",
    footerText: "",
    socialLinks: { facebook: "", instagram: "", twitter: "", linkedin: "" },
    enableCountdown: true,
    enableCorporatePage: true,
    enableOtherModel: false,
    companyPresentationUrl: ""
  })

  useEffect(() => {
    // Auth guard
    if (isMockMode) {
      const u = typeof window !== "undefined" ? window.localStorage.getItem("mock_admin_user") : null
      if (!u) {
        if (typeof window !== "undefined") window.location.replace("/admin/login")
        return
      }
      setAuthorized(true)
      setCurrentUserRole("admin")
    } else {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (!user) {
          if (typeof window !== "undefined") window.location.replace("/admin/login")
        } else {
          getUserRole(user.uid).then((role) => {
            setCurrentUserRole(role)
            if (role === "admin" || role === "super_admin") {
              setAuthorized(true)
              setOtpEmail(auth.currentUser?.email || "")
            } else {
              if (typeof window !== "undefined") window.location.replace("/admin/login")
            }
          })
        }
      })
      return () => unsub()
    }
    if (isMockMode) {
      setSettings({
        companyName: "KBI Fix",
        mainPhone: "+971 50 123 4567",
        email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@kbi.services",
        address: "Dubai, UAE",
        footerText: "Professional Repair Services",
        socialLinks: { 
          facebook: "https://facebook.com/kbi", 
          instagram: "https://instagram.com/kbi", 
          twitter: "https://twitter.com/kbi", 
          linkedin: "https://linkedin.com/kbi" 
        },
        enableCountdown: true,
        enableCorporatePage: true,
        enableOtherModel: false
      })
      setLoading(false)
      return
    }

    const unsub = onSnapshot(doc(db, "settings", "site"), (doc) => {
      if (doc.exists()) {
        const data = doc.data() as any
        // Merge with default structure to avoid undefined errors
        setSettings(prev => ({
            ...prev,
            ...data,
            socialLinks: { ...prev.socialLinks, ...data.socialLinks }
        }))
      }
      setLoading(false)
    })
    return () => unsub()
  }, [])

  const saveSettings = async () => {
    if (isMockMode) {
      alert("Site settings saved! (Mock Mode)")
      return
    }
  try {
      await setDoc(doc(db, "settings", "site"), settings)
      alert("Site settings saved!")
  } catch (e) {
      alert("Error saving settings")
  }
  }

  const handleUploadPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    try {
      if (isMockMode) {
        const url = "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"
        setSettings({ ...settings, companyPresentationUrl: url })
        return
      }
      const storageRef = ref(storage, `company/${Date.now()}_${file.name}`)
      await uploadBytes(storageRef, file)
      const url = await getDownloadURL(storageRef)
      setSettings({ ...settings, companyPresentationUrl: url })
    } catch (err) {
      alert("Upload failed")
    }
  }

  const clearPDF = () => {
    setSettings({ ...settings, companyPresentationUrl: "" })
  }

  const isLockedOut = lockoutUntil != null && Date.now() < lockoutUntil
  const passwordValid = newPassword.length >= 8 && newPassword === confirmPassword && newPassword !== currentPassword
  const canSubmit = !changing && !isLockedOut && currentPassword.length > 0 && passwordValid
  const otpPasswordValid = otpNewPassword.length >= 8 && otpNewPassword === otpConfirmPassword
  const canSendOtp = !otpSending && otpEmail.length > 0 && otpCountdown <= 0 && otpResendLock <= 0
  const canResetWithOtp = !otpVerifying && otpCode.length === 6 && otpPasswordValid

  const handleChangePassword = async () => {
    if (!authorized || !(currentUserRole === "admin" || currentUserRole === "super_admin")) return
    if (isLockedOut) return
    if (currentPassword.length === 0) {
      toast({ title: t("Validation error"), description: t("Current password is required") })
      return
    }
    if (newPassword.length < 8) {
      toast({ title: t("Validation error"), description: t("New password must be at least 8 characters") })
      return
    }
    if (newPassword !== confirmPassword) {
      toast({ title: t("Validation error"), description: t("New password and confirmation must match") })
      return
    }
    if (newPassword === currentPassword) {
      toast({ title: t("Validation error"), description: t("New password must be different from current") })
      return
    }
    setChanging(true)
    try {
      await changePassword(currentPassword, newPassword)
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setFailureCount(0)
      setLockoutUntil(null)
      toast({ title: t("Password changed"), description: t("You will be logged out for security") })
      const u = auth.currentUser
      if (u) {
        logAction(AuditActions.PASSWORD_CHANGED, "auth", u.uid, u.email || "", { details: { role: currentUserRole || "admin" } })
      }
      await signOutUser()
      if (typeof window !== "undefined") window.location.replace("/admin/login")
    } catch (e: any) {
      setFailureCount((c) => c + 1)
      let msg = t("Password change failed")
      const code = e?.code || ""
      if (code === "auth/wrong-password") msg = t("Wrong current password")
      else if (code === "auth/weak-password") msg = t("Weak password")
      else if (code === "auth/requires-recent-login") msg = t("Please re-login and try again")
      else if (code === "auth/too-many-requests") msg = t("Too many attempts, please wait and retry")
      toast({ title: t("Error"), description: msg })
      if (failureCount + 1 >= 3) {
        setLockoutUntil(Date.now() + 30_000)
      }
    } finally {
      setChanging(false)
    }
  }
  const sha256Hex = async (s: string): Promise<string> => {
    const enc = new TextEncoder().encode(s)
    const buf = await crypto.subtle.digest("SHA-256", enc)
    const arr = Array.from(new Uint8Array(buf))
    return arr.map(b => b.toString(16).padStart(2, "0")).join("")
  }
  const generateOtp = (): string => {
    if (typeof window !== "undefined" && window.crypto?.getRandomValues) {
      const a = new Uint8Array(3)
      window.crypto.getRandomValues(a)
      const n = ((a[0] << 16) | (a[1] << 8) | a[2]) % 1000000
      return String(n).padStart(6, "0")
    }
    return String(Math.floor(Math.random() * 1000000)).padStart(6, "0")
  }
  const handleSendOtp = async () => {
    if (!(currentUserRole === "admin" || currentUserRole === "super_admin")) return
    if (!canSendOtp) return
    setOtpSending(true)
    try {
      const code = generateOtp()
      const hash = await sha256Hex(code)
      const uid = auth.currentUser?.uid || ""
      if (!uid || !otpEmail) throw new Error("Not authenticated")
      if (isMockMode) {
        setOtpCountdown(60)
        setOtpResendLock(60)
        setTimeout(() => setOtpResendLock(0), 60_000)
        const end = Date.now() + 60_000
        const id = setInterval(() => {
          const r = Math.max(0, Math.ceil((end - Date.now()) / 1000))
          setOtpCountdown(r)
          if (r <= 0) clearInterval(id as any)
        }, 1000)
        toast({ title: t("Verification code sent"), description: t("Check your email") })
      } else {
        const { doc, setDoc, Timestamp } = await import("firebase/firestore")
        const { db } = await import("@/lib/firebaseConfig")
        await setDoc(doc(db, "password_otps", uid), {
          userId: uid,
          email: otpEmail,
          otpHash: hash,
          createdAt: Timestamp.now(),
          expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
          attemptsLeft: 5,
          resendAvailableAt: Timestamp.fromDate(new Date(Date.now() + 60 * 1000))
        })
        const u = auth.currentUser
        if (u) {
          logAction(AuditActions.REQUEST_PASSWORD_RESET, "auth", u.uid, u.email || "")
          logAction(AuditActions.OTP_SENT, "auth", u.uid, u.email || "")
        }
        setOtpCountdown(60)
        setOtpResendLock(60)
        setTimeout(() => setOtpResendLock(0), 60_000)
        const end = Date.now() + 60_000
        const id = setInterval(() => {
          const r = Math.max(0, Math.ceil((end - Date.now()) / 1000))
          setOtpCountdown(r)
          if (r <= 0) clearInterval(id as any)
        }, 1000)
        toast({ title: t("Verification code sent"), description: t("Check your email") })
      }
    } catch (e: any) {
      toast({ title: t("Failed to send code"), description: e?.message || t("Please try again") })
    } finally {
      setOtpSending(false)
    }
  }
  const handleResetWithOtp = async () => {
    if (!(currentUserRole === "admin" || currentUserRole === "super_admin")) return
    if (!canResetWithOtp) return
    setOtpVerifying(true)
    try {
      const uid = auth.currentUser?.uid || ""
      if (!uid) throw new Error("Not authenticated")
      const { doc, getDoc, updateDoc, deleteDoc, Timestamp } = await import("firebase/firestore")
      const { db } = await import("@/lib/firebaseConfig")
      const snap = await getDoc(doc(db, "password_otps", uid))
      if (!snap.exists()) throw new Error(t("Code not found"))
      const data: any = snap.data()
      const now = Date.now()
      const exp = data.expiresAt?.toDate?.()?.getTime?.() || new Date(data.expiresAt).getTime()
      if (now > exp) {
        await deleteDoc(doc(db, "password_otps", uid))
        throw new Error(t("Code expired"))
      }
      if (data.attemptsLeft <= 0) {
        await deleteDoc(doc(db, "password_otps", uid))
        throw new Error(t("Too many attempts"))
      }
      const hash = await sha256Hex(otpCode)
      if (hash !== data.otpHash) {
        await updateDoc(doc(db, "password_otps", uid), { attemptsLeft: Number(data.attemptsLeft || 1) - 1, updatedAt: Timestamp.now() })
        throw new Error(t("Invalid code"))
      }
      await deleteDoc(doc(db, "password_otps", uid))
      const u = auth.currentUser
      if (u) {
        logAction(AuditActions.OTP_VERIFIED, "auth", u.uid, u.email || "")
      }
      if (auth.currentUser) {
        await updatePassword(auth.currentUser, otpNewPassword)
      }
      setOtpCode("")
      setOtpNewPassword("")
      setOtpConfirmPassword("")
      toast({ title: t("Password reset"), description: t("You will be logged out for security") })
      if (u) {
        logAction(AuditActions.PASSWORD_RESET_SUCCESS, "auth", u.uid, u.email || "")
      }
      await signOutUser()
      if (typeof window !== "undefined") window.location.replace("/admin/login")
    } catch (e: any) {
      const u = auth.currentUser
      if (u) {
        logAction(AuditActions.PASSWORD_RESET_FAILED, "auth", u.uid, u.email || "", { details: { error: e?.message || "error" } })
      }
      let msg = e?.message || t("Failed to reset")
      const code = e?.code || ""
      if (code === "auth/weak-password") msg = t("Weak password")
      else if (code === "auth/requires-recent-login") msg = t("Please re-login and try again")
      else if (code === "auth/too-many-requests") msg = t("Too many attempts, please wait and retry")
      toast({ title: t("Error"), description: msg })
    } finally {
      setOtpVerifying(false)
    }
  }

  if (!authorized) return null
  return (
    <section className="pt-2 pb-8 max-w-4xl">
      <div className="flex items-center gap-2 mb-6">
         <h1 className="text-2xl font-bold">{t("Site Settings")}</h1>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <GlassCard>
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5 text-cyan-400" />
            {t("General Information")}
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/50 mb-1">{t("Company Name")}</label>
              <input value={settings.companyName} onChange={(e) => setSettings({...settings, companyName: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">{t("Main Phone")}</label>
              <input value={settings.mainPhone} onChange={(e) => setSettings({...settings, mainPhone: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">{t("Email")}</label>
              <input value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">{t("Address")}</label>
              <input value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" />
            </div>
            <div>
              <label className="block text-xs text-white/50 mb-1">{t("Footer Text")}</label>
              <textarea value={settings.footerText} onChange={(e) => setSettings({...settings, footerText: e.target.value})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500 h-24" />
            </div>
          </div>
        </GlassCard>

        <div className="space-y-6">
            <GlassCard>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-cyan-400" />
                    {t("Social Media")}
                </h2>
                <div className="space-y-4">
                    <div>
                    <label className="block text-xs text-white/50 mb-1">Facebook</label>
                    <input value={settings.socialLinks.facebook} onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, facebook: e.target.value}})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" placeholder="https://facebook.com/..." />
                    </div>
                    <div>
                    <label className="block text-xs text-white/50 mb-1">Instagram</label>
                    <input value={settings.socialLinks.instagram} onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, instagram: e.target.value}})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" placeholder="https://instagram.com/..." />
                    </div>
                    <div>
                    <label className="block text-xs text-white/50 mb-1">Twitter (X)</label>
                    <input value={settings.socialLinks.twitter} onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, twitter: e.target.value}})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" placeholder="https://twitter.com/..." />
                    </div>
                    <div>
                    <label className="block text-xs text-white/50 mb-1">LinkedIn</label>
                    <input value={settings.socialLinks.linkedin} onChange={(e) => setSettings({...settings, socialLinks: {...settings.socialLinks, linkedin: e.target.value}})} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500" placeholder="https://linkedin.com/..." />
                    </div>
                </div>
            </GlassCard>

            <GlassCard>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <SettingsIcon className="w-5 h-5 text-cyan-400" />
                    {t("Features")}
                </h2>
                <div className="space-y-4">
                    <label className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10">
                        <span className="font-medium">{t("Enable Order Countdown")}</span>
                        <input type="checkbox" checked={settings.enableCountdown} onChange={(e) => setSettings({...settings, enableCountdown: e.target.checked})} className="w-5 h-5 accent-cyan-500" />
                    </label>
                    <label className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10">
                        <span className="font-medium">{t("Enable Corporate Page")}</span>
                        <input type="checkbox" checked={settings.enableCorporatePage} onChange={(e) => setSettings({...settings, enableCorporatePage: e.target.checked})} className="w-5 h-5 accent-cyan-500" />
                    </label>
                     <label className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-xl cursor-pointer hover:bg-white/10">
                        <span className="font-medium">{t("Enable Other Model (Manual Entry)")}</span>
                        <input type="checkbox" checked={settings.enableOtherModel} onChange={(e) => setSettings({...settings, enableOtherModel: e.target.checked})} className="w-5 h-5 accent-cyan-500" />
                    </label>
                </div>
            </GlassCard>

            {(currentUserRole === "admin" || currentUserRole === "super_admin") && (
            <GlassCard>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-cyan-400" />
                    {t("Account Security")}
                </h2>
                <div className="space-y-4">
                  <div className="text-white/70 font-semibold">{t("Change Password")}</div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">{t("Current Password")}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showCurrent ? "text" : "password"}
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500"
                      />
                      <button type="button" onClick={() => setShowCurrent((v) => !v)} className="p-2 rounded-xl bg-white/5 border border-white/10">
                        {showCurrent ? <EyeOff className="w-4 h-4 text-white/70" /> : <Eye className="w-4 h-4 text-white/70" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">{t("New Password")}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showNew ? "text" : "password"}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500"
                      />
                      <button type="button" onClick={() => setShowNew((v) => !v)} className="p-2 rounded-xl bg-white/5 border border-white/10">
                        {showNew ? <EyeOff className="w-4 h-4 text-white/70" /> : <Eye className="w-4 h-4 text-white/70" />}
                      </button>
                    </div>
                    <p className="text-xs text-white/40 mt-1">{t("Minimum 8 characters")}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">{t("Confirm New Password")}</label>
                    <div className="flex items-center gap-2">
                      <input
                        type={showConfirm ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none focus:border-cyan-500"
                      />
                      <button type="button" onClick={() => setShowConfirm((v) => !v)} className="p-2 rounded-xl bg-white/5 border border-white/10">
                        {showConfirm ? <EyeOff className="w-4 h-4 text-white/70" /> : <Eye className="w-4 h-4 text-white/70" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <button
                      onClick={handleChangePassword}
                      disabled={!canSubmit}
                      className={`px-6 py-3 rounded-xl font-semibold transition-colors flex items-center gap-2 ${canSubmit ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-white/10 text-white/50 cursor-not-allowed"}`}
                    >
                      {t("Change Password")}
                    </button>
                    {isLockedOut && (
                      <span className="text-xs text-red-400">{t("Temporarily locked. Please wait and retry.")}</span>
                    )}
                  </div>
                  <div className="mt-6 pt-4 border-t border-white/10">
                    <div className="text-white/70 font-semibold mb-2">{t("Forgot Password / Reset via OTP")}</div>
                    <div className="space-y-3">
                      <div>
                        <label className="block text-xs text-white/50 mb-1">{t("Email")}</label>
                        <input value={otpEmail} onChange={(e) => setOtpEmail(e.target.value)} readOnly className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={!canSendOtp}
                          className={`px-6 py-3 rounded-xl font-semibold ${canSendOtp ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-white/10 text-white/50 cursor-not-allowed"}`}
                        >
                          {t("Send Verification Code")}
                        </button>
                        {otpCountdown > 0 && (
                          <span className="text-xs text-white/50">{t("Resend in")} {otpCountdown}{t("s")}</span>
                        )}
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">{t("Verification Code")}</label>
                        <input value={otpCode} onChange={(e) => setOtpCode(e.target.value.replace(/\D+/g, "").slice(0, 6))} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" placeholder="123456" />
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">{t("New Password")}</label>
                        <div className="flex items-center gap-2">
                          <input type={showNew ? "text" : "password"} value={otpNewPassword} onChange={(e) => setOtpNewPassword(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
                          <button type="button" onClick={() => setShowNew((v) => !v)} className="p-2 rounded-xl bg-white/5 border border-white/10">
                            {showNew ? <EyeOff className="w-4 h-4 text-white/70" /> : <Eye className="w-4 h-4 text-white/70" />}
                          </button>
                        </div>
                        <p className="text-xs text-white/40 mt-1">{t("Minimum 8 characters, mix upper, lower, numbers")}</p>
                      </div>
                      <div>
                        <label className="block text-xs text-white/50 mb-1">{t("Confirm New Password")}</label>
                        <div className="flex items-center gap-2">
                          <input type={showConfirm ? "text" : "password"} value={otpConfirmPassword} onChange={(e) => setOtpConfirmPassword(e.target.value)} className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white" />
                          <button type="button" onClick={() => setShowConfirm((v) => !v)} className="p-2 rounded-xl bg-white/5 border border-white/10">
                            {showConfirm ? <EyeOff className="w-4 h-4 text-white/70" /> : <Eye className="w-4 h-4 text-white/70" />}
                          </button>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <button
                          type="button"
                          onClick={handleResetWithOtp}
                          disabled={!canResetWithOtp}
                          className={`px-6 py-3 rounded-xl font-semibold ${canResetWithOtp ? "bg-cyan-500 text-black hover:bg-cyan-400" : "bg-white/10 text-white/50 cursor-not-allowed"}`}
                        >
                          {t("Reset Password")}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
            </GlassCard>
            )}

            <GlassCard>
                <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    {t("Company Presentation (PDF)")}
                </h2>
                <div className="space-y-4">
                  {settings.companyPresentationUrl ? (
                    <div className="flex items-center justify-between bg-white/5 rounded-xl p-4 border border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-cyan-400">
                          <FileText className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-medium text-white">{t("Company Presentation")}</p>
                          <a href={settings.companyPresentationUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-cyan-400 underline">{t("View PDF")}</a>
                        </div>
                      </div>
                      <button onClick={clearPDF} className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-4">
                      <button onClick={() => document.getElementById("company-presentation-input")?.click()} className="px-6 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 flex items-center gap-2">
                        <Upload className="w-5 h-5 text-cyan-400" />
                        <span className="text-sm">{t("Upload PDF")}</span>
                      </button>
                      <input id="company-presentation-input" type="file" accept="application/pdf" className="hidden" onChange={handleUploadPDF} />
                    </div>
                  )}
                  <p className="text-xs text-white/40">{t("Upload a company presentation PDF that will be shown on public pages.")}</p>
                </div>
            </GlassCard>
        </div>
      </div>
      
      <div className="mt-6 flex justify-end">
        <button onClick={saveSettings} className="px-8 py-3 bg-cyan-500 text-black rounded-xl font-semibold hover:bg-cyan-400 transition-colors flex items-center gap-2">
            <Save className="w-5 h-5" />
            {t("Save Changes")}
        </button>
      </div>
    </section>
  )
}
