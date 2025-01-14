// Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDidRLWFRYqlXWfacV9Rdn2ErkfFJ9iCgw",
    authDomain: "chat-app-ccc84.firebaseapp.com",
    projectId: "chat-app-ccc84",
    storageBucket: "chat-app-ccc84.firebasestorage.app",
    messagingSenderId: "991015329906",
    appId: "1:991015329906:web:d0bb02133b8de1a52c62eb",
    measurementId: "G-3X6LV0DT7P"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

// Function to show a toast message
function showToast(message) {
    // Create toast container if it doesn't exist
    let toastContainer = document.getElementById("toast-container");
    if (!toastContainer) {
        toastContainer = document.createElement("div");
        toastContainer.id = "toast-container";
        toastContainer.style.position = "fixed";
        toastContainer.style.bottom = "20px";
        toastContainer.style.right = "20px";
        toastContainer.style.zIndex = "1000";
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toast = document.createElement("div");
    toast.textContent = message;
    toast.style.background = "black";
    toast.style.color = "white";
    toast.style.padding = "15px 25px";
    toast.style.borderRadius = "25px";
    toast.style.marginTop = "10px";
    toast.style.boxShadow = "0px 4px 6px rgba(0, 0, 0, 0.1)";
    toast.style.opacity = "1";
    toast.style.transition = "opacity 0.5s ease";

    // Add toast to container
    toastContainer.appendChild(toast);

    // Remove toast after 3 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => {
            toastContainer.removeChild(toast);
        }, 500);
    }, 3000);
}

// Function to handle login
function handleLogin() {
    const loginEmailInput = document.getElementById("email-field");
    const loginPasswordInput = document.getElementById("password-field");
    const loginMessageContainer = document.getElementById("message-container");
    const loginButton = document.getElementById("continue-btn");

    if (loginButton) {
        // Check if user is already logged in
        auth.onAuthStateChanged(async (user) => {
            if (user) {
                // User is signed in, fetch their data from Firestore
                try {
                    const doc = await db.collection("users").doc(user.uid).get();
                    if (doc.exists) {
                        const userData = doc.data();
                        loginEmailInput.value = userData.email || '';
                        // Note: For security reasons, we don't pre-fill the password field
                    }
                } catch (error) {
                    console.error("Error fetching user data:", error);
                }
            } else {
                // No user is signed in, check localStorage for email
                const storedEmail = localStorage.getItem("email");
                if (storedEmail) {
                    loginEmailInput.value = storedEmail;
                }
            }
        });

        // Display verification message if username is set (indicating recent registration)
        const storedUsername = localStorage.getItem("username");
        if (storedUsername) {
            loginMessageContainer.textContent = "Se ha enviado un correo de verificación, a continuación ingresa al link del correo y vuelve a iniciar sesión.";
            loginMessageContainer.style.color = "green";
            localStorage.removeItem("username"); // Clear the username from localStorage
        }

        loginButton.addEventListener("click", async () => {
            const email = loginEmailInput.value.trim();
            const password = loginPasswordInput.value.trim();

            if (!email || !password) {
                alert("Por favor, complete todos los campos.");
                return;
            }

            try {
                const userCredential = await auth.signInWithEmailAndPassword(email, password);
                const user = userCredential.user;

                if (!user.emailVerified) {
                    loginMessageContainer.style.color = "green";
                    loginMessageContainer.textContent = "Se ha enviado un correo de verificación, ingresa al enlace y vuelve a iniciar sesión.";
                    await auth.signOut();
                } else {
                    window.location.href = "/user/home.html"; // Change to your app's main page
                }
            } catch (error) {
                console.error("Error al iniciar sesión:", error);
                alert("Correo o contraseña incorrectos.");
            }
        });
    }
}

// Function to handle registration
function handleRegistration() {
    const registerEmailInput = document.getElementById("email-field");
    const registerNextButton = document.getElementById("next-btn");

    if (registerNextButton) {
        registerNextButton.addEventListener("click", async () => {
            const email = registerEmailInput.value.trim();

            if (!email) {
                displayMessage("Por favor, ingrese un correo válido.", "red");
                return;
            }

            try {
                // Create user with a temporary password
                const userCredential = await auth.createUserWithEmailAndPassword(email, "temporalpassword123");
                const user = userCredential.user;

                // Send verification email
                await user.sendEmailVerification();

                // Store email locally for future use
                localStorage.setItem("email", email);

                // Redirect to password setup page
                window.location.href = "./password/password.html";
            } catch (error) {
                console.error("Error al crear usuario:", error);
                handleRegistrationError(error);
            }
        });
    }

    // Function to display a message to the user
    function displayMessage(message, color) {
        const messageContainer = document.getElementById("message-container");
        if (messageContainer) {
            messageContainer.textContent = message;
            messageContainer.style.color = color;
        } else {
            alert(message); // Fallback in case the message container is not found
        }
    }

// Function to handle registration errors
function handleRegistrationError(error) {
    switch (error.code) {
        case "auth/email-already-in-use":
            showToast("El correo ya está registrado. Intente iniciar sesión.", "error");
            break;
        case "auth/invalid-email":
            showToast("El formato del correo no es válido. Verifíquelo e intente nuevamente.", "error");
            break;
        case "auth/operation-not-allowed":
            showToast("El registro está temporalmente deshabilitado. Intente más tarde.", "error");
            break;
        case "auth/weak-password":
            showToast("La contraseña es demasiado débil. Contacte al administrador.", "error");
            break;
        default:
            showToast("Ocurrió un error al registrarse. Intente nuevamente.", "error");
    }
}
}

// Function to handle password setting
function handlePasswordSetting() {
    const passwordInput = document.getElementById("password-input");
    const termsCheckbox = document.getElementById("terms-checkbox");
    const passwordSubmitButton = document.getElementById("submit-button");

    if (passwordSubmitButton) {
        passwordSubmitButton.addEventListener("click", async () => {
            const password = passwordInput.value.trim();

            if (!password) {
                alert("Por favor, ingrese una contraseña válida.");
                return;
            }

            if (!termsCheckbox.checked) {
                termsCheckbox.labels[0].style.color = "red";
                setTimeout(() => {
                    termsCheckbox.labels[0].style.color = "";
                }, 1000);
                return;
            }

            try {
                const user = auth.currentUser;
                if (user) {
                    await user.updatePassword(password);
                    window.location.href = "../userName/user.html";
                } else {
                    alert("Usuario no autenticado. Vuelve a iniciar el proceso.");
                    window.location.href = "./register.html";
                }
            } catch (error) {
                console.error("Error al guardar la contraseña:", error);
                alert("No se pudo guardar la contraseña. Intente de nuevo.");
            }
        });
    }
}

// Function to handle username setting
function handleUsernameSetting() {
    const usernameInput = document.getElementById("username-input");
    const usernameSubmitButton = document.getElementById("submit-button");

    if (usernameSubmitButton) {
        usernameSubmitButton.addEventListener("click", async () => {
            const username = usernameInput.value.trim();

            if (!username) {
                alert("Por favor, ingrese un nombre de usuario válido.");
                return;
            }

            try {
                const user = auth.currentUser;
                if (user) {
                    await db.collection("users").doc(user.uid).set({
                        email: user.email,
                        name: username,
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    });
                    localStorage.setItem("username", username);
                    window.location.href = "../../welcome/welcome.html";
                } else {
                    alert("Usuario no autenticado. Intente de nuevo.");
                    window.location.href = "./register.html";
                }
            } catch (error) {
                console.error("Error al guardar el nombre de usuario:", error);
                alert("No se pudo guardar el nombre de usuario. Intente de nuevo.");
            }
        });
    }
}

// Function to initialize the appropriate handler based on the current page
function initializeHandlers() {
    const currentPath = window.location.pathname;

    if (currentPath.includes('login.html')) {
        handleLogin();
    } else if (currentPath.includes('register.html')) {
        handleRegistration();
    } else if (currentPath.includes('password.html')) {
        handlePasswordSetting();
    } else if (currentPath.includes('user.html')) {
        handleUsernameSetting();
    }
}

// Call the initialization function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initializeHandlers);