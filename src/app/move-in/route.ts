import { NextResponse } from 'next/server';

export async function GET() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <meta name="apple-mobile-web-app-capable" content="yes">
    <meta name="theme-color" content="#ff6600">
    <title>SUNNFUN RESIDENTS CASINO #2 • Play for PARK COINS</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');

        :root {
            --primary: #ffcc00;
        }

        * { box-sizing: border-box; }

        body {
            margin: 0;
            padding: 0;
            background: linear-gradient(#1a0f00, #3a1f0f, #1a0f00);
            color: #ffcc00;
            font-family: 'Press Start 2P', cursive;
            overflow: hidden;
            touch-action: manipulation;
            image-rendering: pixelated;
        }

        .app {
            max-width: 1000px;
            margin: 0 auto;
            background: #111;
            border: 16px solid #ff6600;
            border-image: linear-gradient(#ffcc00, #ff3300, #ffcc00) 1;
            box-shadow: 0 0 60px #ff0000, inset 0 0 100px rgba(255, 100, 0, 0.7);
            min-height: 100vh;
            display: flex;
            flex-direction: column;
        }

        .nav {
            background: #220000;
            padding: 12px 20px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 10px solid var(--primary);
        }

        .title {
            font-size: 28px;
            text-shadow: 4px 4px 0 #ff0000, -4px -4px 0 #00ff00;
            letter-spacing: 3px;
        }

        .coin-balance {
            background: #000;
            padding: 8px 20px;
            border: 4px solid #00ff00;
            font-size: 22px;
            display: flex;
            align-items: center;
            gap: 8px;
        }

        .screen {
            display: none;
            flex: 1;
            flex-direction: column;
        }

        .screen.active {
            display: flex;
        }

        .grid-container {
            flex: 1;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 20px 10px;
            background: #0a0500;
            position: relative;
        }

        #grid {
            display: grid;
            grid-template-columns: repeat(6, 1fr);
            gap: 8px;
            padding: 15px;
            background: #1f1200;
            border: 12px solid #664400;
            border-radius: 12px;
            box-shadow: 0 0 40px rgba(255, 200, 0, 0.5);
        }

        .symbol {
            width: 92px;
            height: 92px;
            background: linear-gradient(#333, #1a1a1a);
            border: 5px solid #ffcc00;
            border-radius: 8px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 62px;
            box-shadow: inset 0 0 25px rgba(0,0,0,0.9), 0 0 15px rgba(255, 200, 0, 0.6);
            transition: transform 0.2s, filter 0.2s;
            position: relative;
        }

        .symbol.wild { filter: brightness(1.4) drop-shadow(0 0 12px #00ffff); }
        .symbol.scatter { animation: scatterPulse 1.2s infinite; }

        .winning {
            animation: winPop 400ms infinite alternate;
            box-shadow: 0 0 35px #ffff00;
            transform: scale(1.15);
        }

        @keyframes winPop { from { transform: scale(1); } to { transform: scale(1.25); } }
        @keyframes scatterPulse { 0%,100% { filter: brightness(1); } 50% { filter: brightness(2.5) drop-shadow(0 0 20px #ff00ff); } }

        .modal {
            animation: modalPop 0.3s ease;
        }

        .log {
            height: 68px;
            background: #000;
            color: #0f0;
            padding: 12px;
            font-size: 13px;
            overflow-y: auto;
            margin: 0 20px 10px;
            border: 4px solid #00ff00;
            text-align: left;
            line-height: 1.3;
        }

        canvas#confetti {
            position: fixed;
            top: 0; left: 0;
            pointer-events: none;
            z-index: 3000;
        }

        button {
            font-family: 'Press Start 2P', cursive;
        }
    </style>
</head>
<body>
    <div class="app">
        <!-- NAVBAR -->
        <div class="nav">
            <div onclick="navigateTo('game')" class="title cursor-pointer">SUNNFUN RESIDENTS CASINO #2</div>

            <div class="flex items-center gap-6 text-sm">
                <div onclick="navigateTo('game')" class="flex flex-col items-center cursor-pointer hover:text-white">
                    🎰 GAME
                </div>
                <div onclick="navigateTo('profile')" class="flex flex-col items-center cursor-pointer hover:text-white">
                    👤 PROFILE
                </div>
                <div onclick="navigateTo('leaderboard')" class="flex flex-col items-center cursor-pointer hover:text-white">
                    🏆 LEADERBOARD
                </div>
                <div onclick="showAdminPanel()" id="adminTab" class="flex flex-col items-center cursor-pointer hover:text-white hidden">
                    ⚙️ ADMIN
                </div>
            </div>

            <div onclick="logout()" class="coin-balance cursor-pointer" id="navBalance">
                <span id="navCoins">1250</span> 🪙
            </div>
        </div>

        <!-- GAME SCREEN -->
        <div id="gameScreen" class="screen active flex-col">
            <div class="grid-container">
                <div id="grid"></div>
                <canvas id="confetti" width="1000" height="700"></canvas>
            </div>

            <div class="controls bg-[#220000] p-5 flex flex-wrap justify-center gap-4 items-center border-t-8 border-[#ffcc00]">
                <button onclick="changeBet(-10)" class="bg-green-600 text-white px-6 py-3 text-xl border-4 border-white shadow-[0_6px_0_#166534]">–10</button>
                <div class="text-3xl font-bold">BET <span id="betAmount" class="text-green-400">20</span></div>
                <button onclick="changeBet(10)" class="bg-green-600 text-white px-6 py-3 text-xl border-4 border-white shadow-[0_6px_0_#166534]">+10</button>

                <button onclick="spin()" id="spinBtn" class="bg-red-600 text-white px-16 py-6 text-4xl border-8 border-yellow-400 shadow-[0_10px_0_#991b1b] flex-1 max-w-xs">SPIN 🪙</button>

                <button onclick="toggleAuto()" id="autoBtn" class="bg-green-600 text-white px-8 py-6 text-2xl border-4 border-white">AUTO</button>
                <button onclick="buyFeature()" class="bg-emerald-600 text-white px-8 py-6 text-2xl border-4 border-white">BUY BONUS (100×)</button>
            </div>

            <div id="gameLog" class="log">Welcome to the park! Spin with PARK COINS. Big clusters = big wins!</div>
        </div>

        <!-- PROFILE SCREEN -->
        <div id="profileScreen" class="screen p-6">
            <h1 class="text-4xl text-center mb-6">YOUR TRAILER</h1>
            <div class="bg-black p-8 rounded-xl border-8 border-[#ffcc00] text-center">
                <div id="profileName" class="text-5xl mb-4">RedneckRandy</div>
                <div class="text-7xl font-bold text-green-400 mb-8" id="profileCoins">1250 🪙</div>
                <button onclick="claimDailyBonus()" class="bg-yellow-400 text-black px-12 py-6 text-2xl w-full mb-8">CLAIM DAILY BONUS (50 COINS)</button>

                <div class="text-left text-sm bg-gray-900 p-4 rounded mb-6">
                    <h3 class="mb-3 text-yellow-400">LAST 5 SPINS</h3>
                    <div id="historyList" class="space-y-3 text-green-300 font-mono text-xs"></div>
                </div>

                <button onclick="logout()" class="text-red-400 text-xl underline">LOG OUT / SWITCH USER</button>
            </div>
        </div>

        <!-- LEADERBOARD SCREEN -->
        <div id="leaderboardScreen" class="screen p-6 overflow-auto">
            <h1 class="text-4xl text-center mb-6">PARK LEGENDS</h1>
            <div id="leaderboardList" class="space-y-4"></div>
        </div>

        <!-- ADMIN PANEL -->
        <div id="adminScreen" class="screen p-6 hidden">
            <div class="flex justify-between items-center mb-6">
                <h1 class="text-4xl">ADMIN • MANAGE COINS</h1>
                <button onclick="hideAdminPanel()" class="text-red-500 text-2xl">✕ CLOSE</button>
            </div>
            <div id="adminUserList" class="space-y-4"></div>
        </div>

        <!-- LOGIN / USER SELECT MODAL -->
        <div id="loginModal" class="fixed inset-0 bg-black/95 flex items-center justify-center z-[9999]">
            <div class="bg-[#111] border-8 border-[#ffcc00] p-8 max-w-md w-full mx-4 text-center modal">
                <h1 class="text-5xl mb-8">SUNNFUN RESIDENTS CASINO #2</h1>
                <p class="mb-6 text-xl">Pick your trailer or create a new one</p>

                <div id="userSelectList" class="grid grid-cols-2 gap-4 mb-8"></div>

                <div class="text-xs text-gray-400 mb-4">— OR —</div>

                <input id="newUsername" type="text" placeholder="NEW TRAILER NAME"
                       class="w-full bg-black border-4 border-yellow-400 text-white px-6 py-5 text-2xl text-center mb-6 outline-none">

                <button onclick="createNewUser()" class="w-full bg-[#00ff00] text-black py-6 text-3xl border-4 border-white">START NEW TRAILER</button>

                <p class="text-[10px] mt-8 text-gray-500">Demo app • Data saved in browser • Perfect for Vercel static deploy</p>
            </div>
        </div>

        <!-- BONUS MODAL -->
        <div id="bonusScreen" onclick="if(event.target.id==='bonusScreen')endFreeSpins()"
             class="fixed inset-0 bg-black/95 hidden items-center justify-center z-[10000]">
            <div class="modal-content bg-[#111] border-8 border-[#ff00ff] p-10 text-center max-w-md w-full">
                <h1 id="bonusHeader" class="text-6xl text-[#ff00ff] mb-4">FREE SPINS!</h1>
                <div id="freeSpinsLeft" class="text-8xl text-yellow-300 mb-6">10</div>
                <div class="text-2xl">MULTIPLIER: <span id="multiplier" class="text-cyan-400">1×</span></div>
                <button onclick="endFreeSpins()" class="mt-10 bg-[#ff00ff] text-black px-14 py-6 text-3xl">END BONUS</button>
            </div>
        </div>
    </div>

    <script>
        // ================== CONFIG & SYMBOLS ==================
        const ROWS = 5;
        const COLS = 6;
        const symbols = ['🍺','🦴','🐕','🪴','🚗','🔮','👑','💰','🔥'];
        const wild = '🔧';
        const scatter = '🏠';

        const payoutBase = { '🍺':2, '🦴':4, '🐕':8, '🪴':12, '🚗':18, '🔮':35, '👑':60, '💰':90, '🔥':150 };

        // ================== GLOBAL STATE ==================
        let currentUser = null;
        let usersDB = [];
        let board = Array.from({length: ROWS}, () => Array(COLS).fill(null));
        let gridCells = [];
        let currentBet = 20;
        let isSpinning = false;
        let autoPlaying = false;
        let freeSpinsRemaining = 0;
        let currentMultiplier = 1;
        let history = [];

        let confettiCanvas, confettiCtx;

        // Tailwind script already loaded in head
        function initTailwind() {
            tailwind.config = { content: ["./**/*.html"] };
        }

        // ================== LOCALSTORAGE DB ==================
        function loadDB() {
            const savedUsers = localStorage.getItem('trailerParkUsers');
            if (savedUsers) {
                usersDB = JSON.parse(savedUsers);
            } else {
                // Preload fake users (like a real social casino)
                usersDB = [
                    { id:1, name:"RedneckRandy", coins:1250, history:[], isAdmin:false },
                    { id:2, name:"TrailerTrashTy", coins:8750, history:[], isAdmin:false },
                    { id:3, name:"PitbullPam", coins:420, history:[], isAdmin:false },
                    { id:4, name:"MethLabMike", coins:3120, history:[], isAdmin:false },
                    { id:5, name:"LawnGnomeLarry", coins:650, history:[], isAdmin:true }
                ];
                saveDB();
            }
        }

        function saveDB() {
            localStorage.setItem('trailerParkUsers', JSON.stringify(usersDB));
        }

        function findUser(id) {
            return usersDB.find(u => u.id === id);
        }

        // ================== LOGIN / USER SELECT ==================
        function showLogin() {
            document.getElementById('loginModal').style.display = 'flex';
            renderUserSelect();
        }

        function renderUserSelect() {
            const container = document.getElementById('userSelectList');
            container.innerHTML = '';

            usersDB.forEach(user => {
                const div = document.createElement('div');
                div.className = 'bg-[#220000] border-4 border-[#ffcc00] p-4 cursor-pointer hover:scale-105 transition';
                div.innerHTML = \`
                    <div class="text-2xl">\${user.name}</div>
                    <div class="text-green-400 text-4xl">\${user.coins} 🪙</div>
                \`;
                div.onclick = () => loginAs(user.id);
                container.appendChild(div);
            });
        }

        function loginAs(id) {
            currentUser = findUser(id);
            document.getElementById('loginModal').style.display = 'none';
            document.getElementById('adminTab').classList.toggle('hidden', !currentUser.isAdmin);
            updateNavBalance();
            navigateTo('game');
            log("Logged in as " + currentUser.name);
        }

        function createNewUser() {
            const nameInput = document.getElementById('newUsername').value.trim() || "Newbie" + Math.floor(Math.random()*999);
            const newUser = {
                id: Date.now(),
                name: nameInput,
                coins: 500,
                history: [],
                isAdmin: false
            };
            usersDB.push(newUser);
            saveDB();
            loginAs(newUser.id);
        }

        function logout() {
            currentUser = null;
            showLogin();
        }

        // ================== NAVIGATION ==================
        function navigateTo(screen) {
            document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
            const target = document.getElementById(screen + 'Screen');
            if (target) target.classList.add('active');

            if (screen === 'profile') renderProfile();
            if (screen === 'leaderboard') renderLeaderboard();
        }

        // ================== BALANCE & NAV ==================
        function updateNavBalance() {
            if (!currentUser) return;
            document.getElementById('navCoins').textContent = currentUser.coins;
        }

        function addCoins(amount, reason = "win") {
            if (!currentUser) return;
            currentUser.coins += amount;
            saveDB();
            updateNavBalance();

            if (reason === "win" && amount >= 200) {
                launchConfetti(2);
            }
        }

        // ================== GAME LOGIC (same as before but integrated) ==================
        function createGrid() {
            const gridEl = document.getElementById('grid');
            gridEl.innerHTML = '';
            gridCells = [];
            for (let i = 0; i < ROWS * COLS; i++) {
                const cell = document.createElement('div');
                cell.className = 'symbol';
                gridEl.appendChild(cell);
                gridCells.push(cell);
            }
        }

        function renderBoard() {
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    const idx = r * COLS + c;
                    const sym = board[r][c] || '';
                    gridCells[idx].textContent = sym;
                    gridCells[idx].classList.toggle('wild', sym === wild);
                    gridCells[idx].classList.toggle('scatter', sym === scatter);
                }
            }
        }

        function getRandomSymbol() {
            const rand = Math.random();
            if (rand < 0.07) return wild;
            if (rand < 0.13) return scatter;
            return symbols[Math.floor(Math.random() * symbols.length)];
        }

        // Cluster detection (unchanged from previous version)
        const directions = [[-1,0],[1,0],[0,-1],[0,1],[-1,-1],[-1,1],[1,-1],[1,1]];

        function findClusters() {
            const visited = Array.from({length: ROWS}, () => Array(COLS).fill(false));
            const clusters = [];
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    if (visited[r][c] || !board[r][c] || board[r][c] === scatter) continue;
                    const sym = board[r][c];
                    const clusterPositions = [];
                    dfs(r, c, sym, visited, clusterPositions);
                    if (clusterPositions.length >= 4) {
                        clusters.push({symbol: sym, size: clusterPositions.length, positions: clusterPositions});
                    }
                }
            }
            return clusters;
        }

        function dfs(r, c, originalSym, visited, clusterPositions) {
            if (r < 0 || r >= ROWS || c < 0 || c >= COLS || visited[r][c]) return;
            const current = board[r][c];
            if (!current || (current !== originalSym && current !== wild)) return;
            visited[r][c] = true;
            clusterPositions.push({r, c});
            for (const [dr, dc] of directions) dfs(r + dr, c + dc, originalSym, visited, clusterPositions);
        }

        function removeWinningClusters(clusters) {
            clusters.forEach(cluster => {
                cluster.positions.forEach(({r,c}) => board[r][c] = null);
            });
        }

        function dropSymbols() {
            for (let c = 0; c < COLS; c++) {
                let writeRow = ROWS - 1;
                for (let r = ROWS - 1; r >= 0; r--) {
                    if (board[r][c]) {
                        board[writeRow][c] = board[r][c];
                        if (r !== writeRow) board[r][c] = null;
                        writeRow--;
                    }
                }
                for (let r = writeRow; r >= 0; r--) {
                    board[r][c] = getRandomSymbol();
                }
            }
        }

        function calculatePayout(clusters) {
            let total = 0;
            clusters.forEach(cluster => {
                const base = payoutBase[cluster.symbol] || 5;
                const multiplier = Math.pow(1.6, cluster.size - 4);
                total += Math.floor(currentBet * base * multiplier * 0.8);
            });
            return Math.max(0, Math.floor(total));
        }

        function initConfetti() {
            confettiCanvas = document.getElementById('confetti');
            confettiCtx = confettiCanvas.getContext('2d');
            confettiCanvas.width = window.innerWidth;
            confettiCanvas.height = window.innerHeight;
        }

        function launchConfetti(intensity = 1) {
            const colors = ['#ffcc00', '#ff0000', '#00ff00', '#ffff00', '#ff00ff'];
            const particles = [];
            for (let i = 0; i < 220 * intensity; i++) {
                particles.push({
                    x: Math.random() * confettiCanvas.width,
                    y: Math.random() * confettiCanvas.height / 2 - 50,
                    size: Math.random() * 12 + 6,
                    speed: Math.random() * 8 + 4,
                    angle: Math.random() * Math.PI * 2,
                    color: colors[Math.floor(Math.random() * colors.length)],
                    rotation: Math.random() * 0.1 - 0.05
                });
            }
            let frame = 0;
            const animate = () => {
                confettiCtx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
                let alive = false;
                particles.forEach(p => {
                    p.y += p.speed;
                    p.angle += p.rotation;
                    p.speed += 0.12;
                    confettiCtx.save();
                    confettiCtx.translate(p.x, p.y);
                    confettiCtx.rotate(p.angle);
                    confettiCtx.fillStyle = p.color;
                    confettiCtx.fillRect(-p.size/2, -p.size/2, p.size, p.size);
                    confettiCtx.restore();
                    if (p.y < confettiCanvas.height) alive = true;
                });
                if (alive && frame < 180) {
                    frame++;
                    requestAnimationFrame(animate);
                }
            };
            animate();
        }

        async function performSpin() {
            if (isSpinning || !currentUser) return;
            isSpinning = true;

            const cost = freeSpinsRemaining > 0 ? 0 : currentBet;
            if (currentUser.coins < cost) {
                log("NOT ENOUGH COINS!");
                isSpinning = false;
                return;
            }

            currentUser.coins -= cost;
            saveDB();
            updateNavBalance();

            // Fill board
            for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) board[r][c] = getRandomSymbol();
            renderBoard();

            let cascadeCount = 0;
            let totalWinThisSpin = 0;

            while (true) {
                const clusters = findClusters();
                const scatters = board.flat().filter(s => s === scatter).length;

                if (clusters.length === 0 && cascadeCount === 0) break;

                const winNow = calculatePayout(clusters);
                totalWinThisSpin += winNow * currentMultiplier;

                if (winNow > 0) {
                    clusters.forEach(cluster => {
                        cluster.positions.forEach(({r,c}) => {
                            const idx = r * COLS + c;
                            gridCells[idx].classList.add('winning');
                        });
                    });
                    await new Promise(r => setTimeout(r, 620));
                    gridCells.forEach(cell => cell.classList.remove('winning'));

                    removeWinningClusters(clusters);
                    dropSymbols();
                    renderBoard();
                    cascadeCount++;
                    log(\`CASCADE #\${cascadeCount} +\${winNow} COINS\`);
                }

                if (scatters >= 3 && freeSpinsRemaining === 0) {
                    triggerFreeSpins();
                    totalWinThisSpin += currentBet * 25;
                    break;
                }

                if (clusters.length > 0) await new Promise(r => setTimeout(r, 480));
                else break;
            }

            if (totalWinThisSpin > 0) {
                addCoins(totalWinThisSpin);
                currentUser.history.unshift({win: totalWinThisSpin, bet: currentBet, time: new Date().toLocaleTimeString()});
                if (currentUser.history.length > 10) currentUser.history.pop();
                saveDB();
                log(\`BIG WIN +\${totalWinThisSpin} COINS\`);
            } else {
                log("NO WIN THIS SPIN");
            }

            isSpinning = false;
            updateNavBalance();

            if (freeSpinsRemaining > 0) {
                freeSpinsRemaining--;
                document.getElementById('freeSpinsLeft').textContent = freeSpinsRemaining;
                if (freeSpinsRemaining > 0) setTimeout(performSpin, 900);
                else endFreeSpins();
            }

            if (autoPlaying && freeSpinsRemaining === 0) setTimeout(performSpin, 1100);
        }

        function spin() { if (freeSpinsRemaining === 0) performSpin(); }

        function changeBet(delta) {
            if (freeSpinsRemaining > 0) return;
            currentBet = Math.max(10, Math.min(500, currentBet + delta));
            document.getElementById('betAmount').textContent = currentBet;
        }

        function toggleAuto() {
            autoPlaying = !autoPlaying;
            document.getElementById('autoBtn').textContent = autoPlaying ? "STOP" : "AUTO";
            if (autoPlaying && !isSpinning) performSpin();
        }

        function buyFeature() {
            const cost = currentBet * 100;
            if (!currentUser || currentUser.coins < cost) return log("NOT ENOUGH COINS FOR BUY!");
            currentUser.coins -= cost;
            saveDB();
            updateNavBalance();
            triggerFreeSpins();
            log("FEATURE BOUGHT – PREMIUM CHAOS!");
        }

        function triggerFreeSpins() {
            freeSpinsRemaining = 10;
            currentMultiplier = 1;
            document.getElementById('bonusHeader').innerHTML = \`TRAILER TRASH<br>FREE SPINS!\`;
            document.getElementById('freeSpinsLeft').textContent = 10;
            document.getElementById('multiplier').textContent = \`1×\`;
            document.getElementById('bonusScreen').classList.remove('hidden');
            document.getElementById('bonusScreen').style.display = 'flex';
            setTimeout(() => performSpin(), 1400);
        }

        function endFreeSpins() {
            freeSpinsRemaining = 0;
            currentMultiplier = 1;
            document.getElementById('bonusScreen').style.display = 'none';
        }

        function log(message) {
            const logEl = document.getElementById('gameLog');
            const time = new Date().toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'});
            logEl.innerHTML += \`<span class="text-gray-400">[\${time}]</span> \${message}<br>\`;
            logEl.scrollTop = logEl.scrollHeight;
            if (logEl.children.length > 12) logEl.removeChild(logEl.firstChild);
        }

        // ================== PROFILE ==================
        function renderProfile() {
            document.getElementById('profileName').textContent = currentUser.name;
            document.getElementById('profileCoins').innerHTML = \`\${currentUser.coins} <span class="text-5xl">🪙</span>\`;
            document.getElementById('profileCoins').innerHTML = \`\${currentUser.coins} <span class="text-5xl">🪙</span>\`;

            const list = document.getElementById('historyList');
            list.innerHTML = currentUser.history.length ?
                currentUser.history.map(h => \`<div class="flex justify-between"><span>\${h.time}</span><span class="text-green-400">+\${h.win}</span></div>\`).join('') :
                '<div class="text-gray-400">No spins yet</div>';
        }

        function claimDailyBonus() {
            const today = new Date().toDateString();
            const lastClaim = localStorage.getItem('lastDailyClaim');
            if (lastClaim === today) {
                log("Already claimed today!");
                return;
            }
            addCoins(50, "daily");
            localStorage.setItem('lastDailyClaim', today);
            log("DAILY BONUS +50 COINS CLAIMED!");
            renderProfile();
        }

        // ================== LEADERBOARD ==================
        function renderLeaderboard() {
            const sorted = [...usersDB].sort((a,b) => b.coins - a.coins);
            const container = document.getElementById('leaderboardList');
            container.innerHTML = sorted.map((u,i) => \`
                <div class="flex items-center justify-between bg-black p-6 border-4 border-yellow-400 rounded-xl">
                    <div class="flex items-center gap-4">
                        <div class="text-4xl">\${i+1}.</div>
                        <div>
                            <div class="text-3xl">\${u.name}</div>
                            <div class="text-xs text-gray-400">\${u.isAdmin ? 'ADMIN' : 'PLAYER'}</div>
                        </div>
                    </div>
                    <div class="text-5xl text-green-400">\${u.coins} 🪙</div>
                </div>
            \`).join('');
        }

        // ================== ADMIN PANEL ==================
        function showAdminPanel() {
            if (!currentUser || !currentUser.isAdmin) return;
            document.getElementById('adminScreen').classList.remove('hidden');
            document.getElementById('adminScreen').classList.add('active');
            renderAdminUsers();
        }

        function hideAdminPanel() {
            document.getElementById('adminScreen').classList.add('hidden');
            document.getElementById('adminScreen').classList.remove('active');
            navigateTo('game');
        }

        function renderAdminUsers() {
            const container = document.getElementById('adminUserList');
            container.innerHTML = usersDB.map(user => \`
                <div class="flex items-center justify-between bg-[#220000] p-6 border-4 border-yellow-400 rounded-xl">
                    <div>
                        <span class="text-3xl">\${user.name}</span>
                        <span class="ml-6 text-green-400 text-4xl">\${user.coins} 🪙</span>
                    </div>
                    <div class="flex gap-4">
                        <button onclick="adminAddCoins(\${user.id}, 100)" class="bg-green-600 px-6 py-4 text-xl">+100</button>
                        <button onclick="adminAddCoins(\${user.id}, 500)" class="bg-green-600 px-6 py-4 text-xl">+500</button>
                        <button onclick="adminAddCoins(\${user.id}, 2000)" class="bg-green-600 px-6 py-4 text-xl">+2000</button>
                        <button onclick="adminAddCoins(\${user.id}, -200)" class="bg-red-600 px-6 py-4 text-xl">-200</button>
                    </div>
                </div>
            \`).join('');
        }

        function adminAddCoins(userId, amount) {
            const target = findUser(userId);
            if (target) {
                target.coins = Math.max(0, target.coins + amount);
                saveDB();
                renderAdminUsers();
                if (currentUser.id === userId) updateNavBalance();
                log(\`ADMIN: \${amount > 0 ? '+' : ''}\${amount} coins to \${target.name}\`);
            }
        }

        // ================== INIT ==================
        function initGame() {
            initTailwind();
            loadDB();
            createGrid();
            initConfetti();

            // Initial random board
            for (let r = 0; r < ROWS; r++) {
                for (let c = 0; c < COLS; c++) {
                    board[r][c] = getRandomSymbol();
                }
            }
            renderBoard();

            document.getElementById('betAmount').textContent = currentBet;

            log("🚚 SUNNFUN RESIDENTS CASINO #2 LOADED – Vercel-ready PWA!");
            log("Pick a user or create new. Admin password not needed – one user is admin by default.");

            // Show login on start
            setTimeout(showLogin, 300);

            console.log('%c✅ SUNNFUN RESIDENTS CASINO #2 READY FOR VERCEL', 'color:#ffcc00;font-size:18px');
        }

        // Keyboard support
        document.addEventListener('keydown', e => {
            if (e.key === ' ' && document.getElementById('gameScreen').classList.contains('active') && !isSpinning) {
                e.preventDefault();
                spin();
            }
        });

        window.onload = initGame;
    </script>
</body>
</html>`;

  return new Response(html, {
    headers: {
      'Content-Type': 'text/html',
    },
  });
}