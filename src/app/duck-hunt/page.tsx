'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Duck {
  id: string;
  x: number;
  y: number;
  velocityX: number;
  velocityY: number;
  type: 'regular' | 'rare' | 'boss';
  hit: boolean;
  emoji: string;
  points: number;
  size: number;
}

interface GameState {
  balance: number;
  bet: number;
  ducks: Duck[];
  score: number;
  timeLeft: number;
  ammo: number;
  gamePhase: 'betting' | 'playing' | 'results';
  level: number;
  shotsFired: number;
  ducksHit: number;
  lastWin: number;
  gamesPlayed: number;
  gamesWon: number;
  showResult: boolean;
  resultMessage: string;
  combo: number;
  maxCombo: number;
}

const DUCK_TYPES = {
  regular: { emoji: '🦆', points: 10, size: 40, spawnRate: 0.8 },
  rare: { emoji: '🦉', points: 25, size: 45, spawnRate: 0.15 },
  boss: { emoji: '🦅', points: 50, size: 50, spawnRate: 0.05 }
};

export default function DuckHuntGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const spawnIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const gameTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    balance: 10000,
    bet: 50,
    ducks: [],
    score: 0,
    timeLeft: 60,
    ammo: 25,
    gamePhase: 'betting',
    level: 1,
    shotsFired: 0,
    ducksHit: 0,
    lastWin: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    showResult: false,
    resultMessage: '',
    combo: 0,
    maxCombo: 0
  });

  // Start new game
  const startGame = useCallback(() => {
    if (gameState.balance < gameState.bet) return;

    setGameState(prev => ({
      ...prev,
      balance: prev.balance - prev.bet,
      ducks: [],
      score: 0,
      timeLeft: 60,
      ammo: 25,
      gamePhase: 'playing',
      shotsFired: 0,
      ducksHit: 0,
      gamesPlayed: prev.gamesPlayed + 1,
      showResult: false,
      combo: 0,
      maxCombo: 0
    }));

    // Start duck spawning
    spawnDucks();

    // Start game timer
    gameTimerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          if (gameTimerRef.current) clearInterval(gameTimerRef.current);
          if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
          return { ...prev, gamePhase: 'results', timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [gameState.balance, gameState.bet]);

  // Spawn ducks periodically
  const spawnDucks = useCallback(() => {
    const spawnDuck = () => {
      const duckType = getRandomDuckType();
      const duckData = DUCK_TYPES[duckType];

      const duck: Duck = {
        id: `duck-${Date.now()}-${Math.random()}`,
        x: -50, // Start off-screen left
        y: Math.random() * 300 + 50, // Random height
        velocityX: 2 + Math.random() * 3, // Random speed
        velocityY: (Math.random() - 0.5) * 2, // Slight up/down movement
        type: duckType,
        hit: false,
        emoji: duckData.emoji,
        points: duckData.points,
        size: duckData.size
      };

      setGameState(prev => ({
        ...prev,
        ducks: [...prev.ducks, duck]
      }));
    };

    // Spawn ducks more frequently as level increases
    const spawnRate = Math.max(800 - (gameState.level * 100), 400);
    spawnIntervalRef.current = setInterval(spawnDuck, spawnRate);
  }, [gameState.level]);

  // Get random duck type based on spawn rates
  const getRandomDuckType = useCallback((): 'regular' | 'rare' | 'boss' => {
    const rand = Math.random();
    if (rand < DUCK_TYPES.boss.spawnRate) return 'boss';
    if (rand < DUCK_TYPES.boss.spawnRate + DUCK_TYPES.rare.spawnRate) return 'rare';
    return 'regular';
  }, []);

  // Update duck positions
  const updateDucks = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      ducks: prev.ducks
        .map(duck => ({
          ...duck,
          x: duck.x + duck.velocityX,
          y: duck.y + duck.velocityY + Math.sin(Date.now() * 0.005) * 1 // Gentle wave motion
        }))
        .filter(duck => duck.x < 850 && !duck.hit) // Remove ducks that flew off screen or were hit
    }));
  }, []);

  // Handle duck click/shoot
  const shootDuck = useCallback((duckId: string) => {
    if (gameState.gamePhase !== 'playing' || gameState.ammo <= 0) return;

    setGameState(prev => {
      const duck = prev.ducks.find(d => d.id === duckId);
      if (!duck || duck.hit) return prev;

      const newDucks = prev.ducks.map(d =>
        d.id === duckId ? { ...d, hit: true } : d
      );

      const points = duck.points;
      const newScore = prev.score + points;
      const newCombo = prev.combo + 1;
      const comboBonus = Math.floor(newCombo * 0.5);
      const totalPoints = points + comboBonus;

      return {
        ...prev,
        ducks: newDucks,
        score: prev.score + totalPoints,
        ammo: prev.ammo - 1,
        shotsFired: prev.shotsFired + 1,
        ducksHit: prev.ducksHit + 1,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo)
      };
    });
  }, [gameState.gamePhase, gameState.ammo]);

  // Handle canvas click for shooting
  const handleCanvasClick = useCallback((e: React.MouseEvent) => {
    if (gameState.gamePhase !== 'playing' || gameState.ammo <= 0) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Check if click hit any duck
    setGameState(prev => {
      let hitDuck = false;
      const newDucks = prev.ducks.map(duck => {
        if (!hitDuck && !duck.hit &&
            x >= duck.x && x <= duck.x + duck.size &&
            y >= duck.y && y <= duck.y + duck.size) {
          hitDuck = true;
          return { ...duck, hit: true };
        }
        return duck;
      });

      if (!hitDuck) {
        // Missed shot - break combo
        return {
          ...prev,
          ammo: prev.ammo - 1,
          shotsFired: prev.shotsFired + 1,
          combo: 0
        };
      }

      // Hit! - calculate points with combo
      const duck = prev.ducks.find(d => !d.hit && x >= d.x && x <= d.x + d.size && y >= d.y && y <= d.y + d.size);
      if (!duck) return prev;

      const points = duck.points;
      const newCombo = prev.combo + 1;
      const comboBonus = Math.floor(newCombo * 0.5);
      const totalPoints = points + comboBonus;

      return {
        ...prev,
        ducks: newDucks,
        score: prev.score + totalPoints,
        ducksHit: prev.ducksHit + 1,
        combo: newCombo,
        maxCombo: Math.max(prev.maxCombo, newCombo)
      };
    });
  }, [gameState.gamePhase, gameState.ammo]);

  // Game loop
  useEffect(() => {
    if (gameState.gamePhase === 'playing') {
      const gameLoop = () => {
        updateDucks();
        animationFrameRef.current = requestAnimationFrame(gameLoop);
      };
      gameLoop();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.gamePhase, updateDucks]);

  // Calculate results when game ends
  useEffect(() => {
    if (gameState.gamePhase === 'results') {
      if (spawnIntervalRef.current) clearInterval(spawnIntervalRef.current);
      if (gameTimerRef.current) clearInterval(gameTimerRef.current);

      const accuracy = gameState.shotsFired > 0 ? (gameState.ducksHit / gameState.shotsFired) * 100 : 0;
      const scorePerDuck = gameState.ducksHit > 0 ? gameState.score / gameState.ducksHit : 0;

      let multiplier = 1;
      if (gameState.score >= 1000) multiplier = 5;
      else if (gameState.score >= 750) multiplier = 4;
      else if (gameState.score >= 500) multiplier = 3;
      else if (gameState.score >= 250) multiplier = 2;

      const winAmount = Math.floor(gameState.bet * multiplier);

      setGameState(prev => ({
        ...prev,
        balance: prev.balance + winAmount,
        lastWin: winAmount,
        gamesWon: winAmount > 0 ? prev.gamesWon + 1 : prev.gamesWon,
        showResult: true,
        resultMessage: getResultMessage(gameState.score, accuracy, gameState.maxCombo)
      }));
    }
  }, [gameState.gamePhase, gameState.score, gameState.shotsFired, gameState.ducksHit, gameState.bet, gameState.maxCombo]);

  // Get funny result message
  const getResultMessage = (score: number, accuracy: number, maxCombo: number): string => {
    if (score >= 1000) return "🎯 ELITE MARKSMAN! You're makin' Rambo look like a amateur!";
    if (score >= 750) return "🏆 SHARPSHOOTER! Those ducks won't forget your name!";
    if (score >= 500) return "🎖️ VETERAN HUNTER! Task Force is proud!";
    if (score >= 250) return "👍 SOLID PERFORMANCE! Keep that trigger finger ready!";
    return "🐔 ROOKIE! Even grandma shoots straighter than that!";
  };

  // Adjust bet
  const adjustBet = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      bet: Math.max(10, Math.min(500, prev.bet + amount))
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-600 text-white">
      {/* Header */}
      <header className="border-b border-green-600 bg-green-800/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Company Cookout
            </span>
            <span className="text-yellow-400 font-semibold">Duck Hunt</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="text-yellow-400 font-bold">
              🍗 {gameState.balance.toLocaleString()} Coins
            </div>
            <Link href="/lobby" className="text-green-300 hover:text-white transition-colors">
              ← Back to Garage
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Task Force: Duck N Cover
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            &ldquo;Take cover, soldier! Those ducks are armed and dangerous!&rdquo;
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8 max-w-4xl mx-auto">
          <div className="bg-green-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesPlayed}</div>
            <div className="text-sm text-green-200">Missions</div>
          </div>
          <div className="bg-green-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesWon}</div>
            <div className="text-sm text-green-200">Victories</div>
          </div>
          <div className="bg-green-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.score}</div>
            <div className="text-sm text-green-200">Best Score</div>
          </div>
          <div className="bg-green-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.maxCombo}</div>
            <div className="text-sm text-green-200">Max Combo</div>
          </div>
          <div className="bg-green-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {gameState.shotsFired > 0 ? Math.round((gameState.ducksHit / gameState.shotsFired) * 100) : 0}%
            </div>
            <div className="text-sm text-green-200">Accuracy</div>
          </div>
        </div>

        {/* Betting Phase */}
        {gameState.gamePhase === 'betting' && (
          <div className="max-w-md mx-auto bg-green-700/50 backdrop-blur-sm rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Gear Up, Soldier!</h3>

            <div className="flex items-center justify-center space-x-6 mb-6">
              <button
                onClick={() => adjustBet(-10)}
                className="w-12 h-12 bg-green-600 hover:bg-green-500 rounded-full text-xl font-bold transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{gameState.bet}</div>
                <div className="text-sm text-green-200">Ammo Budget</div>
              </div>
              <button
                onClick={() => adjustBet(10)}
                className="w-12 h-12 bg-green-600 hover:bg-green-500 rounded-full text-xl font-bold transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={startGame}
              disabled={gameState.balance < gameState.bet}
              className={`w-full py-4 text-xl font-bold rounded-lg transition-all ${
                gameState.balance < gameState.bet
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 shadow-lg transform hover:scale-105'
              }`}
            >
              🎯 Lock & Load!
            </button>

            {gameState.lastWin > 0 && (
              <div className="mt-4 text-center text-green-300 font-bold">
                Last Mission: 🍗 {gameState.lastWin} earned
              </div>
            )}
          </div>
        )}

        {/* Game Area */}
        {gameState.gamePhase === 'playing' && (
          <div className="max-w-5xl mx-auto">
            {/* Game HUD */}
            <div className="bg-green-700/50 backdrop-blur-sm rounded-xl p-6 mb-6">
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{gameState.timeLeft}s</div>
                  <div className="text-sm text-green-200">Time Left</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{gameState.ammo}</div>
                  <div className="text-sm text-green-200">Ammo</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{gameState.score}</div>
                  <div className="text-sm text-green-200">Score</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{gameState.combo}x</div>
                  <div className="text-sm text-green-200">Combo</div>
                </div>
              </div>
            </div>

            {/* Game Canvas */}
            <div
              ref={gameAreaRef}
              className="relative bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600 rounded-xl h-96 overflow-hidden shadow-2xl border-4 border-green-600 cursor-crosshair"
              onClick={handleCanvasClick}
            >
              {/* Sky background with moving clouds */}
              <div className="absolute inset-0 opacity-30">
                <div className="absolute top-10 left-10 text-6xl animate-pulse">☁️</div>
                <div className="absolute top-20 right-20 text-4xl animate-pulse delay-1000">☁️</div>
                <div className="absolute bottom-20 left-1/4 text-5xl animate-pulse delay-500">☁️</div>
              </div>

              {/* Ducks */}
              {gameState.ducks.map(duck => (
                <div
                  key={duck.id}
                  className={`absolute transition-all duration-100 ${
                    duck.hit ? 'animate-ping opacity-50' : 'animate-bounce'
                  }`}
                  style={{
                    left: `${duck.x}px`,
                    top: `${duck.y}px`,
                    fontSize: `${duck.size}px`,
                    cursor: duck.hit ? 'default' : 'crosshair',
                    zIndex: duck.type === 'boss' ? 10 : duck.type === 'rare' ? 5 : 1
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    shootDuck(duck.id);
                  }}
                >
                  {duck.emoji}
                  {duck.hit && (
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold animate-bounce">
                      HIT! +{duck.points}
                    </div>
                  )}
                </div>
              ))}

              {/* Crosshair cursor effect */}
              <div className="absolute inset-0 pointer-events-none">
                <div className="w-full h-full flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-white rounded-full opacity-50 animate-ping"></div>
                </div>
              </div>

              {/* Instructions */}
              <div className="absolute bottom-4 left-4 bg-black/50 text-white p-3 rounded-lg">
                <div className="text-sm">Click ducks to shoot!</div>
                <div className="text-xs text-gray-300">🦆 Regular: 10pts | 🦉 Rare: 25pts | 🦅 Boss: 50pts</div>
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {gameState.showResult && (
          <div className="max-w-2xl mx-auto bg-green-700/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">
              {gameState.lastWin >= gameState.bet * 4 ? (
                <span className="text-green-400 animate-pulse">🎖️ ELITE SNIPER! Task Force Hero!</span>
              ) : gameState.lastWin >= gameState.bet * 2 ? (
                <span className="text-yellow-400 animate-bounce">🏅 MARKSMAN! Mission Accomplished!</span>
              ) : gameState.lastWin >= gameState.bet ? (
                <span className="text-blue-400">⭐ SOLID SOLDIER! Well Done!</span>
              ) : (
                <span className="text-red-400 animate-pulse">💥 ROOKIE! Back to Boot Camp!</span>
              )}
            </h3>

            {/* Funny Military Commentary */}
            <div className="bg-green-800/50 rounded-lg p-4 mb-6 border-2 border-green-600">
              <p className="text-green-100 italic text-lg">
                {gameState.score >= 1000 ? (
                  <span className="animate-pulse">\"Sir! This soldier single-handedly cleared the skies! Ducks won't fly over our cookout again!\"</span>
                ) : gameState.score >= 750 ? (
                  <span className="animate-bounce">\"Outstanding marksmanship! Those ducks are quacking up from fear!\"</span>
                ) : gameState.score >= 500 ? (
                  <span>\"Good shooting, soldier! The Task Force commends your efforts!\"</span>
                ) : gameState.score >= 250 ? (
                  <span>\"Decent work, but we expect better from our troops! Keep practicing!\"</span>
                ) : (
                  <span className="animate-pulse">\"Soldier, were you shooting at the ducks or trying to scare them with bad aim?\"</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center bg-green-800/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{gameState.score}</div>
                <div className="text-sm text-green-200">Final Score</div>
              </div>
              <div className="text-center bg-green-800/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">
                  {gameState.shotsFired > 0 ? Math.round((gameState.ducksHit / gameState.shotsFired) * 100) : 0}%
                </div>
                <div className="text-sm text-green-200">Accuracy</div>
              </div>
            </div>

            {gameState.lastWin > 0 ? (
              <div className="text-2xl font-bold text-green-400 mb-6 animate-bounce">
                + 🍗 {gameState.lastWin} Coins Earned!
                <div className="text-sm text-green-300 mt-1">Task Force pays well for good shooting!</div>
              </div>
            ) : (
              <div className="text-xl font-bold text-red-400 mb-6">
                "Better luck next mission, soldier! Those ducks are tricky customers!"
              </div>
            )}

            <button
              onClick={() => setGameState(prev => ({
                ...prev,
                gamePhase: 'betting',
                ducks: [],
                showResult: false
              }))}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🎯 Next Mission!
            </button>
          </div>
        )}

        {/* How to Play */}
        <div className="mt-12 bg-green-700/50 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">Task Force: Duck N Cover - Mission Brief</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-green-100">
            <div>
              <h4 className="font-bold text-white mb-2">🎯 Objective</h4>
              <p>Shoot as many ducks as possible before time runs out! Protect the cookout from aerial invaders!</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🎮 Controls</h4>
              <p><strong>Desktop:</strong> Click ducks to shoot<br/>
              <strong>Mobile:</strong> Tap ducks to shoot<br/>
              Miss shots break your combo!</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🦆 Duck Types</h4>
              <p><strong>🦆 Regular:</strong> 10pts<br/>
              <strong>🦉 Rare:</strong> 25pts<br/>
              <strong>🦅 Boss:</strong> 50pts</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">💰 Scoring</h4>
              <p><strong>1000+ pts:</strong> 5x bet<br/>
              <strong>750+ pts:</strong> 4x bet<br/>
              <strong>500+ pts:</strong> 3x bet<br/>
              <strong>250+ pts:</strong> 2x bet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}