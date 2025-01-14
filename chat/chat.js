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

const auth = firebase.auth();
const db = firebase.firestore();

// Elementos del DOM
const friendName = document.getElementById('friend-name');
const chatMessages = document.getElementById('chat-messages');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');
const sendButton = document.getElementById('send-button');
const backButton = document.getElementById('back-button');
const userProfilePicture = document.getElementById('user-profile-picture');
const cloudinaryBaseURL = "https://res.cloudinary.com/dbdrdkngr/image/upload/"; // Cambia "tu-cloud-name" por el nombre de tu cuenta en Cloudinary


let currentUser = null;
let currentChat = null;

messageForm.addEventListener('submit', sendMessage);
sendButton.addEventListener('click', sendMessage);
backButton.addEventListener('click', () => window.location.href = '../index.html');
messageInput.addEventListener('input', toggleSendButtonColor);

function toggleSendButtonColor() {
    if (messageInput.value.trim() !== '') {
        sendButton.classList.add('has-text');
    } else {
        sendButton.classList.remove('has-text');
    }
}

function loadFriendProfile() {
    db.collection('users').doc(currentChat.id).get().then(doc => {
        if (doc.exists) {
            const friendData = doc.data();
            if (friendData.cloudinaryPublicId) {
                userProfilePicture.src = `${cloudinaryBaseURL}${friendData.cloudinaryPublicId}`; 
            } else {
                userProfilePicture.src = friendData.photoURL || 'assets/default.jpeg'; 
            }

            friendName.textContent = `@${friendData.username}`; 
        } else {
            console.error('No se encontró el perfil del amigo en Firestore');
        }
    }).catch(error => {
        console.error("Error al cargar el perfil del amigo:", error);
    });
}

function updateProfilePicture(file) {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "tu-upload-preset"); 

    fetch("https://api.cloudinary.com/v1_1/dbdrdkngr/image/upload", { 
        method: "POST",
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        if (data.secure_url) {
            db.collection('users').doc(auth.currentUser.uid).update({
                cloudinaryPublicId: data.public_id,
                photoURL: data.secure_url 
            }).then(() => {
                console.log("Foto de perfil actualizada en Firestore");
            }).catch(error => {
                console.error("Error al actualizar Firestore:", error);
            });
        }
    })
    .catch(error => {
        console.error("Error al subir a Cloudinary:", error);
    });
}

function sendMessage(e) {
    e.preventDefault();
    const messageText = messageInput.value.trim();
    if (messageText && currentChat && currentUser) {
        console.log('Intentando enviar mensaje:', messageText);
        console.log('Usuario actual:', currentUser.uid);
        console.log('Destinatario:', currentChat.id);

        db.collection('messages').add({
            sender: currentUser.uid,
            receiver: currentChat.id,
            text: messageText,
            time: firebase.firestore.FieldValue.serverTimestamp()
        }).then(() => {
            console.log('Mensaje enviado con éxito');
            messageInput.value = '';
            toggleSendButtonColor();
        }).catch(error => {
            console.error("Error al enviar el mensaje:", error);
        });
    } else {
        console.error('No se puede enviar el mensaje. Datos faltantes:', { messageText, currentChat, currentUser });
    }
}

let lastSender = null;

function displayMessage(message) {
    console.log('Mostrando mensaje:', message);

    if (message.sender !== lastSender) {
        lastSender = message.sender;

        const senderNameElement = document.createElement('div');
        senderNameElement.classList.add('sender-name');
        senderNameElement.textContent = message.sender === currentUser.uid ? 'Tú' : currentChat.username;
        chatMessages.appendChild(senderNameElement);
    }

    const messageElement = document.createElement('div');
    messageElement.classList.add('message');
    messageElement.classList.add(message.sender === currentUser.uid ? 'sent' : 'received');

    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(message.text)) {
        const linkElement = document.createElement('a');
        linkElement.href = message.text.match(urlRegex)[0];
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.textContent = message.text;
        linkElement.style.color = '#CE262C';
        linkElement.style.textDecoration = 'underline';

        messageElement.appendChild(linkElement);
    } else {
        messageElement.textContent = message.text;
    }

    chatMessages.appendChild(messageElement);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function loadMessages() {
    if (currentUser && currentChat) {
        console.log('Cargando mensajes para:', currentUser.uid, currentChat.id);
        db.collection('messages')
            .where('sender', 'in', [currentUser.uid, currentChat.id])
            .where('receiver', 'in', [currentUser.uid, currentChat.id])
            .orderBy('time')
            .onSnapshot((snapshot) => {
                console.log('Snapshot recibido:', snapshot.size, 'mensajes');
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        console.log('Nuevo mensaje:', change.doc.data());
                        displayMessage(change.doc.data());
                    }
                });
            }, (error) => {
                console.error("Error al cargar los mensajes:", error);
            });
    } else {
        console.error('No se pueden cargar los mensajes. Datos faltantes:', { currentUser, currentChat });
    }
}

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('Usuario autenticado:', user.uid);
        currentUser = user;
            db.collection('users').doc(currentUser.uid).get().then(doc => {
                if (doc.exists) {
                    const userData = doc.data();
                    if (userData.cloudinaryPublicId) {
                        userProfilePicture.src = `${cloudinaryBaseURL}${userData.cloudinaryPublicId}`;
                    } else {
                        userProfilePicture.src = userData.photoURL || 'assets/default.jpeg';
                    }
                }
            });
        const storedFriend = JSON.parse(localStorage.getItem('currentChatFriend'));
        if (storedFriend) {
            console.log('Amigo del chat:', storedFriend);
            currentChat = storedFriend;
            loadFriendProfile();
            friendName.textContent = `@${currentChat.username}`;
            loadMessages();
        } else {
            console.error('No hay información del amigo en el almacenamiento local');
            window.location.href = '../index.html';
        }
    } else {
        console.log('No hay usuario autenticado');
        window.location.href = '../index.html';
    }
});

auth.onAuthStateChanged((user) => {
    if (user) {
        console.log('Usuario autenticado al cargar la página:', user.uid);
    } else {
        console.log('No hay usuario autenticado al cargar la página');
        window.location.href = 'index.html';
    }
});

