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

const db = firebase.firestore();
const auth = firebase.auth();

const emailField = document.getElementById('email-field');
const passwordField = document.getElementById('password-field');
const continueBtn = document.getElementById('continue-btn');
const googleBtn = document.getElementById('google-btn');
const messageContainer = document.getElementById('message-container');

function showMessage(message, action = null) {
    messageContainer.innerHTML = message;

    if (action) {
        const actionLink = document.createElement('a');
        actionLink.href = action.href;
        actionLink.textContent = action.text;
        actionLink.style.marginLeft = '5px';
        actionLink.style.color = 'blue';
        actionLink.style.cursor = 'pointer';
        messageContainer.appendChild(actionLink);

        if (action.onClick) {
            actionLink.addEventListener('click', action.onClick);
        }
    }
}

function showMessageSucefully(message, action = null) {
    messageContainer.innerHTML = message;
    messageContainer.className = 'message-success';

    if (action) {
        const actionLink = document.createElement('a');
        actionLink.href = action.href;
        actionLink.textContent = action.text;
        actionLink.style.marginLeft = '5px';
        messageContainer.appendChild(actionLink);

        if (action.onClick) {
            actionLink.addEventListener('click', action.onClick);
        }
    }
}

function clearMessage() {
    messageContainer.innerHTML = '';
}

continueBtn.addEventListener('click', async (e) => {
    e.preventDefault();
    const email = emailField.value.trim();
    const password = passwordField.value.trim();

    if (email && password) {
        try {
            await auth.signInWithEmailAndPassword(email, password);
            clearMessage();
            showMessageSucefully("Inicio de sesión exitoso. Redirigiendo...", null);
            setTimeout(() => (window.location.href = '../index.html'), 1500);
        } catch (error) {
            console.error('Error en el inicio de sesión:', error);
            if (error.code === 'auth/user-not-found') {
                showMessage("No existe una cuenta con este correo. ", {
                    text: "Regístrate",
                    href: "./register/register.html",
                });
            } else if (error.code === 'auth/wrong-password') {
                showMessage("Contraseña incorrecta. ", {
                    text: "¿Olvidaste tu contraseña?",
                    href: "./recover-password.html",
                });
            } else {
                showMessage("Error en el inicio de sesión. Intenta más tarde.");
            }
        }
    } else {
        showMessage("Por favor, completa ambos campos.");
    }
});

// Función para inicio de sesión con Google
googleBtn.addEventListener('click', async () => {
    const provider = new firebase.auth.GoogleAuthProvider();

    try {
        const result = await auth.signInWithPopup(provider);
        const user = result.user;

        const userSnapshot = await db.collection('users').where('email', '==', user.email).get();

        if (userSnapshot.empty) {
            showMessage("¡Bienvenido! Primero crea una cuenta", {
                text: "Crea tu cuenta",
                href: "./register/register.html",
            });
        } else {
            clearMessage();
            showMessageSucefully("Inicio de sesión exitoso. Redirigiendo...", null);
            setTimeout(() => (window.location.href = '../index.html'), 1500);
        }
    } catch (error) {
        console.error('Error en el inicio de sesión con Google:', error);
        showMessage("Error en el inicio de sesión con Google. Intenta más tarde.");
    }
});

// Autocompletar el campo de correo si está almacenado en localStorage
document.addEventListener('DOMContentLoaded', () => {
    const storedEmail = localStorage.getItem('userEmail');
    if (storedEmail) {
        emailField.value = storedEmail;
    }
});