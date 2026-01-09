/**
 * Export Service for generating PDF/Excel reports
 */

export interface ExportData {
    orders: any[]
    dateRange?: { from: Date; to: Date }
    type: "orders" | "revenue" | "technicians"
}

/**
 * Export orders to CSV format
 */
export function exportToCSV(orders: any[], filename: string = "orders"): void {
    const headers = [
        "Order ID",
        "Customer Name",
        "Phone",
        "Device",
        "Issue",
        "Status",
        "Technician",
        "Price",
        "Date",
        "Address"
    ]

    const rows = orders.map(order => [
        order.orderId || order.id,
        order.customerName || "",
        order.customerPhone || "",
        order.device || "",
        order.issue || order.issueType || "",
        order.status || "",
        order.technicianName || "Unassigned",
        order.price || order.totalCost || "0",
        order.createdAt?.toDate?.()?.toLocaleDateString?.() || new Date(order.createdAt).toLocaleDateString(),
        order.address || order.location || ""
    ])

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n")

    downloadFile(csvContent, `${filename}.csv`, "text/csv")
}

/**
 * Export revenue report to CSV
 */
export function exportRevenueReport(orders: any[], filename: string = "revenue"): void {
    const headers = ["Date", "Orders", "Revenue (AED)", "Avg Order Value"]

    // Group by date
    const byDate = orders.reduce((acc, order) => {
        const date = order.createdAt?.toDate?.()?.toLocaleDateString?.() ||
            new Date(order.createdAt).toLocaleDateString()
        if (!acc[date]) {
            acc[date] = { count: 0, revenue: 0 }
        }
        acc[date].count++
        acc[date].revenue += Number(order.totalCost || order.price || 0)
        return acc
    }, {} as Record<string, { count: number; revenue: number }>)

    const rows = (Object.entries(byDate) as Array<[string, { count: number; revenue: number }]>).map(([date, data]) => [
        date,
        data.count,
        data.revenue.toFixed(2),
        (data.revenue / data.count).toFixed(2)
    ])

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.join(","))
    ].join("\n")

    downloadFile(csvContent, `${filename}.csv`, "text/csv")
}

/**
 * Export technician performance report
 */
export function exportTechnicianReport(technicians: any[], orders: any[], filename: string = "technicians"): void {
    const headers = ["Technician", "Email", "Status", "Completed Jobs", "Active Jobs", "Specializations"]

    const rows = technicians.map(tech => {
        const completed = orders.filter(o => o.technicianId === tech.id && o.status === "completed").length
        const active = orders.filter(o => o.technicianId === tech.id && o.status !== "completed" && o.status !== "cancelled").length

        return [
            tech.name,
            tech.email,
            tech.status,
            completed,
            active,
            tech.specialization?.join("; ") || ""
        ]
    })

    const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
    ].join("\n")

    downloadFile(csvContent, `${filename}.csv`, "text/csv")
}

/**
 * Export inventory items to CSV (UTF-8 with BOM), Excel & Google Sheets compatible
 * Column order:
 * SKU, Part Name, Category, Brand, Compatible Devices, Supplier, Location,
 * Quantity, Min Stock, Stock Status, Cost (AED), Price (AED), Profit (AED), Margin (%), Last Updated
 */
export function exportInventoryCSV(parts: any[]): void {
    const headers = [
        "SKU",
        "Part Name",
        "Category",
        "Brand",
        "Compatible Devices",
        "Supplier",
        "Location",
        "Quantity",
        "Min Stock",
        "Stock Status",
        "Cost (AED)",
        "Price (AED)",
        "Profit (AED)",
        "Margin (%)",
        "Last Updated"
    ]

    const asTitleCase = (s: string) => s.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.slice(1))
    const dash = "—"

    const formatPrice = (n: any) => {
        const num = Number(n || 0)
        return num.toFixed(2)
    }
    const formatMargin = (price: any, cost: any) => {
        const p = Number(price || 0)
        const c = Number(cost || 0)
        if (c <= 0) return "0"
        const margin = Math.round(((p - c) / c) * 100)
        return String(margin)
    }
    const formatProfit = (price: any, cost: any) => {
        const p = Number(price || 0)
        const c = Number(cost || 0)
        return (p - c).toFixed(2)
    }
    const formatDate = (d: any) => {
        if (!d) return dash
        let date: Date | null = null
        if (typeof d?.toDate === "function") {
            date = d.toDate()
        } else if (typeof d === "number" || typeof d === "string") {
            date = new Date(d)
        } else if (d?.seconds) {
            date = new Date(d.seconds * 1000)
        }
        if (!date || isNaN(date.getTime())) return dash
        const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
        const Y = date.getFullYear()
        const M = pad(date.getMonth() + 1)
        const D = pad(date.getDate())
        const h = pad(date.getHours())
        const m = pad(date.getMinutes())
        return `${Y}-${M}-${D} ${h}:${m}`
    }
    const joinDevices = (arr: any) => {
        if (!Array.isArray(arr) || arr.length === 0) return dash
        const cleaned = arr.map((x) => String(x).trim()).filter(Boolean)
        return cleaned.length ? cleaned.join(" | ") : dash
    }
    const stockStatus = (qty: any, min: any) => {
        const q = Number(qty || 0)
        const m = Number(min || 0)
        if (q === 0) return "Out Of Stock"
        if (q > m) return "In Stock"
        return "Low Stock"
    }
    const esc = (s: string) => `"${s.replace(/"/g, '""')}"`
    const textCell = (v: any) => esc(v === undefined || v === null || v === "" ? dash : String(v))
    const numCell = (v: any) => String(v)

    const rows = parts.map((p: any) => {
        const sku = p.sku || dash
        const name = p.name || dash
        const category = p.category ? asTitleCase(String(p.category)) : dash
        const brand = p.brand ? asTitleCase(String(p.brand)) : dash
        const devices = joinDevices(p.compatibleDevices)
        const supplier = p.supplier || dash
        const location = p.location || dash
        const quantity = Number(p.quantity || 0)
        const minStock = Number(p.minStock || p.minQuantity || 0)
        const status = stockStatus(quantity, minStock)
        const cost = formatPrice(p.cost ?? p.costPrice)
        const price = formatPrice(p.price)
        const profit = formatProfit(p.price, p.cost ?? p.costPrice)
        const margin = formatMargin(p.price, p.cost ?? p.costPrice)
        const updated = formatDate(p.updatedAt)

        const ordered = [
            textCell(sku),
            textCell(name),
            textCell(category),
            textCell(brand),
            textCell(devices),
            textCell(supplier),
            textCell(location),
            numCell(quantity),
            numCell(minStock),
            textCell(status),
            numCell(cost),
            numCell(price),
            numCell(profit),
            numCell(margin),
            textCell(updated),
        ]
        return ordered.join(",")
    })

    const bom = "\uFEFF"
    const csvContent = bom + [headers.join(","), ...rows].join("\r\n")

    const pad = (n: number) => (n < 10 ? `0${n}` : String(n))
    const now = new Date()
    const filename = `inventory_export_${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}.csv`

    downloadFile(csvContent, filename, "text/csv;charset=utf-8;")
}
/**
 * Helper to download file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
}

/**
 * Generate summary stats for dashboard
 */
export function generateStats(orders: any[]) {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1)

    const todayOrders = orders.filter(o => {
        const created = o.createdAt?.toDate?.() || new Date(o.createdAt)
        return created >= today
    })

    const monthOrders = orders.filter(o => {
        const created = o.createdAt?.toDate?.() || new Date(o.createdAt)
        return created >= thisMonth
    })

    const completed = orders.filter(o => o.status === "completed")
    const totalRevenue = completed.reduce((sum, o) => sum + Number(o.totalCost || o.price || 0), 0)

    return {
        totalOrders: orders.length,
        todayOrders: todayOrders.length,
        monthOrders: monthOrders.length,
        completedOrders: completed.length,
        totalRevenue,
        averageOrderValue: completed.length > 0 ? totalRevenue / completed.length : 0
    }
}
