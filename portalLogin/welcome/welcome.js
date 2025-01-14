// Configurations
const CONFIG = {
    firebase: {
        apiKey: "AIzaSyDidRLWFRYqlXWfacV9Rdn2ErkfFJ9iCgw",
        authDomain: "chat-app-ccc84.firebaseapp.com",
        projectId: "chat-app-ccc84",
        storageBucket: "chat-app-ccc84.firebasestorage.app",
        messagingSenderId: "991015329906",
        appId: "1:991015329906:web:d0bb02133b8de1a52c62eb",
        measurementId: "G-3X6LV0DT7P"
    },
    cloudinary: {
        url: "https://api.cloudinary.com/v1_1/dbdrdkngr/image/upload",
        preset: "ml_default"
    },
    maxFileSize: 5 * 1024 * 1024 // 5MB
};

// Firebase initialization
if (!firebase.apps.length) {
    firebase.initializeApp(CONFIG.firebase);
}

class ProfileManager {
    constructor() {
        this.db = firebase.firestore();
        this.auth = firebase.auth();
        this.cropper = null;
        this.cropperWindow = null;
        this.initializeElements();
        this.setupEventListeners();
    }

    initializeElements() {
        this.elements = {
            profileCircle: document.getElementById("profile-circle"),
            profileIcon: document.getElementById("profile-icon"),
            welcomeText: document.getElementById("welcome-text"),
            subText: document.getElementById("sub-text"),
            nameElement: document.getElementById("name"),
            emailElement: document.getElementById("email"),
            uploadCircle: document.getElementById("upload-circle")
        };
    }

    setupEventListeners() {
        this.auth.onAuthStateChanged(this.handleAuthStateChanged.bind(this));
        this.elements.uploadCircle.addEventListener("click", this.handleImageSelection.bind(this));
    }

    updatePageTitle(userName) {
        document.title = `Welcome - ${userName}`;
    }

    setProfilePicture(imageUrl) {
        this.elements.profileCircle.style.backgroundImage = `url(${imageUrl})`;
        this.elements.profileCircle.style.backgroundSize = "cover";
        this.elements.profileCircle.style.backgroundPosition = "center";
        this.elements.profileCircle.style.backgroundRepeat = "no-repeat";
        this.elements.profileIcon.style.display = "none";
    }

    async fetchUserData(userId) {
        try {
            const userDoc = await this.db.collection("users").doc(userId).get();

            if (userDoc.exists) {
                const userData = userDoc.data();
                this.updateUIWithUserData(userData);
            } else {
                console.log("No se encontró el documento del usuario.");
            }
        } catch (error) {
            console.error("Error fetching user data:", error);
        }
    }

    updateUIWithUserData(userData) {
        const { name, email, profilePicture, firstLogin } = userData;

        this.elements.nameElement.textContent = name || "Nul";
        this.elements.emailElement.textContent = email || "nul@example.com";
        this.updatePageTitle(name || "Nul");

        this.elements.welcomeText.textContent = firstLogin
            ? "Encantado de conocerle"
            : "Gracias por volver a unirse a la comunidad de Nul.";
        this.elements.subText.textContent = firstLogin
            ? "Gracias por unirse a la comunidad de Nul. Estamos encantados de contar con usted."
            : "Estamos encantados de contar de vuelta con usted.";

        if (profilePicture) {
            this.setProfilePicture(profilePicture);
        } else {
            this.elements.profileCircle.style.backgroundImage = "none";
            this.elements.profileIcon.style.display = "block";
        }
    }

    handleAuthStateChanged(user) {
        if (user) {
            this.fetchUserData(user.uid);
        } else {
            console.log("No hay un usuario autenticado.");
        }
    }

    handleImageSelection() {
        const fileInput = this.createFileInput();
        fileInput.click();
    }

    createFileInput() {
        const fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.accept = "image/gif*";
        fileInput.onchange = this.handleFileSelection.bind(this);
        return fileInput;
    }

    async handleFileSelection(event) {
        const file = event.target.files[0];
        if (!file) return;
    
        if (file.size > CONFIG.maxFileSize) {
            alert("La imagen es demasiado grande. Por favor, seleccione una imagen menor a 5MB.");
            return;
        }
    
        // Verificar si el archivo es un GIF
        const isGif = file.type === "image/gif";
        if (isGif) {
            this.uploadGifDirectly(file);
            return;
        }
    
        // Procesar otros tipos de imagen con Cropper.js
        const reader = new FileReader();
        reader.onload = (e) => this.showImageCropper(e.target.result);
        reader.readAsDataURL(file);
    }
    
    async uploadGifDirectly(file) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", CONFIG.cloudinary.preset);
    
        try {
            const response = await fetch(CONFIG.cloudinary.url, {
                method: "POST",
                body: formData
            });
    
            const data = await response.json();
            if (data.secure_url) {
                this.updateUserProfile(data.secure_url); // Actualiza la foto de perfil con la URL del GIF
            }
        } catch (error) {
            console.error("Error al subir el GIF:", error);
        }
    }
    

    showImageCropper(imageSrc) {
        this.cleanupCropper();
        
        this.cropperWindow = this.createCropperWindow(imageSrc);
        document.body.appendChild(this.cropperWindow);
        this.initializeCropper();
    }

    cleanupCropper() {
        if (this.cropper) {
            this.cropper.destroy();
            this.cropper = null;
        }
        if (this.cropperWindow && this.cropperWindow.parentNode) {
            this.cropperWindow.parentNode.removeChild(this.cropperWindow);
        }
    }

    createCropperWindow(imageSrc) {
        const cropperWindow = document.createElement("div");
        cropperWindow.id = "cropper-window";
        cropperWindow.innerHTML = this.getCropperTemplate(imageSrc);
        return cropperWindow;
    }

    getCropperTemplate(imageSrc) {
        return `
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&" />
            <div class="cropper-overlay">
                <div class="cropper-container">
                    <img id="cropper-image" src="${imageSrc}" />
                </div>
                <div class="cropper-controls">
                    <button id="rotate-left" title="Rotar a la izquierda"><span class="material-symbols-outlined">rotate_left</span></button>
                    <button id="rotate-right" title="Rotar a la derecha"><span class="material-symbols-outlined">rotate_right</span></button>
                    <button id="zoom-in" title="Acercar"><span class="material-symbols-outlined">zoom_in</span></button>
                    <button id="zoom-out" title="Alejar"><span class="material-symbols-outlined">zoom_out</span></button>
                    <button id="upload-button" style="color: #70baf5;">Sent photo</button>
                    <button id="cancel-button" style="color: white;">Cancelar</button>
                </div>
            </div>
        `;
    }

    initializeCropper() {
        const cropperImage = document.getElementById("cropper-image");
        this.cropper = new Cropper(cropperImage, {
            aspectRatio: 1,
            viewMode: 2,
            dragMode: 'move',
            autoCropArea: 1,
            responsive: true
        });
        this.setupCropperControls();
    }

    setupCropperControls() {
        document.getElementById("rotate-left").addEventListener("click", () => this.cropper.rotate(-90));
        document.getElementById("rotate-right").addEventListener("click", () => this.cropper.rotate(90));
        document.getElementById("zoom-in").addEventListener("click", () => this.cropper.zoom(0.1));
        document.getElementById("zoom-out").addEventListener("click", () => this.cropper.zoom(-0.1));
        document.getElementById("cancel-button").addEventListener("click", () => this.cleanupCropper());
        document.getElementById("upload-button").addEventListener("click", () => this.handleImageUpload());
    }

    async handleImageUpload() {
        const canvas = this.cropper.getCroppedCanvas({
            width: 400,
            height: 400
        });

        canvas.toBlob(async (blob) => {
            const formData = new FormData();
            formData.append("file", blob);
            formData.append("upload_preset", CONFIG.cloudinary.preset);

            try {
                const response = await fetch(CONFIG.cloudinary.url, {
                    method: "POST",
                    body: formData
                });

                const data = await response.json();
                if (data.secure_url) {
                    this.updateUserProfile(data.secure_url);
                }
            } catch (error) {
                console.error(error);
            }
        }, "image/jpeg");
    }

    async updateUserProfile(imageUrl) {
        const user = this.auth.currentUser;
        if (!user) return;

        try {
            const userRef = this.db.collection("users").doc(user.uid);
            await userRef.update({
                profilePicture: imageUrl
            });

            this.setProfilePicture(imageUrl);
            this.cleanupCropper();
        } catch (error) {
            console.error("Error updating profile:", error);
        }
    }
}

document.addEventListener("DOMContentLoaded", () => {
    new ProfileManager();
});
