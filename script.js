
let score = 0;
let totalClicks = 0;
let clickPower = 1;
let autoClickerPower = 0;
let clickTimes = [];

let upgrades = {
    upgrade1: 0,
    upgrade2: 0,
    upgrade3: 0,
    upgrade4: 0
};

const upgradePrices = {
    1: 10,
    2: 50,
    3: 200,
    4: 100
};

let leaderboard = [];

function createClickSound() {
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
}

function playClickSound() {
    try {
        createClickSound();
    } catch (e) {
        console.log('Звук недоступний');
    }
}

function loadGame() {
    const savedGame = localStorage.getItem('clickerGame');
    if (savedGame) {
        const data = JSON.parse(savedGame);
        score = data.score || 0;
        totalClicks = data.totalClicks || 0;
        clickPower = data.clickPower || 1;
        autoClickerPower = data.autoClickerPower || 0;
        upgrades = data.upgrades || upgrades;
        updateDisplay();
        updateUpgradeButtons();
    }
    
    const savedLeaderboard = localStorage.getItem('leaderboard');
    if (savedLeaderboard) {
        leaderboard = JSON.parse(savedLeaderboard);
        updateLeaderboard();
    }
}

function saveGame() {
    const gameData = {
        score,
        totalClicks,
        clickPower,
        autoClickerPower,
        upgrades
    };
    localStorage.setItem('clickerGame', JSON.stringify(gameData));
}

function updateDisplay() {
    document.getElementById('score').textContent = Math.floor(score);
    document.getElementById('totalClicks').textContent = totalClicks;
    document.getElementById('clickPower').textContent = clickPower;
    
    document.getElementById('upgrade1Count').textContent = upgrades.upgrade1;
    document.getElementById('upgrade2Count').textContent = upgrades.upgrade2;
    document.getElementById('upgrade3Count').textContent = upgrades.upgrade3;
    document.getElementById('upgrade4Count').textContent = upgrades.upgrade4;
}

function createFloatingNumber(x, y, text) {
    const floatNum = document.createElement('div');
    floatNum.className = 'float-number';
    floatNum.textContent = text;
    floatNum.style.left = x + 'px';
    floatNum.style.top = y + 'px';
    document.body.appendChild(floatNum);
    
    setTimeout(() => {
        floatNum.remove();
    }, 1000);
}

function handleClick(e) {
    score += clickPower;
    totalClicks++;
    
    playClickSound();
    
    createFloatingNumber(e.clientX, e.clientY, `+${clickPower}`);
    
    const now = Date.now();
    clickTimes.push(now);
    clickTimes = clickTimes.filter(time => now - time < 1000);
    document.getElementById('cps').textContent = clickTimes.length;
    
    updateDisplay();
    updateUpgradeButtons();
    saveGame();
}

function buyUpgrade(upgradeNum) {
    const price = upgradePrices[upgradeNum];
    
    if (score >= price) {
        score -= price;
        upgrades[`upgrade${upgradeNum}`]++;
        
        switch(upgradeNum) {
            case 1:
                clickPower += 1;
                break;
            case 2:
                clickPower += 5;
                break;
            case 3:
                clickPower += 10;
                break;
            case 4:
                autoClickerPower += 1;
                break;
        }
        
        updateDisplay();
        updateUpgradeButtons();
        saveGame();
    }
}

function updateUpgradeButtons() {
    for (let i = 1; i <= 4; i++) {
        const button = document.getElementById(`upgrade${i}`);
        const price = upgradePrices[i];
        button.disabled = score < price;
    }
}

function resetGame() {
    if (confirm('Ви впевнені, що хочете скинути всю гру?')) {
        score = 0;
        totalClicks = 0;
        clickPower = 1;
        autoClickerPower = 0;
        upgrades = {
            upgrade1: 0,
            upgrade2: 0,
            upgrade3: 0,
            upgrade4: 0
        };
        updateDisplay();
        updateUpgradeButtons();
        saveGame();
    }
}

function autoClicker() {
    if (autoClickerPower > 0) {
        score += autoClickerPower;
        updateDisplay();
        saveGame();
    }
}

function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboardList');
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<div class="no-leaders">Таблиця лідерів порожня. Будьте першим!</div>';
        return;
    }
    
    leaderboard.sort((a, b) => b.score - a.score);
    
    leaderboardList.innerHTML = leaderboard.slice(0, 10).map((player, index) => {
        const rank = index + 1;
        let medalClass = '';
        let medal = rank;
        
        if (rank === 1) {
            medalClass = 'top-1';
            medal = '🥇';
        } else if (rank === 2) {
            medalClass = 'top-2';
            medal = '🥈';
        } else if (rank === 3) {
            medalClass = 'top-3';
            medal = '🥉';
        }
        
        return `
            <div class="leaderboard-item ${medalClass}">
                <span class="leaderboard-rank">${medal}</span>
                <span class="leaderboard-player">${player.name}</span>
                <span class="leaderboard-score">${player.score.toLocaleString()}</span>
            </div>
        `;
    }).join('');
}

function saveToLeaderboard() {
    const playerNameInput = document.getElementById('playerName');
    const playerName = playerNameInput.value.trim();
    
    if (!playerName) {
        alert('Будь ласка, введіть ваше ім\'я!');
        return;
    }
    
    if (score === 0) {
        alert('Ваш рахунок 0! Спочатку пограйте :)');
        return;
    }
    
    leaderboard.push({
        name: playerName,
        score: Math.floor(score),
        date: new Date().toLocaleDateString('uk-UA')
    });
    
    localStorage.setItem('leaderboard', JSON.stringify(leaderboard));
    
    updateLeaderboard();
    
    playerNameInput.value = '';
    
    alert(`${playerName}, ваш результат ${Math.floor(score)} збережено!`);
}

function initGame() {
    loadGame();
    
    document.getElementById('clickButton').addEventListener('click', handleClick);
    
    document.getElementById('upgrade1').addEventListener('click', () => buyUpgrade(1));
    document.getElementById('upgrade2').addEventListener('click', () => buyUpgrade(2));
    document.getElementById('upgrade3').addEventListener('click', () => buyUpgrade(3));
    document.getElementById('upgrade4').addEventListener('click', () => buyUpgrade(4));
    
    document.getElementById('resetButton').addEventListener('click', resetGame);
    
    document.getElementById('saveScore').addEventListener('click', saveToLeaderboard);
    
    document.getElementById('playerName').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            saveToLeaderboard();
        }
    });
    
    setInterval(autoClicker, 1000);
    
    setInterval(saveGame, 5000);
    
    updateUpgradeButtons();
}

window.addEventListener('DOMContentLoaded', initGame);
