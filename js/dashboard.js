// ============================================
// Dashboard Logic - PIN Access, Real-time, Popup, Random, Delete, Reset, Export
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // === Access PIN Gate ===
    const accessOverlay = document.getElementById('accessOverlay');
    const accessInput = document.getElementById('accessKeyInput');
    const accessBtn = document.getElementById('accessKeyBtn');
    const accessError = document.getElementById('accessError');

    // Clear old auth and check PIN-based auth
    const storedPin = sessionStorage.getItem('mapfre_dash_pin');
    if (storedPin === DASHBOARD_PIN) {
        accessOverlay.classList.add('hidden');
        initDashboard();
    } else {
        // Clear any old auth
        sessionStorage.removeItem('mapfre_dash_auth');
        sessionStorage.removeItem('mapfre_dash_pin');
        accessInput.focus();
    }

    function tryAccess() {
        const pin = accessInput.value.trim();
        if (pin === DASHBOARD_PIN) {
            sessionStorage.setItem('mapfre_dash_pin', pin);
            accessOverlay.classList.add('hidden');
            initDashboard();
        } else {
            accessInput.classList.add('error');
            accessError.classList.add('visible');
            setTimeout(() => accessInput.classList.remove('error'), 500);
        }
    }

    accessBtn.addEventListener('click', tryAccess);
    accessInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') tryAccess();
        accessError.classList.remove('visible');
    });

    // === Custom Confirm Dialog ===
    const confirmOverlay = document.getElementById('confirmOverlay');
    const confirmTitle = document.getElementById('confirmTitle');
    const confirmText = document.getElementById('confirmText');
    const confirmPinGroup = document.getElementById('confirmPinGroup');
    const confirmPinInput = document.getElementById('confirmPinInput');
    const confirmPinError = document.getElementById('confirmPinError');
    const confirmCancel = document.getElementById('confirmCancel');
    const confirmOk = document.getElementById('confirmOk');

    let confirmCallback = null;
    let confirmRequiresPin = false;

    function showConfirm(title, text, requiresPin, callback) {
        confirmTitle.textContent = title;
        confirmText.textContent = text;
        confirmRequiresPin = requiresPin;
        confirmCallback = callback;

        if (requiresPin) {
            confirmPinGroup.style.display = 'block';
            confirmPinInput.value = '';
            confirmPinError.classList.remove('visible');
        } else {
            confirmPinGroup.style.display = 'none';
        }

        confirmOverlay.classList.add('active');
        if (requiresPin) {
            setTimeout(() => confirmPinInput.focus(), 100);
        }
    }

    function hideConfirm() {
        confirmOverlay.classList.remove('active');
        confirmCallback = null;
    }

    confirmCancel.addEventListener('click', hideConfirm);

    confirmOk.addEventListener('click', () => {
        if (confirmRequiresPin) {
            const pin = confirmPinInput.value.trim();
            if (pin !== DASHBOARD_PIN) {
                confirmPinInput.classList.add('error');
                confirmPinError.classList.add('visible');
                setTimeout(() => confirmPinInput.classList.remove('error'), 500);
                return;
            }
        }
        if (confirmCallback) confirmCallback();
        hideConfirm();
    });

    confirmPinInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') confirmOk.click();
        confirmPinError.classList.remove('visible');
    });

    confirmOverlay.addEventListener('click', (e) => {
        if (e.target === confirmOverlay) hideConfirm();
    });

    // === Back to Top Button ===
    const backToTop = document.getElementById('backToTop');
    window.addEventListener('scroll', () => {
        backToTop.classList.toggle('visible', window.scrollY > 400);
    });
    backToTop.addEventListener('click', () => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // === QR Fullscreen ===
    const qrFrame = document.getElementById('qrFrame');
    const qrFullscreen = document.getElementById('qrFullscreen');
    const qrFullscreenClose = document.getElementById('qrFullscreenClose');

    if (qrFrame && qrFullscreen) {
        qrFrame.addEventListener('click', () => {
            qrFullscreen.classList.add('active');
        });
        qrFullscreenClose.addEventListener('click', () => {
            qrFullscreen.classList.remove('active');
        });
        qrFullscreen.addEventListener('click', (e) => {
            if (e.target === qrFullscreen) qrFullscreen.classList.remove('active');
        });
    }

    // === Main Dashboard Init ===
    function initDashboard() {
        const questionsContainer = document.getElementById('questionsFeed');
        const questionCount = document.getElementById('questionCount');
        const emptyState = document.getElementById('emptyState');
        const exportBtn = document.getElementById('exportBtn');
        const dataTableBody = document.getElementById('dataTableBody');
        const randomBtn = document.getElementById('randomBtn');
        const resetBtn = document.getElementById('resetBtn');

        // Popup
        const popupOverlay = document.getElementById('questionPopup');
        const popupText = document.getElementById('popupText');
        const popupAuthor = document.getElementById('popupAuthor');
        const popupBadge = document.getElementById('popupBadgeText');
        const closePopup = document.getElementById('closePopup');

        // Tabs
        document.querySelectorAll('.tab').forEach(tab => {
            tab.addEventListener('click', () => {
                const target = tab.dataset.tab;
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                tab.classList.add('active');
                document.getElementById(target).classList.add('active');
            });
        });

        // Search
        const searchInput = document.getElementById('searchInput');
        const searchClear = document.getElementById('searchClear');
        let searchTerm = '';

        if (searchInput) {
            searchInput.addEventListener('input', () => {
                searchTerm = searchInput.value.toLowerCase().trim();
                searchClear.style.display = searchTerm ? 'flex' : 'none';
                filterQuestions();
            });
            searchClear.addEventListener('click', () => {
                searchInput.value = '';
                searchTerm = '';
                searchClear.style.display = 'none';
                filterQuestions();
            });
        }

        function filterQuestions() {
            const cards = questionsContainer.querySelectorAll('.question-card');
            let visibleCount = 0;
            cards.forEach(card => {
                const text = (card.dataset.consulta + ' ' + card.dataset.nombre).toLowerCase();
                const match = !searchTerm || text.includes(searchTerm);
                card.style.display = match ? '' : 'none';
                if (match) visibleCount++;
            });
        }

        let allQuestions = [];
        let questionCounter = 0;
        const questionsRef = database.ref('consultas');

        questionsRef.on('child_added', (snapshot) => {
            const data = snapshot.val();
            data.id = snapshot.key;
            questionCounter++;
            data.number = questionCounter;
            allQuestions.push(data);
            addQuestionCard(data);
            addTableRow(data);
            questionCount.textContent = allQuestions.length;
            emptyState.style.display = 'none';
        });

        questionsRef.on('child_removed', (snapshot) => {
            const removedId = snapshot.key;
            allQuestions = allQuestions.filter(q => q.id !== removedId);
            const card = document.getElementById('card-' + removedId);
            if (card) {
                card.style.animation = 'fadeOut 0.3s ease forwards';
                setTimeout(() => card.remove(), 300);
            }
            const row = document.getElementById('row-' + removedId);
            if (row) row.remove();
            questionCount.textContent = allQuestions.length;
            if (allQuestions.length === 0) emptyState.style.display = 'block';
        });

        questionsRef.once('value', (snapshot) => {
            if (!snapshot.exists()) emptyState.style.display = 'block';
        });

        function addQuestionCard(data) {
            const card = document.createElement('div');
            card.className = 'question-card new';
            card.id = 'card-' + data.id;
            card.dataset.consulta = data.consulta;
            card.dataset.nombre = data.nombre;
            card.innerHTML = `
        <div class="question-actions">
          <div class="question-number">#${data.number}</div>
          <button class="question-delete" data-id="${data.id}" title="Eliminar consulta">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
            </svg>
          </button>
        </div>
        <p class="question-text">${escapeHtml(data.consulta)}</p>
        <div class="question-meta">
          <span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
              <circle cx="12" cy="7" r="4"/>
            </svg>
            ${escapeHtml(data.nombre)}
          </span>
        </div>
      `;

            // Apply search filter if active
            if (searchTerm) {
                const text = (data.consulta + ' ' + data.nombre).toLowerCase();
                card.style.display = text.includes(searchTerm) ? '' : 'none';
            }

            card.addEventListener('click', (e) => {
                if (e.target.closest('.question-delete')) return;
                openPopup(data);
            });

            card.querySelector('.question-delete').addEventListener('click', (e) => {
                e.stopPropagation();
                showConfirm(
                    '¿Eliminar esta consulta?',
                    '"' + data.consulta.substring(0, 60) + (data.consulta.length > 60 ? '...' : '') + '"',
                    false,
                    () => database.ref('consultas/' + data.id).remove()
                );
            });

            // Append at bottom (first question stays on top)
            questionsContainer.appendChild(card);
            setTimeout(() => card.classList.remove('new'), 3000);
        }

        function addTableRow(data) {
            const row = document.createElement('tr');
            row.id = 'row-' + data.id;
            row.innerHTML = `
        <td>${data.number}</td>
        <td>${escapeHtml(data.nombre)}</td>
        <td>${escapeHtml(data.telefono)}</td>
        <td>${escapeHtml(data.consulta)}</td>
        <td>${data.fecha || formatTimestamp(data.timestamp)}</td>
      `;
            dataTableBody.appendChild(row);
        }

        // Popup
        function openPopup(data) {
            popupText.textContent = data.consulta;
            popupAuthor.textContent = '— ' + data.nombre;
            popupBadge.textContent = 'Consulta #' + data.number;
            popupOverlay.classList.add('active');
        }

        function closePopupFn() {
            popupOverlay.classList.remove('active');
        }

        closePopup.addEventListener('click', closePopupFn);
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) closePopupFn();
        });
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') { closePopupFn(); hideConfirm(); if (qrFullscreen) qrFullscreen.classList.remove('active'); }
        });

        // Random
        randomBtn.addEventListener('click', () => {
            if (allQuestions.length === 0) return;
            const q = allQuestions[Math.floor(Math.random() * allQuestions.length)];
            popupBadge.textContent = '🎲 Selección al azar — Consulta #' + q.number;
            openPopup(q);
        });

        // Reset All
        resetBtn.addEventListener('click', () => {
            if (allQuestions.length === 0) return;
            showConfirm(
                '¿Reiniciar todas las consultas?',
                'Se eliminarán TODAS las ' + allQuestions.length + ' consultas. Esta acción no se puede deshacer.',
                true,
                () => { database.ref('consultas').remove(); questionCounter = 0; }
            );
        });

        // Export
        exportBtn.addEventListener('click', () => {
            if (allQuestions.length === 0) return;
            try {
                const data = allQuestions.map((q, i) => ({
                    'N°': i + 1,
                    'Nombre Completo': q.nombre || '',
                    'Teléfono': q.telefono || '',
                    'Consulta': q.consulta || '',
                    'Fecha y Hora': q.fecha || formatTimestamp(q.timestamp)
                }));
                const ws = XLSX.utils.json_to_sheet(data);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Consultas');
                ws['!cols'] = [{ wch: 5 }, { wch: 30 }, { wch: 18 }, { wch: 50 }, { wch: 22 }];
                XLSX.writeFile(wb, 'Consultas_Mapfre_' + new Date().toISOString().slice(0, 10) + '.xlsx');
            } catch (err) {
                // Fallback CSV
                let csv = 'N°,Nombre,Teléfono,Consulta,Fecha\n';
                allQuestions.forEach((q, i) => {
                    csv += `${i + 1},"${(q.nombre || '').replace(/"/g, '""')}","${(q.telefono || '').replace(/"/g, '""')}","${(q.consulta || '').replace(/"/g, '""')}","${q.fecha || formatTimestamp(q.timestamp)}"\n`;
                });
                const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
                const a = document.createElement('a');
                a.href = URL.createObjectURL(blob);
                a.download = 'Consultas_Mapfre_' + new Date().toISOString().slice(0, 10) + '.csv';
                a.click();
            }
        });

        function escapeHtml(text) {
            const d = document.createElement('div');
            d.textContent = text;
            return d.innerHTML;
        }

        function formatTimestamp(ts) {
            if (!ts) return '';
            return new Date(ts).toLocaleString('es-ES', {
                timeZone: 'America/Argentina/Buenos_Aires',
                day: '2-digit', month: '2-digit', year: 'numeric',
                hour: '2-digit', minute: '2-digit'
            });
        }
    }
});

// FadeOut animation
const s = document.createElement('style');
s.textContent = '@keyframes fadeOut{from{opacity:1;transform:translateX(0)}to{opacity:0;transform:translateX(20px)}}';
document.head.appendChild(s);
