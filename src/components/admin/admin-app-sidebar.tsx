"use client"

import * as React from "react"
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Smartphone,
  Inbox,
  Settings,
  LogOut,
  Briefcase,
  MessageSquare,
  ClipboardList
} from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useT } from "@/components/providers/language-provider"
import { auth, isMockMode } from "@/lib/firebaseConfig"
import { signOut } from "firebase/auth"

const navItems = [
  {
    title: "Dashboard",
    url: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Orders",
    url: "/admin/orders",
    icon: ShoppingCart,
  },
  {
    title: "Technicians",
    url: "/admin/technicians",
    icon: Users,
  },
  {
    title: "Inventory",
    url: "/admin/inventory",
    icon: Smartphone,
  },
]

const inboxItems = [
  {
    title: "Contact Inbox",
    url: "/admin/inbox/contact",
    icon: MessageSquare,
  },
  {
    title: "Corporate Requests",
    url: "/admin/inbox/corporate",
    icon: Briefcase,
  },
  {
    title: "Technician Requests",
    url: "/admin/requests",
    icon: ClipboardList,
  },
]

const settingsItems = [
  {
    title: "Settings",
    url: "/admin/settings",
    icon: Settings,
  },
]

export function AdminAppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const pathname = usePathname()
  const router = useRouter()
  const t = useT()

  const handleLogout = async () => {
    if (isMockMode) {
      localStorage.removeItem("mock_admin_user")
      router.push("/admin/login")
      return
    }
    await signOut(auth)
    router.push("/admin/login")
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <div className="flex items-center gap-2 p-2">
          <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-cyan-500 text-sidebar-primary-foreground">
            <span className="font-bold text-white">KBI</span>
          </div>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{t("Admin Panel")}</span>
            <span className="truncate text-xs">{t("Repair Services")}</span>
          </div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>{t("Management")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={t(item.title)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("Inbox")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {inboxItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={t(item.title)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>{t("Configuration")}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {settingsItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url} tooltip={t(item.title)}>
                    <Link href={item.url}>
                      <item.icon />
                      <span>{t(item.title)}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
             <div className="flex items-center gap-3 p-2">
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src="/placeholder-user.jpg" alt="Admin" />
                  <AvatarFallback className="rounded-lg">AD</AvatarFallback>
                </Avatar>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{t("Admin User")}</span>
                  <span className="truncate text-xs">{process.env.NEXT_PUBLIC_COMPANY_EMAIL || "info@kbi.services"}</span>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={handleLogout}>
                    <LogOut className="size-4" />
                </Button>
             </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
