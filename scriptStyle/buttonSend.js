document.addEventListener('DOMContentLoaded', function() {
    const messageInput = document.getElementById('message-input');
    const sendButton = document.getElementById('send-button');
    const messageForm = document.getElementById('message-form');

    messageInput.addEventListener('input', function() {
        if (this.value.trim() !== '') {
            sendButton.classList.add('has-text');
        } else {
            sendButton.classList.remove('has-text');
        }
    });

    // Manejar el envío del formulario
    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (messageInput.value.trim() !== '') {
            // Aquí iría la lógica para enviar el mensaje
            messageInput.value = '';
            sendButton.classList.remove('has-text');
        }
    });
});

