const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const steerLeftBtn = document.getElementById('steer-left-btn');
const steerRightBtn = document.getElementById('steer-right-btn');

let steerLeftActive = false;
let steerRightActive = false;
const keys = {};

window.addEventListener('keydown', e => { keys[e.key] = true; });
window.addEventListener('keyup', e => { keys[e.key] = false; });

function drawVectorCar(ctx, x, y, width, height, mainColor, isPlayer) {
    ctx.save();
    
    // Wheels
    ctx.fillStyle = '#111';
    const wheelW = width * 0.18;
    const wheelH = height * 0.22;
    
    ctx.fillRect(x - width/2 - wheelW/2, y + height*0.15, wheelW, wheelH);
    ctx.fillRect(x + width/2 - wheelW/2, y + height*0.15, wheelW, wheelH);
    ctx.fillRect(x - width/2 - wheelW/2, y - height*0.35, wheelW, wheelH);
    ctx.fillRect(x + width/2 - wheelW/2, y - height*0.35, wheelW, wheelH);

    // Hubs
    ctx.fillStyle = '#64748b';
    ctx.fillRect(x - width/2 - wheelW/2 + 2, y + height*0.15 + 2, wheelW - 4, wheelH - 4);
    ctx.fillRect(x + width/2 - wheelW/2 + 2, y + height*0.15 + 2, wheelW - 4, wheelH - 4);
    ctx.fillRect(x - width/2 - wheelW/2 + 2, y - height*0.35 + 2, wheelW - 4, wheelH - 4);
    ctx.fillRect(x + width/2 - wheelW/2 + 2, y - height*0.35 + 2, wheelW - 4, wheelH - 4);

    // Spoiler
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - width*0.55, y + height*0.28, width*1.1, height*0.08);
    ctx.fillStyle = '#475569';
    ctx.fillRect(x - width*0.35, y + height*0.20, width*0.08, height*0.08);
    ctx.fillRect(x + width*0.27, y + height*0.20, width*0.08, height*0.08);

    // Chassis
    ctx.fillStyle = mainColor;
    ctx.beginPath();
    ctx.moveTo(x - width*0.42, y + height*0.25);
    ctx.lineTo(x + width*0.42, y + height*0.25);
    ctx.lineTo(x + width*0.36, y - height*0.35);
    ctx.lineTo(x - width*0.36, y - height*0.35);
    ctx.closePath();
    ctx.fill();

    // Mirrors
    ctx.fillStyle = mainColor;
    ctx.fillRect(x - width*0.5, y - height*0.15, width*0.1, height*0.05);
    ctx.fillRect(x + width*0.4, y - height*0.15, width*0.1, height*0.05);
    ctx.fillStyle = '#00f0ff';
    ctx.fillRect(x - width*0.49, y - height*0.14, width*0.07, height*0.03);
    ctx.fillRect(x + width*0.42, y - height*0.14, width*0.07, height*0.03);

    // Cabin
    ctx.fillStyle = '#090d16';
    ctx.beginPath();
    ctx.moveTo(x - width*0.3, y + height*0.12);
    ctx.lineTo(x + width*0.3, y + height*0.12);
    ctx.lineTo(x + width*0.24, y - height*0.2);
    ctx.lineTo(x - width*0.24, y - height*0.2);
    ctx.closePath();
    ctx.fill();

    // Windshield
    ctx.fillStyle = 'rgba(0, 240, 255, 0.35)';
    ctx.beginPath();
    ctx.moveTo(x - width*0.22, y - height*0.05);
    ctx.lineTo(x + width*0.22, y - height*0.05);
    ctx.lineTo(x + width*0.19, y - height*0.18);
    ctx.lineTo(x - width*0.19, y - height*0.18);
    ctx.closePath();
    ctx.fill();

    // Lights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(x - width*0.38, y + height*0.21, width*0.14, height*0.04);
    ctx.fillRect(x + width*0.24, y + height*0.21, width*0.14, height*0.04);
    
    // Grille
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(x - width*0.15, y - height*0.28, width*0.3, height*0.06);

    // Stripe
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(x - width*0.04, y - height*0.35, width*0.08, height*0.1);

    // License
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(x - width*0.12, y + height*0.22, width*0.24, height*0.04);
    ctx.fillStyle = '#fbbf24';
    ctx.font = `bold ${Math.floor(height * 0.035)}px monospace`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(isPlayer ? 'RACER' : 'CPU', x, y + height*0.24);

    ctx.restore();
}

class Entity {
    constructor(lane, type, speedFactor = 1) {
        this.lane = lane;
        this.progress = 0;
        this.type = type;
        this.speedFactor = speedFactor;
        this.baseWidth = 24;
        this.baseHeight = 24;
        this.width = 24;
        this.height = 24;
        this.x = 240;
        this.y = 320;
        this.color = '#fff';
        this.pulse = 0;

        if (type === 'point') {
            this.baseWidth = 36;
            this.baseHeight = 36;
            this.color = window.currentLevel === 1 ? '#fff200' : '#39ff14';
        } else if (type === 'obstacle_cone') {
            this.baseWidth = 24;
            this.baseHeight = 30;
            this.color = '#ff5d00';
        } else if (type === 'obstacle_barricade') {
            this.baseWidth = 60;
            this.baseHeight = 24;
            this.color = '#ff0055';
        } else if (type === 'obstacle_car') {
            this.baseWidth = 55;
            this.baseHeight = 90;
            this.color = '#e000ff';
        }
    }

    update(gameSpeed) {
        this.progress += gameSpeed * 0.00010 * this.speedFactor;
        
        const horizonY = 280;
        const roadWidthTop = 240;
        const roadWidthBottom = 850;
        
        this.y = horizonY + this.progress * (650 - horizonY);
        
        const currentRoadWidth = roadWidthTop + this.progress * (roadWidthBottom - roadWidthTop);
        const laneOffsetRatio = -1.5 + this.lane;
        const laneSpacing = currentRoadWidth / 4;
        this.x = 550 + (laneOffsetRatio * laneSpacing);

        const scale = 0.15 + this.progress * 0.85;
        this.width = this.baseWidth * scale;
        this.height = this.baseHeight * scale;

        this.pulse += 0.15;
    }

    draw(ctx) {
        if (this.type === 'obstacle_car') {
            const oppColor = window.currentLevel === 1 ? '#f43f5e' : '#a855f7';
            drawVectorCar(ctx, this.x, this.y, this.width, this.height, oppColor, false);
            return;
        }

        ctx.save();
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        let emoji = '🪙';
        if (this.type === 'point') {
            emoji = '🪙';
        } else if (this.type === 'obstacle_cone') {
            emoji = '⚠️';
        } else if (this.type === 'obstacle_barricade') {
            emoji = '🚧';
        }

        ctx.font = `${Math.floor(this.height * 1.3)}px sans-serif`;
        ctx.fillText(emoji, this.x, this.y);
        ctx.restore();
    }
}

function spawnEntities() {
    window.spawnTimer++;
    const spawnRate = Math.max(75, 130 - Math.floor(window.score / 150));

    if (window.spawnTimer >= spawnRate) {
        window.spawnTimer = 0;
        const lane = Math.floor(Math.random() * 4);
        const rand = Math.random();
        if (rand < 0.45) {
            window.entities.push(new Entity(lane, 'point'));
        } else if (rand < 0.70) {
            window.entities.push(new Entity(lane, 'obstacle_cone'));
        } else if (rand < 0.85) {
            window.entities.push(new Entity(lane, 'obstacle_barricade'));
        } else {
            const speedFactor = window.currentLevel === 2 ? 1.2 : 0.9;
            window.entities.push(new Entity(lane, 'obstacle_car', speedFactor));
        }
    }
}

window.initStars = function() {
    window.backgroundStars = [];
    for (let i = 0; i < 30; i++) {
        window.backgroundStars.push({
            x: Math.random() * 1100,
            y: Math.random() * 280,
            size: Math.random() * 2 + 1,
            speed: Math.random() * 0.5 + 0.1
        });
    }
};

function drawBackground() {
    const horizonY = 280;
    if (window.currentLevel === 1) {
        const gradient = ctx.createLinearGradient(0, 0, 0, horizonY);
        gradient.addColorStop(0, '#2b003a');
        gradient.addColorStop(0.5, '#7f005c');
        gradient.addColorStop(1, '#ff6a00');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1100, horizonY);
        
        ctx.save();
        ctx.fillStyle = '#ffcc00';
        ctx.beginPath();
        ctx.arc(550, horizonY, 60, Math.PI, 0);
        ctx.fill();
        ctx.restore();
    } else {
        const gradient = ctx.createLinearGradient(0, 0, 0, horizonY);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(1, '#1c003d');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, 1100, horizonY);

        ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
        window.backgroundStars.forEach(star => {
            ctx.fillRect(star.x, star.y, star.size, star.size);
            star.x -= star.speed * (window.speed * 0.05);
            if (star.x < 0) star.x = 1100;
        });
    }
}

function drawRoad() {
    const horizonY = 280;
    const roadWidthTop = 240;
    const roadWidthBottom = 850;
    
    // Draw road
    ctx.fillStyle = '#2d3748';
    ctx.beginPath();
    ctx.moveTo((1100 - roadWidthTop) / 2, horizonY);
    ctx.lineTo((1100 + roadWidthTop) / 2, horizonY);
    ctx.lineTo((1100 + roadWidthBottom) / 2, 650);
    ctx.lineTo((1100 - roadWidthBottom) / 2, 650);
    ctx.closePath();
    ctx.fill();

    const totalLines = 14;
    window.roadOffset += window.speed * 0.15;
    if (window.roadOffset >= 40) window.roadOffset -= 40; // smooth subtract

    for (let i = 0; i < totalLines; i++) {
        const progress1 = (i * 40 - window.roadOffset) / 400;
        const progress2 = ((i + 1) * 40 - window.roadOffset) / 400;
        if (progress1 < 0 || progress1 > 1) continue;

        const y1 = horizonY + progress1 * (650 - horizonY);
        const y2 = horizonY + progress2 * (650 - horizonY);
        
        const wTop1 = roadWidthTop + progress1 * (roadWidthBottom - roadWidthTop);
        const wTop2 = roadWidthTop + progress2 * (roadWidthBottom - roadWidthTop);

        ctx.fillStyle = i % 2 === 0 ? '#ff3e3e' : '#ffffff';
        
        // Left Curb
        ctx.beginPath();
        ctx.moveTo((1100 - wTop1) / 2, y1);
        ctx.lineTo((1100 - wTop2) / 2, y2);
        ctx.lineTo((1100 - wTop2) / 2 - 12, y2);
        ctx.lineTo((1100 - wTop1) / 2 - 12, y1);
        ctx.closePath();
        ctx.fill();

        // Right Curb
        ctx.beginPath();
        ctx.moveTo((1100 + wTop1) / 2, y1);
        ctx.lineTo((1100 + wTop2) / 2, y2);
        ctx.lineTo((1100 + wTop2) / 2 + 12, y2);
        ctx.lineTo((1100 + wTop1) / 2 + 12, y1);
        ctx.closePath();
        ctx.fill();
    }

    ctx.strokeStyle = '#fff';
    ctx.lineWidth = 3;
    
    for (let i = 0; i < totalLines; i++) {
        const progress = (i * 40 - window.roadOffset) / 400;
        if (progress < 0 || progress > 1) continue;

        const y = horizonY + (progress * (650 - horizonY));
        const currentRoadWidth = roadWidthTop + progress * (roadWidthBottom - roadWidthTop);
        
        if (i % 2 === 0) {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.fillRect(550 - 2, y, 4, 20);
            ctx.fillRect((1100 - currentRoadWidth / 2) / 2 - 2, y, 4, 20);
            ctx.fillRect((1100 + currentRoadWidth / 2) / 2 - 2, y, 4, 20);
        }
    }
}

function drawPlayer() {
    drawVectorCar(ctx, window.player.x, window.player.y, window.player.width, window.player.height, window.player.color, true);
}

function checkCollisions() {
    const pxLeft = window.player.x - window.player.width / 2;
    const pxRight = window.player.x + window.player.width / 2;
    const pxTop = window.player.y - window.player.height / 2;
    const pxBottom = window.player.y + window.player.height / 2;

    for (let i = window.entities.length - 1; i >= 0; i--) {
        const ent = window.entities[i];
        
        const exLeft = ent.x - ent.width / 2;
        const exRight = ent.x + ent.width / 2;
        const exTop = ent.y - ent.height / 2;
        const exBottom = ent.y + ent.height / 2;

        if (pxLeft < exRight && pxRight > exLeft && pxTop < exBottom && pxBottom > exTop) {
            if (ent.type === 'point') {
                window.audio.playCollectSound();
                window.score += 100;
                if (window.currentLevel === 1 && window.score >= 1200) {
                    window.transitionToLevel2();
                } else if (window.currentLevel === 2 && window.score >= 3000) {
                    window.winGame();
                }
                window.entities.splice(i, 1);
            } else {
                window.audio.playCrashSound();
                window.shield -= 25;
                if (window.shield <= 0) {
                    window.gameOver();
                }
                window.entities.splice(i, 1);
            }
        }
    }
}

function updatePlayerInput() {
    if (keys['ArrowLeft'] || keys['a'] || keys['A'] || steerLeftActive) {
        window.player.x -= window.player.steerSpeed;
    }
    if (keys['ArrowRight'] || keys['d'] || keys['D'] || steerRightActive) {
        window.player.x += window.player.steerSpeed;
    }

    const horizonY = 280;
    const roadWidthTop = 240;
    const roadWidthBottom = 850;
    
    const progress = (window.player.y - horizonY) / (650 - horizonY);
    const currentRoadWidth = roadWidthTop + progress * (roadWidthBottom - roadWidthTop);
    
    const roadLimitLeft = 550 - currentRoadWidth / 2 + window.player.width / 2;
    const roadLimitRight = 550 + currentRoadWidth / 2 - window.player.width / 2;

    if (window.player.x < roadLimitLeft) {
        window.player.x = roadLimitLeft;
        window.player.x += 4; 
        window.shield = Math.max(0, window.shield - 0.5); 
        if (window.speed > 10) window.speed -= 0.5;
        window.audio.playCrashSound();
    }
    if (window.player.x > roadLimitRight) {
        window.player.x = roadLimitRight;
        window.player.x -= 4; 
        window.shield = Math.max(0, window.shield - 0.5); 
        if (window.speed > 10) window.speed -= 0.5;
        window.audio.playCrashSound();
    }
}

function gameLoop(timestamp) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    ctx.scale(canvas.width / 1100, canvas.height / 650);

    if (window.gameState === 'PLAYING' || window.gameState === 'COUNTDOWN') {
        if (window.gameState === 'PLAYING') {
            if (window.speed < window.targetSpeed) {
                window.speed += 1.5;
            } else if (window.speed > window.targetSpeed) {
                window.speed -= 1.0;
            }
            updatePlayerInput();
            spawnEntities();
        } else {
            window.speed = 10;
        }

        drawBackground();
        drawRoad();

        for (let i = window.entities.length - 1; i >= 0; i--) {
            const ent = window.entities[i];
            ent.update(window.speed);
            ent.draw(ctx);

            if (ent.progress > 1.1) {
                window.entities.splice(i, 1);
            }
        }

        drawPlayer();

        if (window.gameState === 'PLAYING') {
            checkCollisions();
            const speedRatio = window.speed / window.maxSpeed;
            window.audio.updateSpeed(speedRatio);
            window.updateHUD();
        } else {
            window.updateHUD();
        }
    } else {
        drawBackground();
        drawRoad();
    }

    ctx.restore();
    requestAnimationFrame(gameLoop);
}

steerLeftBtn.addEventListener('mousedown', () => steerLeftActive = true);
steerLeftBtn.addEventListener('mouseup', () => steerLeftActive = false);
steerLeftBtn.addEventListener('mouseleave', () => steerLeftActive = false);
steerLeftBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    steerLeftActive = true;
});
steerLeftBtn.addEventListener('touchend', () => steerLeftActive = false);

steerRightBtn.addEventListener('mousedown', () => steerRightActive = true);
steerRightBtn.addEventListener('mouseup', () => steerRightActive = false);
steerRightBtn.addEventListener('mouseleave', () => steerRightActive = false);
steerRightBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    steerRightActive = true;
});
steerRightBtn.addEventListener('touchend', () => steerRightActive = false);

gameLoop();
