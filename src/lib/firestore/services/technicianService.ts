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
    onSnapshot,
    serverTimestamp,
} from "firebase/firestore";
import { db, isMockMode } from "@/lib/firebaseConfig";
import { Technician } from "../schema";

export async function getTechnicianIdFromUser(user: { uid: string; email?: string }): Promise<string | null> {
    try {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const data = userSnap.data() as any;
        let id: string | null = data?.technicianId || null;
        if (!id) {
            const byUid = query(collection(db, "technicians"), where("uid", "==", user.uid));
            const uidSnap = await getDocs(byUid);
            if (!uidSnap.empty) {
                id = uidSnap.docs[0].id;
            } else if (user.email) {
                const byEmail = query(collection(db, "technicians"), where("email", "==", user.email));
                const emailSnap = await getDocs(byEmail);
                if (!emailSnap.empty) {
                    id = emailSnap.docs[0].id;
                }
            }
        }
        return id;
    } catch (error) {
        console.error("Resolve technicianId error:", error);
        return null;
    }
}

/**
 * Create a new technician profile
 */
export async function createTechnician(techData: Omit<Technician, "id" | "createdAt" | "updatedAt">): Promise<string> {
    try {
        const docRef = await addDoc(collection(db, "technicians"), {
            ...techData,
            totalJobs: 0,
            rating: 0,
            isAvailable: true,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });
        return docRef.id;
    } catch (error: any) {
        console.error("Create technician error:", error);
        throw new Error(error.message || "Failed to create technician");
    }
}

/**
 * Get a single technician by ID
 */
export async function getTechnician(techId: string): Promise<Technician | null> {
    try {
        const docSnap = await getDoc(doc(db, "technicians", techId));
        if (!docSnap.exists()) {
            return null;
        }
        return {
            id: docSnap.id,
            ...docSnap.data(),
        } as Technician;
    } catch (error: any) {
        console.error("Get technician error:", error);
        return null;
    }
}

/**
 * Get technician by user ID
 */
export async function getTechnicianByUserId(userId: string): Promise<Technician | null> {
    try {
        const q = query(collection(db, "technicians"), where("userId", "==", userId));
        const querySnapshot = await getDocs(q);

        if (querySnapshot.empty) {
            return null;
        }

        const doc = querySnapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data(),
        } as Technician;
    } catch (error: any) {
        console.error("Get technician by user ID error:", error);
        return null;
    }
}

/**
 * Update technician profile
 */
export async function updateTechnician(techId: string, updates: Partial<Technician>): Promise<void> {
    try {
        await updateDoc(doc(db, "technicians", techId), {
            ...updates,
            updatedAt: serverTimestamp(),
        });
    } catch (error: any) {
        console.error("Update technician error:", error);
        throw new Error(error.message || "Failed to update technician");
    }
}

/**
 * Delete technician
 */
export async function deleteTechnician(techId: string): Promise<void> {
    try {
        await deleteDoc(doc(db, "technicians", techId));
    } catch (error: any) {
        console.error("Delete technician error:", error);
        throw new Error(error.message || "Failed to delete technician");
    }
}

/**
 * Get all technicians
 */
export async function getAllTechnicians(): Promise<Technician[]> {
    try {
        const querySnapshot = await getDocs(collection(db, "technicians"));
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Technician[];
    } catch (error: any) {
        console.error("Get all technicians error:", error);
        return [];
    }
}

/**
 * Get available technicians
 */
export async function getAvailableTechnicians(): Promise<Technician[]> {
    try {
        const q = query(collection(db, "technicians"), where("isAvailable", "==", true));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Technician[];
    } catch (error: any) {
        console.error("Get available technicians error:", error);
        return [];
    }
}

/**
 * Update technician availability
 */
export async function updateTechnicianAvailability(techId: string, isAvailable: boolean): Promise<void> {
    try {
        await updateTechnician(techId, { isAvailable });
    } catch (error: any) {
        console.error("Update technician availability error:", error);
        throw new Error(error.message || "Failed to update availability");
    }
}

/**
 * Subscribe to all technicians in real-time
 */
export function subscribeToTechnicians(callback: (technicians: Technician[]) => void): () => void {
    if (typeof window !== "undefined" && isMockMode) {
        callback([]);
        return () => { };
    }
    return onSnapshot(collection(db, "technicians"), (snapshot) => {
        const technicians = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
        })) as Technician[];
        callback(technicians);
    });
}
