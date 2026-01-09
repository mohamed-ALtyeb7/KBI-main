import { Timestamp } from "firebase/firestore";

export type UserRole = "admin" | "technician" | "customer" | "super_admin";

export type OrderStatus = "pending" | "assigned" | "accepted" | "in_progress" | "on_way" | "completed" | "cancelled";

export interface User {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  phone?: string;
  address?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerAddress?: string;
  
  technicianId?: string;
  technicianName?: string;
  assignedTechnicianId?: string;
  assignedTechnicianName?: string;
  assignedAt?: Timestamp;
  
  device: string;
  deviceBrand?: string;
  deviceModel?: string;
  issue: string;
  description?: string;
  
  status: OrderStatus;
  priority?: "low" | "medium" | "high";

  price: number;
  estimatedDuration?: string;

  location?: string;
  scheduledDate?: Timestamp;
  completedDate?: Timestamp;

  images?: string[]; // Storage URLs
  notes?: any;

  isOverdue?: boolean;
  
  proposedPrice?: number | null; // legacy single price
  // Enhanced proposal
  proposedPriceMin?: number | null;
  proposedPriceMax?: number | null;
  proposedBreakdown?: {
    labor?: number | null;
    parts?: number | null;
    inspection?: number | null;
  } | null;
  proposedDurationMinutes?: number | null;
  proposedArrivalETA?: string | Timestamp | null;
  proposalNote?: string | null;
  proposalMediaUrls?: string[] | null;
  proposedByTechnicianId?: string | null;
  proposedAt?: Timestamp | null;
  proposedExpiresAt?: Timestamp | null;
  
  approvedPrice?: number | null;
  approvedDurationMinutes?: number | null;
  approvedArrivalETA?: string | Timestamp | null;
  approvedByAdminId?: string | null;
  approvedAt?: Timestamp | null;
  
  // Counter-offer (Super Admin)
  counterPrice?: number | null;
  counterDurationMinutes?: number | null;
  counterArrivalETA?: string | Timestamp | null;
  counterByAdminId?: string | null;
  counterAt?: Timestamp | null;
  
  pricingStatus?: "none" | "proposed" | "countered" | "re_accepted" | "approved" | "rejected";

  assignmentHistory?: Array<{
    technicianId: string;
    technicianName?: string;
    assignedAt: Timestamp;
  }>;
  auditLog?: Array<{
    action: string;
    by: string;
    role: UserRole;
    at: Timestamp;
    note?: string;
  }>;

  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Technician {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  
  specialization?: string[];
  experience?: string;
  rating?: number;
  totalJobs?: number;
  
  isAvailable: boolean;
  currentLocation?: string;
  
  profileImage?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Device {
  id: string;
  brand: string;
  model: string;
  category: "phone" | "tablet" | "laptop" | "desktop" | "other";
  commonIssues?: string[];
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CorporateRequest {
  id: string;
  companyName: string;
  contactPerson: string;
  email: string;
  phone: string;
  message: string;
  
  status: "pending" | "contacted" | "closed";
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Notification {
  id: string;
  userId: string;
  role: UserRole;
  
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  
  read: boolean;
  link?: string;
  
  createdAt: Timestamp;
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  
  quantity: number;
  minQuantity: number;
  
  price: number;
  supplier?: string;
  
  sku?: string;
  description?: string;
  
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
