import { 
    initializeApp 
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-app.js";
import { 
    getFirestore, 
    collection, 
    getDocs, 
    doc, 
    updateDoc, 
    addDoc, 
    getDoc,
    onSnapshot 
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-firestore.js";
import { 
    getAuth, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/9.17.1/firebase-auth.js";

// Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyDidRLWFRYqlXWfacV9Rdn2ErkfFJ9iCgw",
    authDomain: "chat-app-ccc84.firebaseapp.com",
    projectId: "chat-app-ccc84",
    storageBucket: "chat-app-ccc84.appspot.com",
    messagingSenderId: "991015329906",
    appId: "1:991015329906:web:d0bb02133b8de1a52c62eb",
    measurementId: "G-3X6LV0DT7P"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

async function markMessagesAsRead(friendId, currentUserId) {
    const messagesSnapshot = await getDocs(collection(db, "messages"));

    const batch = [];
    messagesSnapshot.forEach((messageDoc) => {
        const message = messageDoc.data();
        if (message.sender === friendId && message.receiver === currentUserId && !message.read) {
            batch.push(updateDoc(doc(db, "messages", messageDoc.id), { read: true }));
        }
    });

    // Asegúrate de devolver una Promise
    return Promise.all(batch);
}

// Obtener la lista de usuarios desde Firestore
async function fetchUsers(currentUserId) {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users = [];

    for (const userDoc of usersSnapshot.docs) {
        const userData = userDoc.data();
        const userId = userDoc.id;

        if (userId === currentUserId) continue;

        const messagesSnapshot = await getDocs(collection(db, "messages"));
        let lastMessage = null;
        let unreadCount = 0;

        messagesSnapshot.forEach((doc) => {
            const message = doc.data();

            if (
                (message.receiver === currentUserId && message.sender === userId) ||
                (message.sender === currentUserId && message.receiver === userId)
            ) {
                if (!lastMessage || (message.time && message.time > lastMessage.time)) {
                    lastMessage = message;
                }

                if (message.receiver === currentUserId && !message.read) {
                    unreadCount++;
                }
            }
        });

        users.push({
            id: userId,
            ...userData,
            lastMessage,
            unreadCount,
        });
    }

    users.sort((a, b) => {
        const timeA = a.lastMessage?.time ? a.lastMessage.time.seconds : 0;
        const timeB = b.lastMessage?.time ? b.lastMessage.time.seconds : 0;
        return timeB - timeA;
    });

    return users;
}

function renderUsers(users, currentUserId) {
    const chatContainer = document.getElementById("chat-container");
    chatContainer.innerHTML = "";

    users.forEach((user) => {
        const { lastMessage, unreadCount } = user;

        let messageText = "";
        let messageDate = "";
        let messageStyle = "";
        let statusIndicator = ""; // Aquí manejaré el contador o la bolita azul

        if (lastMessage) {
            const isSender = lastMessage.sender === currentUserId;
            const senderName = isSender ? "Tú" : user.name;
            messageText = `${senderName}: ${lastMessage.text}`;

            const date = new Date(lastMessage.time.seconds * 1000);
            messageDate = date.toLocaleString("es-ES", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            });

            // Define el estilo y decide el estado del indicador
            if (lastMessage.read && isSender) {
                // Si el mensaje fue leído y el usuario es el emisor
                messageStyle = "color: #00BBFF;";
                statusIndicator = `<div id="read-dot" style="width: 10px; height: 10px; border-radius: 50%; background-color: #00BBFF;"></div>`;
            } else if (!lastMessage.read && lastMessage.receiver === currentUserId) {
                // Si el mensaje no fue leído y el usuario es el receptor
                messageStyle = "font-weight: bold;";
                statusIndicator = `<span id="unread-count">${unreadCount}</span>`;
            }
        }

        const userElement = document.createElement("div");
        userElement.id = "chat-item";
        userElement.innerHTML = `
            <div id="avatar">
                ${
                    user.profilePicture
                        ? `<img src="${user.profilePicture}" alt="avatar" style="width: 50px; height: 50px; border-radius: 50%;">`
                        : `<span class="material-symbols-outlined" style="color: #8E8E8E;">person</span>`
                }
                <div id="online-dot"></div>
            </div>
            <div id="chat-content">
                <div id="chat-header">
                    <span id="chat-name">${user.name}</span>
                    <span id="chat-time">${messageDate}</span>
                </div>
                <div id="chat-message" style="${messageStyle}">
                    <span>${messageText}</span>
                    ${statusIndicator}
                </div>
            </div>
        `;

        userElement.addEventListener("click", async () => {
            await markMessagesAsRead(user.id, currentUserId);
            localStorage.setItem("currentChatFriend", JSON.stringify(user));
            try {
                window.location.href = "./chatMsg/msg.html";
            } catch (error) {
                console.error("Error al redirigir:", error);
            }
        });

        chatContainer.appendChild(userElement);
    });
}

// Observa el estado del usuario autenticado
onAuthStateChanged(auth, async (user) => {
    if (user) {
        const currentUserId = user.uid;

        // Escucha los cambios en la colección de mensajes
        onSnapshot(collection(db, "messages"), async () => {
            const users = await fetchUsers(currentUserId);
            renderUsers(users, currentUserId);
        });
    } else {
        console.log("Usuario no autenticado.");
        window.location.href = "../index.html";
    }
});

const menuIcon = document.querySelector('.menu-icon');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('overlay');

// Alternar sidebar
menuIcon.addEventListener('click', () => {
  sidebar.classList.toggle('active');
  overlay.classList.toggle('active');
});

// Cerrar sidebar al hacer clic fuera de él
overlay.addEventListener('click', () => {
  sidebar.classList.remove('active');
  overlay.classList.remove('active');
});


async function loadSidebarUserData(currentUserId) {
    const userRef = doc(db, "users", currentUserId);
    const userDoc = await getDoc(userRef);
  
    if (userDoc.exists()) {
      const userData = userDoc.data();
      const profilePicture = userData.profilePicture;
      const userName = userData.name;
  
      // Actualizar el nombre de usuario
      const userNameElement = document.getElementById("user-name");
      userNameElement.textContent = userName || "Usuario";
  
      // Actualizar la foto de perfil
      const profilePictureElement = document.getElementById("profile-picture");
  
      if (profilePicture) {
        // Reemplazar el span por una imagen si hay foto de perfil
        const imgElement = document.createElement("img");
        imgElement.src = profilePicture;
        imgElement.alt = "Foto de perfil";
        imgElement.style.width = "100px";
        imgElement.style.height = "100px";
        imgElement.style.borderRadius = "50%";
  
        profilePictureElement.replaceWith(imgElement);
      }
    } else {
      console.log("No se encontró información del usuario.");
    }
  }
  
  // Observa el estado del usuario autenticado
  onAuthStateChanged(auth, (user) => {
    if (user) {
      const currentUserId = user.uid;
      loadSidebarUserData(currentUserId);
    } else {
      console.log("Usuario no autenticado.");
      window.location.href = "../index.html";
    }
  });
  
  onAuthStateChanged(auth, (user) => {
    if (user) {
      loadSidebarUserData(user.uid);
    }
  });
  