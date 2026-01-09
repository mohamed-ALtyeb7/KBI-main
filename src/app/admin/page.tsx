"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ShoppingCart, Clock, CheckCircle, AlertTriangle, Users, Smartphone, Briefcase, Activity } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { collection, onSnapshot, query, where, orderBy, limit } from "firebase/firestore"
import { db, auth } from "@/lib/firebaseConfig"
import { onAuthStateChanged } from "firebase/auth"
import { Skeleton } from "@/components/ui/skeleton"
import { Button } from "@/components/ui/button"
import { logger } from "@/lib/utils"

export default function AdminDashboard() {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [stats, setStats] = useState({
    totalOrders: 0,
    inProgress: 0,
    completed: 0,
    overdue: 0,
    todayOrders: 0,
    totalTechs: 0,
    totalDevices: 0,
    corpRequests: 0,
  })
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState<any[]>([])

  // Chart data for visualization
  const chartData = [
    { name: 'Mon', orders: 4 },
    { name: 'Tue', orders: 3 },
    { name: 'Wed', orders: 2 },
    { name: 'Thu', orders: 6 },
    { name: 'Fri', orders: 8 },
    { name: 'Sat', orders: 9 },
    { name: 'Sun', orders: 5 },
  ]

  const pieData = [
    { name: 'Pending', value: stats.totalOrders - stats.completed - stats.inProgress },
    { name: 'In Progress', value: stats.inProgress },
    { name: 'Completed', value: stats.completed },
  ]

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']

  useEffect(() => {
    // Real Firebase mode
    const unsub = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.replace("/admin/login")
      } else {
        setAuthorized(true)
      }
    })

    // Real Firestore Subscriptions
    let loadedCount = 0
    const checkLoaded = () => {
      loadedCount++
      if (loadedCount >= 1) {
        setLoading(false)
      }
    }

    const unsubOrders = onSnapshot(collection(db, "orders"), (snap) => {
      const total = snap.size
      const pending = snap.docs.filter(d => d.data().status === "pending" || d.data().status === "Order Created").length
      const progress = snap.docs.filter(d => d.data().status === "in_progress" || d.data().status === "In Progress").length
      const completed = snap.docs.filter(d => d.data().status === "completed" || d.data().status === "Completed").length
      const overdue = snap.docs.filter(d => d.data().isOverdue).length

      // Simple "Today" check
      const today = new Date().toISOString().split('T')[0]
      const todayCount = snap.docs.filter(d => {
        const createdAt = d.data().createdAt
        if (typeof createdAt === 'string') {
          return createdAt.split('T')[0] === today
        }
        if (createdAt?.toDate) {
          return createdAt.toDate().toISOString().split('T')[0] === today
        }
        return false
      }).length

      setStats(prev => ({
        ...prev,
        totalOrders: total,
        inProgress: progress,
        completed: completed,
        overdue: overdue,
        todayOrders: todayCount
      }))
      checkLoaded()
    }, (error) => {
      logger.error("orders subscription failed", error)
      setLoading(false)
    })

    const unsubTechs = onSnapshot(collection(db, "technicians"), (snap) => {
      setStats(prev => ({ ...prev, totalTechs: snap.size }))
    }, (error) => {
      logger.error("technicians subscription failed", error)
    })

    const unsubDevices = onSnapshot(collection(db, "devices"), (snap) => {
      setStats(prev => ({ ...prev, totalDevices: snap.size }))
    }, (error) => {
      logger.error("devices subscription failed", error)
    })

    const unsubCorp = onSnapshot(collection(db, "corporate_requests"), (snap) => {
      setStats(prev => ({ ...prev, corpRequests: snap.size }))
    }, (error) => {
      logger.error("corporate_requests subscription failed", error)
    })

    return () => {
      unsub()
      unsubOrders()
      unsubTechs()
      unsubDevices()
      unsubCorp()
    }
  }, [])

  if (!authorized) {
    return null
  }
  if (loading) {
    return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl bg-white/10" />)}
    </div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight text-white">Dashboard Overview</h2>
        <Button onClick={() => router.push('/admin/login')} className="bg-cyan-500 hover:bg-cyan-400 text-black font-semibold">
          Sign In
        </Button>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Orders" value={stats.totalOrders} icon={ShoppingCart} color="text-blue-400" />
        <StatCard title="In Progress" value={stats.inProgress} icon={Clock} color="text-yellow-400" />
        <StatCard title="Completed" value={stats.completed} icon={CheckCircle} color="text-green-400" />
        <StatCard title="Overdue" value={stats.overdue} icon={AlertTriangle} color="text-red-400" />
        <StatCard title="Technicians" value={stats.totalTechs} icon={Users} color="text-cyan-400" />
        <StatCard title="Devices" value={stats.totalDevices} icon={Smartphone} color="text-purple-400" />
        <StatCard title="Corp Requests" value={stats.corpRequests} icon={Briefcase} color="text-orange-400" />
        <StatCard title="Today's Orders" value={stats.todayOrders} icon={Activity} color="text-pink-400" />
      </div>

      {/* Charts Section */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4 bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Weekly Orders</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#444" />
                <XAxis dataKey="name" stroke="#888" />
                <YAxis stroke="#888" />
                <RechartsTooltip
                  contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="orders" stroke="#06b6d4" strokeWidth={2} activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="col-span-3 bg-white/5 border-white/10 text-white">
          <CardHeader>
            <CardTitle>Order Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  fill="#8884d8"
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                  <span>{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="bg-white/5 border-white/10 text-white">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-center justify-between border-b border-white/10 pb-4 last:border-0 last:pb-0">
                <div className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-cyan-500" />
                  <p className="text-sm font-medium">{activity.text}</p>
                </div>
                <span className="text-xs text-white/40">{activity.time}</span>
              </div>
            ))}
            {recentActivity.length === 0 && <p className="text-white/40 text-sm">No recent activity.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({ title, value, icon: Icon, color }: any) {
  return (
    <Card className="bg-white/5 border-white/10 text-white">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-white/70">
          {title}
        </CardTitle>
        <Icon className={`h-4 w-4 ${color}`} />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  )
}
