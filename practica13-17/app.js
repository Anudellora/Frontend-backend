/**
 * Основной скрипт приложения «Заметки» — App Shell Architecture
 * Практика 13-14 (доработка: Socket.IO + Push Notifications + Напоминания)
 *
 * Архитектура App Shell:
 * - Статическая оболочка (навигация, шапка, стили) загружается из кэша
 * - Динамический контент (страницы notes.html, about.html) — Network First
 * - Socket.IO для real-time уведомлений о новых задачах
 * - Push Notifications через PushManager + VAPID
 * - Напоминания (reminder) с планированием на сервере через setTimeout
 */

document.addEventListener('DOMContentLoaded', () => {
    // ==========================================
    // DOM ЭЛЕМЕНТЫ APP SHELL
    // ==========================================
    const contentArea = document.getElementById('content');
    const pageTitle = document.getElementById('page-title');
    const offlineIndicator = document.getElementById('offline-indicator');
    const menuToggle = document.getElementById('menu-toggle');
    const sidebar = document.getElementById('sidebar');
    const sidebarOverlay = document.getElementById('sidebar-overlay');
    const navLinks = document.querySelectorAll('.nav-link');
    const btnInstall = document.getElementById('btn-install');

    // Ключ для хранения в localStorage
    const STORAGE_KEY = 'appshell_notes';

    // Состояние заметок (структура: { id, title, text, reminder, createdAt })
    let notes = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    // Текущая страница
    let currentPage = 'notes';

    // ==========================================
    // SOCKET.IO — ПОДКЛЮЧЕНИЕ
    // ==========================================
    let socket = null;

    const initSocket = () => {
        if (typeof io === 'undefined') {
            console.warn('Socket.IO не загружен');
            return;
        }

        socket = io();

        socket.on('connect', () => {
            console.log('🔌 Socket.IO подключён:', socket.id);
        });

        // Получаем событие «taskAdded» от сервера
        socket.on('taskAdded', (task) => {
            console.log('📬 Получено событие taskAdded:', task);

            let message = `Новая заметка: "${task.title}"`;
            if (task.reminder) {
                const reminderDate = formatDate(task.reminder);
                message += ` (напоминание: ${reminderDate})`;
            }
            showToast(message);
        });

        socket.on('disconnect', () => {
            console.log('❌ Socket.IO отключён');
        });

        socket.on('connect_error', (err) => {
            console.warn('⚠️ Ошибка Socket.IO:', err.message);
        });
    };

    initSocket();

    // ==========================================
    // ВСПЛЫВАЮЩИЕ СООБЩЕНИЯ (TOAST)
    // ==========================================

    /**
     * Показать всплывающее сообщение (toast)
     */
    const showToast = (message, type = 'info') => {
        // Создаём контейнер, если его нет
        let container = document.getElementById('toast-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'toast-container';
            container.className = 'toast-container';
            document.body.appendChild(container);
        }

        const toast = document.createElement('div');
        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${type === 'success' ? '✅' : type === 'error' ? '❌' : '🔔'}</span>
            <span class="toast-message">${message}</span>
        `;

        container.appendChild(toast);

        // Анимация появления
        requestAnimationFrame(() => {
            toast.classList.add('toast-visible');
        });

        // Автоудаление через 4 секунды
        setTimeout(() => {
            toast.classList.remove('toast-visible');
            toast.classList.add('toast-hiding');
            setTimeout(() => toast.remove(), 400);
        }, 4000);
    };

    // ==========================================
    // НАВИГАЦИЯ (App Shell роутинг)
    // ==========================================

    /**
     * Загрузка динамической страницы по стратегии Network First
     */
    const loadPage = async (pageName) => {
        currentPage = pageName;

        // Обновляем навигацию
        navLinks.forEach(link => {
            link.classList.toggle('active', link.dataset.page === pageName);
        });

        // Обновляем заголовок
        const titles = {
            notes: 'Заметки',
            about: 'О нас'
        };
        pageTitle.textContent = titles[pageName] || 'Заметки';

        // Закрываем мобильное меню
        closeSidebar();

        // Загрузка динамического контента (Network First реализована в SW)
        try {
            const response = await fetch(`./pages/${pageName}.html`);
            if (!response.ok) throw new Error(`HTTP ${response.status}`);
            const html = await response.text();

            // Вставляем контент с анимацией
            contentArea.style.opacity = '0';
            contentArea.style.transform = 'translateY(8px)';

            setTimeout(() => {
                contentArea.innerHTML = html;
                contentArea.style.opacity = '1';
                contentArea.style.transform = 'translateY(0)';

                // Инициализируем логику страницы
                if (pageName === 'notes') {
                    initNotesPage();
                }
            }, 150);

        } catch (error) {
            console.error('Ошибка загрузки страницы:', error);
            contentArea.innerHTML = `
                <div class="notes-empty">
                    <div class="notes-empty-icon">⚠️</div>
                    <p class="notes-empty-text">Не удалось загрузить страницу.<br>Проверьте соединение с сетью.</p>
                </div>
            `;
        }
    };

    // Обработка кликов по навигации
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const page = link.dataset.page;
            if (page) {
                window.location.hash = page;
            }
        });
    });

    // Обработка хэш-навигации
    const handleHashChange = () => {
        const hash = window.location.hash.replace('#', '') || 'notes';
        loadPage(hash);
    };

    window.addEventListener('hashchange', handleHashChange);

    // ==========================================
    // МОБИЛЬНОЕ МЕНЮ
    // ==========================================
    const openSidebar = () => {
        sidebar.classList.add('open');
        sidebarOverlay.classList.add('active');
    };

    const closeSidebar = () => {
        sidebar.classList.remove('open');
        sidebarOverlay.classList.remove('active');
    };

    menuToggle.addEventListener('click', () => {
        if (sidebar.classList.contains('open')) {
            closeSidebar();
        } else {
            openSidebar();
        }
    });

    sidebarOverlay.addEventListener('click', closeSidebar);

    // ==========================================
    // ЛОГИКА СТРАНИЦЫ ЗАМЕТОК
    // ==========================================

    /**
     * Инициализация страницы заметок (после загрузки HTML-фрагмента)
     */
    const initNotesPage = () => {
        const noteForm = document.getElementById('note-form');
        const noteTitle = document.getElementById('note-title');
        const noteText = document.getElementById('note-text');
        const noteReminder = document.getElementById('note-reminder');
        const notesGrid = document.getElementById('notes-grid');

        if (!noteForm || !notesGrid) return;

        // Устанавливаем минимальную дату — текущее время (Закомментировано из-за багов с валидацией HTML5)
        /*
        if (noteReminder) {
            const now = new Date();
            // Формат для datetime-local: YYYY-MM-DDTHH:mm
            const localIso = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
                .toISOString().slice(0, 16);
            noteReminder.min = localIso;
        }
        */

        // Инициализируем кнопку уведомлений (если есть на странице)
        initPushButtons();

        // Отрисовка заметок
        const renderNotes = () => {
            if (notes.length === 0) {
                notesGrid.innerHTML = `
                    <div class="notes-empty">
                        <div class="notes-empty-icon">📝</div>
                        <p class="notes-empty-text">Нет заметок. Создайте первую!</p>
                    </div>
                `;
                return;
            }

            notesGrid.innerHTML = notes
                .sort((a, b) => b.createdAt - a.createdAt)
                .map((note, index) => {
                    // Определяем статус напоминания
                    let reminderBadge = '';
                    if (note.reminder) {
                        const now = Date.now();
                        const isPast = note.reminder <= now;
                        const reminderDateStr = formatDate(note.reminder);

                        if (isPast) {
                            reminderBadge = `
                                <div class="reminder-badge reminder-past">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    <span>Сработало: ${reminderDateStr}</span>
                                </div>
                            `;
                        } else {
                            reminderBadge = `
                                <div class="reminder-badge reminder-active">
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <circle cx="12" cy="12" r="10"/>
                                        <polyline points="12 6 12 12 16 14"/>
                                    </svg>
                                    <span>⏰ ${reminderDateStr}</span>
                                </div>
                            `;
                        }
                    }

                    return `
                        <div class="note-card ${note.reminder && note.reminder > Date.now() ? 'note-card-reminder' : ''}" style="animation-delay: ${index * 0.05}s">
                            <div class="note-card-header">
                                <span class="note-card-title">${escapeHTML(note.title)}</span>
                                <span class="note-card-date">${formatDate(note.createdAt)}</span>
                                <button class="btn-delete-note" data-id="${note.id}" aria-label="Удалить заметку">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <path d="M3 6h18"/>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                                        <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                                    </svg>
                                </button>
                            </div>
                            ${note.text ? `<div class="note-card-body">${escapeHTML(note.text)}</div>` : ''}
                            ${reminderBadge}
                        </div>
                    `;
                }).join('');
        };

        // Добавление заметки
        noteForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const title = noteTitle.value.trim();
            const text = noteText.value.trim();
            const reminderValue = noteReminder ? noteReminder.value : '';

            if (title) {
                // Формируем reminder timestamp (или null)
                let reminder = null;
                if (reminderValue) {
                    reminder = new Date(reminderValue).getTime();

                    // Проверяем, что время в будущем
                    if (reminder <= Date.now()) {
                        showToast('Время напоминания должно быть в будущем', 'error');
                        return;
                    }
                }

                const newNote = {
                    id: Date.now().toString(),
                    title,
                    text,
                    reminder,
                    createdAt: Date.now()
                };

                notes.push(newNote);
                saveNotes();
                renderNotes();
                noteTitle.value = '';
                noteText.value = '';
                if (noteReminder) noteReminder.value = '';
                noteTitle.focus();

                // Отправляем событие newTask через Socket.IO
                if (socket && socket.connected) {
                    socket.emit('newTask', newNote);
                    console.log('📤 Отправлено событие newTask:', newNote.title);
                }

                // Если есть напоминание — дополнительно планируем на сервере
                if (reminder) {
                    scheduleReminderOnServer(newNote.id, newNote.title, reminder);
                    showToast(`Напоминание установлено на ${formatDate(reminder)}`, 'success');
                }
            }
        });

        // Удаление заметки (делегирование)
        notesGrid.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete-note');
            if (deleteBtn) {
                const id = deleteBtn.dataset.id;

                // Отменяем напоминание на сервере, если оно было
                const note = notes.find(n => n.id === id);
                if (note && note.reminder) {
                    cancelReminderOnServer(id);
                }

                notes = notes.filter(n => n.id !== id);
                saveNotes();
                renderNotes();
            }
        });

        renderNotes();
    };

    /**
     * Планирование напоминания на сервере
     */
    const scheduleReminderOnServer = async (noteId, title, reminder) => {
        try {
            await fetch('/schedule-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteId, title, reminder })
            });
            console.log('⏰ Напоминание запланировано на сервере');
        } catch (err) {
            console.error('Ошибка планирования напоминания:', err);
        }
    };

    /**
     * Отмена напоминания на сервере
     */
    const cancelReminderOnServer = async (noteId) => {
        try {
            await fetch('/cancel-reminder', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ noteId })
            });
            console.log('🗑️  Напоминание отменено на сервере');
        } catch (err) {
            console.error('Ошибка отмены напоминания:', err);
        }
    };

    /**
     * Сохранение заметок
     */
    const saveNotes = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
    };

    /**
     * Экранирование HTML
     */
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    /**
     * Форматирование даты
     */
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // ==========================================
    // PUSH-УВЕДОМЛЕНИЯ
    // ==========================================

    /**
     * Получаем публичный VAPID-ключ с сервера
     */
    const getVapidPublicKey = async () => {
        try {
            const res = await fetch('/vapidPublicKey');
            const data = await res.json();
            return data.publicKey;
        } catch (err) {
            console.error('Не удалось получить VAPID-ключ:', err);
            return null;
        }
    };

    /**
     * urlBase64ToUint8Array — конвертация VAPID-ключа
     */
    const urlBase64ToUint8Array = (base64String) => {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        const rawData = atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    };

    /**
     * Получение или регистрация Service Worker
     */
    const getOrRegisterSW = async () => {
        let registration = await navigator.serviceWorker.getRegistration();
        if (!registration) {
            console.log('Регистрация Service Worker (fallback)...');
            registration = await navigator.serviceWorker.register('./sw.js');
        }
        return registration;
    };

    /**
     * Подписка на push-уведомления
     */
    const subscribeToPush = async () => {
        try {
            const permission = await Notification.requestPermission();
            if (permission !== 'granted') {
                showToast('Разрешение на уведомления отклонено', 'error');
                return false;
            }

            const registration = await getOrRegisterSW();
            if (!registration) {
                showToast('Ошибка: не удалось инициализировать Service Worker', 'error');
                return false;
            }
            const vapidKey = await getVapidPublicKey();
            if (!vapidKey) {
                showToast('Не удалось получить ключ сервера', 'error');
                return false;
            }

            const subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(vapidKey)
            });

            // Отправляем подписку на сервер
            const res = await fetch('/subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(subscription)
            });

            if (res.ok) {
                console.log('📬 Push-подписка оформлена');
                showToast('Уведомления включены!', 'success');
                return true;
            } else {
                showToast('Ошибка сохранения подписки', 'error');
                return false;
            }
        } catch (err) {
            console.error('Ошибка подписки на push:', err);
            showToast('Ошибка подписки на уведомления', 'error');
            return false;
        }
    };

    /**
     * Отписка от push-уведомлений
     */
    const unsubscribeFromPush = async () => {
        try {
            const registration = await getOrRegisterSW();
            if (!registration) return false;
            const subscription = await registration.pushManager.getSubscription();

            if (subscription) {
                // Уведомляем сервер об отписке
                await fetch('/unsubscribe', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: subscription.endpoint })
                });

                // Отписываемся на клиенте
                await subscription.unsubscribe();
                console.log('🔕 Push-подписка отменена');
                showToast('Уведомления отключены', 'info');
                return true;
            }
            return false;
        } catch (err) {
            console.error('Ошибка отписки от push:', err);
            showToast('Ошибка отписки', 'error');
            return false;
        }
    };

    /**
     * Проверяем, подписан ли пользователь на push
     */
    const checkPushSubscription = async () => {
        try {
            const registration = await getOrRegisterSW();
            if (!registration) return false;
            const subscription = await registration.pushManager.getSubscription();
            return !!subscription;
        } catch {
            return false;
        }
    };

    /**
     * Инициализация кнопок управления push-уведомлениями
     */
    const initPushButtons = () => {
        const pushToggle = document.getElementById('push-toggle');
        const pushStatusIcon = document.getElementById('push-status-icon');
        const pushStatusText = document.getElementById('push-status-text');

        if (!pushToggle) return;

        // Проверяем поддержку push
        if (!('PushManager' in window) || !('serviceWorker' in navigator)) {
            pushToggle.disabled = true;
            pushStatusText.textContent = 'Push не поддерживается';
            return;
        }

        const iconOn = `
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
        `;
        const iconOff = `
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
            <path d="M18.63 13A17.89 17.89 0 0 1 18 8"/>
            <path d="M6.26 6.26A5.86 5.86 0 0 0 6 8c0 7-3 9-3 9h14"/>
            <line x1="1" y1="1" x2="23" y2="23"/>
        `;

        // Обновляем UI в зависимости от статуса подписки
        const updatePushUI = async () => {
            const isSubscribed = await checkPushSubscription();
            pushToggle.checked = isSubscribed;
            pushToggle.disabled = false;
            
            if (isSubscribed) {
                pushStatusIcon.innerHTML = iconOn;
                pushStatusIcon.classList.add('text-primary');
                pushStatusText.textContent = 'Уведомления включены';
            } else {
                pushStatusIcon.innerHTML = iconOff;
                pushStatusIcon.classList.remove('text-primary');
                pushStatusText.textContent = 'Уведомления выключены';
            }
        };

        pushToggle.addEventListener('change', async (e) => {
            pushToggle.disabled = true;
            pushStatusText.textContent = 'Подождите...';
            
            if (e.target.checked) {
                const success = await subscribeToPush();
                if (!success) {
                    e.target.checked = false; // rollback
                }
            } else {
                const success = await unsubscribeFromPush();
                if (!success) {
                    e.target.checked = true; // rollback
                }
            }
            
            await updatePushUI();
        });

        updatePushUI();
    };

    // ==========================================
    // ЛОГИКА OFFLINE РЕЖИМА
    // ==========================================
    const updateNetworkStatus = () => {
        if (navigator.onLine) {
            offlineIndicator.classList.add('hidden');
        } else {
            offlineIndicator.classList.remove('hidden');
        }
    };

    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    updateNetworkStatus();

    // ==========================================
    // ЛОГИКА УСТАНОВКИ (PWA)
    // ==========================================
    let deferredPrompt;

    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        if (btnInstall) btnInstall.classList.remove('hidden');
    });

    if (btnInstall) {
        btnInstall.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`Установка: ${outcome === 'accepted' ? 'принята' : 'отклонена'}`);
            deferredPrompt = null;
            btnInstall.classList.add('hidden');
        });
    }

    // ==========================================
    // РЕГИСТРАЦИЯ SERVICE WORKER (Начальная)
    // ==========================================
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('./sw.js')
            .then(reg => {
                console.log('ServiceWorker зарегистрирован. Scope:', reg.scope);
            })
            .catch(err => {
                console.error('Ошибка регистрации ServiceWorker:', err);
            });
    }

    // ==========================================
    // ИНИЦИАЛИЗАЦИЯ
    // ==========================================
    handleHashChange();
});
