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

// Elementos relacionados con la foto de perfil
const profilePicture = document.getElementById('profile-picture');
const pfpUser = document.getElementById('pfp-user');
const uploadModal = document.getElementById('upload-modal');
const fileInput = document.getElementById('file-input');
const uploadFileBtn = document.getElementById('upload-file-btn');
const closeModal = document.getElementById('close-modal');
const modalBackdrop = document.getElementById('modal-backdrop');

// Tu configuración de Cloudinary
const cloudName = "dbdrdkngr"; 
const uploadPreset = "ml_default";
  
  // Inicializar Firebase
  firebase.initializeApp(firebaseConfig);
  
  // Obtener referencias a los servicios de Firebase
  const auth = firebase.auth();
  const db = firebase.firestore();
  
  // Elementos del DOM
  const loginButton = document.getElementById('login-button');
  const logoutButton = document.getElementById('logout-button');
  const userSection = document.getElementById('user-section');
  const userNameSpan = document.getElementById('user-name');
  const newUsernameInput = document.getElementById('new-username');
  const saveUsernameButton = document.getElementById('save-username');
  const friendSearch = document.getElementById('friend-search');
  const friendList = document.getElementById('friend-list');
  
  // Variables globales
  let currentUser = null;
  
  // Event listeners
  loginButton.addEventListener('click', signInWithGoogle);
  logoutButton.addEventListener('click', signOut);
  friendSearch.addEventListener('input', debounce(searchFriends, 300));
  userNameSpan.addEventListener('click', showUsernameInput);
  saveUsernameButton.addEventListener('click', changeUsername);
  
  // Función para iniciar sesión con Google
  function signInWithGoogle() {
      const provider = new firebase.auth.GoogleAuthProvider();
      auth.signInWithPopup(provider).catch(error => {
          console.error("Error al iniciar sesión:", error);
      });
  }
  
  // Función para cerrar sesión
  function signOut() {
      auth.signOut().catch(error => {
          console.error("Error al cerrar sesión:", error);
      });
  }
  
  // Función para buscar amigos
function searchFriends() {
    const searchTerm = friendSearch.value.trim().toLowerCase();  // Convertir a minúsculas
    friendList.innerHTML = '';
  
    if (searchTerm.length === 0) {
        return;
    }
  
    db.collection('users')
        .orderBy('username')
        .startAt(searchTerm)
        .endAt(searchTerm + '\uf8ff')
        .limit(10)
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                const userData = doc.data();
                if (doc.id !== currentUser.uid) {
                    const li = document.createElement('li');
                    li.textContent = `@${userData.username}`;
                    li.addEventListener('click', () => startChat(doc.id, userData.username));
                    friendList.appendChild(li);
                }
            });
            if (friendList.children.length === 0) {
                const li = document.createElement('li');
                li.textContent = 'No se encontraron usuarios';
                friendList.appendChild(li);
            }
        })
        .catch(error => {
            console.error("Error al buscar usuarios:", error);
        });
}
  
  // Función para iniciar chat
  function startChat(friendId, friendUsername) {
      console.log('Iniciando chat con:', friendId, friendUsername);
      localStorage.setItem('currentChatFriend', JSON.stringify({ id: friendId, username: friendUsername }));
      window.location.href = 'chat.html';
  }
  
  // Función para mostrar el input de cambio de nombre de usuario
  function showUsernameInput() {
      userNameSpan.style.display = 'none';
      newUsernameInput.style.display = 'inline-block';
      saveUsernameButton.style.display = 'inline-block';
      newUsernameInput.value = userNameSpan.textContent.slice(1); // Eliminar el @
      newUsernameInput.focus();
  }
  
  // Función para cambiar el nombre de usuario
function changeUsername() {
    let newUsername = newUsernameInput.value.trim().toLowerCase();  // Convertir a minúsculas
    if (newUsername && newUsername !== currentUser.username) {
        db.collection('users').where('username', '==', newUsername).get()
            .then((snapshot) => {
                if (snapshot.empty) {
                    return db.collection('users').doc(currentUser.uid).update({
                        username: newUsername
                    });
                } else {
                    throw new Error('El nombre de usuario ya existe');
                }
            })
            .then(() => {
                userNameSpan.textContent = `@${newUsername}`;
                currentUser.username = newUsername;
                newUsernameInput.style.display = 'none';
                saveUsernameButton.style.display = 'none';
                userNameSpan.style.display = 'inline-block';
            })
            .catch((error) => {
                alert(error.message);
            });
    }
}
  
  // Función debounce para evitar múltiples llamadas a la base de datos
  function debounce(func, delay) {
      let timeoutId;
      return function (...args) {
          clearTimeout(timeoutId);
          timeoutId = setTimeout(() => func.apply(this, args), delay);
      };
  }
  
// Listener para cambios en el estado de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('Usuario autenticado en script.js:', user.uid);
        currentUser = user;
        loginButton.style.display = 'none';
        logoutButton.style.display = 'inline-block';
        userSection.style.display = 'block';

        // Verificar si el usuario ya tiene un nombre de usuario
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists && doc.data().username) {
                currentUser.username = doc.data().username;
                userNameSpan.textContent = `@${currentUser.username}`;
                console.log('Nombre de usuario existente:', currentUser.username);
                document.title = `${currentUser.username} Nul`; // Aquí se cambia el título
            } else {
                // Si no tiene un nombre de usuario, crear uno basado en su displayName
                const username = user.displayName.toLowerCase().replace(/\s+/g, '_');  // Convertir a minúsculas
                db.collection('users').doc(user.uid).set({
                    username: username,
                    email: user.email
                }, { merge: true }).then(() => {
                    console.log('Nuevo nombre de usuario creado:', username);
                    currentUser.username = username;
                    userNameSpan.textContent = `@${username}`;
                    document.title = `${username} Nul`; // Aquí también se cambia el título
                }).catch((error) => {
                    console.error('Error al crear el nombre de usuario:', error);
                });
            }
        }).catch((error) => {
            console.error('Error al obtener el documento del usuario:', error);
        });
    } else {
        console.log('No hay usuario autenticado en script.js');
        currentUser = null;
        loginButton.style.display = 'inline-block';
        logoutButton.style.display = 'none';
        userSection.style.display = 'none';
        friendList.innerHTML = '';
    }
});



// Mostrar foto de perfil del usuario autenticado
auth.onAuthStateChanged((user) => {
    if (user) {
        // Mostrar la foto del usuario (de Google o de Firestore)
        profilePicture.src = user.photoURL || './assets/default.png'; // Imagen predeterminada si no hay foto

        // Si hay una URL personalizada guardada en Firestore, usar esa
        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists && doc.data().profilePicture) {
                profilePicture.src = doc.data().profilePicture;
            }
        }).catch((error) => {
            console.error('Error al obtener la foto de perfil del usuario:', error);
        });
    }
});

// Abrir el modal al hacer clic en la foto de perfil
pfpUser.addEventListener('click', () => {
    uploadModal.style.display = 'block';
    modalBackdrop.style.display = 'block';
});

// Cerrar el modal
closeModal.addEventListener('click', () => {
    uploadModal.style.display = 'none';
    modalBackdrop.style.display = 'none';
});

// Subir una nueva foto de perfil
uploadFileBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        alert('Por favor selecciona un archivo.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', uploadPreset);

    try {
        // Subir imagen a Cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();

        // Actualizar la foto de perfil en la página
        profilePicture.src = data.secure_url;

        // Guardar la nueva URL en Firestore
        const user = auth.currentUser;
        if (user) {
            await db.collection('users').doc(user.uid).update({
                profilePicture: data.secure_url,
            });
            alert('Foto de perfil actualizada.');
        }

        // Cerrar el modal
        uploadModal.style.display = 'none';
        modalBackdrop.style.display = 'none';
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        alert('Error al subir la imagen. Inténtalo nuevamente.');
    }
});
