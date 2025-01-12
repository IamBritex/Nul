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
  
  // Referencias a elementos del DOM
  const emailField = document.getElementById('email-field');
  const passwordField = document.getElementById('password-field');
  const continueBtn = document.getElementById('continue-btn');
  const createAccountBtn = document.getElementById('create-account-btn');
  const googleBtn = document.getElementById('google-btn');
  
  // Función para inicio de sesión con correo y contraseña
  continueBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailField.value;
    const password = passwordField.value;
  
    if (email && password) {
      try {
        await firebase.auth().signInWithEmailAndPassword(email, password);
        window.location.href = '../index.html'; // Redirige a index.html si la autenticación es exitosa
      } catch (error) {
        if (error.code === 'auth/user-not-found') {
          alert('Cuenta no encontrada. Redirigiendo a la página de registro.');
          window.location.href = './register/register.html';
        } else {
          alert(`Error: ${error.message}`);
        }
      }
    } else {
      alert('Por favor, completa todos los campos.');
    }
  });
  
  // Función para redirigir a la página de creación de cuenta
  createAccountBtn.addEventListener('click', () => {
    window.location.href = './register/register.html';
  });
  
  // Función para inicio de sesión con Google
  googleBtn.addEventListener('click', async () => {
    const googleProvider = new firebase.auth.GoogleAuthProvider();
  
    try {
      const result = await firebase.auth().signInWithPopup(googleProvider);
      const user = result.user;
  
      if (user) {
        window.location.href = '../index.html'; // Redirige a index.html si la autenticación es exitosa
      }
    } catch (error) {
      alert(`Error al iniciar sesión con Google: ${error.message}`);
    }
  });
  