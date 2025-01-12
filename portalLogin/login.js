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
  
  // Inicialización de Firestore
  const db = firebase.firestore();
  
  // Referencias a elementos del DOM
  const emailField = document.getElementById('email-field');
  const passwordField = document.getElementById('password-field');
  const continueBtn = document.getElementById('continue-btn');
  const createAccountBtn = document.getElementById('create-account-btn');
  const googleBtn = document.getElementById('google-btn');
  
// Función para inicio de sesión con correo/usuario y contraseña
continueBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailField.value;
    const password = passwordField.value;
  
    if (email && password) {
      try {
        // Intentamos iniciar sesión con el correo y la contraseña
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
  
        // Si la autenticación es exitosa, verificamos si el correo/nombre de usuario existe en Firestore
        const user = userCredential.user;
        const usersRef = db.collection('users');
  
        // Buscar el usuario en Firestore por correo electrónico
        let userSnapshot = await usersRef.where('email', '==', email).get();
  
        // Si no se encuentra por correo, buscar por nombre de usuario
        if (userSnapshot.empty) {
          userSnapshot = await usersRef.where('name', '==', email).get();
        }
  
        // Si no se encuentra el usuario ni por correo ni por nombre de usuario
        if (userSnapshot.empty) {
          // Redirige al registro sin mostrar mensaje de error
          window.location.href = './register/register.html';
          return;
        }
  
        // Si todo es correcto, redirigir a la página principal
        window.location.href = '../index.html';
  
      } catch (error) {
        // Si el error es de credenciales inválidas, redirige al registro
        if (error.code === 'auth/invalid-email' || error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
          window.location.href = './register/register.html';
        } else {
          console.log(`Error inesperado: ${error.message}`);
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
        // Guarda los datos básicos del usuario en Firestore si no existen
        const userDoc = db.collection('users').doc(user.uid);
        const docSnapshot = await userDoc.get();
        if (!docSnapshot.exists) {
          await userDoc.set({
            email: user.email,
            name: user.displayName,
            photoURL: user.photoURL,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
          });
        }
  
        window.location.href = '../index.html'; // Redirige a index.html si la autenticación es exitosa
      }
    } catch (error) {
      alert(`Error al iniciar sesión con Google: ${error.message}`);
    }
  });
  