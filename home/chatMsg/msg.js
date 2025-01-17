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
                    imgElement.style.width = 'clamp(32px, 8vw, 40px)';
                    imgElement.style.height = 'clamp(32px, 8vw, 40px)';
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

function formatMessageTime(timestamp) {
    const now = new Date();
    const date = new Date(timestamp.toDate());
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    const options = { weekday: 'long', day: 'numeric', month: 'long' };

    const hours = date.getHours() % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const ampm = date.getHours() >= 12 ? 'p.m.' : 'a.m.';

    if (diffDays === 0) return `Hoy a las ${hours}:${minutes} ${ampm}`;
    if (diffDays === 1) return `Ayer a las ${hours}:${minutes} ${ampm}`;
    if (diffDays === 2) return `Anteayer a las ${hours}:${minutes} ${ampm}`;
    if (diffDays <= 7) {
        return `${date.toLocaleDateString('es-ES', { weekday: 'long' })} a las ${hours}:${minutes} ${ampm}`;
    }
    return `${date.toLocaleDateString('es-ES', options)} a las ${hours}:${minutes} ${ampm}`;
}

let lastSender = null;
let lastMessageDate = null;

function displayMessage(message) {
    const isSender = message.sender === currentUser.uid;
    const senderName = isSender ? "Tú" : currentChat.name || "Amigo";
    const messageDate = new Date(message.time.toDate());
    const formattedDate = getFormattedDate(messageDate);
    const messageTime = formatMessageTime(message.time);

    // Insertar separador de fecha si cambia la fecha
    if (formattedDate !== lastMessageDate) {
        const dateSeparator = document.createElement('div');
        dateSeparator.classList.add('date-separator');
        dateSeparator.textContent = formattedDate;
        chatMessages.appendChild(dateSeparator);
        lastMessageDate = formattedDate;
    }

    // Crear encabezado solo si cambia el remitente
    if (message.sender !== lastSender) {
        const header = document.createElement('div');
        header.classList.add('message-header');

        const nameElement = document.createElement('span');
        nameElement.classList.add('sender-name');
        nameElement.textContent = senderName;

        const timeElement = document.createElement('span');
        timeElement.classList.add('message-time');
        timeElement.textContent = messageTime;

        header.appendChild(nameElement);
        header.appendChild(timeElement);
        chatMessages.appendChild(header);

        lastSender = message.sender;
    }

    // Crear el contenedor del mensaje
    const messageWrapper = document.createElement('div');
    messageWrapper.classList.add('message-wrapper', isSender ? 'sent' : 'received');

    const messageElement = document.createElement('div');
    messageElement.classList.add('message-content');

    // Detectar enlaces y formatear
    const linkRegex = /(https?:\/\/[^\s]+)/g;
    if (linkRegex.test(message.text)) {
        const parts = message.text.split(linkRegex);

        parts.forEach((part) => {
            if (linkRegex.test(part)) {
                const linkElement = document.createElement('a');
                linkElement.href = part;
                linkElement.textContent = part;
                linkElement.target = "_blank"; // Abre en una nueva pestaña
                linkElement.style.color = "#CE262C";
                linkElement.style.textDecoration = "underline";
                messageElement.appendChild(linkElement);
            } else {
                const textNode = document.createTextNode(part);
                messageElement.appendChild(textNode);
            }
        });
    } else {
        messageElement.textContent = message.text;
    }

    messageWrapper.appendChild(messageElement);
    chatMessages.appendChild(messageWrapper);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// Función para formatear las fechas como Hoy, Ayer, etc.
function getFormattedDate(date) {
    const now = new Date();
    const differenceInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));

    if (differenceInDays === 0) {
        return "Hoy";
    } else if (differenceInDays === 1) {
        return "Ayer";
    } else if (differenceInDays === 2) {
        return "Anteayer";
    } else if (differenceInDays < 7) {
        return date.toLocaleDateString('es-ES', { weekday: 'long' });
    } else {
        return date.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
    }
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