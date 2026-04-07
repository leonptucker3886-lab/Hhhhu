'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Pitbull {
  id: string;
  name: string;
  emoji: string;
  attributes: {
    bark: number;      // 1-10
    muscle: number;    // 1-10
    eyes: number;      // 1-10
    personality: number; // 1-10
  };
  description: string;
  odds: number; // payout multiplier
}

interface Contest {
  id: string;
  name: string;
  description: string;
  attribute: keyof Pitbull['attributes'];
  winner?: string;
  isComplete: boolean;
}

interface GameState {
  balance: number;
  bet: number;
  pitbulls: Pitbull[];
  contests: Contest[];
  currentContest: number;
  gamePhase: 'setup' | 'betting' | 'showing' | 'results';
  selectedWinner: string | null;
  lastWin: number;
  gamesPlayed: number;
  gamesWon: number;
  showResult: boolean;
  resultMessage: string;
}

const PITBULLS: Pitbull[] = [
  {
    id: 'buster',
    name: 'Buster',
    emoji: '🐕',
    attributes: { bark: 9, muscle: 7, eyes: 8, personality: 6 },
    description: 'The loudest barker in the neighborhood!',
    odds: 1.5
  },
  {
    id: 'bella',
    name: 'Bella',
    emoji: '🐩',
    attributes: { bark: 5, muscle: 4, eyes: 10, personality: 9 },
    description: 'Sweetest eyes you ever did see!',
    odds: 2.0
  },
  {
    id: 'rocky',
    name: 'Rocky',
    emoji: '🐺',
    attributes: { bark: 8, muscle: 10, eyes: 6, personality: 7 },
    description: 'Built like a tank, tough as nails!',
    odds: 1.8
  },
  {
    id: 'lucky',
    name: 'Lucky',
    emoji: '🦮',
    attributes: { bark: 6, muscle: 5, eyes: 7, personality: 10 },
    description: 'The friendliest pup with the biggest heart!',
    odds: 2.5
  },
  {
    id: 'zeus',
    name: 'Zeus',
    emoji: '🐶',
    attributes: { bark: 10, muscle: 9, eyes: 5, personality: 8 },
    description: 'King of the bark, ruler of the yard!',
    odds: 1.3
  }
];

const CONTESTS: Omit<Contest, 'winner' | 'isComplete'>[] = [
  {
    id: 'bark',
    name: 'Best Bark Contest',
    description: 'Who can bark the loudest?',
    attribute: 'bark'
  },
  {
    id: 'muscle',
    name: 'Most Muscular',
    description: 'Who\'s got the biggest muscles?',
    attribute: 'muscle'
  },
  {
    id: 'eyes',
    name: 'Sweetest Eyes',
    description: 'Who has the most beautiful eyes?',
    attribute: 'eyes'
  },
  {
    id: 'personality',
    name: 'Best Personality',
    description: 'Who\'s the friendliest pittie?',
    attribute: 'personality'
  }
];

export default function PittiesGame() {
  const [gameState, setGameState] = useState<GameState>({
    balance: 8000,
    bet: 100,
    pitbulls: PITBULLS,
    contests: CONTESTS.map(contest => ({ ...contest, winner: undefined, isComplete: false })),
    currentContest: 0,
    gamePhase: 'setup',
    selectedWinner: null,
    lastWin: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    showResult: false,
    resultMessage: ''
  });

  // Start new game
  const startGame = useCallback(() => {
    if (gameState.balance < gameState.bet) return;

    const shuffledContests = [...CONTESTS]
      .sort(() => Math.random() - 0.5)
      .slice(0, 3) // Randomly select 3 contests
      .map(contest => ({ ...contest, winner: undefined, isComplete: false }));

    setGameState(prev => ({
      ...prev,
      balance: prev.balance - prev.bet,
      contests: shuffledContests,
      currentContest: 0,
      gamePhase: 'betting',
      selectedWinner: null,
      gamesPlayed: prev.gamesPlayed + 1,
      showResult: false
    }));
  }, [gameState.balance, gameState.bet]);

  // Select a winner for betting
  const selectWinner = useCallback((pitbullId: string) => {
    if (gameState.gamePhase !== 'betting') return;

    setGameState(prev => ({
      ...prev,
      selectedWinner: pitbullId,
      gamePhase: 'showing'
    }));

    // Simulate the contest after a delay
    setTimeout(() => {
      runContest();
    }, 2000);
  }, [gameState.gamePhase]);

  // Run the current contest
  const runContest = useCallback(() => {
    const currentContest = gameState.contests[gameState.currentContest];
    if (!currentContest) return;

    // Find the winner based on the contest attribute
    let highestScore = 0;
    let winnerId = '';

    gameState.pitbulls.forEach(pitbull => {
      const score = pitbull.attributes[currentContest.attribute];
      if (score > highestScore) {
        highestScore = score;
        winnerId = pitbull.id;
      }
    });

    // Update contest with winner
    const updatedContests = [...gameState.contests];
    updatedContests[gameState.currentContest] = {
      ...currentContest,
      winner: winnerId,
      isComplete: true
    };

    const isCorrect = winnerId === gameState.selectedWinner;
    const winAmount = isCorrect ? Math.floor(gameState.bet * gameState.pitbulls.find(p => p.id === winnerId)!.odds) : 0;

    setGameState(prev => {
      const nextContest = prev.currentContest + 1;
      const allContestsComplete = nextContest >= prev.contests.length;

      return {
        ...prev,
        contests: updatedContests,
        balance: prev.balance + winAmount,
        lastWin: winAmount,
        currentContest: nextContest,
        gamePhase: allContestsComplete ? 'results' : 'betting',
        selectedWinner: null,
        gamesWon: winAmount > 0 ? prev.gamesWon + 1 : prev.gamesWon,
        showResult: allContestsComplete,
        resultMessage: allContestsComplete ? getFinalResult(updatedContests, prev.bet) : ''
      };
    });
  }, [gameState.contests, gameState.currentContest, gameState.selectedWinner, gameState.bet, gameState.pitbulls]);

  // Get final result message
  const getFinalResult = useCallback((contests: Contest[], bet: number) => {
    const correctPredictions = contests.filter(contest => contest.winner === gameState.selectedWinner).length;
    const accuracy = (correctPredictions / contests.length) * 100;

    if (accuracy >= 80) return "🏆 PITBULL MASTER! You know your pitties better than their owners!";
    if (accuracy >= 60) return "🎉 GREAT JOB! You're a natural pittie predictor!";
    if (accuracy >= 40) return "👍 NOT BAD! You picked some winners!";
    return "🐕 KEEP TRYIN'! Those pitties are tricky customers!";
  }, [gameState.selectedWinner]);

  // Adjust bet
  const adjustBet = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      bet: Math.max(25, Math.min(1000, prev.bet + amount))
    }));
  };

  // Get pitbull by ID
  const getPitbull = useCallback((id: string) => {
    return gameState.pitbulls.find(p => p.id === id);
  }, [gameState.pitbulls]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-800 via-blue-700 to-blue-600 text-white">
      {/* Header */}
      <header className="border-b border-blue-600 bg-blue-800/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Company Cookout
            </span>
            <span className="text-yellow-400 font-semibold">Show me your Pitties</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="text-yellow-400 font-bold">
              🍗 {gameState.balance.toLocaleString()} Coins
            </div>
            <Link href="/lobby" className="text-blue-300 hover:text-white transition-colors">
              ← Back to Garage
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Show me your Pitties
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto">
            &ldquo;Welcome to the ultimate pitbull show! Bet on the best bark, biggest muscles, and sweetest eyes!&rdquo;
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="bg-blue-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesPlayed}</div>
            <div className="text-sm text-blue-200">Shows Attended</div>
          </div>
          <div className="bg-blue-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesWon}</div>
            <div className="text-sm text-blue-200">Shows Won</div>
          </div>
          <div className="bg-blue-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {gameState.gamesPlayed > 0 ? Math.round((gameState.gamesWon / gameState.gamesPlayed) * 100) : 0}%
            </div>
            <div className="text-sm text-blue-200">Prediction Rate</div>
          </div>
        </div>

        {/* Setup Phase */}
        {gameState.gamePhase === 'setup' && (
          <div className="max-w-md mx-auto bg-blue-700/50 backdrop-blur-sm rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Pitbull Show Time!</h3>

            <div className="flex items-center justify-center space-x-6 mb-6">
              <button
                onClick={() => adjustBet(-25)}
                className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{gameState.bet}</div>
                <div className="text-sm text-blue-200">Coins per Show</div>
              </div>
              <button
                onClick={() => adjustBet(25)}
                className="w-12 h-12 bg-blue-600 hover:bg-blue-500 rounded-full text-xl font-bold transition-colors"
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
              🐕 Let&apos;s See them Pitties!
            </button>

            {gameState.lastWin > 0 && (
              <div className="mt-4 text-center text-green-300 font-bold">
                Last Show: 🍗 {gameState.lastWin} earned
              </div>
            )}
          </div>
        )}

        {/* Current Contest Display */}
        {(gameState.gamePhase === 'betting' || gameState.gamePhase === 'showing') && gameState.contests[gameState.currentContest] && (
          <div className="max-w-4xl mx-auto mb-8">
            <div className="bg-blue-700/50 backdrop-blur-sm rounded-xl p-6 mb-6">
              <div className="text-center">
                <h3 className="text-2xl font-bold text-yellow-400 mb-2">
                  {gameState.contests[gameState.currentContest].name}
                </h3>
                <p className="text-blue-100 mb-4">
                  {gameState.contests[gameState.currentContest].description}
                </p>
                {gameState.gamePhase === 'showing' && (
                  <div className="text-xl text-white animate-pulse">
                    Judging in progress... 🏆
                  </div>
                )}
              </div>
            </div>

            {/* Pitbull Selection */}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {gameState.pitbulls.map(pitbull => {
                const isSelected = gameState.selectedWinner === pitbull.id;
                const isWinner = gameState.contests[gameState.currentContest]?.winner === pitbull.id;
                const isLoser = gameState.contests[gameState.currentContest]?.isComplete && !isWinner;

                return (
                  <button
                    key={pitbull.id}
                    onClick={() => gameState.gamePhase === 'betting' && selectWinner(pitbull.id)}
                    disabled={gameState.gamePhase !== 'betting'}
                    className={`p-4 rounded-xl border-2 transition-all duration-300 ${
                      isWinner
                        ? 'border-green-400 bg-green-600/50 animate-bounce'
                        : isLoser
                        ? 'border-red-400 bg-red-600/20 opacity-50'
                        : isSelected
                        ? 'border-yellow-400 bg-yellow-600/30'
                        : 'border-blue-500 bg-blue-600/20 hover:bg-blue-500/30'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-4xl mb-2">{pitbull.emoji}</div>
                      <div className="font-bold text-white mb-1">{pitbull.name}</div>
                      <div className="text-xs text-blue-200 mb-2">{pitbull.description}</div>
                      <div className="text-sm text-yellow-400 font-bold">
                        {pitbull.odds}x payout
                      </div>
                      {isWinner && (
                        <div className="text-green-400 font-bold animate-pulse mt-2">
                          🏆 WINNER!
                        </div>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {gameState.gamePhase === 'betting' && (
              <div className="text-center mt-6">
                <p className="text-blue-200">
                  Click on the pitbull you think will win this contest!
                </p>
              </div>
            )}
          </div>
        )}

        {/* Contest Progress */}
        <div className="max-w-2xl mx-auto mb-8">
          <h4 className="text-lg font-bold text-yellow-400 mb-4 text-center">Show Progress</h4>
          <div className="grid grid-cols-3 gap-4">
            {gameState.contests.map((contest, index) => (
              <div
                key={contest.id}
                className={`p-3 rounded-lg text-center ${
                  contest.isComplete
                    ? contest.winner === gameState.selectedWinner
                      ? 'bg-green-600/50 border border-green-400'
                      : 'bg-red-600/50 border border-red-400'
                    : index === gameState.currentContest
                    ? 'bg-blue-600/50 border border-blue-400'
                    : 'bg-blue-800/30 border border-blue-600'
                }`}
              >
                <div className="text-sm font-bold text-white">{contest.name.split(' ')[0]}</div>
                <div className="text-xs text-blue-200 mt-1">
                  {contest.isComplete ? (
                    contest.winner === gameState.selectedWinner ? '✅' : '❌'
                  ) : (
                    index === gameState.currentContest ? '🎯' : '⏳'
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Results */}
        {gameState.showResult && (
          <div className="max-w-2xl mx-auto bg-blue-700/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">
              {gameState.lastWin >= gameState.bet * 2 ? (
                <span className="text-green-400 animate-pulse">🏆 PITBULL WHISPERER! You know your pitties!</span>
              ) : gameState.lastWin >= gameState.bet ? (
                <span className="text-yellow-400 animate-bounce">🎉 GOOD SHOW! You picked some winners!</span>
              ) : (
                <span className="text-red-400 animate-pulse">🐶 BETTER LUCK NEXT SHOW! Pitties are unpredictable!</span>
              )}
            </h3>

            {/* Funny Commentary */}
            <div className="bg-blue-800/50 rounded-lg p-4 mb-6 border-2 border-blue-600">
              <p className="text-blue-100 italic text-lg">
                {gameState.lastWin >= gameState.bet * 2 ? (
                  <span className="animate-pulse">\"Well I'll be! You're predictin' pittie winners like you got a crystal ball! These dogs think you're their new best friend!\"</span>
                ) : gameState.lastWin >= gameState.bet ? (
                  <span className="animate-bounce">\"Not too shabby! You got a real eye for quality pittie contestants. The judges are impressed!\"</span>
                ) : (
                  <span className="animate-pulse">\"Oof! Those pitties played you like a fiddle! But hey, that's why we love dog shows - full of surprises!\"</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center bg-blue-800/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{gameState.contests.filter(c => c.isComplete).length}</div>
                <div className="text-sm text-blue-200">Contests Completed</div>
              </div>
              <div className="text-center bg-blue-800/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">
                  {gameState.contests.filter(c => c.winner === gameState.selectedWinner).length}
                </div>
                <div className="text-sm text-blue-200">Correct Predictions</div>
              </div>
            </div>

            {gameState.lastWin > 0 ? (
              <div className="text-2xl font-bold text-green-400 mb-6 animate-bounce">
                + 🍗 {gameState.lastWin} Coins Won!
                <div className="text-sm text-green-300 mt-1">Cha-ching! The pitties thank you!</div>
              </div>
            ) : (
              <div className="text-xl font-bold text-red-400 mb-6">
                "Don't worry, even the best pittie predictors have off days! Try again!"
              </div>
            )}

            <button
              onClick={() => setGameState(prev => ({
                ...prev,
                gamePhase: 'setup',
                contests: [],
                currentContest: 0,
                showResult: false
              }))}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🐕 Another Pittie Show!
            </button>
          </div>
        )}

        {/* How to Play */}
        <div className="mt-12 bg-blue-700/50 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">How to Play: Show me your Pitties</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-blue-100">
            <div>
              <h4 className="font-bold text-white mb-2">🎯 Objective</h4>
              <p>Predict which pitbull will win each contest category! Bet on bark, muscle, eyes, and personality!</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🎮 How to Play</h4>
              <p>3 random contests per show. Click your predicted winner for each contest. Higher odds = bigger payouts!</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🏆 Contest Types</h4>
              <p><strong>Best Bark:</strong> Loudest barker wins<br/>
              <strong>Most Muscular:</strong> Biggest muscles<br/>
              <strong>Sweetest Eyes:</strong> Most beautiful eyes<br/>
              <strong>Best Personality:</strong> Friendliest pittie</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">💰 Odds & Payouts</h4>
              <p>Each pitbull has different odds based on their stats. Lucky has 2.5x odds, Zeus has 1.3x odds!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}