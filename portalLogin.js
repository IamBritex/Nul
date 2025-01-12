// Función para redirigir al usuario si no ha iniciado sesión
function checkAuthState() {
  // Verificamos si Firebase Auth ya está inicializado
  if (firebase.apps.length === 0) {
    console.error('Firebase no está inicializado. Asegúrate de que script.js se carga antes que portalLogin.js');
    return;
  }

  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      // Si no hay usuario autenticado, redirigir a la página de login
      window.location.href = 'portalLogin/login.html';
    }
  });
}

// Llamar a la función cuando se carga la página
document.addEventListener('DOMContentLoaded', checkAuthState);