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

    messageForm.addEventListener('submit', function(e) {
        e.preventDefault();
        if (messageInput.value.trim() !== '') {
            messageInput.value = '';
            sendButton.classList.remove('has-text');
        }
    });
});

