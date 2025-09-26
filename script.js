// Game state
const gameState = {
    count: 0,
    timeLeft: 10,
    totalTime: 10,
    timerInterval: null,
    isRunning: false,
    scores: JSON.parse(localStorage.getItem('clickTestScores')) || [],
    soundEnabled: false,
    spacebarEnabled: true,
    clickEffectsEnabled: true,
    achievementsEnabled: true,
    currentTheme: localStorage.getItem('clickTestTheme') || 'dark',
    achievements: JSON.parse(localStorage.getItem('clickTestAchievements')) || []
};

// DOM elements
const elements = {
    timer: document.getElementById('timer'),
    counter: document.getElementById('counter'),
    clickArea: document.getElementById('clickArea'),
    result: document.getElementById('result'),
    startBtn: document.getElementById('startBtn'),
    resetBtn: document.getElementById('resetBtn'),
    timeButtons: document.querySelectorAll('.time-btn'),
    themeButtons: document.querySelectorAll('.theme-btn'),
    progressRing: document.getElementById('progressRing'),
    bestScore: document.getElementById('bestScore'),
    avgScore: document.getElementById('avgScore'),
    historyList: document.getElementById('historyList'),
    soundToggle: document.getElementById('soundToggle'),
    spacebarToggle: document.getElementById('spacebarToggle'),
    clickEffectsToggle: document.getElementById('clickEffectsToggle'),
    achievementToggle: document.getElementById('achievementToggle'),
    clickText: document.querySelector('.click-text'),
    menuBtn: document.getElementById('menuBtn'),
    menuDropdown: document.getElementById('menuDropdown'),
    achievement: document.getElementById('achievement')
};

// Initialize the game
function init() {
    // Load settings from localStorage
    gameState.soundEnabled = localStorage.getItem('soundEnabled') === 'true';
    gameState.spacebarEnabled = localStorage.getItem('spacebarEnabled') !== 'false';
    gameState.clickEffectsEnabled = localStorage.getItem('clickEffectsEnabled') !== 'false';
    gameState.achievementsEnabled = localStorage.getItem('achievementsEnabled') !== 'false';
    
    // Set toggle states
    elements.soundToggle.checked = gameState.soundEnabled;
    elements.spacebarToggle.checked = gameState.spacebarEnabled;
    elements.clickEffectsToggle.checked = gameState.clickEffectsEnabled;
    elements.achievementToggle.checked = gameState.achievementsEnabled;
    
    // Apply theme
    applyTheme(gameState.currentTheme);
    setActiveThemeButton(gameState.currentTheme);
    
    updateTimerDisplay();
    updateStats();
    setupEventListeners();
}

// Set up event listeners
function setupEventListeners() {
    // Click area
    elements.clickArea.addEventListener('click', handleClick);
    
    // Start button
    elements.startBtn.addEventListener('click', startGame);
    
    // Reset button
    elements.resetBtn.addEventListener('click', resetGame);
    
    // Time selection buttons
    elements.timeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (gameState.isRunning) return;
            gameState.timeLeft = parseInt(this.dataset.time);
            gameState.totalTime = gameState.timeLeft;
            setActiveTimeButton(gameState.timeLeft);
            updateTimerDisplay();
        });
    });
    
    // Theme selection buttons
    elements.themeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const theme = this.dataset.theme;
            applyTheme(theme);
            setActiveThemeButton(theme);
            gameState.currentTheme = theme;
            localStorage.setItem('clickTestTheme', theme);
        });
    });
    
    // Sound toggle
    elements.soundToggle.addEventListener('change', function() {
        gameState.soundEnabled = this.checked;
        localStorage.setItem('soundEnabled', gameState.soundEnabled);
    });
    
    // Spacebar toggle
    elements.spacebarToggle.addEventListener('change', function() {
        gameState.spacebarEnabled = this.checked;
        localStorage.setItem('spacebarEnabled', gameState.spacebarEnabled);
    });
    
    // Click effects toggle
    elements.clickEffectsToggle.addEventListener('change', function() {
        gameState.clickEffectsEnabled = this.checked;
        localStorage.setItem('clickEffectsEnabled', gameState.clickEffectsEnabled);
    });
    
    // Achievement toggle
    elements.achievementToggle.addEventListener('change', function() {
        gameState.achievementsEnabled = this.checked;
        localStorage.setItem('achievementsEnabled', gameState.achievementsEnabled);
    });
    
    // Spacebar support
    document.addEventListener('keydown', function(e) {
        if (e.code === 'Space' && gameState.spacebarEnabled) {
            e.preventDefault();
            if (!gameState.isRunning) {
                startGame();
            }
            if (gameState.isRunning) {
                handleClick();
            }
        }
    });
    
    // Menu button
    elements.menuBtn.addEventListener('click', function() {
        elements.menuDropdown.classList.toggle('active');
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!elements.menuBtn.contains(e.target) && !elements.menuDropdown.contains(e.target)) {
            elements.menuDropdown.classList.remove('active');
        }
    });
}

// Apply theme
function applyTheme(theme) {
    document.body.className = theme + '-theme';
}

// Set active theme button
function setActiveThemeButton(theme) {
    elements.themeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (btn.dataset.theme === theme) {
            btn.classList.add('active');
        }
    });
}

// Set active time button
function setActiveTimeButton(selectedTime) {
    elements.timeButtons.forEach(btn => {
        btn.classList.remove('active');
        if (parseInt(btn.dataset.time) === selectedTime) {
            btn.classList.add('active');
        }
    });
}

// Update timer display
function updateTimerDisplay() {
    elements.timer.textContent = gameState.timeLeft.toString().padStart(2, '0');
    
    // Update progress ring
    const progress = 100 - (gameState.timeLeft / gameState.totalTime * 100);
    elements.progressRing.style.background = `conic-gradient(transparent 0%, rgba(255, 255, 255, 0.3) ${progress}%)`;
}

// Update statistics
function updateStats() {
    if (gameState.scores.length > 0) {
        const best = Math.max(...gameState.scores);
        elements.bestScore.textContent = best.toFixed(1);
        
        const avg = gameState.scores.reduce((a, b) => a + b, 0) / gameState.scores.length;
        elements.avgScore.textContent = avg.toFixed(1);
        
        // Update history list
        elements.historyList.innerHTML = '';
        const recentScores = gameState.scores.slice(-5).reverse();
        recentScores.forEach(score => {
            const item = document.createElement('div');
            item.className = 'history-item';
            const now = new Date();
            item.innerHTML = `<span>${score.toFixed(1)} CPS</span><span>${now.toLocaleDateString()}</span>`;
            elements.historyList.appendChild(item);
        });
    }
}

// Create click effect
function createClickEffect(x, y) {
    if (!gameState.clickEffectsEnabled) return;
    
    const effect = document.createElement('div');
    effect.className = 'click-effect';
    effect.style.left = `${x}px`;
    effect.style.top = `${y}px`;
    elements.clickArea.appendChild(effect);
    
    setTimeout(() => {
        effect.remove();
    }, 500);
}

// Show achievement
function showAchievement(text) {
    if (!gameState.achievementsEnabled) return;
    
    elements.achievement.textContent = text;
    elements.achievement.classList.add('show');
    
    setTimeout(() => {
        elements.achievement.classList.remove('show');
    }, 3000);
}

// Check for achievements
function checkAchievements(cps) {
    if (cps >= 10 && !gameState.achievements.includes('speed_demon')) {
        gameState.achievements.push('speed_demon');
        localStorage.setItem('clickTestAchievements', JSON.stringify(gameState.achievements));
        showAchievement('Speed Demon: Achieved 10+ CPS!');
    }
    
    if (cps >= 15 && !gameState.achievements.includes('click_master')) {
        gameState.achievements.push('click_master');
        localStorage.setItem('clickTestAchievements', JSON.stringify(gameState.achievements));
        showAchievement('Click Master: Achieved 15+ CPS!');
    }
    
    if (gameState.scores.length >= 10 && !gameState.achievements.includes('persistent')) {
        gameState.achievements.push('persistent');
        localStorage.setItem('clickTestAchievements', JSON.stringify(gameState.achievements));
        showAchievement('Persistent: Completed 10 tests!');
    }
}

// Play click sound
function playClickSound() {
    if (!gameState.soundEnabled) return;
    
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.1);
    } catch (e) {
        console.log("Audio not supported");
    }
}

// Handle click
function handleClick(e) {
    if (!gameState.isRunning) {
        startGame();
        return;
    }
    
    gameState.count++;
    elements.counter.textContent = gameState.count;
    playClickSound();
    
    // Create click effect
    if (e) {
        const rect = elements.clickArea.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        createClickEffect(x, y);
    }
}

// Start the game
function startGame() {
    if (gameState.isRunning) return;
    
    gameState.isRunning = true;
    gameState.count = 0;
    gameState.totalTime = gameState.timeLeft;
    elements.counter.textContent = gameState.count;
    elements.result.textContent = '';
    elements.clickText.textContent = 'CLICK!';
    elements.startBtn.textContent = 'RUNNING...';
    elements.startBtn.disabled = true;
    
    gameState.timerInterval = setInterval(function() {
        gameState.timeLeft--;
        updateTimerDisplay();
        
        if (gameState.timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

// End the game
function endGame() {
    clearInterval(gameState.timerInterval);
    gameState.isRunning = false;
    
    const cps = (gameState.count / gameState.totalTime).toFixed(2);
    
    elements.result.innerHTML = `
        <div>Total Clicks: ${gameState.count}</div>
        <div class="cps">${cps} clicks per second</div>
    `;
    
    elements.clickText.textContent = 'TIME\'S UP!';
    elements.clickArea.style.cursor = 'default';
    elements.startBtn.textContent = 'START';
    elements.startBtn.disabled = false;
    
    // Save the score
    saveScore(parseFloat(cps));
    
    // Check for achievements
    checkAchievements(parseFloat(cps));
}

// Reset the game
function resetGame() {
    clearInterval(gameState.timerInterval);
    gameState.isRunning = false;
    gameState.count = 0;
    gameState.timeLeft = parseInt(document.querySelector('.time-btn.active').dataset.time);
    gameState.totalTime = gameState.timeLeft;
    
    elements.counter.textContent = gameState.count;
    updateTimerDisplay();
    elements.result.textContent = '';
    elements.clickText.textContent = 'CLICK TO START';
    elements.clickArea.style.cursor = 'pointer';
    elements.startBtn.textContent = 'START';
    elements.startBtn.disabled = false;
}

// Save score to localStorage
function saveScore(cps) {
    gameState.scores.push(cps);
    // Keep only last 10 scores
    if (gameState.scores.length > 10) {
        gameState.scores = gameState.scores.slice(-10);
    }
    localStorage.setItem('clickTestScores', JSON.stringify(gameState.scores));
    updateStats();
}

// Initialize the game when DOM is loaded
document.addEventListener('DOMContentLoaded', init);
