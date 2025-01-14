const firebaseConfig = {
    apiKey: "AIzaSyDidRLWFRYqlXWfacV9Rdn2ErkfFJ9iCgw",
    authDomain: "chat-app-ccc84.firebaseapp.com",
    projectId: "chat-app-ccc84",
    storageBucket: "chat-app-ccc84.firebasestorage.app",
    messagingSenderId: "991015329906",
    appId: "1:991015329906:web:d0bb02133b8de1a52c62eb",
    measurementId: "G-3X6LV0DT7P"
};

const profilePicture = document.getElementById('profile-picture');
const pfpUser = document.getElementById('pfp-user');
const uploadModal = document.getElementById('upload-modal');
const fileInput = document.getElementById('file-input');
const uploadFileBtn = document.getElementById('upload-file-btn');
const closeModal = document.getElementById('close-modal');
const modalBackdrop = document.getElementById('modal-backdrop');

firebase.initializeApp(firebaseConfig);

const auth = firebase.auth();
const db = firebase.firestore();

const logoutButton = document.getElementById('logout-button');
const userSection = document.getElementById('user-section');
const userNameSpan = document.getElementById('user-name');
const friendSearch = document.getElementById('friend-search');
const friendList = document.getElementById('friend-list');

let currentUser = null;

logoutButton.addEventListener('click', signOut);
friendSearch.addEventListener('input', debounce(searchFriends, 300));

function signOut() {
    auth.signOut().catch(error => {
        console.error("Error al cerrar sesión:", error);
    });
}

function debounce(func, delay) {
    let timeoutId;
    return function (...args) {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
}

function searchFriends() {
    const searchTerm = friendSearch.value.trim().toLowerCase();
    friendList.innerHTML = '';

    if (searchTerm.length === 0) {
        return;
    }

    db.collection('users')
        .orderBy('name')
        .startAt(searchTerm)
        .endAt(searchTerm + '\uf8ff')
        .limit(10)
        .get()
        .then((snapshot) => {
            snapshot.forEach((doc) => {
                const userData = doc.data();
                if (doc.id !== currentUser.uid) {
                    const li = document.createElement('li');
                    li.textContent = `@${userData.name}`;
                    li.addEventListener('click', () => startChat(doc.id, userData.name));
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

function startChat(friendId, friendName) {
    console.log('Iniciando chat con:', friendId, friendName);
    localStorage.setItem('currentChatFriend', JSON.stringify({ id: friendId, name: friendName }));
    window.location.href = './chat/chat.html';
}

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('Usuario autenticado:', user.uid);
        currentUser = user;
        logoutButton.style.display = 'inline-block';
        userSection.style.display = 'block';

        db.collection('users').doc(user.uid).get().then((doc) => {
            if (doc.exists && doc.data().name) {
                currentUser.name = doc.data().name;
                userNameSpan.textContent = `@${currentUser.name}`;
                document.title = `${currentUser.name} Nul`;
            } else {
                const name = user.displayName.toLowerCase().replace(/\s+/g, '_');
                db.collection('users').doc(user.uid).set({
                    name: name,
                    email: user.email
                }, { merge: true }).then(() => {
                    console.log('Nuevo nombre creado:', name);
                    currentUser.name = name;
                    userNameSpan.textContent = `@${name}`;
                    document.title = `${name} Nul`;
                }).catch((error) => {
                    console.error('Error al crear el nombre:', error);
                });
            }
        }).catch((error) => {
            console.error('Error al obtener el documento del usuario:', error);
        });
    } else {
        console.log('No hay usuario autenticado.');
        currentUser = null;
        logoutButton.style.display = 'none';
        userSection.style.display = 'none';
        friendList.innerHTML = '';
        window.location.href = './login.html';
    }
});

pfpUser.addEventListener('click', () => {
    uploadModal.style.display = 'block';
    modalBackdrop.style.display = 'block';
});

closeModal.addEventListener('click', () => {
    uploadModal.style.display = 'none';
    modalBackdrop.style.display = 'none';
});

uploadFileBtn.addEventListener('click', async () => {
    const file = fileInput.files[0];
    if (!file) {
        alert('Por favor selecciona un archivo.');
        return;
    }

    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'ml_default');

    try {
        const response = await fetch(`https://api.cloudinary.com/v1_1/dbdrdkngr/image/upload`, {
            method: 'POST',
            body: formData,
        });
        const data = await response.json();

        profilePicture.src = data.secure_url;

        const user = auth.currentUser;
        if (user) {
            await db.collection('users').doc(user.uid).update({
                profilePicture: data.secure_url,
            });
            alert('Foto de perfil actualizada.');
        }

        uploadModal.style.display = 'none';
        modalBackdrop.style.display = 'none';
    } catch (error) {
        console.error('Error al subir la imagen:', error);
        alert('Error al subir la imagen. Inténtalo nuevamente.');
    }
});
