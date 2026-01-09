import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut as firebaseSignOut,
    sendPasswordResetEmail,
    User as FirebaseUser,
    updateProfile,
    reauthenticateWithCredential,
    EmailAuthProvider,
    updatePassword
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "@/lib/firebaseConfig";
import { User, UserRole } from "../schema";
import { logAction, AuditActions } from "@/lib/auditService";

export interface SignUpData {
    email: string;
    password: string;
    name: string;
    role: UserRole;
    phone?: string;
    address?: string;
}

export interface SignInData {
    email: string;
    password: string;
}

/**
 * Sign up a new user with email/password and create their profile in Firestore
 */
export async function signUp(data: SignUpData): Promise<User> {
    try {
        // Create Firebase Auth user
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );

        const firebaseUser = userCredential.user;

        // Update display name in Auth
        await updateProfile(firebaseUser, {
            displayName: data.name
        });

        // Create user document in Firestore
        const userDoc: Omit<User, "uid"> = {
            email: data.email,
            name: data.name,
            role: data.role,
            phone: data.phone,
            address: data.address,
            createdAt: serverTimestamp() as any,
            updatedAt: serverTimestamp() as any,
        };

        await setDoc(doc(db, "users", firebaseUser.uid), userDoc);

        // Return complete user object
        return {
            uid: firebaseUser.uid,
            ...userDoc,
        };
    } catch (error: any) {
        console.error("Sign up error:", error);
        throw new Error(error.message || "Failed to sign up");
    }
}

/**
 * Sign in with email and password
 */
export async function signIn(data: SignInData): Promise<FirebaseUser> {
    try {
        const userCredential = await signInWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );
        return userCredential.user;
    } catch (error: any) {
        console.error("Sign in error:", error);
        throw new Error(error.message || "Failed to sign in");
    }
}

/**
 * Sign out the current user
 */
export async function signOut(): Promise<void> {
    try {
        await firebaseSignOut(auth);
    } catch (error: any) {
        console.error("Sign out error:", error);
        throw new Error(error.message || "Failed to sign out");
    }
}

/**
 * Send password reset email
 */
export async function resetPassword(email: string): Promise<void> {
    try {
        await sendPasswordResetEmail(auth, email);
    } catch (error: any) {
        console.error("Password reset error:", error);
        throw new Error(error.message || "Failed to send password reset email");
    }
}

/**
 * Get user data from Firestore
 */
export async function getUserData(uid: string): Promise<User | null> {
    try {
        const userDoc = await getDoc(doc(db, "users", uid));
        if (!userDoc.exists()) {
            return null;
        }
        return {
            uid: userDoc.id,
            ...userDoc.data(),
        } as User;
    } catch (error: any) {
        console.error("Get user data error:", error);
        return null;
    }
}

/**
 * Get the role of the current user
 */
export async function getUserRole(uid: string): Promise<UserRole | null> {
    const userData = await getUserData(uid);
    return userData?.role || null;
}

/**
 * Check if current user has a specific role
 */
export async function hasRole(uid: string, role: UserRole): Promise<boolean> {
    const userRole = await getUserRole(uid);
    return userRole === role;
}

/**
 * Check if current user is admin
 */
export async function isAdmin(uid: string): Promise<boolean> {
    return hasRole(uid, "admin");
}

/**
 * Check if current user is technician
 */
export async function isTechnician(uid: string): Promise<boolean> {
    return hasRole(uid, "technician");
}

/**
 * Check if current user is customer
 */
export async function isCustomer(uid: string): Promise<boolean> {
    return hasRole(uid, "customer");
}

export async function changePassword(currentPassword: string, newPassword: string): Promise<void> {
    const user = auth.currentUser;
    if (!user || !user.email) {
        throw new Error("Not authenticated");
    }
    const credential = EmailAuthProvider.credential(user.email, currentPassword);
    await reauthenticateWithCredential(user, credential);
    await updatePassword(user, newPassword);
    await logAction(AuditActions.PASSWORD_CHANGED, "auth", user.uid, user.email || "");
}
