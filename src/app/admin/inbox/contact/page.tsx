"use client"

import { useState, useEffect } from "react"
import { GlassCard } from "@/components/ui/glass-card"
import { useT } from "@/components/providers/language-provider"
import { Mail, Phone, MessageSquare, Trash2, Check, Clock, MapPin, Send } from "lucide-react"
import { db, isMockMode, auth } from "@/lib/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"
import { collection, onSnapshot, doc, getDoc, setDoc, deleteDoc, updateDoc, query, orderBy } from "firebase/firestore"

interface ContactSettings {
  email: string
  phone: string
  whatsapp: string
  address: string
  serviceAreas: string
  workingHours: string
}

interface Message {
  id: string
  name: string
  email: string
  phone: string
  subject: string
  message: string
  createdAt: any
  status: "New" | "Read"
}

export default function ContactInboxPage() {
  const t = useT()
  const [authorized, setAuthorized] = useState(false)
  const [tab, setTab] = useState<"messages" | "settings">("messages")
  const [loading, setLoading] = useState(true)
  
  // Messages
  const [messages, setMessages] = useState<Message[]>([])
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null)

  // Settings
  const [settings, setSettings] = useState<ContactSettings>({
    email: "",
    phone: "",
    whatsapp: "",
    address: "",
    serviceAreas: "",
    workingHours: ""
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
    } else {
      const unsub = onAuthStateChanged(auth, (user) => {
        if (!user) {
          if (typeof window !== "undefined") window.location.replace("/admin/login")
        } else {
          setAuthorized(true)
        }
      })
      return () => unsub()
    }
    if (isMockMode) {
      setMessages([
        {
          id: "msg1",
          name: "John Doe",
          email: "john@example.com",
          phone: "0501234567",
          subject: "Inquiry about repair",
          message: "Do you fix water damaged iPhones?",
          createdAt: new Date().toISOString(),
          status: "New"
        },
        {
          id: "msg2",
          name: "Jane Smith",
          email: "jane@example.com",
          phone: "0559876543",
          subject: "Business Partnership",
          message: "We would like to partner with you.",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          status: "Read"
        }
      ])
      
      setSettings({
        email: process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@kbi.services",
        phone: "+971 50 123 4567",
        whatsapp: "+971 50 123 4567",
        address: "Dubai, UAE",
        serviceAreas: "Dubai, Sharjah, Ajman",
        workingHours: "9:00 AM - 9:00 PM"
      })
      setLoading(false)
      return
    }

    // Listen to messages
    const q = query(collection(db, "messages"), orderBy("createdAt", "desc"))
    const unsubMessages = onSnapshot(q, (snap) => {
      setMessages(snap.docs.map(d => ({ id: d.id, ...d.data() })) as Message[])
    })

    // Listen to settings
    const unsubSettings = onSnapshot(doc(db, "settings", "contact"), (doc) => {
      if (doc.exists()) {
        setSettings(doc.data() as ContactSettings)
      }
    })
    
    setLoading(false)

    return () => {
      unsubMessages()
      unsubSettings()
    }
  }, [])

  const markAsRead = async (id: string) => {
    if (isMockMode) {
      setMessages(messages.map(m => m.id === id ? { ...m, status: "Read" } : m))
      return
    }
    await updateDoc(doc(db, "messages", id), { status: "Read" })
  }

  const deleteMessage = async (id: string) => {
    if(!confirm(t("Delete this message?"))) return
    
    if (isMockMode) {
      setMessages(messages.filter(m => m.id !== id))
      if(selectedMessage?.id === id) setSelectedMessage(null)
      return
    }

    await deleteDoc(doc(db, "messages", id))
    if(selectedMessage?.id === id) setSelectedMessage(null)
  }

  const saveSettings = async () => {
    if (isMockMode) {
      alert(t("Settings saved"))
      return
    }
  try {
      await setDoc(doc(db, "settings", "contact"), settings)
      alert(t("Settings saved"))
  } catch (e) {
      alert(t("Error saving settings"))
  }
  }

  if (!authorized) return null
  return (
    <section className="pt-2 pb-8">
      <div className="flex items-center gap-2 mb-6">
        <button onClick={() => setTab("messages")} className={`px-3 py-2 rounded-lg text-sm ${tab === "messages" ? "bg-cyan-500 text-black" : "bg-white/5 border border-white/10"}`}>
          {t("Messages")}
          {messages.filter(m => m.status === "New").length > 0 && (
            <span className="ml-2 bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              {messages.filter(m => m.status === "New").length}
            </span>
          )}
        </button>
        <button onClick={() => setTab("settings")} className={`px-3 py-2 rounded-lg text-sm ${tab === "settings" ? "bg-cyan-500 text-black" : "bg-white/5 border border-white/10"}`}>{t("Contact Settings")}</button>
      </div>

      {tab === "messages" && (
        <div className="grid md:grid-cols-2 gap-6 h-[600px]">
          <GlassCard className="overflow-hidden flex flex-col">
            <h2 className="text-xl font-semibold mb-4">{t("Inbox")}</h2>
            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {messages.length === 0 && <p className="text-white/30 text-center py-10">{t("No messages")}</p>}
              {messages.map((m) => (
                <div 
                  key={m.id} 
                  onClick={() => { setSelectedMessage(m); if(m.status==="New") markAsRead(m.id); }}
                  className={`p-3 rounded-xl border cursor-pointer transition-colors ${selectedMessage?.id === m.id ? "bg-cyan-500/10 border-cyan-500/50" : m.status === "New" ? "bg-white/10 border-white/20 font-semibold" : "bg-white/5 border-white/10"}`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className="text-sm">{m.name}</span>
                    <span className="text-xs text-white/50">{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleDateString() : t("Just now")}</span>
                  </div>
                  <p className="text-xs text-white/70 truncate">{m.subject}</p>
                </div>
              ))}
            </div>
          </GlassCard>
          
          <GlassCard className="flex flex-col">
            {selectedMessage ? (
              <>
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h3 className="text-lg font-bold">{selectedMessage.subject}</h3>
                    <p className="text-sm text-cyan-400">{selectedMessage.name} &lt;{selectedMessage.email}&gt;</p>
                    <p className="text-xs text-white/50">{selectedMessage.phone}</p>
                  </div>
                  <button onClick={() => deleteMessage(selectedMessage.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors"><Trash2 className="w-5 h-5" /></button>
                </div>
                <div className="flex-1 bg-white/5 rounded-xl p-4 border border-white/10 text-sm whitespace-pre-wrap overflow-y-auto">
                  {selectedMessage.message}
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-white/30">
                {t("Select a message to read")}
              </div>
            )}
          </GlassCard>
        </div>
      )}

      {tab === "settings" && (
        <div className="max-w-2xl">
          <GlassCard>
            <h2 className="text-xl font-semibold mb-6">{t("Contact Information")}</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-white/50 mb-1">{t("Email Address")}</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <Mail className="w-4 h-4 text-white/50" />
                  <input value={settings.email} onChange={(e) => setSettings({...settings, email: e.target.value})} className="flex-1 bg-transparent focus:outline-none" placeholder="contact@example.com" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-white/50 mb-1">{t("Phone Number")}</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <Phone className="w-4 h-4 text-white/50" />
                  <input value={settings.phone} onChange={(e) => setSettings({...settings, phone: e.target.value})} className="flex-1 bg-transparent focus:outline-none" placeholder="+1234567890" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">{t("WhatsApp Number")}</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <MessageSquare className="w-4 h-4 text-white/50" />
                  <input value={settings.whatsapp} onChange={(e) => setSettings({...settings, whatsapp: e.target.value})} className="flex-1 bg-transparent focus:outline-none" placeholder="+1234567890" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">{t("Address")}</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-white/50" />
                  <input value={settings.address} onChange={(e) => setSettings({...settings, address: e.target.value})} className="flex-1 bg-transparent focus:outline-none" placeholder="123 Street Name, City" />
                </div>
              </div>

              <div>
                <label className="block text-xs text-white/50 mb-1">{t("Working Hours")}</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <Clock className="w-4 h-4 text-white/50" />
                  <input value={settings.workingHours} onChange={(e) => setSettings({...settings, workingHours: e.target.value})} className="flex-1 bg-transparent focus:outline-none" placeholder="Mon-Fri: 9AM - 6PM" />
                </div>
              </div>
              
              <div>
                <label className="block text-xs text-white/50 mb-1">{t("Service Areas")}</label>
                <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3">
                  <MapPin className="w-4 h-4 text-white/50" />
                  <input value={settings.serviceAreas} onChange={(e) => setSettings({...settings, serviceAreas: e.target.value})} className="flex-1 bg-transparent focus:outline-none" placeholder="City 1, City 2, Region" />
                </div>
              </div>

              <button onClick={saveSettings} className="w-full py-3 bg-cyan-500 text-black rounded-xl font-semibold mt-4 hover:bg-cyan-400 transition-colors">
                {t("Save Changes")}
              </button>
            </div>
          </GlassCard>
        </div>
      )}
    </section>
  )
}
