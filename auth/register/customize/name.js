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
  
  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();
  const auth = firebase.auth();
  
  const usernameInput = document.getElementById("username-input");
  const submitButton = document.getElementById("submit-button");
  
  const showToast = (message, type = "error") => {
    const toast = document.createElement("div");
    toast.innerText = message;
    toast.classList.add("toast", type);
    document.body.appendChild(toast);
  
    setTimeout(() => {
      toast.style.opacity = "0"; 
      setTimeout(() => document.body.removeChild(toast), 500);
    }, 4000);
  };
  
  const isValidUsername = (username) => {
    const regex = /^[a-z0-9_]+$/;
    return username.length >= 4 && regex.test(username) && !username.endsWith(".");
  };
  
  submitButton.addEventListener("click", async () => {
    const username = usernameInput.value.trim();
  
    if (!username) {
      showToast("El campo de nombre de usuario no puede estar vacío.");
      return;
    }
  
    if (!isValidUsername(username)) {
      showToast(
        "El nombre de usuario debe tener al menos 4 caracteres, sin espacios ni puntos finales, solo letras minúsculas, números y guiones bajos."
      );
      return;
    }
  
    try {
      const querySnapshot = await db
        .collection("users")
        .where("name", "==", username)
        .get();
  
      if (!querySnapshot.empty) {
        showToast("El nombre de usuario ya está en uso, elige otro.");
        return;
      }
  
      const user = auth.currentUser;
      if (!user) {
        showToast("No se encontró una sesión activa. Por favor, inicia sesión.");
        return;
      }
  
      const userRef = db.collection("users").doc(user.uid);
      await userRef.set(
        {
          name: username,
        },
        { merge: true }
      );
  
      window.location.href = "finalize.html";
    } catch (error) {
      console.error("Error al guardar el nombre de usuario:", error);
      showToast("Hubo un error al guardar el nombre de usuario. Inténtalo de nuevo.");
    }
  });
  
  // Manejo en tiempo real para validaciones
usernameInput.addEventListener("input", () => {
    const username = usernameInput.value.trim();
  
    if (username === "") {
      // Estado por defecto
      submitButton.style.backgroundColor = ""; // Restaurar color inicial
      submitButton.style.color = ""; // Restaurar color inicial
      submitButton.style.transition = "background-color 0.3s ease, color 0.3s ease"; // Transición suave
    } else if (!isValidUsername(username)) {
      // Estado inválido
      submitButton.style.backgroundColor = "red";
      submitButton.style.color = "white";
      submitButton.style.transition = "background-color 0.3s ease, color 0.3s ease"; // Transición suave
    } else {
      // Estado válido
      submitButton.style.backgroundColor = "white";
      submitButton.style.color = "black";
      submitButton.style.transition = "background-color 0.3s ease, color 0.3s ease"; // Transición suave
    }
  });
  
  