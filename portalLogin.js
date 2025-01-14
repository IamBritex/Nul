function checkAuthState() {
  if (firebase.apps.length === 0) {
    console.error('Firebase no está inicializado. Asegúrate de que script.js se carga antes que portalLogin.js');
    return;
  }

  firebase.auth().onAuthStateChanged(function(user) {
    if (!user) {
      window.location.href = 'portalLogin/login.html';
    }
  });
}

document.addEventListener('DOMContentLoaded', checkAuthState);