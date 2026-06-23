// Web Audio API Sound Engine
class GameAudio {
    constructor() {
        this.ctx = null;
        this.engineOsc = null;
        this.engineGain = null;
        this.noiseFilter = null;
        this.isRunning = false;
        this.isMuted = false;
        this.masterGain = null;
        this.activeOscillators = [];
    }

    init() {
        if (this.ctx) return;
        const AudioContextClass = window.AudioContext || window.webkitAudioContext;
        if (AudioContextClass) {
            this.ctx = new AudioContextClass();
            this.masterGain = this.ctx.createGain();
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
            this.masterGain.connect(this.ctx.destination);
        }
    }

    toggleMute() {
        this.isMuted = !this.isMuted;
        this.init();
        if (this.masterGain && this.ctx) {
            this.masterGain.gain.setValueAtTime(this.isMuted ? 0 : 1, this.ctx.currentTime);
        }
        return this.isMuted;
    }

    startEngine() {
        this.init();
        if (!this.ctx || this.isRunning) return;
        this.isRunning = true;

        if (this.ctx.state === 'suspended') {
            this.ctx.resume();
        }

        const now = this.ctx.currentTime;
        const starterGain = this.ctx.createGain();
        starterGain.gain.setValueAtTime(0, now);
        starterGain.gain.linearRampToValueAtTime(0.3, now + 0.1);
        
        for (let i = 0; i < 5; i++) {
            const crankTime = now + (i * 0.15);
            starterGain.gain.setValueAtTime(0.3, crankTime);
            starterGain.gain.linearRampToValueAtTime(0, crankTime + 0.08);
        }
        
        const starterOsc = this.ctx.createOscillator();
        starterOsc.type = 'triangle';
        starterOsc.frequency.setValueAtTime(80, now);
        starterOsc.frequency.linearRampToValueAtTime(120, now + 0.7);
        
        starterOsc.connect(starterGain);
        starterGain.connect(this.masterGain);
        
        starterOsc.start(now);
        starterOsc.stop(now + 0.8);

        const engineStartDelay = 0.75;
        const engineStartTime = now + engineStartDelay;

        this.engineGain = this.ctx.createGain();
        this.engineGain.gain.setValueAtTime(0, now);
        this.engineGain.gain.linearRampToValueAtTime(0.25, engineStartTime + 0.1);

        this.engineOsc = this.ctx.createOscillator();
        this.engineOsc.type = 'sawtooth';
        this.engineOsc.frequency.setValueAtTime(55, engineStartTime);
        
        const modOsc = this.ctx.createOscillator();
        modOsc.type = 'sine';
        modOsc.frequency.setValueAtTime(15, engineStartTime);

        const modGain = this.ctx.createGain();
        modGain.gain.setValueAtTime(15, engineStartTime);

        const lowpass = this.ctx.createBiquadFilter();
        lowpass.type = 'lowpass';
        lowpass.frequency.setValueAtTime(160, engineStartTime);

        modOsc.connect(modGain);
        modGain.connect(this.engineOsc.frequency);

        this.engineOsc.connect(lowpass);
        lowpass.connect(this.engineGain);
        this.engineGain.connect(this.masterGain);

        this.engineOsc.start(engineStartTime);
        modOsc.start(engineStartTime);

        this.activeOscillators = [starterOsc, this.engineOsc, modOsc];
    }

    updateSpeed(speedRatio) {
        if (!this.ctx || !this.engineOsc || !this.isRunning) return;
        const targetFreq = 50 + (speedRatio * 130);
        this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.1);
    }

    stopEngine() {
        if (!this.ctx || !this.isRunning) return;
        this.isRunning = false;
        
        if (this.engineGain) {
            this.engineGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.15);
        }
        
        setTimeout(() => {
            if (this.activeOscillators) {
                this.activeOscillators.forEach(osc => {
                    try { osc.stop(); } catch(e) {}
                });
            }
            this.engineOsc = null;
            this.engineGain = null;
        }, 300);
    }

    playCollectSound() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, now);
        osc.frequency.setValueAtTime(880.00, now + 0.08);

        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.3);
    }

    playCrashSound() {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        
        const bufferSize = this.ctx.sampleRate * 0.4;
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noiseNode = this.ctx.createBufferSource();
        noiseNode.buffer = buffer;

        const noiseFilter = this.ctx.createBiquadFilter();
        noiseFilter.type = 'lowpass';
        noiseFilter.frequency.setValueAtTime(400, now);
        noiseFilter.frequency.exponentialRampToValueAtTime(20, now + 0.4);

        const gainNode = this.ctx.createGain();
        gainNode.gain.setValueAtTime(0.3, now);
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

        noiseNode.connect(noiseFilter);
        noiseFilter.connect(gainNode);
        gainNode.connect(this.masterGain);

        noiseNode.start(now);
        noiseNode.stop(now + 0.4);
    }

    playCountdownBeep(isHighPitch = false) {
        this.init();
        if (!this.ctx) return;
        const now = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(isHighPitch ? 880.00 : 440.00, now);

        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.18);
    }
}

// Global scope initialization
window.audio = new GameAudio();
window.gameState = 'START';
window.currentLevel = 1;
window.score = 0;
window.shield = 100;
window.speed = 0;
window.targetSpeed = 0;
window.maxSpeed = 160;
window.roadOffset = 0;
window.entities = [];
window.spawnTimer = 0;
window.backgroundStars = [];

window.player = {
    x: 550,
    y: 590,
    width: 70,
    height: 115,
    color: '#00f0ff',
    targetX: 550,
    steerSpeed: 14
};

// DOM references
const startScreen = document.getElementById('start-screen');
const gameOverScreen = document.getElementById('game-over-screen');
const gameWinScreen = document.getElementById('game-win-screen');
const hud = document.getElementById('hud');

const scoreVal = document.getElementById('score-val');
const levelVal = document.getElementById('level-val');
const speedVal = document.getElementById('speed-val');
const shieldBar = document.getElementById('shield-val');

const startBtn = document.getElementById('start-btn');
const restartBtn = document.getElementById('restart-btn');
const winRestartBtn = document.getElementById('win-restart-btn');
const menuBtns = document.querySelectorAll('.menu-btn');
const levelBtns = document.querySelectorAll('.level-btn');
const controlsOverlay = document.getElementById('controls-overlay');
const countdownOverlay = document.getElementById('countdown-overlay');
const countdownNumber = document.getElementById('countdown-number');

// Popups
const infoBtn = document.getElementById('info-btn');
const closeInfoBtn = document.getElementById('close-info-btn');
const infoPopup = document.getElementById('info-popup');

const settingsBtn = document.getElementById('settings-btn');
const closeSettingsBtn = document.getElementById('close-settings-btn');
const settingsPopup = document.getElementById('settings-popup');

const rateBtn = document.getElementById('rate-btn');
const closeRateBtn = document.getElementById('close-rate-btn');
const ratePopup = document.getElementById('rate-popup');

const audioToggleBtn = document.getElementById('audio-toggle-btn');

levelBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        levelBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        window.currentLevel = parseInt(btn.dataset.level);
    });
});

window.showScreen = function(screenId) {
    const screens = ['start-screen', 'game-over-screen', 'game-win-screen', 'countdown-overlay'];
    screens.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            if (id === screenId) {
                el.classList.remove('hidden');
                el.classList.add('active');
            } else {
                el.classList.add('hidden');
                el.classList.remove('active');
            }
        }
    });
};

window.transitionToLevel2 = function() {
    window.currentLevel = 2;
    window.maxSpeed = 80;
    window.targetSpeed = 60;
    window.shield = 100;
    window.entities = [];
    levelVal.textContent = '2';
    const levelBanner = document.createElement('div');
    levelBanner.className = 'level-banner';
    levelBanner.innerHTML = '<h2>STAGE 2: NEON CITY</h2><p>SPEED INCREASING...</p>';
    document.getElementById('game-container').appendChild(levelBanner);
    setTimeout(() => {
        levelBanner.remove();
    }, 2000);
};

window.startCountdown = function() {
    window.gameState = 'COUNTDOWN';
    window.score = 0;
    window.shield = 100;
    window.speed = 0;
    window.entities = [];
    window.spawnTimer = 0;
    if (window.initStars) window.initStars();

    window.showScreen('countdown-overlay');
    hud.classList.remove('hidden');
    controlsOverlay.classList.add('hidden');

    let count = 3;
    countdownNumber.textContent = count;
    countdownNumber.classList.remove('pop');
    void countdownNumber.offsetWidth;
    countdownNumber.classList.add('pop');
    window.audio.playCountdownBeep(false);

    const interval = setInterval(() => {
        count--;
        countdownNumber.classList.remove('pop');
        void countdownNumber.offsetWidth;

        if (count > 0) {
            countdownNumber.textContent = count;
            countdownNumber.classList.add('pop');
            window.audio.playCountdownBeep(false);
        } else if (count === 0) {
            countdownNumber.textContent = 'GO!';
            countdownNumber.classList.add('pop');
            window.audio.playCountdownBeep(true);
            window.startGame();
        } else {
            clearInterval(interval);
            window.showScreen(null);
            controlsOverlay.classList.remove('hidden');
        }
    }, 1000);
};

window.startGame = function() {
    window.gameState = 'PLAYING';
    window.targetSpeed = window.currentLevel === 1 ? 40 : 60;
    window.maxSpeed = window.currentLevel === 1 ? 55 : 80;
    window.speed = 0;

    window.audio.startEngine();
};

window.gameOver = function() {
    window.gameState = 'GAMEOVER';
    window.audio.stopEngine();
    
    document.getElementById('final-score-val').textContent = window.score;
    document.getElementById('final-level-val').textContent = window.currentLevel;
    
    hud.classList.add('hidden');
    controlsOverlay.classList.add('hidden');
    window.showScreen('game-over-screen');
};

window.winGame = function() {
    window.gameState = 'WIN';
    window.audio.stopEngine();
    
    document.getElementById('win-score-val').textContent = window.score;
    
    hud.classList.add('hidden');
    controlsOverlay.classList.add('hidden');
    window.showScreen('game-win-screen');
};

window.updateHUD = function() {
    scoreVal.textContent = String(window.score).padStart(5, '0');
    speedVal.textContent = Math.round(window.speed) + ' mph';
    shieldBar.style.width = window.shield + '%';
};

infoBtn.addEventListener('click', () => infoPopup.classList.remove('hidden'));
closeInfoBtn.addEventListener('click', () => infoPopup.classList.add('hidden'));

settingsBtn.addEventListener('click', () => settingsPopup.classList.remove('hidden'));
closeSettingsBtn.addEventListener('click', () => settingsPopup.classList.add('hidden'));

rateBtn.addEventListener('click', () => ratePopup.classList.remove('hidden'));
closeRateBtn.addEventListener('click', () => ratePopup.classList.add('hidden'));

audioToggleBtn.addEventListener('click', () => {
    const isMuted = window.audio.toggleMute();
    audioToggleBtn.innerHTML = isMuted 
        ? '<span class="material-icons-outlined">volume_off</span>' 
        : '<span class="material-icons-outlined">volume_up</span>';
});

const resButtons = document.querySelectorAll('.res-btn');
resButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        resButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const res = parseInt(btn.dataset.res);
        const canvas = document.getElementById('gameCanvas');
        if (res === 144) { canvas.width = 256; canvas.height = 144; }
        else if (res === 240) { canvas.width = 426; canvas.height = 240; }
        else if (res === 360) { canvas.width = 640; canvas.height = 360; }
        else if (res === 480) { canvas.width = 854; canvas.height = 480; }
        else if (res === 720) { canvas.width = 1100; canvas.height = 650; }
        else if (res === 1080) { canvas.width = 1920; canvas.height = 1080; }
        settingsPopup.classList.add('hidden');
    });
});

const stars = document.querySelectorAll('.star-btn');
const submitRateBtn = document.getElementById('submit-rate-btn');
let selectedRating = 0;

stars.forEach(star => {
    star.addEventListener('click', () => {
        selectedRating = parseInt(star.dataset.value);
        stars.forEach(s => {
            s.style.color = parseInt(s.dataset.value) <= selectedRating ? '#f1c40f' : 'rgba(255, 255, 255, 0.2)';
        });
        submitRateBtn.removeAttribute('disabled');
    });
    star.addEventListener('mouseover', () => {
        const hoverRating = parseInt(star.dataset.value);
        stars.forEach(s => {
            s.style.color = parseInt(s.dataset.value) <= hoverRating ? '#f1c40f' : 'rgba(255, 255, 255, 0.2)';
        });
    });
    star.addEventListener('mouseleave', () => {
        stars.forEach(s => {
            s.style.color = parseInt(s.dataset.value) <= selectedRating ? '#f1c40f' : 'rgba(255, 255, 255, 0.2)';
        });
    });
});

submitRateBtn.addEventListener('click', () => {
    alert(`Thank you for rating us ${selectedRating} stars!`);
    ratePopup.classList.add('hidden');
    selectedRating = 0;
    stars.forEach(s => s.style.color = 'rgba(255, 255, 255, 0.2)');
    submitRateBtn.setAttribute('disabled', 'true');
});

startBtn.addEventListener('click', window.startCountdown);
restartBtn.addEventListener('click', window.startCountdown);
winRestartBtn.addEventListener('click', window.startCountdown);

menuBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        window.gameState = 'START';
        window.showScreen('start-screen');
        hud.classList.add('hidden');
        controlsOverlay.classList.add('hidden');
    });
});
