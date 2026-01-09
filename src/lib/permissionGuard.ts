import { TechnicianPermissions } from "@/lib/types"

/**
 * Default permissions for technicians
 */
export const defaultPermissions: TechnicianPermissions = {
    viewOrders: true,
    editOrders: true,
    updateStatus: true,
    uploadAttachments: true,
    chat: true,
    viewCorporateRequests: false
}

/**
 * Check if a technician has a specific permission
 */
export function hasPermission(
    permissions: TechnicianPermissions | undefined,
    permission: keyof TechnicianPermissions
): boolean {
    if (!permissions) {
        return defaultPermissions[permission]
    }
    return permissions[permission] ?? defaultPermissions[permission]
}

/**
 * Check multiple permissions at once
 */
export function hasAllPermissions(
    permissions: TechnicianPermissions | undefined,
    requiredPermissions: (keyof TechnicianPermissions)[]
): boolean {
    return requiredPermissions.every(perm => hasPermission(permissions, perm))
}

/**
 * Check if technician has at least one of the permissions
 */
export function hasAnyPermission(
    permissions: TechnicianPermissions | undefined,
    requiredPermissions: (keyof TechnicianPermissions)[]
): boolean {
    return requiredPermissions.some(perm => hasPermission(permissions, perm))
}

/**
 * Permission labels for UI display
 */
export const permissionLabels: Record<keyof TechnicianPermissions, string> = {
    viewOrders: "View Orders",
    editOrders: "Edit Orders",
    updateStatus: "Update Status",
    uploadAttachments: "Upload Attachments",
    chat: "Chat with Customers",
    viewCorporateRequests: "View Corporate Requests"
}

/**
 * Get human-readable permission label
 */
export function getPermissionLabel(permission: keyof TechnicianPermissions): string {
    return permissionLabels[permission] || permission
}
