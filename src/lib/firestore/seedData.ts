import {
    collection,
    doc,
    setDoc,
    serverTimestamp,
    Timestamp
} from "firebase/firestore";
import {
    createUserWithEmailAndPassword,
    updateProfile
} from "firebase/auth";
import { db, auth } from "@/lib/firebaseConfig";
import { User, Order, Technician, InventoryItem, CorporateRequest } from "./schema";

// Seed Admin User
export async function seedAdminUser() {
    const adminEmail = "admin@kbi.com";
    const adminPassword = "Admin@123";

    try {
        // Create auth user
        const userCredential = await createUserWithEmailAndPassword(auth, adminEmail, adminPassword);
        const uid = userCredential.user.uid;

        await updateProfile(userCredential.user, {
            displayName: "KBI Admin"
        });

        // Create user document
        await setDoc(doc(db, "users", uid), {
            email: adminEmail,
            name: "KBI Admin",
            role: "admin",
            phone: "+971501234567",
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        });

        console.log("✅ Admin user created:", adminEmail);
        return uid;
    } catch (error: any) {
        if (error.code === "auth/email-already-in-use") {
            console.log("ℹ️ Admin user already exists");
            return null;
        }
        throw error;
    }
}

// Seed Technician Users
export async function seedTechnicians() {
    const technicians = [
        { email: "tech1@kbi.com", password: "Tech@123", name: "Ahmed Hassan", phone: "+971501111111", specialization: ["iPhone", "Samsung"] },
        { email: "tech2@kbi.com", password: "Tech@123", name: "Mohammed Ali", phone: "+971502222222", specialization: ["MacBook", "Laptop"] },
        { email: "tech3@kbi.com", password: "Tech@123", name: "Sara Ibrahim", phone: "+971503333333", specialization: ["iPad", "Tablet"] },
    ];

    for (const tech of technicians) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, tech.email, tech.password);
            const uid = userCredential.user.uid;

            await updateProfile(userCredential.user, { displayName: tech.name });

            // Create user document
            await setDoc(doc(db, "users", uid), {
                email: tech.email,
                name: tech.name,
                role: "technician",
                phone: tech.phone,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            // Create technician profile
            await setDoc(doc(db, "technicians", uid), {
                userId: uid,
                name: tech.name,
                email: tech.email,
                phone: tech.phone,
                specialization: tech.specialization,
                experience: "3+ years",
                rating: 4.5,
                totalJobs: 0,
                isAvailable: true,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            console.log("✅ Technician created:", tech.email);
        } catch (error: any) {
            if (error.code === "auth/email-already-in-use") {
                console.log("ℹ️ Technician already exists:", tech.email);
            } else {
                console.error("❌ Error creating technician:", tech.email, error.message);
            }
        }
    }
}

// Seed Customer Users
export async function seedCustomers() {
    const customers = [
        { email: "customer1@example.com", password: "Customer@123", name: "Sarah Smith", phone: "+971504444444", address: "Downtown Dubai" },
        { email: "customer2@example.com", password: "Customer@123", name: "John Doe", phone: "+971505555555", address: "Business Bay" },
    ];

    for (const customer of customers) {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, customer.email, customer.password);
            const uid = userCredential.user.uid;

            await updateProfile(userCredential.user, { displayName: customer.name });

            await setDoc(doc(db, "users", uid), {
                email: customer.email,
                name: customer.name,
                role: "customer",
                phone: customer.phone,
                address: customer.address,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });

            console.log("✅ Customer created:", customer.email);
        } catch (error: any) {
            if (error.code === "auth/email-already-in-use") {
                console.log("ℹ️ Customer already exists:", customer.email);
            } else {
                console.error("❌ Error creating customer:", customer.email, error.message);
            }
        }
    }
}

// Seed Sample Orders
export async function seedOrders() {
    const orders = [
        {
            customerName: "Sarah Smith",
            customerPhone: "+971504444444",
            customerEmail: "customer1@example.com",
            device: "iPhone 14 Pro",
            deviceBrand: "Apple",
            issue: "Screen Replacement",
            description: "Cracked screen needs replacement",
            status: "pending",
            priority: "high",
            price: 650,
            location: "Downtown Dubai",
        },
        {
            customerName: "John Doe",
            customerPhone: "+971505555555",
            customerEmail: "customer2@example.com",
            device: "MacBook Air M2",
            deviceBrand: "Apple",
            issue: "Battery Replacement",
            description: "Battery draining too fast",
            status: "in_progress",
            priority: "medium",
            price: 450,
            location: "Business Bay",
        },
        {
            customerName: "Sarah Smith",
            customerPhone: "+971504444444",
            customerEmail: "customer1@example.com",
            device: "Samsung Galaxy S23",
            deviceBrand: "Samsung",
            issue: "Charging Port Repair",
            description: "Phone not charging properly",
            status: "completed",
            priority: "low",
            price: 200,
            location: "Downtown Dubai",
        },
    ];

    for (let i = 0; i < orders.length; i++) {
        const order = orders[i];
        try {
            const orderId = `ORD-${1000 + i}`;
            await setDoc(doc(db, "orders", orderId), {
                ...order,
                customerId: "", // Will be updated when linked
                technicianId: "",
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            console.log("✅ Order created:", orderId);
        } catch (error: any) {
            console.error("❌ Error creating order:", error.message);
        }
    }
}

// Seed Inventory Items
export async function seedInventory() {
    const items = [
        { name: "iPhone 14 Pro Screen", category: "Screens", quantity: 10, minQuantity: 5, price: 250 },
        { name: "iPhone 14 Battery", category: "Batteries", quantity: 15, minQuantity: 8, price: 80 },
        { name: "Samsung S23 Screen", category: "Screens", quantity: 8, minQuantity: 5, price: 180 },
        { name: "MacBook Air Battery", category: "Batteries", quantity: 5, minQuantity: 3, price: 150 },
        { name: "USB-C Charging Port", category: "Parts", quantity: 20, minQuantity: 10, price: 25 },
    ];

    for (const item of items) {
        try {
            await setDoc(doc(collection(db, "inventory")), {
                ...item,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp(),
            });
            console.log("✅ Inventory item created:", item.name);
        } catch (error: any) {
            console.error("❌ Error creating inventory:", error.message);
        }
    }
}

// Main seed function
export async function seedAllData() {
    console.log("🌱 Starting database seeding...\n");

    await seedAdminUser();
    await seedTechnicians();
    await seedCustomers();
    await seedOrders();
    await seedInventory();

    console.log("\n✅ Database seeding complete!");
    console.log("\n📋 Test Credentials:");
    console.log("   Admin: admin@kbi.com / Admin@123");
    console.log("   Technician: tech1@kbi.com / Tech@123");
    console.log("   Customer: customer1@example.com / Customer@123");
}
