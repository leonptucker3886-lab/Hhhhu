'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// Game constants
const SYMBOLS = [
  { emoji: '🐷', name: 'Pig', value: 10, multiplier: 1.5 },
  { emoji: '🍺', name: 'Beer Money', value: 8, multiplier: 1.2 },
  { emoji: '🔨', name: 'Nails', value: 6, multiplier: 1.0 },
  { emoji: '🎣', name: 'Fish', value: 4, multiplier: 0.8 },
  { emoji: '🐊', name: 'Alligator', value: 2, multiplier: 0.5 },
  { emoji: '🥾', name: 'Wild Boot', value: 0, multiplier: 2.0, isWild: true },
  { emoji: '⭐', name: 'Free Spin Scatter', value: 0, multiplier: 0, isScatter: true }
];

const PAYLINES = [
  [0, 1, 2, 3, 4],     // Top row
  [5, 6, 7, 8, 9],     // Middle row
  [10, 11, 12, 13, 14], // Bottom row
  [0, 6, 12, 8, 4],    // Diagonal \
  [10, 6, 2, 8, 14]    // Diagonal /
];

const WIN_MULTIPLIERS = {
  3: 1,
  4: 2,
  5: 5
};

interface GameState {
  balance: number;
  bet: number;
  reels: string[][];
  spinning: boolean;
  lastWin: number;
  freeSpins: number;
  totalFreeSpins: number;
  jackpot: number;
  winHistory: number[];
  showWinAnimation: boolean;
  showJackpot: boolean;
  isAutoSpin: boolean;
}

export default function SlotMachine() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);
  const spinTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    balance: 5000,
    bet: 10,
    reels: Array.from({ length: 5 }, () => Array.from({ length: 3 }, () => '🔨')),
    spinning: false,
    lastWin: 0,
    freeSpins: 0,
    totalFreeSpins: 0,
    jackpot: 10000,
    winHistory: [],
    showWinAnimation: false,
    showJackpot: false,
    isAutoSpin: false
  });

  // Generate random symbol
  const getRandomSymbol = useCallback(() => {
    const weights = [15, 20, 25, 20, 15, 3, 2]; // Weighted probabilities
    const totalWeight = weights.reduce((sum, w) => sum + w, 0);
    let random = Math.random() * totalWeight;

    for (let i = 0; i < SYMBOLS.length; i++) {
      random -= weights[i];
      if (random <= 0) return SYMBOLS[i].emoji;
    }
    return SYMBOLS[0].emoji;
  }, []);

  // Spin reels
  const spinReels = useCallback(() => {
    if (gameState.spinning || gameState.balance < gameState.bet) return;

    setGameState(prev => ({
      ...prev,
      balance: prev.balance - prev.bet,
      spinning: true,
      lastWin: 0,
      showWinAnimation: false,
      showJackpot: false
    }));

    // Animate spinning
    let spinCount = 0;
    const maxSpins = 20 + Math.random() * 10;

    const animate = () => {
      if (spinCount < maxSpins) {
        setGameState(prev => ({
          ...prev,
          reels: Array.from({ length: 5 }, () =>
            Array.from({ length: 3 }, () => getRandomSymbol())
          )
        }));
        spinCount++;
        animationFrameRef.current = requestAnimationFrame(animate);
      } else {
        // Final result
        const finalReels = Array.from({ length: 5 }, () =>
          Array.from({ length: 3 }, () => getRandomSymbol())
        );

        setGameState(prev => {
          const result = calculateWin(finalReels, prev.bet);
          const newBalance = prev.balance + result.winAmount;
          const hasScatters = countScatters(finalReels) >= 3;

          return {
            ...prev,
            reels: finalReels,
            spinning: false,
            lastWin: result.winAmount,
            balance: newBalance,
            freeSpins: hasScatters ? prev.freeSpins + 10 : prev.freeSpins,
            totalFreeSpins: hasScatters ? prev.totalFreeSpins + 10 : prev.totalFreeSpins,
            winHistory: [...prev.winHistory.slice(-4), result.winAmount],
            showWinAnimation: result.winAmount > 0,
            showJackpot: Math.random() < 0.001, // 0.1% chance for jackpot
            jackpot: prev.jackpot + prev.bet * 0.01 // Progressive jackpot grows
          };
        });
      }
    };

    animate();
  }, [gameState.spinning, gameState.balance, gameState.bet, getRandomSymbol]);

  // Calculate win amount
  const calculateWin = useCallback((reels: string[][], bet: number) => {
    let totalWin = 0;
    const winningLines: number[][] = [];

    PAYLINES.forEach((payline, lineIndex) => {
      const lineSymbols = payline.map(pos => {
        const row = Math.floor(pos / 5);
        const col = pos % 5;
        return reels[col][row];
      });

      // Check for wins (3, 4, or 5 in a row)
      for (let length = 5; length >= 3; length--) {
        const symbol = lineSymbols[0];
        const isWild = SYMBOLS.find(s => s.emoji === symbol)?.isWild;
        const isWin = lineSymbols.slice(0, length).every(s =>
          s === symbol || SYMBOLS.find(sym => sym.emoji === s)?.isWild || isWild
        );

        if (isWin) {
          const symbolData = SYMBOLS.find(s => s.emoji === symbol);
          if (symbolData) {
            const multiplier = WIN_MULTIPLIERS[length as keyof typeof WIN_MULTIPLIERS] * symbolData.multiplier;
            totalWin += bet * multiplier;
            winningLines.push(payline.slice(0, length));
            break;
          }
        }
      }
    });

    return { winAmount: totalWin, winningLines };
  }, []);

  // Count scatters for free spins
  const countScatters = useCallback((reels: string[][]) => {
    let count = 0;
    reels.forEach(reel => {
      reel.forEach(symbol => {
        if (SYMBOLS.find(s => s.emoji === symbol)?.isScatter) count++;
      });
    });
    return count;
  }, []);

  // Handle auto spin
  useEffect(() => {
    if (gameState.isAutoSpin && !gameState.spinning && gameState.balance >= gameState.bet) {
      spinTimeoutRef.current = setTimeout(spinReels, 1000);
    }
    return () => {
      if (spinTimeoutRef.current) clearTimeout(spinTimeoutRef.current);
    };
  }, [gameState.isAutoSpin, gameState.spinning, gameState.balance, gameState.bet, spinReels]);

  // Adjust bet
  const adjustBet = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      bet: Math.max(1, Math.min(100, prev.bet + amount))
    }));
  };

  // Toggle auto spin
  const toggleAutoSpin = () => {
    setGameState(prev => ({ ...prev, isAutoSpin: !prev.isAutoSpin }));
  };

  return (
    <div className="min-h-screen bg-neutral-900 text-white">
      {/* Header */}
      <header className="border-b border-neutral-800 bg-neutral-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Company Cookout
            </span>
            <span className="text-yellow-400 font-semibold">Sun N Fun Slots</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="text-yellow-400 font-bold">
              🍗 {gameState.balance.toLocaleString()} Coins
            </div>
            <Link href="/lobby" className="text-neutral-400 hover:text-yellow-400 transition-colors">
              ← Back to Garage
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Sun N Fun Slots - Kick the Pig Edition
          </h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            &ldquo;Lakeside cookout chaos! Kick them pigs and watch the money fly!&rdquo;
          </p>
        </div>

        {/* Game Canvas Area */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-8 mb-8">
          {/* Slot Machine Display */}
          <div className="relative mb-8">
            <div className="bg-gradient-to-b from-neutral-700 to-neutral-900 p-8 rounded-xl border-4 border-yellow-500 shadow-2xl">
              {/* Reels Grid */}
              <div className="grid grid-cols-5 gap-2 mb-6 max-w-2xl mx-auto">
                {gameState.reels.map((reel, reelIndex) => (
                  <div key={reelIndex} className="bg-neutral-800 rounded-lg p-2">
                    {reel.map((symbol, symbolIndex) => (
                      <div
                        key={symbolIndex}
                        className={`text-4xl md:text-6xl text-center mb-1 ${
                          gameState.spinning ? 'animate-pulse' : ''
                        }`}
                      >
                        {symbol}
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Win Animation Overlay */}
              {gameState.showWinAnimation && (
                <div className="absolute inset-0 flex items-center justify-center bg-yellow-500/20 rounded-xl animate-pulse">
                  <div className="text-6xl animate-bounce">🎉 WIN! 🎉</div>
                </div>
              )}

              {/* Jackpot Animation */}
              {gameState.showJackpot && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-500/20 rounded-xl">
                  <div className="text-center">
                    <div className="text-8xl animate-bounce mb-4">🏆</div>
                    <div className="text-4xl font-bold text-yellow-400 animate-pulse">
                      JACKPOT! ${gameState.jackpot.toLocaleString()}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Paylines Indicator */}
            <div className="absolute -right-8 top-1/2 transform -translate-y-1/2 space-y-4">
              {PAYLINES.slice(0, 3).map((_, index) => (
                <div key={index} className="w-6 h-1 bg-yellow-400 rounded"></div>
              ))}
            </div>
          </div>

          {/* Game Controls */}
          <div className="grid md:grid-cols-3 gap-6 items-center">
            {/* Bet Controls */}
            <div className="text-center">
              <h3 className="text-lg font-bold text-yellow-400 mb-2">Bet Amount</h3>
              <div className="flex items-center justify-center space-x-4">
                <button
                  onClick={() => adjustBet(-1)}
                  className="w-10 h-10 bg-neutral-700 hover:bg-neutral-600 rounded-full text-xl font-bold"
                  disabled={gameState.spinning}
                >
                  -
                </button>
                <span className="text-2xl font-bold text-yellow-400 min-w-[60px]">
                  {gameState.bet}
                </span>
                <button
                  onClick={() => adjustBet(1)}
                  className="w-10 h-10 bg-neutral-700 hover:bg-neutral-600 rounded-full text-xl font-bold"
                  disabled={gameState.spinning}
                >
                  +
                </button>
              </div>
            </div>

            {/* Spin Button */}
            <div className="text-center">
              <button
                onClick={spinReels}
                disabled={gameState.spinning || gameState.balance < gameState.bet}
                className={`px-12 py-6 text-2xl font-bold rounded-full transform transition-all duration-200 ${
                  gameState.spinning || gameState.balance < gameState.bet
                    ? 'bg-neutral-600 cursor-not-allowed'
                    : 'bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 hover:scale-105 shadow-xl'
                }`}
              >
                {gameState.spinning ? '🎰 SPINNING...' : '🎰 SPIN!'}
              </button>

              {/* Auto Spin Toggle */}
              <div className="mt-4">
                <button
                  onClick={toggleAutoSpin}
                  className={`px-6 py-2 rounded-lg font-bold transition-colors ${
                    gameState.isAutoSpin
                      ? 'bg-green-600 hover:bg-green-500'
                      : 'bg-neutral-700 hover:bg-neutral-600'
                  }`}
                >
                  🔄 Auto Spin {gameState.isAutoSpin ? 'ON' : 'OFF'}
                </button>
              </div>
            </div>

            {/* Game Info */}
            <div className="text-center">
              <div className="space-y-2">
                <div className="text-lg">
                  <span className="text-neutral-400">Last Win:</span>
                  <span className={`ml-2 font-bold ${gameState.lastWin > 0 ? 'text-green-400' : 'text-neutral-300'}`}>
                    {gameState.lastWin > 0 ? `🍗 ${gameState.lastWin}` : 'None'}
                  </span>
                </div>
                <div className="text-lg">
                  <span className="text-neutral-400">Free Spins:</span>
                  <span className="ml-2 font-bold text-blue-400">
                    {gameState.freeSpins > 0 ? `${gameState.freeSpins} left` : 'None'}
                  </span>
                </div>
                <div className="text-lg">
                  <span className="text-neutral-400">Jackpot:</span>
                  <span className="ml-2 font-bold text-red-400">
                    ${gameState.jackpot.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Win History */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">Recent Wins</h3>
          <div className="flex justify-center space-x-4">
            {gameState.winHistory.map((win, index) => (
              <div
                key={index}
                className={`px-4 py-2 rounded-lg text-center ${
                  win > 0 ? 'bg-green-600/50 text-green-300' : 'bg-neutral-700 text-neutral-400'
                }`}
              >
                {win > 0 ? `🍗 ${win}` : '❌'}
              </div>
            ))}
          </div>
        </div>

        {/* Symbol Legend */}
        <div className="mt-8 bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">Symbol Values</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {SYMBOLS.map(symbol => (
              <div key={symbol.emoji} className="bg-neutral-700 rounded-lg p-4 text-center">
                <div className="text-3xl mb-2">{symbol.emoji}</div>
                <div className="font-bold text-yellow-400">{symbol.name}</div>
                <div className="text-sm text-neutral-300">
                  {symbol.isWild && 'WILD'}
                  {symbol.isScatter && 'SCATTER'}
                  {!symbol.isWild && !symbol.isScatter && `${symbol.value}x base`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}