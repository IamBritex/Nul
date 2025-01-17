import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signInWithPopup, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, collection, query, where, getDocs } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";

// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDidRLWFRYqlXWfacV9Rdn2ErkfFJ9iCgw",
    authDomain: "chat-app-ccc84.firebaseapp.com",
    projectId: "chat-app-ccc84",
    storageBucket: "chat-app-ccc84.firebasestorage.app",
    messagingSenderId: "991015329906",
    appId: "1:991015329906:web:d0bb02133b8de1a52c62eb",
    measurementId: "G-3X6LV0DT7P"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Select DOM elements
const loginForm = document.getElementById("login-form");
const emailInput = document.getElementById("email-input");
const passwordInput = document.getElementById("password-input");
const createAccountBtn = document.getElementById("create-account");
const googleBtn = document.getElementById("google-btn");

// Functions to handle notifications
const clearNotifications = () => {
    const notifications = document.querySelectorAll(".notification");
    notifications.forEach((el) => el.remove());
};

const createNotification = (message, className) => {
    const notification = document.createElement("div");
    notification.className = `notification ${className}`;
    notification.textContent = message;
    passwordInput.insertAdjacentElement("afterend", notification);
};

// Handle email and password login
loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearNotifications();

    const email = emailInput.value.trim();
    const password = passwordInput.value.trim();

    if (!email || !password) {
        createNotification("Por favor, completa todos los campos.", "error-notification");
        return;
    }

    try {
        // Check if the email exists in Firestore
        const usersCollection = collection(db, "users");
        const emailQuery = query(usersCollection, where("email", "==", email));
        const querySnapshot = await getDocs(emailQuery);

        if (querySnapshot.empty) {
            createNotification("Cuenta no encontrada. Regístrate", "account-not-found");
            return;
        }

        // Try signing in with the provided password
        await signInWithEmailAndPassword(auth, email, password);
        window.location.href = "../../home/chats.html";
    } catch (error) {
        if (error.code === "auth/wrong-password") {
            createNotification("Contraseña no encontrada. ¿Encontrar contraseña?", "wrong-password");
        } else if (error.code === "auth/user-not-found") {
            createNotification("Cuenta no encontrada. Regístrate", "account-not-found");
        } else if (error.code === "auth/account-exists-with-different-credential") {
            createNotification("Esta cuenta fue creada con anterioridad con Google.", "google-created-account");
        } else {
            createNotification("Ocurrió un error inesperado. Por favor, inténtalo nuevamente.", "error-notification");
        }
    }
});

// Handle Google login
googleBtn.addEventListener("click", async () => {
    const provider = new GoogleAuthProvider();

    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;

        const usersCollection = collection(db, "users");
        const emailQuery = query(usersCollection, where("email", "==", user.email));
        const querySnapshot = await getDocs(emailQuery);

        if (querySnapshot.empty) {
            // First login
            const userDoc = {
                name: user.displayName || "Nuevo Usuario",
                email: user.email,
                pictureProfile: user.photoURL || null,
            };
            await setDoc(doc(usersCollection, user.uid), userDoc);
            window.location.href = "../register/customize/name.html";
        } else {
            window.location.href = "../../home/chats.html";
        }
    } catch (error) {
        console.error("Error during Google login:", error.message);
        createNotification("No se pudo iniciar sesión con Google. Por favor, intenta nuevamente.", "error-notification");
    }
});

// Redirect to register page
createAccountBtn.addEventListener("click", () => {
    window.location.href = "../register/register.html";
});
