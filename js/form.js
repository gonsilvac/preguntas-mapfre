// ============================================
// Form Logic - Public Q&A Submission
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('questionForm');
    const submitBtn = document.getElementById('submitBtn');
    const successOverlay = document.getElementById('successOverlay');
    const closeSuccessBtn = document.getElementById('closeSuccess');

    // Phone input: allow only digits and +
    const phoneInput = document.getElementById('phone');
    phoneInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/[^\d+\-\s()]/g, '');
    });

    // Form submission
    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const nombre = document.getElementById('nombre').value.trim();
        const telefono = document.getElementById('phone').value.trim();
        const consulta = document.getElementById('consulta').value.trim();

        // Basic validation
        if (!nombre || !telefono || !consulta) {
            shakeButton(submitBtn);
            return;
        }

        // Disable button and show loading
        submitBtn.classList.add('loading');
        submitBtn.disabled = true;

        try {
            // Push to Firebase Realtime Database
            const newQuestionRef = database.ref('consultas').push();
            await newQuestionRef.set({
                nombre: nombre,
                telefono: telefono,
                consulta: consulta,
                timestamp: firebase.database.ServerValue.TIMESTAMP,
                fecha: new Date().toLocaleString('es-ES', {
                    timeZone: 'America/Argentina/Buenos_Aires'
                })
            });

            // Show success overlay
            successOverlay.classList.add('active');
            form.reset();
        } catch (error) {
            console.error('Error al enviar consulta:', error);
            alert('Hubo un error al enviar tu consulta. Por favor, intenta de nuevo.');
        } finally {
            submitBtn.classList.remove('loading');
            submitBtn.disabled = false;
        }
    });

    // Close success overlay
    closeSuccessBtn.addEventListener('click', () => {
        successOverlay.classList.remove('active');
    });

    // Close on overlay background click
    successOverlay.addEventListener('click', (e) => {
        if (e.target === successOverlay) {
            successOverlay.classList.remove('active');
        }
    });

    // Shake animation for validation
    function shakeButton(btn) {
        btn.style.animation = 'shake 0.4s ease';
        btn.addEventListener('animationend', () => {
            btn.style.animation = '';
        }, { once: true });
    }
});

// Shake keyframes (added via JS)
const style = document.createElement('style');
style.textContent = `
  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    20% { transform: translateX(-8px); }
    40% { transform: translateX(8px); }
    60% { transform: translateX(-4px); }
    80% { transform: translateX(4px); }
  }
`;
document.head.appendChild(style);
