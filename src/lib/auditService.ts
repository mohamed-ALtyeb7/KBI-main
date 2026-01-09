/**
 * Audit Service for logging admin actions
 */

import { collection, addDoc, query, where, orderBy, getDocs, Timestamp, limit } from "firebase/firestore"
import { db } from "@/lib/firebaseConfig"

export interface AuditLog {
    id?: string
    action: string
    category: "order" | "technician" | "inventory" | "settings" | "auth" | "system"
    userId: string
    userEmail: string
    targetId?: string
    targetType?: string
    details?: Record<string, any>
    ipAddress?: string
    timestamp: Date
}

/**
 * Log an admin action
 */
export async function logAction(
    action: string,
    category: AuditLog["category"],
    userId: string,
    userEmail: string,
    options?: {
        targetId?: string
        targetType?: string
        details?: Record<string, any>
    }
): Promise<void> {
    try {
        await addDoc(collection(db, "audit_logs"), {
            action,
            category,
            userId,
            userEmail,
            targetId: options?.targetId || null,
            targetType: options?.targetType || null,
            details: options?.details || null,
            timestamp: Timestamp.now()
        })
    } catch (error) {
        console.error("Failed to log audit action:", error)
    }
}

/**
 * Get audit logs with filters
 */
export async function getAuditLogs(filters?: {
    category?: AuditLog["category"]
    userId?: string
    startDate?: Date
    endDate?: Date
    limitCount?: number
}): Promise<AuditLog[]> {
    try {
        const q = query(
            collection(db, "audit_logs"),
            orderBy("timestamp", "desc"),
            limit(filters?.limitCount || 100)
        )

        // Note: Firestore requires composite indexes for multiple where clauses
        // For production, create necessary indexes

        const snapshot = await getDocs(q)
        return snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp.toDate()
        })) as AuditLog[]
    } catch (error) {
        console.error("Failed to fetch audit logs:", error)
        return []
    }
}

/**
 * Predefined action types for consistency
 */
export const AuditActions = {
    // Orders
    ORDER_CREATED: "order_created",
    ORDER_UPDATED: "order_updated",
    ORDER_DELETED: "order_deleted",
    ORDER_ASSIGNED: "order_assigned",
    ORDER_STATUS_CHANGED: "order_status_changed",

    // Technicians
    TECHNICIAN_CREATED: "technician_created",
    TECHNICIAN_UPDATED: "technician_updated",
    TECHNICIAN_DELETED: "technician_deleted",

    // Inventory
    INVENTORY_ADDED: "inventory_added",
    INVENTORY_UPDATED: "inventory_updated",
    INVENTORY_DELETED: "inventory_deleted",

    // Auth
    USER_LOGIN: "user_login",
    USER_LOGOUT: "user_logout",
    PASSWORD_CHANGED: "password_changed",
    REQUEST_PASSWORD_RESET: "request_password_reset",
    OTP_SENT: "otp_sent",
    OTP_VERIFIED: "otp_verified",
    PASSWORD_RESET_SUCCESS: "password_reset_success",
    PASSWORD_RESET_FAILED: "password_reset_failed",

    // Settings
    SETTINGS_UPDATED: "settings_updated",

    // System
    EXPORT_GENERATED: "export_generated",
    EMAIL_SENT: "email_sent"
} as const
