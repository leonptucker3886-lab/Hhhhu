'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Ball {
  id: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  number?: number;
  sunk: boolean;
  isCue?: boolean;
  isEight?: boolean;
}

interface Pocket {
  x: number;
  y: number;
  radius: number;
}

interface GameState {
  balance: number;
  bet: number;
  balls: Ball[];
  pockets: Pocket[];
  cueBall: Ball | null;
  isAiming: boolean;
  power: number;
  angle: number;
  ballsInMotion: boolean;
  currentPlayer: 'solids' | 'stripes' | null;
  gamePhase: 'setup' | 'aiming' | 'shooting' | 'result';
  sunkBalls: number;
  score: number;
  lastWin: number;
  gamesPlayed: number;
  gamesWon: number;
  showResult: boolean;
  resultMessage: string;
  scratchPenalty: boolean;
}

const POCKETS: Pocket[] = [
  { x: 50, y: 50, radius: 25 },
  { x: 400, y: 35, radius: 25 },
  { x: 750, y: 50, radius: 25 },
  { x: 50, y: 350, radius: 25 },
  { x: 400, y: 365, radius: 25 },
  { x: 750, y: 350, radius: 25 }
];

export default function PoolGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationFrameRef = useRef<number | null>(null);

  const [gameState, setGameState] = useState<GameState>({
    balance: 10000,
    bet: 50,
    balls: [],
    pockets: POCKETS,
    cueBall: null,
    isAiming: false,
    power: 50,
    angle: 0,
    ballsInMotion: false,
    currentPlayer: null,
    gamePhase: 'setup',
    sunkBalls: 0,
    score: 0,
    lastWin: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    showResult: false,
    resultMessage: '',
    scratchPenalty: false
  });

  // Initialize pool balls
  const initializeBalls = useCallback(() => {
    const balls: Ball[] = [];

    // Cue ball
    balls.push({
      id: 'cue',
      x: 200,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 12,
      color: '#ffffff',
      isCue: true,
      sunk: false
    });

    // 8-ball
    balls.push({
      id: '8ball',
      x: 600,
      y: 200,
      vx: 0,
      vy: 0,
      radius: 12,
      color: '#000000',
      number: 8,
      isEight: true,
      sunk: false
    });

    // Solids (1-7)
    const solidColors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce', '#85c1e9'];
    for (let i = 1; i <= 7; i++) {
      balls.push({
        id: `solid-${i}`,
        x: 550 + (i % 3) * 24,
        y: 180 + Math.floor(i / 3) * 24,
        vx: 0,
        vy: 0,
        radius: 12,
        color: solidColors[i - 1],
        number: i,
        sunk: false
      });
    }

    // Stripes (9-15)
    const stripeColors = ['#ffd700', '#ff6b6b', '#4ecdc4', '#45b7d1', '#f7dc6f', '#bb8fce', '#85c1e9'];
    for (let i = 9; i <= 15; i++) {
      balls.push({
        id: `stripe-${i}`,
        x: 550 + ((i - 9) % 3) * 24,
        y: 220 + Math.floor((i - 9) / 3) * 24,
        vx: 0,
        vy: 0,
        radius: 12,
        color: stripeColors[i - 9],
        number: i,
        sunk: false
      });
    }

    return balls;
  }, []);

  // Start new game
  const startGame = useCallback(() => {
    if (gameState.balance < gameState.bet) return;

    const balls = initializeBalls();
    const cueBall = balls.find(ball => ball.isCue) || null;

    setGameState(prev => ({
      ...prev,
      balance: prev.balance - prev.bet,
      balls,
      cueBall,
      gamePhase: 'aiming',
      sunkBalls: 0,
      score: 0,
      gamesPlayed: prev.gamesPlayed + 1,
      showResult: false,
      scratchPenalty: false
    }));
  }, [gameState.balance, gameState.bet, initializeBalls]);

  // Physics update
  const updatePhysics = useCallback(() => {
    setGameState(prev => {
      const newBalls = prev.balls.map(ball => {
        if (ball.sunk) return ball;

        let newX = ball.x + ball.vx;
        let newY = ball.y + ball.vy;

        // Apply friction
        const friction = 0.98;
        let newVx = ball.vx * friction;
        let newVy = ball.vy * friction;

        // Stop very slow balls
        if (Math.abs(newVx) < 0.1) newVx = 0;
        if (Math.abs(newVy) < 0.1) newVy = 0;

        // Wall collisions
        if (newX - ball.radius < 0 || newX + ball.radius > 800) {
          newVx = -newVx;
          newX = newX - ball.radius < 0 ? ball.radius : 800 - ball.radius;
        }
        if (newY - ball.radius < 0 || newY + ball.radius > 400) {
          newVy = -newVy;
          newY = newY - ball.radius < 0 ? ball.radius : 400 - ball.radius;
        }

        // Pocket collisions
        prev.pockets.forEach(pocket => {
          const dx = newX - pocket.x;
          const dy = newY - pocket.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < pocket.radius) {
            // Ball sunk!
            return { ...ball, sunk: true, vx: 0, vy: 0 };
          }
        });

        return {
          ...ball,
          x: newX,
          y: newY,
          vx: newVx,
          vy: newVy
        };
      });

      // Ball-to-ball collisions (simplified)
      for (let i = 0; i < newBalls.length; i++) {
        for (let j = i + 1; j < newBalls.length; j++) {
          const ball1 = newBalls[i];
          const ball2 = newBalls[j];

          if (ball1.sunk || ball2.sunk) continue;

          const dx = ball2.x - ball1.x;
          const dy = ball2.y - ball1.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < ball1.radius + ball2.radius) {
            // Simple elastic collision
            const angle = Math.atan2(dy, dx);
            const sin = Math.sin(angle);
            const cos = Math.cos(angle);

            // Rotate velocities
            const v1x = ball1.vx * cos + ball1.vy * sin;
            const v1y = ball1.vy * cos - ball1.vx * sin;
            const v2x = ball2.vx * cos + ball2.vy * sin;
            const v2y = ball2.vy * cos - ball2.vx * sin;

            // Swap x velocities (simplified)
            const temp = v1x;
            ball1.vx = v2x * cos - v1y * sin;
            ball1.vy = v1y * cos + v2x * sin;
            ball2.vx = temp * cos - v2y * sin;
            ball2.vy = v2y * cos + temp * sin;
          }
        }
      }

      const ballsInMotion = newBalls.some(ball => Math.abs(ball.vx) > 0.1 || Math.abs(ball.vy) > 0.1);
      const sunkBalls = newBalls.filter(ball => ball.sunk).length;
      const score = sunkBalls * 10; // 10 points per sunk ball

      return {
        ...prev,
        balls: newBalls,
        ballsInMotion,
        sunkBalls,
        score
      };
    });
  }, []);

  // Shoot cue ball
  const shootCueBall = useCallback(() => {
    if (!gameState.cueBall || gameState.gamePhase !== 'aiming') return;

    const power = gameState.power / 100;
    const angleRad = (gameState.angle * Math.PI) / 180;

    setGameState(prev => {
      const newBalls = prev.balls.map(ball => {
        if (ball.isCue) {
          return {
            ...ball,
            vx: Math.cos(angleRad) * power * 20,
            vy: -Math.sin(angleRad) * power * 20
          };
        }
        return ball;
      });

      return {
        ...prev,
        balls: newBalls,
        gamePhase: 'shooting',
        ballsInMotion: true
      };
    });
  }, [gameState.cueBall, gameState.power, gameState.angle, gameState.gamePhase]);

  // Game loop
  useEffect(() => {
    if (gameState.ballsInMotion) {
      const gameLoop = () => {
        updatePhysics();

        // Check if all balls stopped
        const allStopped = gameState.balls.every(ball =>
          ball.sunk || (Math.abs(ball.vx) < 0.1 && Math.abs(ball.vy) < 0.1)
        );

        if (allStopped && gameState.ballsInMotion) {
          setGameState(prev => ({ ...prev, ballsInMotion: false, gamePhase: 'aiming' }));
        }

        animationFrameRef.current = requestAnimationFrame(gameLoop);
      };
      gameLoop();
    }

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [gameState.ballsInMotion, gameState.balls, updatePhysics]);

  // Check game end conditions
  useEffect(() => {
    if (gameState.gamePhase === 'aiming' && !gameState.ballsInMotion) {
      const cueBallSunk = gameState.balls.find(ball => ball.isCue)?.sunk;
      const eightBallSunk = gameState.balls.find(ball => ball.isEight)?.sunk;

      if (cueBallSunk) {
        // Scratch penalty
        setGameState(prev => ({ ...prev, scratchPenalty: true, gamePhase: 'result' }));
        return;
      }

      if (eightBallSunk) {
        // Game over - 8-ball sunk too early
        setGameState(prev => ({ ...prev, gamePhase: 'result' }));
        return;
      }

      // Check win conditions
      const remainingBalls = gameState.balls.filter(ball => !ball.sunk && !ball.isCue);
      if (remainingBalls.length <= 1) {
        // Only 8-ball left
        setGameState(prev => ({ ...prev, gamePhase: 'result' }));
      }
    }
  }, [gameState.gamePhase, gameState.ballsInMotion, gameState.balls]);

  // Calculate final results
  useEffect(() => {
    if (gameState.gamePhase === 'result') {
      const cueBallSunk = gameState.balls.find(ball => ball.isCue)?.sunk;
      const eightBallSunk = gameState.balls.find(ball => ball.isEight)?.sunk;
      const remainingBalls = gameState.balls.filter(ball => !ball.sunk && !ball.isCue).length;

      let winAmount = 0;
      let message = '';

      if (cueBallSunk) {
        message = "Scratch! Cue ball in the pocket - you lose this round!";
      } else if (eightBallSunk && remainingBalls > 1) {
        message = "Eight-ball sunk too early! Game over!";
      } else if (remainingBalls === 1) {
        // Only 8-ball left - potential win
        const accuracy = gameState.sunkBalls / 15; // 15 balls total (not counting cue)
        if (accuracy >= 0.8) {
          winAmount = gameState.bet * 5;
          message = "🏆 PERFECT GAME! You cleared the table like a champion!";
        } else if (accuracy >= 0.6) {
          winAmount = gameState.bet * 3;
          message = "🎯 Excellent shooting! Almost a perfect game!";
        } else if (accuracy >= 0.4) {
          winAmount = gameState.bet * 2;
          message = "👍 Good game! You know your way around a cue!";
        } else {
          winAmount = gameState.bet * 1.5;
          message = "✅ Decent run! Keep practicing that aim!";
        }
      } else {
        message = "Game continues! Take your next shot!";
        setGameState(prev => ({ ...prev, gamePhase: 'aiming' }));
        return;
      }

      setGameState(prev => ({
        ...prev,
        balance: prev.balance + winAmount,
        lastWin: winAmount,
        gamesWon: winAmount > 0 ? prev.gamesWon + 1 : prev.gamesWon,
        resultMessage: message,
        showResult: true
      }));
    }
  }, [gameState.gamePhase, gameState.balls, gameState.sunkBalls, gameState.bet]);

  // Adjust bet
  const adjustBet = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      bet: Math.max(10, Math.min(500, prev.bet + amount))
    }));
  };

  // Adjust power
  const adjustPower = (delta: number) => {
    setGameState(prev => ({
      ...prev,
      power: Math.max(10, Math.min(100, prev.power + delta))
    }));
  };

  // Adjust angle
  const adjustAngle = (delta: number) => {
    setGameState(prev => ({
      ...prev,
      angle: (prev.angle + delta + 360) % 360
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700 text-white">
      {/* Header */}
      <header className="border-b border-amber-600 bg-amber-800/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Company Cookout
            </span>
            <span className="text-yellow-400 font-semibold">Firewood Balls</span>
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
            Firewood Balls
          </h1>
          <p className="text-xl text-amber-100 max-w-2xl mx-auto">
            &ldquo;Pool by the campfire! Sink them balls and watch the sparks fly!&rdquo;
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-5 gap-4 mb-8 max-w-4xl mx-auto">
          <div className="bg-amber-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesPlayed}</div>
            <div className="text-sm text-amber-200">Games Played</div>
          </div>
          <div className="bg-amber-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesWon}</div>
            <div className="text-sm text-amber-200">Games Won</div>
          </div>
          <div className="bg-amber-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.score}</div>
            <div className="text-sm text-amber-200">Points</div>
          </div>
          <div className="bg-amber-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.sunkBalls}</div>
            <div className="text-sm text-amber-200">Balls Sunk</div>
          </div>
          <div className="bg-amber-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {gameState.sunkBalls > 0 ? Math.round((gameState.sunkBalls / 15) * 100) : 0}%
            </div>
            <div className="text-sm text-amber-200">Accuracy</div>
          </div>
        </div>

        {/* Betting Phase */}
        {gameState.gamePhase === 'setup' && (
          <div className="max-w-md mx-auto bg-amber-700/50 backdrop-blur-sm rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Rack &apos;Em Up!</h3>

            <div className="flex items-center justify-center space-x-6 mb-6">
              <button
                onClick={() => adjustBet(-10)}
                className="w-12 h-12 bg-amber-600 hover:bg-amber-500 rounded-full text-xl font-bold transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{gameState.bet}</div>
                <div className="text-sm text-amber-200">Coins per Game</div>
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
              🎱 Break Time!
            </button>

            {gameState.lastWin > 0 && (
              <div className="mt-4 text-center text-green-300 font-bold">
                Last Game: 🍗 {gameState.lastWin} earned
              </div>
            )}
          </div>
        )}

        {/* Game Area */}
        {(gameState.gamePhase === 'aiming' || gameState.gamePhase === 'shooting') && (
          <div className="max-w-5xl mx-auto">
            {/* Game HUD */}
            <div className="bg-amber-700/50 backdrop-blur-sm rounded-xl p-6 mb-6">
              <div className="grid md:grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{gameState.power}%</div>
                  <div className="text-sm text-amber-200">Power</div>
                  <div className="flex justify-center mt-2 space-x-2">
                    <button onClick={() => adjustPower(-5)} className="px-2 py-1 bg-amber-600 rounded text-xs">-</button>
                    <button onClick={() => adjustPower(5)} className="px-2 py-1 bg-amber-600 rounded text-xs">+</button>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{Math.round(gameState.angle)}°</div>
                  <div className="text-sm text-amber-200">Angle</div>
                  <div className="flex justify-center mt-2 space-x-2">
                    <button onClick={() => adjustAngle(-5)} className="px-2 py-1 bg-amber-600 rounded text-xs">←</button>
                    <button onClick={() => adjustAngle(5)} className="px-2 py-1 bg-amber-600 rounded text-xs">→</button>
                  </div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{gameState.sunkBalls}</div>
                  <div className="text-sm text-amber-200">Balls Sunk</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{gameState.score}</div>
                  <div className="text-sm text-amber-200">Score</div>
                </div>
              </div>
            </div>

            {/* Pool Table */}
            <div className="relative bg-gradient-to-br from-green-800 to-green-900 rounded-xl border-8 border-amber-600 shadow-2xl mx-auto" style={{ width: '800px', height: '400px' }}>
              {/* Table felt */}
              <div className="absolute inset-4 bg-green-700 rounded-lg">
                {/* Rails */}
                <div className="absolute inset-0 border-4 border-amber-700 rounded-lg"></div>

                {/* Pockets */}
                {gameState.pockets.map((pocket, index) => (
                  <div
                    key={index}
                    className="absolute bg-black rounded-full border-2 border-amber-600"
                    style={{
                      left: pocket.x - pocket.radius,
                      top: pocket.y - pocket.radius,
                      width: pocket.radius * 2,
                      height: pocket.radius * 2
                    }}
                  ></div>
                ))}

                {/* Balls */}
                {gameState.balls.map(ball => (
                  !ball.sunk && (
                    <div
                      key={ball.id}
                      className={`absolute rounded-full border-2 border-gray-400 shadow-lg transition-all duration-75 ${
                        ball.isCue ? 'border-white' : ball.isEight ? 'border-white' : ''
                      }`}
                      style={{
                        left: ball.x - ball.radius,
                        top: ball.y - ball.radius,
                        width: ball.radius * 2,
                        height: ball.radius * 2,
                        backgroundColor: ball.color
                      }}
                    >
                      {ball.number && (
                        <div className={`absolute inset-0 flex items-center justify-center text-xs font-bold ${
                          ball.isEight ? 'text-white' : 'text-black'
                        }`}>
                          {ball.number}
                        </div>
                      )}
                    </div>
                  )
                ))}

                {/* Aiming line */}
                {gameState.gamePhase === 'aiming' && gameState.cueBall && (
                  <div
                    className="absolute border-l-2 border-white opacity-50"
                    style={{
                      left: gameState.cueBall.x,
                      top: gameState.cueBall.y,
                      width: '100px',
                      height: '2px',
                      transform: `rotate(${gameState.angle}deg)`,
                      transformOrigin: '0 50%'
                    }}
                  ></div>
                )}
              </div>

              {/* Campfire elements */}
              <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
                <div className="text-4xl animate-pulse">🔥</div>
              </div>
              <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8 bg-amber-800 rounded-t-lg"></div>
            </div>

            {/* Controls */}
            <div className="mt-6 text-center">
              {gameState.gamePhase === 'aiming' && !gameState.ballsInMotion && (
                <button
                  onClick={shootCueBall}
                  className="px-8 py-4 bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  🎯 Shoot! ({gameState.power}%)
                </button>
              )}

              {gameState.gamePhase === 'shooting' && (
                <div className="text-2xl text-white animate-pulse">🎱 Balls in motion!</div>
              )}
            </div>
          </div>
        )}

        {/* Results */}
        {gameState.showResult && (
          <div className="max-w-2xl mx-auto bg-amber-700/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">
              {gameState.lastWin >= gameState.bet * 4 ? (
                <span className="text-green-400 animate-pulse">🏆 POOL SHARK! You cleared the table!</span>
              ) : gameState.lastWin >= gameState.bet * 2 ? (
                <span className="text-yellow-400 animate-bounce">🎱 SOLID GAME! You're on fire!</span>
              ) : gameState.lastWin >= gameState.bet ? (
                <span className="text-blue-400">👍 GOOD SHOOTIN'! Keep that cue stick ready!</span>
              ) : (
                <span className="text-red-400 animate-pulse">🎯 BETTER LUCK NEXT RACK! The eight-ball got ya!</span>
              )}
            </h3>

            {/* Funny Pool Commentary */}
            <div className="bg-amber-800/50 rounded-lg p-4 mb-6 border-2 border-amber-600">
              <p className="text-amber-100 italic text-lg">
                {gameState.score >= 120 ? (
                  <span className="animate-pulse">\"Holy smokes! You're sinkin' balls like they're goin' out of style! The campfire's jealous of your heat!\"</span>
                ) : gameState.score >= 90 ? (
                  <span className="animate-bounce">\"Well rack me up and call me striped! You're playin' like a champion lumberjack!\"</span>
                ) : gameState.score >= 60 ? (
                  <span>\"Not too shabby around the table! You're warmin' up like a good campfire!\"</span>
                ) : gameState.score >= 30 ? (
                  <span>\"Keep chalkin' that cue, partner! Every miss brings you closer to mastery!\"</span>
                ) : (
                  <span className="animate-pulse">\"Ouch! Looks like those balls are fightin' back harder than a bear in spring!\"</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center bg-amber-800/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{gameState.score}</div>
                <div className="text-sm text-amber-200">Final Score</div>
              </div>
              <div className="text-center bg-amber-800/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{gameState.sunkBalls}</div>
                <div className="text-sm text-amber-200">Balls Sunk</div>
              </div>
            </div>

            {gameState.lastWin > 0 ? (
              <div className="text-2xl font-bold text-green-400 mb-6 animate-bounce">
                + 🍗 {gameState.lastWin} Coins Earned!
                <div className="text-sm text-green-300 mt-1">Cha-ching! That's some hot firewood action!</div>
              </div>
            ) : (
              <div className="text-xl font-bold text-red-400 mb-6">
                "The eight-ball always gets the last laugh! Try again, cue master!"
              </div>
            )}

            <button
              onClick={() => setGameState(prev => ({
                ...prev,
                gamePhase: 'setup',
                balls: [],
                cueBall: null,
                showResult: false
              }))}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🎱 Rack &apos;Em Up Again!
            </button>
          </div>
        )}

        {/* How to Play */}
        <div className="mt-12 bg-amber-700/50 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">How to Play: Firewood Balls</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-amber-100">
            <div>
              <h4 className="font-bold text-white mb-2">🎯 Objective</h4>
              <p>Sink balls into the pockets! Avoid sinking the cue ball or 8-ball prematurely!</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🎮 Controls</h4>
              <p><strong>Power/Angle:</strong> Use buttons to adjust<br/>
              <strong>Shoot:</strong> Click "Shoot!" when ready</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🏆 Scoring</h4>
              <p><strong>120+ pts:</strong> 5x bet<br/>
              <strong>90+ pts:</strong> 4x bet<br/>
              <strong>60+ pts:</strong> 3x bet<br/>
              <strong>30+ pts:</strong> 2x bet</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🎱 Pool Rules</h4>
              <p>15 numbered balls + cue ball. Sink all your balls first, then the 8-ball to win!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}