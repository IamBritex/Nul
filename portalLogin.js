// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDidRLWFRYqlXWfacV9Rdn2ErkfFJ9iCgw",
    authDomain: "chat-app-ccc84.firebaseapp.com",
    projectId: "chat-app-ccc84",
    storageBucket: "chat-app-ccc84.firebasestorage.app",
    messagingSenderId: "991015329906",
    appId: "1:991015329906:web:d0bb02133b8de1a52c62eb",
    measurementId: "G-3X6LV0DT7P"
};
  
  firebase.initializeApp(firebaseConfig);
  
  // Función para redirigir al usuario si no ha iniciado sesión
  function checkAuthState() {
    firebase.auth().onAuthStateChanged(function(user) {
      if (!user) {
        // Si no hay usuario autenticado, redirigir a la página de login
        window.location.href = 'portalLogin/login.html';
      }
    });
  }
  
  // Llamar a la función cuando se carga la página
  document.addEventListener('DOMContentLoaded', checkAuthState);