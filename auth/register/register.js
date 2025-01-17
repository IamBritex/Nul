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
  firebase.initializeApp(firebaseConfig);
  
  // Referencias a elementos del DOM
  const emailField = document.getElementById("email-field");
  const nextButton = document.querySelector(".btn");
  
  // Cambiar estilo del botón cuando se ingresa un correo
  emailField.addEventListener("input", () => {
    if (emailField.value) {
      nextButton.style.backgroundColor = "white";
      nextButton.style.color = "black";
    } else {
      nextButton.style.backgroundColor = ""; // Color original
      nextButton.style.color = ""; // Color original
    }
  });
  
  // Función para guardar el correo en localStorage
  const saveEmailLocally = () => {
    const email = emailField.value.trim();
  
    if (!email) {
      alert("Por favor, ingrese un correo electrónico válido.");
      return;
    }
  
    // Guardar el correo en localStorage
    localStorage.setItem("email", email);
  
    console.log("Correo guardado localmente.");
    window.location.href = "./password/password.html"; // Redirigir a la página de contraseña
  };
  
  // Manejar clic en el botón
  nextButton.addEventListener("click", saveEmailLocally);
  
  // Manejar tecla Enter
  emailField.addEventListener("keypress", (event) => {
    if (event.key === "Enter") {
      saveEmailLocally();
    }
  });
  
  
//Verificar que no haya un usuario logueado con el mismo correo