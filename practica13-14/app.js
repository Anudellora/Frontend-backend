/**
 * Основной скрипт приложения To-Do List
 * Отвечает за логику UI, работу с localStorage и регистрацию Service Worker
 */

document.addEventListener('DOMContentLoaded', () => {
    // DOM Элементы
    const todoForm = document.getElementById('todo-form');
    const todoInput = document.getElementById('todo-input');
    const todoList = document.getElementById('todo-list');
    const offlineIndicator = document.getElementById('offline-indicator');

    // Ключ для хранения в localStorage
    const STORAGE_KEY = 'pwa_todos';

    // Состояние задач
    let todos = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

    /**
     * Отрисовка списка задач
     */
    const renderTodos = () => {
        todoList.innerHTML = '';
        
        if (todos.length === 0) {
            todoList.innerHTML = '<li class="todo-item" style="justify-content: center; color: var(--text-muted);">Нет активных задач</li>';
            return;
        }

        todos.forEach(todo => {
            const li = document.createElement('li');
            li.className = 'todo-item';
            
            li.innerHTML = `
                <span class="todo-text">${escapeHTML(todo.text)}</span>
                <button class="btn-delete" data-id="${todo.id}" aria-label="Удалить задачу">
                    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                    </svg>
                </button>
            `;
            
            todoList.appendChild(li);
        });
    };

    /**
     * Сохранение задач в localStorage
     */
    const saveTodos = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
    };

    /**
     * Экранирование HTML для предотвращения XSS
     */
    const escapeHTML = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };

    /**
     * Обработчик добавления задачи
     */
    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = todoInput.value.trim();
        
        if (text) {
            const newTodo = {
                id: Date.now().toString(),
                text: text
            };
            
            todos.push(newTodo);
            saveTodos();
            renderTodos();
            todoInput.value = '';
        }
    });

    /**
     * Обработчик удаления задачи (делегирование событий)
     */
    todoList.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.btn-delete');
        if (deleteBtn) {
            const id = deleteBtn.getAttribute('data-id');
            todos = todos.filter(todo => todo.id !== id);
            saveTodos();
            renderTodos();
        }
    });

    // Первоначальная отрисовка
    renderTodos();

    // ==========================================
    // ЛОГИКА OFFLINE РЕЖИМА И SERVICE WORKER
    // ==========================================

    /**
     * Обновление индикатора сети
     */
    const updateNetworkStatus = () => {
        if (navigator.onLine) {
            offlineIndicator.classList.add('hidden');
        } else {
            offlineIndicator.classList.remove('hidden');
        }
    };

    // Слушатели событий изменения статуса сети
    window.addEventListener('online', updateNetworkStatus);
    window.addEventListener('offline', updateNetworkStatus);
    
    // Инициализация статуса при загрузке
    updateNetworkStatus();

    // ==========================================
    // ЛОГИКА УСТАНОВКИ ПРИЛОЖЕНИЯ (PWA)
    // ==========================================
    const btnInstall = document.getElementById('btn-install');
    let deferredPrompt;

    // Браузер генерирует событие, если приложение может быть установлено
    window.addEventListener('beforeinstallprompt', (e) => {
        // Запрещаем автоматический показ стандартного предложения браузера
        e.preventDefault();
        // Сохраняем событие для вызова в будущем
        deferredPrompt = e;
        // Показываем кнопку "Установить" для пользователя
        if (btnInstall) {
            btnInstall.classList.remove('hidden');
        }
    });

    if (btnInstall) {
        btnInstall.addEventListener('click', async () => {
            if (!deferredPrompt) return;
            
            // Показываем стандартное окно установки PWA
            deferredPrompt.prompt();
            
            // Дожидаемся ответа пользователя
            const { outcome } = await deferredPrompt.userChoice;
            console.log(`Пользователь ${outcome === 'accepted' ? 'принял' : 'отклонил'} установку`);
            
            // Больше событие использовать нельзя
            deferredPrompt = null;
            // Прячем кнопку
            btnInstall.classList.add('hidden');
        });
    }

    /**
     * Регистрация Service Worker
     */
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('./sw.js')
                .then(registration => {
                    console.log('ServiceWorker успешно зарегистрирован. Область видимости:', registration.scope);
                })
                .catch(error => {
                    console.error('Ошибка регистрации ServiceWorker:', error);
                });
        });
    } else {
        console.warn('Ваш браузер не поддерживает Service Workers.');
    }
});
