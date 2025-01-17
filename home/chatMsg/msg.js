const firebaseConfig = {
    apiKey: "AIzaSyDidRLWFRYqlXWfacV9Rdn2ErkfFJ9iCgw",
    authDomain: "chat-app-ccc84.firebaseapp.com",
    projectId: "chat-app-ccc84",
    storageBucket: "chat-app-ccc84.firebasestorage.app",
    messagingSenderId: "991015329906",
    appId: "1:991015329906:web:d0bb02133b8de1a52c62eb",
    measurementId: "G-3X6LV0DT7P"
};

// Inicializa Firebase
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
const cloudinaryBaseURL = "https://res.cloudinary.com/dbdrdkngr/image/upload/";

// Variables globales
let currentUser = null;
let currentChat = null;

// Event Listeners
messageForm.addEventListener('submit', sendMessage);
sendButton.addEventListener('click', sendMessage);
backButton.addEventListener('click', () => window.location.href = '../chats.html');
messageInput.addEventListener('input', toggleSendButtonColor);

// Cambia el color del botón enviar según si el input tiene texto
function toggleSendButtonColor() {
    sendButton.classList.toggle('has-text', messageInput.value.trim() !== '');
}

function loadFriendProfile() {
    if (!currentChat || !currentChat.id) {
        console.error('No hay información válida del amigo actual.');
        return;
    }

    db.collection('users').doc(currentChat.id).get()
        .then((doc) => {
            if (doc.exists) {
                const friendData = doc.data();

                // Obtén la foto de perfil o deja vacía.
                const profilePic = friendData.profilePicture || null;

                // Reemplaza el contenido dentro de #user-profile-picture
                const userProfileContainer = document.getElementById('user-profile-picture');
                userProfileContainer.innerHTML = ''; // Limpia contenido actual
                
                if (profilePic) {
                    const imgElement = document.createElement('img');
                    imgElement.src = profilePic;
                    imgElement.alt = friendData.name || 'Amigo';
                    imgElement.style.width = '50px';
                    imgElement.style.height = '50px';
                    imgElement.style.borderRadius = '50%';

                    // Manejo si no carga la imagen
                    imgElement.onerror = () => {
                        userProfileContainer.innerHTML = `
                            <span class="material-icons" style="color: #8e8e8e; font-size: 18px;">person</span>
                        `;
                    };

                    userProfileContainer.appendChild(imgElement);
                } else {
                    // Agrega un ícono predeterminado en caso de que no haya foto.
                    userProfileContainer.innerHTML = `
                        <span class="material-icons" style="color: #8e8e8e; font-size: 18px;">person</span>
                    `;
                }

                // Mostrar el nombre del amigo
                document.getElementById('friend-name').textContent = friendData.name || "Nul";
            } else {
                console.error('Perfil del amigo no encontrado en Firestore.');
            }
        })
        .catch((error) => {
            console.error('Error al cargar el perfil del amigo:', error);
        });
}

// Envía un mensaje
function sendMessage(e) {
    e.preventDefault();
    const messageText = messageInput.value.trim();

    if (messageText && currentChat && currentUser) {
        db.collection('messages').add({
            sender: currentUser.uid,
            receiver: currentChat.id,
            text: messageText,
            time: firebase.firestore.FieldValue.serverTimestamp(),
            read: false, // El mensaje no se ha leído inicialmente
        }).then(() => {
            messageInput.value = '';
            toggleSendButtonColor();
        }).catch((error) => {
            console.error('Error al enviar el mensaje:', error);
        });
    }
}

// Marca los mensajes como leídos
function markMessagesAsRead() {
    if (currentUser && currentChat) {
        db.collection('messages')
            .where('sender', '==', currentChat.id)
            .where('receiver', '==', currentUser.uid)
            .where('read', '==', false) // Solo selecciona los mensajes no leídos
            .get()
            .then((snapshot) => {
                const batch = db.batch();

                snapshot.docs.forEach((doc) => {
                    const messageRef = db.collection('messages').doc(doc.id);
                    batch.update(messageRef, { read: true });
                });

                return batch.commit(); // Aplica los cambios en lote
            })
            .catch((error) => {
                console.error('Error al marcar mensajes como leídos:', error);
            });
    }
}

// Carga los mensajes del chat
function loadMessages() {
    if (currentUser && currentChat) {
        db.collection('messages')
            .where('sender', 'in', [currentUser.uid, currentChat.id])
            .where('receiver', 'in', [currentUser.uid, currentChat.id])
            .orderBy('time')
            .onSnapshot((snapshot) => {
                snapshot.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        displayMessage(change.doc.data());
                    }
                });

                // Marca los mensajes como leídos después de cargarlos
                markMessagesAsRead();
            }, (error) => {
                console.error('Error al cargar mensajes:', error);
            });
    }
}

function displayMessage(message) {
    const isSender = message.sender === currentUser.uid;
    const senderName = isSender ? "Tú" : currentChat.name || "Amigo";
    const messageTime = message.time ?
        new Date(message.time.toDate()).toLocaleString('es-ES', {
            hour: '2-digit',
            minute: '2-digit',
            day: '2-digit',
            month: 'short',
        }) : "Enviando...";

    // Contenedor principal del mensaje
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper', isSender ? 'sent' : 'received');

    // Contenedor del encabezado (nombre y hora)
    const messageHeader = document.createElement('div');
    messageHeader.classList.add('message-header');

    const nameElement = document.createElement('span');
    nameElement.classList.add('sender-name');
    nameElement.textContent = senderName;

    const timeElement = document.createElement('span');
    timeElement.classList.add('message-time');
    timeElement.textContent = `(${messageTime})`;

    // Agregar elementos al encabezado
    messageHeader.appendChild(nameElement);
    messageHeader.appendChild(timeElement);

    // Contenedor del texto del mensaje
    const messageElement = document.createElement('div');
    messageElement.classList.add('message-content');

    // Detectar enlaces en el mensaje
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    if (urlRegex.test(message.text)) {
        const linkElement = document.createElement('a');
        linkElement.href = message.text.match(urlRegex)[0];
        linkElement.target = '_blank';
        linkElement.rel = 'noopener noreferrer';
        linkElement.textContent = message.text;
        linkElement.style.textDecoration = 'underline';
        messageElement.appendChild(linkElement);
    } else {
        messageElement.textContent = message.text;
    }

    // Ensamblar los elementos
    messageWrapper.appendChild(messageHeader);
    messageWrapper.appendChild(messageElement);

    // Agregar al contenedor del chat
    chatMessages.appendChild(messageWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Maneja el estado de autenticación
auth.onAuthStateChanged((user) => {
    if (user) {
        currentUser = user;

        const storedFriend = JSON.parse(localStorage.getItem('currentChatFriend'));
        if (storedFriend) {
            currentChat = storedFriend;
            loadFriendProfile();
            loadMessages();
        } else {
            console.error('No hay información del amigo en el almacenamiento local');
            window.location.href = '../chats.html';
        }
    } else {
        console.error('Usuario no autenticado');
        window.location.href = '../chats.html';
    }
});