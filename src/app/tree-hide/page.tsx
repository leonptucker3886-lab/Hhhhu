'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface HiddenItem {
  id: string;
  name: string;
  emoji: string;
  x: number;
  y: number;
  found: boolean;
  points: number;
}

interface GameState {
  balance: number;
  bet: number;
  timeLeft: number;
  score: number;
  items: HiddenItem[];
  gamePhase: 'betting' | 'playing' | 'result';
  foundItems: number;
  totalItems: number;
  lastWin: number;
  gamesPlayed: number;
  gamesWon: number;
  showCelebration: boolean;
}

export default function TreeHideGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    balance: 15000,
    bet: 50,
    timeLeft: 30,
    score: 0,
    items: [],
    gamePhase: 'betting',
    foundItems: 0,
    totalItems: 8,
    lastWin: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    showCelebration: false
  });

  // Generate hidden items
  const generateItems = useCallback((): HiddenItem[] => {
    const possibleItems = [
      { name: 'Squirrel', emoji: '🐿️', points: 100 },
      { name: 'Bird', emoji: '🐦', points: 75 },
      { name: 'Frog', emoji: '🐸', points: 60 },
      { name: 'Butterfly', emoji: '🦋', points: 50 },
      { name: 'Bee', emoji: '🐝', points: 40 },
      { name: 'Spider', emoji: '🕷️', points: 80 },
      { name: 'Ladybug', emoji: '🐞', points: 45 },
      { name: 'Owl', emoji: '🦉', points: 90 }
    ];

    return possibleItems.slice(0, gameState.totalItems).map((item, index) => ({
      id: `item-${index}`,
      name: item.name,
      emoji: item.emoji,
      x: Math.random() * 400 + 50, // Random position within game area
      y: Math.random() * 300 + 100,
      found: false,
      points: item.points
    }));
  }, [gameState.totalItems]);

  // Start game
  const startGame = useCallback(() => {
    if (gameState.balance < gameState.bet) return;

    const items = generateItems();
    setGameState(prev => ({
      ...prev,
      balance: prev.balance - prev.bet,
      items,
      gamePhase: 'playing',
      timeLeft: 30,
      score: 0,
      foundItems: 0,
      gamesPlayed: prev.gamesPlayed + 1,
      showCelebration: false
    }));

    // Start timer
    timerRef.current = setInterval(() => {
      setGameState(prev => {
        if (prev.timeLeft <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          return { ...prev, gamePhase: 'result', timeLeft: 0 };
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);
  }, [gameState.balance, gameState.bet, generateItems]);

  // Handle item click
  const handleItemClick = useCallback((itemId: string) => {
    if (gameState.gamePhase !== 'playing') return;

    setGameState(prev => {
      const item = prev.items.find(i => i.id === itemId);
      if (!item || item.found) return prev;

      const newItems = prev.items.map(i =>
        i.id === itemId ? { ...i, found: true } : i
      );

      const newScore = prev.score + item.points;
      const newFoundItems = prev.foundItems + 1;

      return {
        ...prev,
        items: newItems,
        score: newScore,
        foundItems: newFoundItems,
        showCelebration: true
      };
    });

    // Hide celebration after a moment
    setTimeout(() => {
      setGameState(prev => ({ ...prev, showCelebration: false }));
    }, 1000);
  }, [gameState.gamePhase]);

  // End game and calculate winnings
  const endGame = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);

    const foundPercentage = gameState.foundItems / gameState.totalItems;
    let multiplier = 0;

    if (foundPercentage >= 0.8) multiplier = 3; // 80%+ = 3x bet
    else if (foundPercentage >= 0.6) multiplier = 2; // 60%+ = 2x bet
    else if (foundPercentage >= 0.4) multiplier = 1.5; // 40%+ = 1.5x bet
    else if (foundPercentage >= 0.2) multiplier = 1; // 20%+ = 1x bet (break even)

    const winAmount = Math.floor(gameState.bet * multiplier);
    const newBalance = gameState.balance + winAmount;

    setGameState(prev => ({
      ...prev,
      balance: newBalance,
      lastWin: winAmount,
      gamePhase: 'result',
      gamesWon: winAmount > 0 ? prev.gamesWon + 1 : prev.gamesWon
    }));
  }, [gameState]);

  // Adjust bet
  const adjustBet = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      bet: Math.max(10, Math.min(500, prev.bet + amount))
    }));
  };

  // New game
  const newGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      gamePhase: 'betting',
      timeLeft: 30,
      score: 0,
      items: [],
      foundItems: 0,
      showCelebration: false
    }));
  }, []);

  // Auto-end game when time runs out
  useEffect(() => {
    if (gameState.timeLeft === 0 && gameState.gamePhase === 'playing') {
      endGame();
    }
  }, [gameState.timeLeft, gameState.gamePhase, endGame]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900 text-white">
      {/* Header */}
      <header className="border-b border-green-600 bg-green-800/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Company Cookout
            </span>
            <span className="text-yellow-400 font-semibold">Tree Hide</span>
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
            Hiding in the Tree
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            &ldquo;Spot the critters hidin&apos; in this mighty oak! Find &apos;em all before time runs out!&rdquo;
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="bg-green-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesPlayed}</div>
            <div className="text-sm text-green-200">Games Played</div>
          </div>
          <div className="bg-green-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesWon}</div>
            <div className="text-sm text-green-200">Games Won</div>
          </div>
          <div className="bg-green-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.foundItems}</div>
            <div className="text-sm text-green-200">Items Found</div>
          </div>
          <div className="bg-green-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.score}</div>
            <div className="text-sm text-green-200">Score</div>
          </div>
        </div>

        {/* Betting Phase */}
        {gameState.gamePhase === 'betting' && (
          <div className="max-w-md mx-auto bg-green-700/50 backdrop-blur-sm rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Place Your Bet</h3>

            <div className="flex items-center justify-center space-x-6 mb-6">
              <button
                onClick={() => adjustBet(-10)}
                className="w-12 h-12 bg-green-600 hover:bg-green-500 rounded-full text-xl font-bold transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{gameState.bet}</div>
                <div className="text-sm text-green-200">Coins</div>
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
              🌳 Start Huntin&apos;!
            </button>

            {gameState.lastWin > 0 && (
              <div className="mt-4 text-center text-green-300 font-bold">
                Last Win: 🍗 {gameState.lastWin}
              </div>
            )}
          </div>
        )}

        {/* Game Area */}
        {(gameState.gamePhase === 'playing' || gameState.gamePhase === 'result') && (
          <div className="max-w-2xl mx-auto">
            {/* Game UI */}
            <div className="bg-green-700/50 backdrop-blur-sm rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-4">
                <div className="text-lg font-bold">
                  Time: <span className={`text-2xl ${gameState.timeLeft <= 10 ? 'text-red-400 animate-pulse' : 'text-white'}`}>
                    {gameState.timeLeft}s
                  </span>
                </div>
                <div className="text-lg font-bold">
                  Found: {gameState.foundItems}/{gameState.totalItems}
                </div>
                <div className="text-lg font-bold">
                  Score: {gameState.score}
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-green-800 rounded-full h-3 mb-4">
                <div
                  className="bg-yellow-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(gameState.foundItems / gameState.totalItems) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Tree Game Area */}
            <div
              ref={gameAreaRef}
              className="relative bg-gradient-to-b from-green-600 to-green-800 rounded-xl h-96 overflow-hidden shadow-2xl border-4 border-green-500"
              style={{
                backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23006600" fill-opacity="0.1"%3E%3Ccircle cx="30" cy="30" r="4"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
                backgroundSize: '30px 30px'
              }}
            >
              {/* Tree Trunk */}
              <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-16 h-32 bg-amber-800 rounded-t-lg shadow-lg"></div>

              {/* Tree Leaves/Canopy */}
              <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 w-64 h-48 bg-green-700 rounded-full shadow-lg"></div>

              {/* Hidden Items */}
              {gameState.items.map(item => (
                <button
                  key={item.id}
                  onClick={() => handleItemClick(item.id)}
                  disabled={item.found}
                  className={`absolute transition-all duration-300 ${
                    item.found
                      ? 'opacity-30 scale-75 grayscale'
                      : 'hover:scale-110 animate-pulse'
                  }`}
                  style={{
                    left: `${item.x}px`,
                    top: `${item.y}px`,
                    fontSize: '2rem',
                    width: '40px',
                    height: '40px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  {item.emoji}
                </button>
              ))}

              {/* Celebration Effect */}
              {gameState.showCelebration && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 rounded-xl animate-pulse">
                  <div className="text-4xl animate-bounce">🎉 FOUND ONE! 🎉</div>
                </div>
              )}
            </div>

            {/* Game Controls */}
            {gameState.gamePhase === 'playing' && (
              <div className="mt-6 text-center">
                <button
                  onClick={endGame}
                  className="px-8 py-3 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all transform hover:scale-105"
                >
                  🏁 End Hunt Early
                </button>
              </div>
            )}

            {/* Result Screen */}
            {gameState.gamePhase === 'result' && (
              <div className="mt-6 text-center bg-green-700/50 backdrop-blur-sm rounded-xl p-8">
                <h3 className="text-3xl font-bold mb-4">
                  {gameState.foundItems >= gameState.totalItems * 0.6 ? (
                    <span className="text-green-400">🌟 Hunt Master! 🌟</span>
                  ) : gameState.foundItems >= gameState.totalItems * 0.4 ? (
                    <span className="text-yellow-400">👍 Good Huntin&apos;! 👍</span>
                  ) : (
                    <span className="text-red-400">🐿️ They Got Away! 🐿️</span>
                  )}
                </h3>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{gameState.foundItems}</div>
                    <div className="text-sm text-green-200">Items Found</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-white">{gameState.score}</div>
                    <div className="text-sm text-green-200">Final Score</div>
                  </div>
                </div>

                {gameState.lastWin > 0 ? (
                  <div className="text-2xl font-bold text-green-400 mb-6">
                    + 🍗 {gameState.lastWin} Coins Won!
                  </div>
                ) : (
                  <div className="text-xl font-bold text-red-400 mb-6">
                    Better luck next hunt!
                  </div>
                )}

                <button
                  onClick={newGame}
                  className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  🎯 Hunt Again!
                </button>
              </div>
            )}
          </div>
        )}

        {/* How to Play */}
        <div className="mt-12 bg-green-700/50 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">How to Play: Hiding in the Tree</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-green-100">
            <div>
              <h4 className="font-bold text-white mb-2">🎯 Objective</h4>
              <p>Find all the hidden critters in the tree before time runs out! Each animal gives different points.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">⏱️ Time Pressure</h4>
              <p>You have 30 seconds to spot as many critters as possible. The timer counts down!</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">💰 Winnings</h4>
              <p>80% found = 3x bet | 60% = 2x | 40% = 1.5x | 20% = break even</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🐿️ Critters</h4>
              <p>Squirrel (100pts), Bird (75pts), Frog (60pts), Butterfly (50pts), Bee (40pts), Spider (80pts), Ladybug (45pts), Owl (90pts)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}