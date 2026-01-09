// Customer Loyalty Points Service
import { doc, getDoc, setDoc, updateDoc, increment, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebaseConfig"

export interface LoyaltyAccount {
    customerId: string
    points: number
    tier: "bronze" | "silver" | "gold" | "platinum"
    totalSpent: number
    ordersCompleted: number
    createdAt: any
    updatedAt: any
}

// Points config
export const POINTS_CONFIG = {
    pointsPerAED: 1, // 1 point per AED spent
    tierThresholds: {
        bronze: 0,
        silver: 500,
        gold: 2000,
        platinum: 5000
    },
    tierDiscounts: {
        bronze: 0,
        silver: 5,  // 5% discount
        gold: 10,   // 10% discount
        platinum: 15 // 15% discount
    },
    bonusPoints: {
        firstOrder: 100,
        referral: 200,
        review: 50
    }
}

export const getTier = (points: number): LoyaltyAccount["tier"] => {
    if (points >= POINTS_CONFIG.tierThresholds.platinum) return "platinum"
    if (points >= POINTS_CONFIG.tierThresholds.gold) return "gold"
    if (points >= POINTS_CONFIG.tierThresholds.silver) return "silver"
    return "bronze"
}

export const getTierColor = (tier: LoyaltyAccount["tier"]) => {
    switch (tier) {
        case "platinum": return "bg-gradient-to-r from-slate-400 to-slate-600 text-white"
        case "gold": return "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
        case "silver": return "bg-gradient-to-r from-gray-300 to-gray-400 text-black"
        default: return "bg-gradient-to-r from-orange-600 to-orange-700 text-white"
    }
}

export const getOrCreateLoyaltyAccount = async (customerId: string): Promise<LoyaltyAccount> => {
    const ref = doc(db, "loyalty", customerId)
    const snap = await getDoc(ref)

    if (snap.exists()) {
        return snap.data() as LoyaltyAccount
    }

    // Create new account
    const newAccount: LoyaltyAccount = {
        customerId,
        points: POINTS_CONFIG.bonusPoints.firstOrder, // Welcome bonus
        tier: "bronze",
        totalSpent: 0,
        ordersCompleted: 0,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
    }

    await setDoc(ref, newAccount)
    return newAccount
}

export const addPoints = async (
    customerId: string,
    amount: number,
    reason: string
): Promise<number> => {
    const ref = doc(db, "loyalty", customerId)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
        await getOrCreateLoyaltyAccount(customerId)
    }

    const currentData = (await getDoc(ref)).data() as LoyaltyAccount
    const newPoints = currentData.points + amount
    const newTier = getTier(newPoints)

    await updateDoc(ref, {
        points: increment(amount),
        tier: newTier,
        updatedAt: Timestamp.now()
    })

    // Log points transaction
    await setDoc(doc(db, "loyalty", customerId, "transactions", Date.now().toString()), {
        amount,
        reason,
        balanceBefore: currentData.points,
        balanceAfter: newPoints,
        createdAt: Timestamp.now()
    })

    return newPoints
}

export const recordOrderCompletion = async (
    customerId: string,
    orderAmount: number
): Promise<{ points: number; tier: LoyaltyAccount["tier"]; discount: number }> => {
    const pointsEarned = Math.floor(orderAmount * POINTS_CONFIG.pointsPerAED)

    const ref = doc(db, "loyalty", customerId)
    const snap = await getDoc(ref)

    if (!snap.exists()) {
        await getOrCreateLoyaltyAccount(customerId)
    }

    const currentData = (await getDoc(ref)).data() as LoyaltyAccount
    const newPoints = currentData.points + pointsEarned
    const newTier = getTier(newPoints)

    await updateDoc(ref, {
        points: increment(pointsEarned),
        totalSpent: increment(orderAmount),
        ordersCompleted: increment(1),
        tier: newTier,
        updatedAt: Timestamp.now()
    })

    return {
        points: newPoints,
        tier: newTier,
        discount: POINTS_CONFIG.tierDiscounts[newTier]
    }
}

export const redeemPoints = async (
    customerId: string,
    points: number
): Promise<boolean> => {
    const ref = doc(db, "loyalty", customerId)
    const snap = await getDoc(ref)

    if (!snap.exists()) return false

    const currentData = snap.data() as LoyaltyAccount
    if (currentData.points < points) return false

    await updateDoc(ref, {
        points: increment(-points),
        updatedAt: Timestamp.now()
    })

    return true
}
