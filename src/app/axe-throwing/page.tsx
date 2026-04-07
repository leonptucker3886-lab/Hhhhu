'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Axe {
  id: string;
  x: number;
  y: number;
  rotation: number;
  velocityX: number;
  velocityY: number;
  angularVelocity: number;
  thrown: boolean;
  landed: boolean;
  score: number;
}

interface TargetZone {
  id: string;
  x: number;
  y: number;
  radius: number;
  points: number;
  color: string;
  name: string;
}

interface GameState {
  balance: number;
  bet: number;
  axes: Axe[];
  targetZones: TargetZone[];
  currentAxe: number;
  totalAxes: number;
  score: number;
  gamePhase: 'aiming' | 'throwing' | 'results';
  power: number;
  angle: number;
  isDragging: boolean;
  dragStart: { x: number; y: number } | null;
  lastWin: number;
  gamesPlayed: number;
  gamesWon: number;
  showResult: boolean;
}

const TARGET_ZONES: TargetZone[] = [
  { id: 'bullseye', x: 400, y: 200, radius: 25, points: 50, color: '#ef4444', name: 'Bullseye' },
  { id: 'inner', x: 400, y: 200, radius: 50, points: 25, color: '#f97316', name: 'Inner Ring' },
  { id: 'middle', x: 400, y: 200, radius: 75, points: 15, color: '#eab308', name: 'Middle Ring' },
  { id: 'outer', x: 400, y: 200, radius: 100, points: 10, color: '#22c55e', name: 'Outer Ring' },
  { id: 'edge', x: 400, y: 200, radius: 125, points: 5, color: '#3b82f6', name: 'Edge' }
];

export default function AxeThrowingGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    balance: 12000,
    bet: 100,
    axes: [],
    targetZones: TARGET_ZONES,
    currentAxe: 0,
    totalAxes: 5,
    score: 0,
    gamePhase: 'aiming',
    power: 50,
    angle: 45,
    isDragging: false,
    dragStart: null,
    lastWin: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    showResult: false
  });

  // Initialize axes
  const initializeAxes = useCallback(() => {
    const axes: Axe[] = [];
    for (let i = 0; i < gameState.totalAxes; i++) {
      axes.push({
        id: `axe-${i}`,
        x: 100 + (i * 20), // Starting position
        y: 350,
        rotation: 0,
        velocityX: 0,
        velocityY: 0,
        angularVelocity: 0,
        thrown: false,
        landed: false,
        score: 0
      });
    }
    return axes;
  }, [gameState.totalAxes]);

  // Start new game
  const startGame = useCallback(() => {
    if (gameState.balance < gameState.bet) return;

    const axes = initializeAxes();
    setGameState(prev => ({
      ...prev,
      balance: prev.balance - prev.bet,
      axes,
      currentAxe: 0,
      score: 0,
      gamePhase: 'aiming',
      gamesPlayed: prev.gamesPlayed + 1,
      showResult: false
    }));
  }, [gameState.balance, gameState.bet, initializeAxes]);

  // Physics update for thrown axes
  const updatePhysics = useCallback(() => {
    setGameState(prev => {
      const newAxes = prev.axes.map(axe => {
        if (!axe.thrown || axe.landed) return axe;

        // Apply gravity (more challenging)
        const gravity = 0.5;
        const newVelocityY = axe.velocityY + gravity;

        // Add air resistance for more realistic physics
        const airResistance = 0.98;
        const newVelocityX = axe.velocityX * airResistance;
        const newY = axe.y + newVelocityY;
        const newX = axe.x + axe.velocityX;

        // Apply rotation
        const newRotation = axe.rotation + axe.angularVelocity;

        // Check for landing (ground collision)
        if (newY >= 380) {
          // Check if axe hit target
          const distanceToTarget = Math.sqrt((newX - 400) ** 2 + (380 - 200) ** 2);
          let points = 0;

          // Find which zone it hit
          for (const zone of prev.targetZones) {
            if (distanceToTarget <= zone.radius) {
              points = zone.points;
              break;
            }
          }

          return {
            ...axe,
            x: newX,
            y: 380,
            velocityX: 0,
            velocityY: 0,
            angularVelocity: 0,
            landed: true,
            score: points
          };
        }

        return {
          ...axe,
          x: newX,
          y: newY,
          velocityX: newVelocityX,
          velocityY: newVelocityY,
          rotation: newRotation
        };
      });

      return { ...prev, axes: newAxes };
    });
  }, []);

  // Throw axe
  const throwAxe = useCallback(() => {
    if (gameState.gamePhase !== 'aiming' || gameState.currentAxe >= gameState.totalAxes) return;

    const power = gameState.power / 100; // Convert to 0-1 scale
    const angleRad = (gameState.angle * Math.PI) / 180;

    // Calculate velocity components
    const velocityX = Math.cos(angleRad) * power * 15;
    const velocityY = -Math.sin(angleRad) * power * 15;

    setGameState(prev => {
      const newAxes = [...prev.axes];
      const currentAxe = newAxes[prev.currentAxe];

      if (currentAxe) {
        newAxes[prev.currentAxe] = {
          ...currentAxe,
          velocityX,
          velocityY,
          angularVelocity: velocityX * 0.1, // Spin based on horizontal velocity
          thrown: true
        };
      }

      return {
        ...prev,
        axes: newAxes,
        currentAxe: prev.currentAxe + 1,
        gamePhase: prev.currentAxe + 1 >= prev.totalAxes ? 'results' : 'throwing'
      };
    });

    // Start physics animation
    const animate = () => {
      updatePhysics();
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    animate();
  }, [gameState.power, gameState.angle, gameState.gamePhase, gameState.currentAxe, gameState.totalAxes, updatePhysics]);

  // Handle mouse/touch events for aiming
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (gameState.gamePhase !== 'aiming') return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setGameState(prev => ({
      ...prev,
      isDragging: true,
      dragStart: { x, y }
    }));
  }, [gameState.gamePhase]);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!gameState.isDragging || !gameState.dragStart) return;

    const rect = canvasRef.current?.getBoundingClientRect();
    if (!rect) return;

    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const deltaX = x - gameState.dragStart.x;
    const deltaY = y - gameState.dragStart.y;

    // Calculate angle and power from drag
    const angle = Math.atan2(-deltaY, deltaX) * (180 / Math.PI);
    const power = Math.min(100, Math.sqrt(deltaX * deltaX + deltaY * deltaY));

    setGameState(prev => ({
      ...prev,
      angle: Math.max(0, Math.min(90, angle)),
      power: power
    }));
  }, [gameState.isDragging, gameState.dragStart]);

  const handleMouseUp = useCallback(() => {
    if (gameState.isDragging) {
      throwAxe();
    }
    setGameState(prev => ({
      ...prev,
      isDragging: false,
      dragStart: null
    }));
  }, [gameState.isDragging, throwAxe]);

  // Calculate final score and winnings
  useEffect(() => {
    if (gameState.gamePhase === 'results' && gameState.axes.every(axe => axe.landed)) {
      const totalScore = gameState.axes.reduce((sum, axe) => sum + axe.score, 0);
      const averageScore = totalScore / gameState.totalAxes;

      // Calculate multiplier based on average score
      let multiplier = 0;
      if (averageScore >= 40) multiplier = 5; // Excellent
      else if (averageScore >= 25) multiplier = 3; // Good
      else if (averageScore >= 15) multiplier = 2; // Decent
      else if (averageScore >= 8) multiplier = 1.5; // Okay
      else if (averageScore >= 3) multiplier = 1; // Poor but some points

      const winAmount = Math.floor(gameState.bet * multiplier);

      setGameState(prev => ({
        ...prev,
        score: totalScore,
        balance: prev.balance + winAmount,
        lastWin: winAmount,
        gamesWon: winAmount > 0 ? prev.gamesWon + 1 : prev.gamesWon,
        showResult: true
      }));

      // Stop animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, [gameState.gamePhase, gameState.axes, gameState.totalAxes, gameState.bet]);

  // Adjust bet
  const adjustBet = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      bet: Math.max(10, Math.min(1000, prev.bet + amount))
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-800 via-amber-700 to-amber-900 text-white">
      {/* Header */}
      <header className="border-b border-amber-600 bg-amber-800/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Company Cookout
            </span>
            <span className="text-yellow-400 font-semibold">Axe Throwing</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="text-yellow-400 font-bold">
              🍗 {gameState.balance.toLocaleString()} Coins
            </div>
            <Link href="/lobby" className="text-amber-300 hover:text-white transition-colors">
              ← Back to Garage
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            My Achy Breaky Axe
          </h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            &ldquo;Don&apos;t be a lumberjack slacker! Throw them axes and hit them targets!&rdquo;
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="bg-amber-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesPlayed}</div>
            <div className="text-sm text-amber-200">Throws Made</div>
          </div>
          <div className="bg-amber-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesWon}</div>
            <div className="text-sm text-amber-200">Games Won</div>
          </div>
          <div className="bg-amber-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.score}</div>
            <div className="text-sm text-amber-200">Last Score</div>
          </div>
          <div className="bg-amber-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.currentAxe}</div>
            <div className="text-sm text-amber-200">Axes Thrown</div>
          </div>
        </div>

        {/* Betting Phase */}
        {gameState.gamePhase === 'aiming' && gameState.currentAxe === 0 && (
          <div className="max-w-md mx-auto bg-amber-700/50 backdrop-blur-sm rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Place Your Bet</h3>

            <div className="flex items-center justify-center space-x-6 mb-6">
              <button
                onClick={() => adjustBet(-10)}
                className="w-12 h-12 bg-amber-600 hover:bg-amber-500 rounded-full text-xl font-bold transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{gameState.bet}</div>
                <div className="text-sm text-amber-200">Coins per Round</div>
              </div>
              <button
                onClick={() => adjustBet(10)}
                className="w-12 h-12 bg-amber-600 hover:bg-amber-500 rounded-full text-xl font-bold transition-colors"
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
              🪓 Start Throwin&apos;!
            </button>

            {gameState.lastWin > 0 && (
              <div className="mt-4 text-center text-green-300 font-bold">
                Last Win: 🍗 {gameState.lastWin}
              </div>
            )}
          </div>
        )}

        {/* Game Canvas */}
        <div className="max-w-4xl mx-auto mb-8">
          <div className="bg-gradient-to-b from-amber-600 to-amber-800 rounded-xl p-8 shadow-2xl relative overflow-hidden">
            {/* Target */}
            <div className="absolute top-20 left-1/2 transform -translate-x-1/2">
              {gameState.targetZones.map((zone, index) => (
                <div
                  key={zone.id}
                  className="absolute rounded-full border-4 border-white flex items-center justify-center font-bold text-white shadow-lg"
                  style={{
                    width: zone.radius * 2,
                    height: zone.radius * 2,
                    left: -zone.radius,
                    top: -zone.radius,
                    backgroundColor: zone.color,
                    opacity: 0.8,
                    zIndex: 5 - index
                  }}
                >
                  {zone.points}
                </div>
              ))}
            </div>

            {/* Ground */}
            <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-amber-900 to-amber-800"></div>

            {/* Axes */}
            {gameState.axes.map(axe => (
              <div
                key={axe.id}
                className="absolute text-4xl transition-all duration-75"
                style={{
                  left: axe.x,
                  top: axe.y,
                  transform: `rotate(${axe.rotation}deg)`,
                  zIndex: axe.thrown ? 10 : 1
                }}
              >
                🪓
                {axe.landed && axe.score > 0 && (
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-black px-2 py-1 rounded text-sm font-bold animate-bounce">
                    +{axe.score}
                  </div>
                )}
              </div>
            ))}

            {/* Aiming Guide */}
            {gameState.gamePhase === 'aiming' && gameState.currentAxe < gameState.totalAxes && (
              <div className="absolute bottom-24 left-20 flex items-end">
                <div className="w-4 bg-yellow-400 rounded-full mr-2 relative overflow-hidden">
                  <div
                    className="bg-red-500 w-full transition-all duration-200"
                    style={{ height: `${gameState.power}%`, marginTop: `${100 - gameState.power}%` }}
                  ></div>
                </div>
                <div className="text-white font-bold">
                  <div>Power: {Math.round(gameState.power)}%</div>
                  <div>Angle: {Math.round(gameState.angle)}°</div>
                  <div className="text-sm text-amber-200 mt-2">
                    {gameState.isDragging ? 'Release to throw!' : 'Drag to aim!'}
                  </div>
                </div>
              </div>
            )}

            {/* Invisible interaction layer */}
            <div
              className="absolute inset-0 cursor-crosshair"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            ></div>
          </div>

          {/* Game Controls */}
          {gameState.gamePhase === 'aiming' && gameState.currentAxe < gameState.totalAxes && (
            <div className="mt-6 text-center">
              <div className="text-lg text-amber-200 mb-4">
                Axe {gameState.currentAxe + 1} of {gameState.totalAxes} - Click and drag to aim, release to throw!
              </div>
            </div>
          )}

          {gameState.gamePhase === 'throwing' && (
            <div className="mt-6 text-center">
              <div className="text-2xl text-white animate-pulse">🎯 Axe in flight!</div>
            </div>
          )}
        </div>

        {/* Results */}
        {gameState.showResult && (
          <div className="max-w-2xl mx-auto bg-amber-700/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">
              {gameState.lastWin >= gameState.bet * 4 ? (
                <span className="text-green-400 animate-pulse">🌟 PAUL BUNYAN APPROVED! 🌟</span>
              ) : gameState.lastWin >= gameState.bet * 2 ? (
                <span className="text-yellow-400 animate-bounce">🎯 TIMBER! YOU&apos;RE A NATURAL! 🎯</span>
              ) : gameState.lastWin >= gameState.bet ? (
                <span className="text-blue-400">👍 NOT BAD FOR A CITY SLICKER! 👍</span>
              ) : (
                <span className="text-red-400 animate-pulse">🪓 EVEN MY GRANDPA THROWS BETTER! 🪓</span>
              )}
            </h3>

            {/* Funny Lumberjack Commentary */}
            <div className="bg-amber-800/50 rounded-lg p-4 mb-6 border-2 border-amber-600">
              <p className="text-amber-100 italic text-lg">
                {gameState.score >= 200 ? (
                  <span className="animate-pulse">\"Hot dang! You're makin' the trees nervous! Even the squirrels are impressed!\"</span>
                ) : gameState.score >= 150 ? (
                  <span className="animate-bounce">\"Well butter my biscuit! That's some fine axe work! You been practicin' in secret?\"</span>
                ) : gameState.score >= 100 ? (
                  <span>\"Not too shabby, but I've seen squirrels throw better! Keep choppin' away!\"</span>
                ) : gameState.score >= 50 ? (
                  <span>\"Keep tryin', partner! Even I miss sometimes... okay, rarely. Very rarely.\"</span>
                ) : (
                  <span className="animate-pulse">\"Ouch! That axe needs more therapy than I do! Have you considered bowlin'?\"</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center bg-amber-800/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{gameState.score}</div>
                <div className="text-sm text-amber-200">Total Points</div>
              </div>
              <div className="text-center bg-amber-800/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">
                  {gameState.totalAxes > 0 ? Math.round(gameState.score / gameState.totalAxes) : 0}
                </div>
                <div className="text-sm text-amber-200">Avg per Axe</div>
              </div>
            </div>

            {gameState.lastWin > 0 ? (
              <div className="text-2xl font-bold text-green-400 mb-6 animate-bounce">
                + 🍗 {gameState.lastWin} Coins Won!
                <div className="text-sm text-green-300 mt-1">Cha-ching! That's what I call axe-cellent!</div>
              </div>
            ) : (
              <div className="text-xl font-bold text-red-400 mb-6">
                "Don't worry, we all have off days... or in your case, off centuries! Try again, champ!"
              </div>
            )}

            <button
              onClick={() => setGameState(prev => ({
                ...prev,
                gamePhase: 'aiming',
                currentAxe: 0,
                axes: [],
                score: 0,
                showResult: false
              }))}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🎯 Throw Again!
            </button>
          </div>
        )}

        {/* How to Play */}
        <div className="mt-12 bg-amber-700/50 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">How to Play: My Achy Breaky Axe</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-amber-100">
            <div>
              <h4 className="font-bold text-white mb-2">🎯 Objective</h4>
              <p>Throw 5 axes at the target to score points. Higher scores = bigger payouts!</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🎮 Controls</h4>
              <p><strong>Desktop:</strong> Click and drag to aim<br/>
              <strong>Mobile:</strong> Touch and drag to aim<br/>
              Release to throw!</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🏹 Scoring</h4>
              <p><strong>Bullseye:</strong> 50pts<br/>
              <strong>Inner:</strong> 25pts<br/>
              <strong>Middle:</strong> 15pts<br/>
              <strong>Outer:</strong> 10pts<br/>
              <strong>Edge:</strong> 5pts</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">💰 Payouts</h4>
              <p><strong>40+ avg:</strong> 5x bet<br/>
              <strong>25+ avg:</strong> 3x bet<br/>
              <strong>15+ avg:</strong> 2x bet<br/>
              <strong>8+ avg:</strong> 1.5x bet</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}