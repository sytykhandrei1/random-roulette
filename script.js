class RouletteApp {
    constructor() {
        this.participants = [];
        // nextSpinPenalty хранит штрафы (мультипликаторы вероятности) на СЛЕДУЮЩИЙ спин
        // пример: { "Иван": 0.5 } — в следующем спине шанс в 2 раза меньше
        this.nextSpinPenalty = new Map();
        this.stats = new Map(); // Статистика побед
        this.allTimeParticipants = new Set(); // Для саджестов
        this.maxParticipants = 30;
        // Эмодзи-аватары участников
        this.avatars = new Map();
        
        this.initializeElements();
        this.loadData();
        this.setupEventListeners();
        this.updateUI();
    }

    initializeElements() {
        this.contextInput = document.getElementById('context');
        this.participantInput = document.getElementById('participant-input');
        this.addButton = document.getElementById('add-participant');
        this.suggestionsDiv = document.getElementById('suggestions');
        this.participantsList = document.getElementById('participants-list');
        this.spinDurationInput = document.getElementById('spin-duration');
        this.spinButton = document.getElementById('spin-button');
        this.resultSection = document.getElementById('result-section');
        this.winnerDisplay = document.getElementById('winner-display');
        this.confettiContainer = document.getElementById('confetti-container');
        this.statsContent = document.getElementById('stats-content');
        this.resetStatsButton = document.getElementById('reset-stats');
    }

    setupEventListeners() {
        this.addButton.addEventListener('click', () => this.addParticipant());
        this.participantInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addParticipant();
        });
        this.participantInput.addEventListener('input', () => this.showSuggestions());
        this.spinButton.addEventListener('click', () => this.spinRoulette());
        this.resetStatsButton.addEventListener('click', () => this.resetStats());
        
        // Закрытие саджестов при клике вне их
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.suggestions') && !e.target.closest('#participant-input')) {
                this.hideSuggestions();
            }
        });
    }

    addParticipant() {
        const name = this.participantInput.value.trim();
        
        if (!name) {
            alert('Введите имя участника');
            return;
        }
        
        if (this.participants.length >= this.maxParticipants) {
            alert(`Максимум ${this.maxParticipants} участников`);
            return;
        }
        
        if (this.participants.includes(name)) {
            alert('Этот участник уже добавлен');
            return;
        }
        
        this.participants.push(name);
        // Назначаем эмодзи-аватар при первом добавлении
        if (!this.avatars.has(name)) {
            this.avatars.set(name, this.generateRandomEmoji());
        }
        this.allTimeParticipants.add(name);
        this.participantInput.value = '';
        this.hideSuggestions();
        this.updateUI();
        this.saveData();
    }

    removeParticipant(name) {
        this.participants = this.participants.filter(p => p !== name);
        this.updateUI();
        this.saveData();
    }

    showSuggestions() {
        const query = this.participantInput.value.trim().toLowerCase();
        
        if (query.length < 1) {
            this.hideSuggestions();
            return;
        }
        
        const suggestions = Array.from(this.allTimeParticipants)
            .filter(name => name.toLowerCase().includes(query) && !this.participants.includes(name))
            .slice(0, 5);
        
        if (suggestions.length === 0) {
            this.hideSuggestions();
            return;
        }
        
        this.suggestionsDiv.innerHTML = suggestions
            .map(name => `<div class="suggestion-item" data-name="${name}">${name}</div>`)
            .join('');
        
        this.suggestionsDiv.style.display = 'block';
        
        // Добавляем обработчики кликов на саджесты
        this.suggestionsDiv.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                this.participantInput.value = item.dataset.name;
                this.hideSuggestions();
            });
        });
    }

    hideSuggestions() {
        this.suggestionsDiv.style.display = 'none';
    }

    updateUI() {
        // Обновляем список участников карточками
        const totalWins = Array.from(this.stats.values()).reduce((sum, wins) => sum + wins, 0);
        this.participantsList.innerHTML = this.participants.map(name => {
            const wins = this.stats.get(name) || 0;
            const percentage = totalWins > 0 ? ((wins / totalWins) * 100).toFixed(0) : 0;
            const avatar = this.avatars.get(name) || '🙂';
            const hasTotem = this.nextSpinPenalty.has(name) && (this.nextSpinPenalty.get(name) < 1);
            return `
                <div class="participant-card">
                    <div class="participant-avatar" aria-hidden="true">${avatar}</div>
                    <div class="participant-info">
                        <div class="participant-name">${name}</div>
                        <div class="participant-stats">${percentage}% побед</div>
                    </div>
                    <div class="participant-actions">
                        <div class="totem ${hasTotem ? 'active' : ''}" title="Тотем: −50% шанса в следующий спин"></div>
                        <button class="remove" onclick="app.removeParticipant('${name}')" aria-label="Удалить">×</button>
                    </div>
                </div>
            `;
        }).join('');
        
        // Обновляем кнопку запуска
        this.spinButton.disabled = this.participants.length < 2;
        
        // Обновляем статистику
        this.updateStats();
    }

    updateStats() {
        if (this.stats.size === 0) {
            this.statsContent.innerHTML = '<p>Пока нет данных</p>';
            return;
        }
        
        const totalWins = Array.from(this.stats.values()).reduce((sum, wins) => sum + wins, 0);
        
        const statsHTML = Array.from(this.stats.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([name, wins]) => {
                const percentage = totalWins > 0 ? ((wins / totalWins) * 100).toFixed(1) : 0;
                return `
                    <div class="stat-item">
                        <span class="stat-name">${name}</span>
                        <div class="stat-values">
                            <span>Побед: ${wins}</span>
                            <span>Процент: ${percentage}%</span>
                        </div>
                    </div>
                `;
            }).join('');
        
        this.statsContent.innerHTML = statsHTML;
    }

    spinRoulette() {
        if (this.participants.length < 2) return;
        
        this.spinButton.disabled = true;
        this.resultSection.classList.add('hidden');
        
        // Создаем рулетку
        this.createRoulette();
        
        // Запускаем анимацию
        const duration = parseInt(this.spinDurationInput.value) * 1000;
        setTimeout(() => {
            this.selectWinner();
        }, duration);
    }

    createRoulette() {
        // Создаем визуальную рулетку
        const rouletteContainer = document.createElement('div');
        rouletteContainer.id = 'roulette-container';
        rouletteContainer.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 300px;
            height: 300px;
            border-radius: 50%;
            background: conic-gradient(${this.participants.map((_, i) => 
                `hsl(${i * 360 / this.participants.length}, 70%, 60%)`
            ).join(', ')});
            z-index: 1000;
            animation: spin 3s linear infinite;
            box-shadow: 0 0 20px rgba(0,0,0,0.3);
        `;
        
        // Добавляем стили для анимации
        const style = document.createElement('style');
        style.textContent = `
            @keyframes spin {
                from { transform: translate(-50%, -50%) rotate(0deg); }
                to { transform: translate(-50%, -50%) rotate(3600deg); }
            }
        `;
        document.head.appendChild(style);
        
        document.body.appendChild(rouletteContainer);
        
        // Удаляем рулетку после анимации
        setTimeout(() => {
            document.body.removeChild(rouletteContainer);
            document.head.removeChild(style);
        }, parseInt(this.spinDurationInput.value) * 1000);
    }

    selectWinner() {
        // Выбираем победителя с учетом штрафов на текущий спин
        const weightedParticipants = [];
        this.participants.forEach(name => {
            const factor = this.nextSpinPenalty.get(name) || 1; // < 1 значит штраф
            // Преобразуем коэффициент в целое количество "билетов"
            // Минимум 1 билет для каждого
            const tickets = Math.max(1, Math.round(10 * factor)); // 10 билетов по умолчанию, 5 если 0.5
            for (let i = 0; i < tickets; i++) {
                weightedParticipants.push(name);
            }
        });
        
        const randomIndex = Math.floor(Math.random() * weightedParticipants.length);
        const winner = weightedParticipants[randomIndex];
        
        // Обновляем статистику
        this.stats.set(winner, (this.stats.get(winner) || 0) + 1);
        
        // Назначаем победителю штраф на СЛЕДУЮЩИЙ спин: шанс ×0.5
        this.nextSpinPenalty.set(winner, 0.5);
        
        // Показываем результат
        this.showResult(winner);
        
        // Обновляем UI, чтобы показать активный тотем у победителя
        this.updateUI();
        
        this.spinButton.disabled = false;
        this.saveData();
    }

    showResult(winner) {
        const context = this.contextInput.value.trim();
        const resultText = context ? `${winner}, ${context}` : winner;
        
        this.winnerDisplay.textContent = resultText;
        this.resultSection.classList.remove('hidden');
        
        // Запускаем конфетти
        this.createConfetti();
        
        // Обновляем статистику
        this.updateStats();
    }

    createConfetti() {
        const colors = ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57', '#ff9ff3'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.cssText = `
                left: ${Math.random() * 100}%;
                background: ${colors[Math.floor(Math.random() * colors.length)]};
                animation-delay: ${Math.random() * 3}s;
                animation-duration: ${3 + Math.random() * 2}s;
            `;
            
            this.confettiContainer.appendChild(confetti);
            
            // Удаляем конфетти после анимации
            setTimeout(() => {
                if (confetti.parentNode) {
                    confetti.parentNode.removeChild(confetti);
                }
            }, 5000);
        }
    }

    resetStats() {
        if (confirm('Вы уверены, что хотите сбросить всю статистику?')) {
            this.stats.clear();
            this.winnerWeights.clear();
            this.updateStats();
            this.saveData();
        }
    }

    saveData() {
        const data = {
            participants: this.participants,
            allTimeParticipants: Array.from(this.allTimeParticipants),
            stats: Array.from(this.stats.entries()),
            context: this.contextInput.value,
            avatars: Array.from(this.avatars.entries()),
            penalties: Array.from(this.nextSpinPenalty.entries())
        };
        localStorage.setItem('rouletteData', JSON.stringify(data));
    }

    loadData() {
        const data = localStorage.getItem('rouletteData');
        if (data) {
            try {
                const parsed = JSON.parse(data);
                this.participants = parsed.participants || [];
                this.allTimeParticipants = new Set(parsed.allTimeParticipants || []);
                this.stats = new Map(parsed.stats || []);
                this.contextInput.value = parsed.context || '';
                this.avatars = new Map(parsed.avatars || []);
                this.nextSpinPenalty = new Map(parsed.penalties || []);
            } catch (e) {
                console.error('Ошибка загрузки данных:', e);
            }
        }
    }

    generateRandomEmoji() {
        const pool = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐷','🐸','🐵','🦄','🐔','🐧','🐦','🐤'];
        return pool[Math.floor(Math.random() * pool.length)];
    }
}

// Инициализация приложения
const app = new RouletteApp();
