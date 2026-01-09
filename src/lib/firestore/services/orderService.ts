import {
    collection,
    doc,
    addDoc,
    updateDoc,
    deleteDoc,
    getDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    serverTimestamp,
    Timestamp,
} from "firebase/firestore";
import { db, isMockMode } from "@/lib/firebaseConfig";
import { Order, OrderStatus, UserRole } from "../schema";
import { createNotification } from "./notificationService";

/**
 * Create a new order
 */
export async function createOrder(orderData: Omit<Order, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, "orders"), {
            ...orderData,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error: any) {
        console.error("Create order error:", error);
        throw new Error(error.message || "Failed to create order");
    }
}

/**
 * Get a single order by ID
 */
export async function getOrder(orderId: string): Promise<Order | null> {
    try {
        const docSnap = await getDoc(doc(db, "orders", orderId));
        if (!docSnap.exists()) {
            return null;
        }
        return {
            id: docSnap.id,
            ...docSnap.data(),
        } as Order;
    } catch (error: any) {
        console.error("Get order error:", error);
        return null;
    }
}

/**
 * Update an existing order
 */
export async function updateOrder(orderId: string, updates: Partial<Order>): Promise<void> {
    try {
        await updateDoc(doc(db, "orders", orderId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error: any) {
        console.error("Update order error:", error);
        throw new Error(error.message || "Failed to update order");
    }
}

/**
 * Delete an order
 */
export async function deleteOrder(orderId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "orders", orderId));
    } catch (error: any) {
        console.error("Delete order error:", error);
        throw new Error(error.message || "Failed to delete order");
    }
}

/**
 * Get all orders
 */
export async function getAllOrders(): Promise<Order[]> {
    try {
        const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Order[];
    } catch (error: any) {
        console.error("Get all orders error:", error);
        return [];
    }
}

/**
 * Get orders by status
 */
export async function getOrdersByStatus(status: OrderStatus): Promise<Order[]> {
    try {
        const q = query(
            collection(db, "orders"),
            where("status", "==", status),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Order[];
    } catch (error: any) {
        console.error("Get orders by status error:", error);
        return [];
    }
}

/**
 * Get orders for a specific technician
 */
export async function getOrdersByTechnician(technicianId: string): Promise<Order[]> {
    try {
        const q = query(
            collection(db, "orders"),
            where("technicianId", "==", technicianId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Order[];
    } catch (error: any) {
        console.error("Get orders by technician error:", error);
        return [];
    }
}

/**
 * Get orders for a specific customer
 */
export async function getOrdersByCustomer(customerId: string): Promise<Order[]> {
    try {
        const q = query(
            collection(db, "orders"),
            where("customerId", "==", customerId),
            orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Order[];
    } catch (error: any) {
        console.error("Get orders by customer error:", error);
        return [];
    }
}

/**
 * Assign order to a technician
 */
export async function assignOrderToTechnician(
    orderId: string,
    technicianId: string,
    technicianName: string
): Promise<void> {
    try {
        await updateOrder(orderId, {
            technicianId,
            technicianName,
            assignedTechnicianId: technicianId,
            assignedTechnicianName: technicianName,
            assignedAt: serverTimestamp() as any,
            status: "assigned",
            assignmentHistory: (undefined as any),
        });
    } catch (error: any) {
        console.error("Assign order error:", error);
        throw new Error(error.message || "Failed to assign order");
    }
}

/**
 * Update order status
 */
export async function updateOrderStatus(orderId: string, status: OrderStatus): Promise<void> {
    try {
        const updates: Partial<Order> = { status };

        // If completing the order, add completed date
        if (status === "completed") {
            updates.completedDate = Timestamp.now() as any;
        }

        await updateOrder(orderId, updates);
    } catch (error: any) {
        console.error("Update order status error:", error);
        throw new Error(error.message || "Failed to update order status");
    }
}

/**
 * Technician proposes pricing and duration
 */
export interface OrderProposalParams {
    proposedPriceMin?: number | null;
    proposedPriceMax?: number | null;
    proposedBreakdown?: { labor?: number | null; parts?: number | null; inspection?: number | null } | null;
    proposedDurationMinutes: number;
    proposedArrivalETA?: string | null;
    proposalNote?: string;
    proposalMediaUrls?: string[];
    proposedByTechnicianId: string;
}
export async function proposeOrderPricing(orderId: string, params: OrderProposalParams): Promise<void> {
    const totalFromBreakdown = params.proposedBreakdown
        ? Number(params.proposedBreakdown.labor || 0) + Number(params.proposedBreakdown.parts || 0) + Number(params.proposedBreakdown.inspection || 0)
        : null;
    const totalFromRange = params.proposedPriceMax ?? params.proposedPriceMin ?? null;
    const recommendedTotal = (totalFromBreakdown ?? totalFromRange) ?? null;
    const ttlMs = 48 * 60 * 60 * 1000;
    const expiresAt = Timestamp.fromDate(new Date(Date.now() + ttlMs)) as any;
    const updates: Partial<Order> = {
        proposedPrice: params.proposedPriceMax ?? params.proposedPriceMin ?? null,
        proposedPriceMin: params.proposedPriceMin ?? null,
        proposedPriceMax: params.proposedPriceMax ?? null,
        proposedBreakdown: params.proposedBreakdown ?? null,
        proposedDurationMinutes: params.proposedDurationMinutes,
        proposedArrivalETA: params.proposedArrivalETA ?? null,
        proposalNote: params.proposalNote || null,
        proposalMediaUrls: params.proposalMediaUrls || null,
        proposedByTechnicianId: params.proposedByTechnicianId,
        proposedAt: serverTimestamp() as any,
        proposedExpiresAt: expiresAt,
        pricingStatus: "proposed",
    };
    await updateOrder(orderId, updates);
    try {
        const baseMessage = `Technician proposed pricing for order ${orderId}` + (recommendedTotal != null ? ` • AED ${recommendedTotal}` : "");
        await createNotification({
            type: "system",
            title: "Pricing Proposed",
            message: baseMessage,
            role: "admin",
            orderId,
            link: `/admin/orders`
        });
        if (recommendedTotal != null && recommendedTotal > 500) {
            await createNotification({
                type: "system",
                title: "High-Value Proposal",
                message: `Order ${orderId} requires Super Admin review • AED ${recommendedTotal}`,
                role: "super_admin",
                orderId,
                link: `/admin/orders`
            });
        } else if (recommendedTotal != null && recommendedTotal < 200) {
            await createNotification({
                type: "system",
                title: "Auto-Approval Candidate",
                message: `Order ${orderId} proposed under AED 200 • Consider auto-approve`,
                role: "admin",
                orderId,
                link: `/admin/orders`
            });
        }
    } catch (_e) { void _e }
}

/**
 * Super Admin approves pricing
 */
export async function approveOrderPricing(orderId: string, adminUid: string): Promise<void> {
    const snap = await getDoc(doc(db, "orders", orderId));
    if (!snap.exists()) return;
    const data = snap.data() as any;
    const updates: Partial<Order> = {
        approvedPrice: (data.proposedBreakdown
            ? Number(data.proposedBreakdown.labor || 0) + Number(data.proposedBreakdown.parts || 0) + Number(data.proposedBreakdown.inspection || 0)
            : (data.proposedPriceMax ?? data.proposedPrice ?? null)),
        approvedDurationMinutes: data.proposedDurationMinutes ?? null,
        approvedArrivalETA: data.proposedArrivalETA ?? null,
        approvedByAdminId: adminUid,
        approvedAt: serverTimestamp() as any,
        pricingStatus: "approved",
    };
    await updateOrder(orderId, updates);
    try {
        await createNotification({
            type: "system",
            title: "Pricing Approved",
            message: `Pricing approved for order ${orderId}`,
            role: "technician",
            orderId,
            link: `/technician/orders`
        });
    } catch (_e) { void _e }
}

/**
 * Super Admin rejects pricing
 */
export async function rejectOrderPricing(orderId: string): Promise<void> {
    const updates: Partial<Order> = {
        pricingStatus: "rejected",
    };
    await updateOrder(orderId, updates);
    try {
        await createNotification({
            type: "system",
            title: "Pricing Rejected",
            message: `Pricing rejected for order ${orderId}`,
            role: "technician",
            orderId,
            link: `/technician/orders`
        });
    } catch (_e) { void _e }
}

/**
 * Super Admin counter-offer
 */
export async function counterOfferPricing(orderId: string, adminUid: string, params: {
    counterPrice?: number | null;
    counterDurationMinutes?: number | null;
    counterArrivalETA?: string | null;
    counterNote?: string | null;
}): Promise<void> {
    const updates: Partial<Order> = {
        counterPrice: params.counterPrice ?? null,
        counterDurationMinutes: params.counterDurationMinutes ?? null,
        counterArrivalETA: params.counterArrivalETA ?? null,
        approvedByAdminId: adminUid,
        counterByAdminId: adminUid,
        counterAt: serverTimestamp() as any,
        pricingStatus: "countered",
        proposalNote: params.counterNote ?? null,
    };
    await updateOrder(orderId, updates);
    try {
        await createNotification({
            type: "system",
            title: "Counter Offer",
            message: `Counter offer posted for order ${orderId}`,
            role: "technician",
            orderId,
            link: `/technician/orders`
        });
    } catch (_e) { void _e }
}

/**
 * Technician accepts assignment
 */
export async function acceptAssignedOrder(orderId: string, technicianUid: string): Promise<void> {
    const ref = doc(db, "orders", orderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Order not found");
    const data = snap.data() as any;
    if ((data.status !== "assigned") || (data.technicianId && data.technicianId !== technicianUid)) {
        throw new Error("Not allowed to accept");
    }
    await updateOrder(orderId, {
        status: "accepted",
    });
}

/**
 * Technician re-accepts counter-offer
 */
export async function reAcceptCounterOffer(orderId: string, technicianUid: string): Promise<void> {
    const ref = doc(db, "orders", orderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Order not found");
    const data = snap.data() as any;
    if ((data.pricingStatus !== "countered") || (data.technicianId && data.technicianId !== technicianUid)) {
        throw new Error("Not allowed to re-accept");
    }
    await updateOrder(orderId, {
        pricingStatus: "re_accepted",
    });
    try {
        await createNotification({
            type: "system",
            title: "Counter Offer Accepted",
            message: `Technician accepted counter offer for order ${orderId}`,
            role: "admin",
            orderId,
            link: `/admin/orders`
        });
    } catch (_e) { void _e }
}

/**
 * Start work (requires approved pricing)
 */
export async function startWork(orderId: string, technicianUid: string): Promise<void> {
    const ref = doc(db, "orders", orderId);
    const snap = await getDoc(ref);
    if (!snap.exists()) throw new Error("Order not found");
    const data = snap.data() as any;
    if ((data.pricingStatus !== "approved") || (data.technicianId && data.technicianId !== technicianUid)) {
        throw new Error("Cannot start work");
    }
    await updateOrder(orderId, {
        status: "in_progress",
    });
}
/**
 * Subscribe to all orders in real-time
 */
export function subscribeToOrders(callback: (orders: Order[]) => void): () => void {
    if (typeof window !== "undefined" && isMockMode) {
        callback([]);
        return () => undefined;
    }
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));

    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Order[];
        callback(orders);
    });
}

/**
 * Subscribe to orders by technician in real-time
 */
export function subscribeToTechnicianOrders(
    technicianId: string,
    callback: (orders: Order[]) => void
): () => void {
    if (typeof window !== "undefined" && isMockMode) {
        callback([]);
        return () => undefined;
    }
    const q = query(
        collection(db, "orders"),
        where("technicianId", "==", technicianId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Order[];
        callback(orders);
    });
}

/**
 * Subscribe to orders by customer in real-time
 */
export function subscribeToCustomerOrders(
    customerId: string,
    callback: (orders: Order[]) => void
): () => void {
    if (typeof window !== "undefined" && isMockMode) {
        callback([]);
        return () => undefined;
    }
    const q = query(
        collection(db, "orders"),
        where("customerId", "==", customerId),
        orderBy("createdAt", "desc")
    );

    return onSnapshot(q, (snapshot) => {
        const orders = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Order[];
        callback(orders);
    });
}
