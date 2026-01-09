"use client"

import { useMemo } from "react"
import { useT } from "@/components/providers/language-provider"

type InvoiceItem = {
  description: string
  category?: string
  quantity: number
  unitPrice: number
  total: number
}

type Props = {
  order: any
  items: InvoiceItem[]
  invoiceNumber: string
  invoiceDate: string | Date
  language: "en" | "ar" | "both"
  discount?: number
  vatEnabled?: boolean
  vatRate?: number
  warrantyPeriod?: string
  adminNotes?: string
  disclaimerText?: string
}

export function FinalInvoice(props: Props) {
  const t = useT()
  const {
    order,
    items,
    invoiceNumber,
    invoiceDate,
    language,
    discount = 0,
    vatEnabled = false,
    vatRate = 0,
    warrantyPeriod = "3 months",
    adminNotes = "",
    disclaimerText = t("Payment due upon completion of repair.")
  } = props

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, i) => s + Number(i.total || i.unitPrice * i.quantity), 0)
    const afterDiscount = subtotal - Number(discount || 0)
    const vatAmount = vatEnabled ? afterDiscount * Number(vatRate || 0) : 0
    const finalTotal = afterDiscount + vatAmount
    return { subtotal, vatAmount, finalTotal }
  }, [items, discount, vatEnabled, vatRate])

  const qrData = useMemo(() => {
    const d = `KBI Invoice ${invoiceNumber} | Order ${order?.orderId || order?.id}`
    return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(d)}`
  }, [invoiceNumber, order])

  const Header = () => (
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xl font-bold">KBI</p>
        <p className="text-sm">{t("On-Site Repair Service")}</p>
        <p className="text-sm">Abu Dhabi – UAE</p>
        <p className="text-sm">+971 50 731 3446</p>
      </div>
      <div className="text-right">
        <p className="font-semibold">{t("Invoice Number")}: {invoiceNumber}</p>
        <p className="text-sm">{t("Order ID")}: {order?.orderId || order?.id}</p>
        <p className="text-sm">{t("Invoice Date")}: {typeof invoiceDate === "string" ? invoiceDate : new Date(invoiceDate).toLocaleDateString()}</p>
      </div>
    </div>
  )

  const CustomerDevice = () => (
    <div className="grid grid-cols-2 gap-4">
      <div className="space-y-1">
        <p className="text-sm font-semibold">{t("Customer Information")}</p>
        <p className="text-sm">{t("Customer Name")}: {order?.customerName}</p>
        <p className="text-sm">{t("Phone Number")}: {order?.customerPhone}</p>
        <p className="text-sm">{t("Service Address")}: {order?.location || order?.address || ""}</p>
      </div>
      <div className="space-y-1">
        <p className="text-sm font-semibold">{t("Device Information")}</p>
        <p className="text-sm">{t("Device Type")}: {order?.deviceType || order?.device}</p>
        <p className="text-sm">{t("Brand")}: {order?.brand}</p>
        <p className="text-sm">{t("Model")}: {order?.model}</p>
        <p className="text-sm">{t("Serial Number (optional)")}: {order?.serial || ""}</p>
      </div>
    </div>
  )

  const ItemsTable = () => (
    <div className="mt-4">
      <div className="grid grid-cols-12 gap-2 border-b py-2 text-xs font-semibold">
        <div className="col-span-5">{t("Description")}</div>
        <div className="col-span-2">{t("Type")}</div>
        <div className="col-span-1 text-right">{t("Qty")}</div>
        <div className="col-span-2 text-right">{t("Unit Price (AED)")}</div>
        <div className="col-span-2 text-right">{t("Total (AED)")}</div>
      </div>
      {items.map((i, idx) => (
        <div key={idx} className="grid grid-cols-12 gap-2 border-b py-2 text-sm">
          <div className="col-span-5">{i.description}</div>
          <div className="col-span-2">{i.category || ""}</div>
          <div className="col-span-1 text-right">{i.quantity}</div>
          <div className="col-span-2 text-right">{Number(i.unitPrice).toFixed(2)}</div>
          <div className="col-span-2 text-right">{Number(i.total || i.unitPrice * i.quantity).toFixed(2)}</div>
        </div>
      ))}
    </div>
  )

  const Summary = () => (
    <div className="mt-4 w-full flex justify-end">
      <div className="w-64 space-y-1 text-sm">
        <div className="flex justify-between"><span>{t("Subtotal")}</span><span>{totals.subtotal.toFixed(2)}</span></div>
        <div className="flex justify-between"><span>{t("Discount")}</span><span>{Number(discount || 0).toFixed(2)}</span></div>
        <div className="flex justify-between"><span>{t("VAT")}</span><span>{totals.vatAmount.toFixed(2)}</span></div>
        <div className="flex justify-between font-semibold"><span>{t("Final Total Price (AED)")}</span><span>{totals.finalTotal.toFixed(2)}</span></div>
      </div>
    </div>
  )

  const Notes = () => (
    <div className="mt-6 grid grid-cols-2 gap-4 text-sm">
      <div>
        <p className="font-semibold mb-1">{t("Warranty & Notes")}</p>
        <p>{t("Warranty Period")}: {warrantyPeriod}</p>
        {adminNotes ? <p className="mt-2">{t("Admin Notes")}: {adminNotes}</p> : null}
      </div>
      <div className="text-right">
        <img src={qrData} alt="QR" className="inline-block" />
      </div>
    </div>
  )

  const Footer = () => (
    <div className="mt-6 pt-4 border-t text-sm">
      <p>{disclaimerText}</p>
      <p className="mt-1">{t("Thank you for choosing KBI.")}</p>
    </div>
  )

  const Block = () => (
    <div className="bg-white text-black p-6 rounded shadow-sm">
      <Header />
      <div className="mt-6">
        <CustomerDevice />
      </div>
      <ItemsTable />
      <Summary />
      <Notes />
      <Footer />
      <div className="mt-6 grid grid-cols-2 gap-6">
        <div className="border-t pt-6">
          <p className="text-sm font-semibold">{t("Customer Signature")}</p>
          <div className="h-16 border rounded"></div>
        </div>
        <div className="border-t pt-6">
          <p className="text-sm font-semibold">{t("Technician Signature")}</p>
          <div className="h-16 border rounded"></div>
        </div>
      </div>
    </div>
  )

  if (language === "both") {
    return (
      <div className="space-y-8">
        <Block />
        <div dir="rtl" className="bg-white text-black p-6 rounded shadow-sm">
          <Header />
          <div className="mt-6">
            <CustomerDevice />
          </div>
          <ItemsTable />
          <Summary />
          <Notes />
          <Footer />
          <div className="mt-6 grid grid-cols-2 gap-6">
            <div className="border-t pt-6">
              <p className="text-sm font-semibold">{t("Customer Signature")}</p>
              <div className="h-16 border rounded"></div>
            </div>
            <div className="border-t pt-6">
              <p className="text-sm font-semibold">{t("Technician Signature")}</p>
              <div className="h-16 border rounded"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (language === "ar") {
    return (
      <div dir="rtl" className="bg-white text-black p-6 rounded shadow-sm">
        <Header />
        <div className="mt-6">
          <CustomerDevice />
        </div>
        <ItemsTable />
        <Summary />
        <Notes />
        <Footer />
        <div className="mt-6 grid grid-cols-2 gap-6">
          <div className="border-t pt-6">
            <p className="text-sm font-semibold">{t("Customer Signature")}</p>
            <div className="h-16 border rounded"></div>
          </div>
          <div className="border-t pt-6">
            <p className="text-sm font-semibold">{t("Technician Signature")}</p>
            <div className="h-16 border rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return <Block />
}

