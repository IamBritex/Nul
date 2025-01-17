// Import Firebase libraries
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js"
// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDidRLWFRYqlXWfacV9Rdn2ErkfFJ9iCgw",
    authDomain: "chat-app-ccc84.firebaseapp.com",
    projectId: "chat-app-ccc84",
    storageBucket: "chat-app-ccc84.firebasestorage.app",
    messagingSenderId: "991015329906",
    appId: "1:991015329906:web:d0bb02133b8de1a52c62eb",
    measurementId: "G-3X6LV0DT7P"
}
// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app)
// Check user authentication state
document.addEventListener("DOMContentLoaded", () => {
    const userDisplay = document.getElementById("user-display");
    const openNulButton = document.getElementById("open-nul-btn");
    const openNulButtonDuplicate = document.getElementById("open-nul-btn-duplicate")
    const renderUser = (user) => {
        if (user) {
            return `
                <div class="user-info">
                    <div class="profile-pic-container">
                        ${
                            user.pictureProfile
                                ? `<img src="${user.pictureProfile}" alt="Foto de perfil" class="profile-pic">`
                                : `<div class="default-avatar"><span class="material-icons">account_circle</span></div>`
                        }
                    </div>
                    <span>${user.name || 'Usuario'}</span>
                    <button id="logout-btn" class="logout-btn">
                        <span class="material-icons">logout</span>
                    </button>
                </div>
            `;
        } else {
            return `<a href="./auth/login/login.html">Iniciar sesión</a>`;
        }
    }
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is signed in
            const userDoc = doc(db, "users", user.uid);
            const userSnapshot = await getDoc(userDoc)
            if (userSnapshot.exists()) {
                const userData = userSnapshot.data();
                userDisplay.innerHTML = renderUser(userData);
            } else {
                userDisplay.textContent = "Error: Usuario no encontrado";
            }
            openNulButton.textContent = "Abrir NUL en el navegador";
            openNulButton.href = "./home/chats.html"
            openNulButtonDuplicate.textContent = "Abrir NUL en tu navegador";
            openNulButtonDuplicate.href = "./home/chats.html"
            // Add logout functionality
            document.getElementById("logout-btn")?.addEventListener("click", async () => {
                await signOut(auth);
                window.location.reload();
            });
        } else {
            // No user signed in
            userDisplay.innerHTML = renderUser(null);
            openNulButton.textContent = "Inicia sesión en NUL";
            openNulButton.href = "./auth/login/login.html"
            openNulButtonDuplicate.textContent = "Inicia sesión en NUL";
            openNulButtonDuplicate.href = "./auth/login/login.html";
        }
    });
});