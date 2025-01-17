// Importar las funciones necesarias de Firebase v9
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.0.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  fetchSignInMethodsForEmail
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc
} from "https://www.gstatic.com/firebasejs/9.0.0/firebase-firestore.js";

// Configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDidRLWFRYqlXWfacV9Rdn2ErkfFJ9iCgw",
  authDomain: "chat-app-ccc84.firebaseapp.com",
  projectId: "chat-app-ccc84",
  storageBucket: "chat-app-ccc84.appspot.com",
  messagingSenderId: "991015329906",
  appId: "1:991015329906:web:d0bb02133b8de1a52c62eb",
  measurementId: "G-3X6LV0DT7P"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Referencias a elementos del DOM
const passwordInput = document.getElementById("password-input");
const submitButton = document.getElementById("submit-button");
const termsCheckbox = document.getElementById("terms-checkbox");

// Función para mostrar *toasts* con estilos
const showToast = (message, type = "error") => {
  const toast = document.createElement("div");
  toast.innerText = message;
  toast.classList.add("toast", type);

  // Agregar el *toast* al DOM
  document.body.appendChild(toast);

  // Fade out después de 4 segundos
  setTimeout(() => {
    toast.style.opacity = "0"; 
    setTimeout(() => document.body.removeChild(toast), 500); 
  }, 3400);
};

submitButton.addEventListener("click", async () => {
  const password = passwordInput.value.trim();
  const email = localStorage.getItem("email"); 

  if (!email) {
    showToast("No se ha encontrado el correo electrónico.");
    return;
  }

  if (!termsCheckbox.checked) {
    showToast("Debes aceptar los términos y condiciones.", "error");
    return;
  }

  try {
    const signInMethods = await fetchSignInMethodsForEmail(auth, email);

    if (signInMethods.length > 0) {
      showToast("Esta cuenta ya existe, inicia sesión.", "error");
      return;
    }

    const userCredential = await createUserWithEmailAndPassword(auth, email, password);

    const user = userCredential.user;
    await setDoc(doc(db, "users", user.uid), {
      email: email,
      createdAt: new Date(),
      password: password // Si es crítico guardar contraseñas, encripta esto.
    });

    showToast("Cuenta creada exitosamente.", "success");

    window.location.href = "../customize/name.html";
  } catch (error) {
    if (error.code === "auth/email-already-in-use") {
      showToast("Esta cuenta ya existe, inicia sesión.", "error");
    } else {
      console.error("Error al registrar al usuario: ", error);
      showToast("Hubo un error. Inténtalo de nuevo.", "error");
    }
  }
});
