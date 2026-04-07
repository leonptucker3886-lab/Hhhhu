'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

// Card suits and values
const SUITS = ['♠', '♥', '♦', '♣'];
const VALUES = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

interface Card {
  suit: string;
  value: string;
  numericValue: number;
}

interface GameState {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  playerScore: number;
  dealerScore: number;
  playerBlackjack: boolean;
  dealerBlackjack: boolean;
  gamePhase: 'betting' | 'playing' | 'dealerTurn' | 'result';
  balance: number;
  bet: number;
  lastWin: number;
  canDoubleDown: boolean;
  canSplit: boolean;
  splitHand: Card[] | null;
  splitScore: number;
  currentHand: 'main' | 'split';
  gamesPlayed: number;
  gamesWon: number;
  showResult: boolean;
  resultMessage: string;
}

export default function WhiteJack() {
  // Create shuffled deck
  const createDeck = useCallback((): Card[] => {
    const deck: Card[] = [];
    for (const suit of SUITS) {
      for (const value of VALUES) {
        let numericValue: number;
        if (value === 'A') numericValue = 11;
        else if (['J', 'Q', 'K'].includes(value)) numericValue = 10;
        else numericValue = parseInt(value);

        deck.push({ suit, value, numericValue });
      }
    }

    // Shuffle deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }

    return deck;
  }, []);

  // Calculate hand score
  const calculateScore = useCallback((hand: Card[]): number => {
    let score = 0;
    let aces = 0;

    for (const card of hand) {
      if (card.value === 'A') {
        aces++;
        score += 11;
      } else {
        score += card.numericValue;
      }
    }

    // Handle aces
    while (score > 21 && aces > 0) {
      score -= 10;
      aces--;
    }

    return score;
  }, []);

  const [gameState, setGameState] = useState<GameState>({
    deck: createDeck(),
    playerHand: [],
    dealerHand: [],
    playerScore: 0,
    dealerScore: 0,
    playerBlackjack: false,
    dealerBlackjack: false,
    gamePhase: 'betting',
    balance: 10000,
    bet: 100,
    lastWin: 0,
    canDoubleDown: true,
    canSplit: false,
    splitHand: null,
    splitScore: 0,
    currentHand: 'main',
    gamesPlayed: 0,
    gamesWon: 0,
    showResult: false,
    resultMessage: ''
  });

  // Deal initial cards
  const dealCards = useCallback(() => {
    if (gameState.balance < gameState.bet) return;

    let newDeck = [...gameState.deck];

    // Reshuffle if deck is low
    if (newDeck.length < 20) {
      newDeck = createDeck();
    }

    const playerHand = [newDeck.pop()!, newDeck.pop()!];
    const dealerHand = [newDeck.pop()!, newDeck.pop()!];

    const playerScore = calculateScore(playerHand);
    const dealerScore = calculateScore(dealerHand);

    const playerBlackjack = playerScore === 21;
    const dealerBlackjack = dealerScore === 21;

    const canSplit = playerHand.length === 2 && playerHand[0].value === playerHand[1].value;

    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand,
      dealerHand,
      playerScore,
      dealerScore,
      playerBlackjack,
      dealerBlackjack,
      gamePhase: playerBlackjack || dealerBlackjack ? 'result' : 'playing',
      balance: prev.balance - prev.bet,
      canDoubleDown: true,
      canSplit,
      showResult: playerBlackjack || dealerBlackjack,
      resultMessage: playerBlackjack ? '🎉 BLACKJACK! 3:2 PAYOUT!' :
                     dealerBlackjack ? '💔 Dealer Blackjack - You Lose' : '',
      gamesPlayed: prev.gamesPlayed + 1,
      lastWin: playerBlackjack ? Math.floor(prev.bet * 2.5) : 0
    }));
  }, [gameState.deck, gameState.balance, gameState.bet, createDeck, calculateScore]);

  // Hit - take another card
  const hit = useCallback(() => {
    if (gameState.gamePhase !== 'playing') return;

    const newCard = gameState.deck[gameState.deck.length - 1];
    const newDeck = gameState.deck.slice(0, -1);
    const newHand = [...gameState.playerHand, newCard];
    const newScore = calculateScore(newHand);

    const isBust = newScore > 21;

    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: newHand,
      playerScore: newScore,
      gamePhase: isBust ? 'dealerTurn' : 'playing',
      canDoubleDown: false,
      canSplit: false
    }));

    if (isBust) {
      setTimeout(() => dealerTurn(), 1000);
    }
  }, [gameState, calculateScore]);

  // Stand - end turn
  const stand = useCallback(() => {
    if (gameState.gamePhase !== 'playing') return;

    setGameState(prev => ({
      ...prev,
      gamePhase: 'dealerTurn'
    }));

    setTimeout(() => dealerTurn(), 1000);
  }, [gameState.gamePhase]);

  // Double down
  const doubleDown = useCallback(() => {
    if (gameState.gamePhase !== 'playing' || !gameState.canDoubleDown || gameState.balance < gameState.bet) return;

    const newCard = gameState.deck[gameState.deck.length - 1];
    const newDeck = gameState.deck.slice(0, -1);
    const newHand = [...gameState.playerHand, newCard];
    const newScore = calculateScore(newHand);

    setGameState(prev => ({
      ...prev,
      deck: newDeck,
      playerHand: newHand,
      playerScore: newScore,
      balance: prev.balance - prev.bet,
      bet: prev.bet * 2,
      gamePhase: 'dealerTurn',
      canDoubleDown: false,
      canSplit: false
    }));

    setTimeout(() => dealerTurn(), 1000);
  }, [gameState, calculateScore]);

  // Dealer turn logic
  const dealerTurn = useCallback(() => {
    let currentDealerHand = [...gameState.dealerHand];
    let currentDeck = [...gameState.deck];
    let dealerScore = gameState.dealerScore;

    // Dealer hits on 16, stands on 17
    while (dealerScore < 17) {
      const newCard = currentDeck.pop()!;
      currentDealerHand.push(newCard);
      dealerScore = calculateScore(currentDealerHand);
    }

    const dealerBust = dealerScore > 21;
    const playerScore = gameState.playerScore;
    const playerBust = playerScore > 21;

    let result = '';
    let winAmount = 0;

    if (playerBust) {
      result = '💔 Bust! You Lose';
    } else if (dealerBust) {
      result = '🎉 Dealer Bust! You Win!';
      winAmount = gameState.bet * 2;
    } else if (playerScore > dealerScore) {
      result = '🎉 You Win!';
      winAmount = gameState.bet * 2;
    } else if (dealerScore > playerScore) {
      result = '💔 Dealer Wins';
    } else {
      result = '🤝 Push - Bet Returned';
      winAmount = gameState.bet;
    }

    setGameState(prev => ({
      ...prev,
      dealerHand: currentDealerHand,
      dealerScore,
      gamePhase: 'result',
      balance: prev.balance + winAmount,
      lastWin: winAmount,
      showResult: true,
      resultMessage: result,
      gamesWon: winAmount > 0 ? prev.gamesWon + 1 : prev.gamesWon
    }));
  }, [gameState, calculateScore]);

  // New game
  const newGame = useCallback(() => {
    setGameState(prev => ({
      ...prev,
      deck: prev.deck.length < 20 ? createDeck() : prev.deck,
      playerHand: [],
      dealerHand: [],
      playerScore: 0,
      dealerScore: 0,
      playerBlackjack: false,
      dealerBlackjack: false,
      gamePhase: 'betting',
      canDoubleDown: true,
      canSplit: false,
      splitHand: null,
      splitScore: 0,
      currentHand: 'main',
      showResult: false,
      resultMessage: ''
    }));
  }, [createDeck]);

  // Adjust bet
  const adjustBet = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      bet: Math.max(10, Math.min(1000, prev.bet + amount))
    }));
  };

  // Render card
  const renderCard = (card: Card, hidden: boolean = false) => {
    if (hidden) {
      return (
        <div className="w-16 h-24 md:w-20 md:h-28 bg-gradient-to-br from-red-600 to-red-800 rounded-lg border-2 border-red-400 flex items-center justify-center shadow-lg">
          <div className="text-white font-bold text-xl">?</div>
        </div>
      );
    }

    const isRed = card.suit === '♥' || card.suit === '♦';
    return (
      <div className={`w-16 h-24 md:w-20 md:h-28 bg-white rounded-lg border-2 border-gray-300 flex flex-col justify-between p-1 shadow-lg ${
        isRed ? 'text-red-600' : 'text-black'
      }`}>
        <div className="text-xs font-bold">{card.value}</div>
        <div className="text-lg self-center">{card.suit}</div>
        <div className="text-xs font-bold self-end transform rotate-180">{card.value}</div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-green-800 to-green-900 text-white">
      {/* Header */}
      <header className="border-b border-green-700 bg-green-900/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-200 bg-clip-text text-transparent">
              Company Cookout
            </span>
            <span className="text-white font-semibold">White Jack</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="text-white font-bold">
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
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white via-gray-200 to-white bg-clip-text text-transparent">
            White Jack
          </h1>
          <p className="text-xl text-green-100 max-w-2xl mx-auto">
            &ldquo;Lakeside elegance meets classic blackjack. Clean cards, cool stakes, hot payouts!&rdquo;
          </p>
        </div>

        {/* Game Stats */}
        <div className="grid md:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
          <div className="bg-green-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesPlayed}</div>
            <div className="text-sm text-green-200">Games Played</div>
          </div>
          <div className="bg-green-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesWon}</div>
            <div className="text-sm text-green-200">Games Won</div>
          </div>
          <div className="bg-green-800/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">
              {gameState.gamesPlayed > 0 ? Math.round((gameState.gamesWon / gameState.gamesPlayed) * 100) : 0}%
            </div>
            <div className="text-sm text-green-200">Win Rate</div>
          </div>
        </div>

        {/* Betting Phase */}
        {gameState.gamePhase === 'betting' && (
          <div className="max-w-md mx-auto bg-green-800/50 backdrop-blur-sm rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Place Your Bet</h3>

            <div className="flex items-center justify-center space-x-6 mb-6">
              <button
                onClick={() => adjustBet(-10)}
                className="w-12 h-12 bg-green-700 hover:bg-green-600 rounded-full text-xl font-bold transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{gameState.bet}</div>
                <div className="text-sm text-green-200">Coins</div>
              </div>
              <button
                onClick={() => adjustBet(10)}
                className="w-12 h-12 bg-green-700 hover:bg-green-600 rounded-full text-xl font-bold transition-colors"
              >
                +
              </button>
            </div>

            <button
              onClick={dealCards}
              disabled={gameState.balance < gameState.bet}
              className={`w-full py-4 text-xl font-bold rounded-lg transition-all ${
                gameState.balance < gameState.bet
                  ? 'bg-gray-600 cursor-not-allowed'
                  : 'bg-gradient-to-r from-white to-gray-200 text-black hover:from-gray-100 hover:to-white shadow-lg transform hover:scale-105'
              }`}
            >
              🃏 Deal Cards
            </button>

            {gameState.lastWin > 0 && (
              <div className="mt-4 text-center text-green-300 font-bold">
                Last Win: 🍗 {gameState.lastWin}
              </div>
            )}
          </div>
        )}

        {/* Game Board */}
        {(gameState.gamePhase === 'playing' || gameState.gamePhase === 'dealerTurn' || gameState.gamePhase === 'result') && (
          <div className="max-w-4xl mx-auto">
            {/* Dealer Hand */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">Dealer</h3>
                <div className="text-lg font-bold text-white">
                  {gameState.gamePhase === 'result' || gameState.gamePhase === 'dealerTurn'
                    ? gameState.dealerScore
                    : gameState.dealerHand[0]?.numericValue || '?'
                  }
                </div>
              </div>
              <div className="flex justify-center space-x-4">
                {gameState.dealerHand.map((card, index) => (
                  <div key={index}>
                    {renderCard(card, gameState.gamePhase !== 'result' && gameState.gamePhase !== 'dealerTurn' && index === 1)}
                  </div>
                ))}
              </div>
            </div>

            {/* Player Hand */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-white">You</h3>
                <div className="text-lg font-bold text-white">{gameState.playerScore}</div>
              </div>
              <div className="flex justify-center space-x-4">
                {gameState.playerHand.map((card, index) => (
                  <div key={index} className="animate-in slide-in-from-bottom-4 duration-500" style={{ animationDelay: `${index * 100}ms` }}>
                    {renderCard(card)}
                  </div>
                ))}
              </div>
            </div>

            {/* Game Controls */}
            {gameState.gamePhase === 'playing' && (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
                <button
                  onClick={hit}
                  className="bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                  Hit
                </button>
                <button
                  onClick={stand}
                  className="bg-red-600 hover:bg-red-500 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                  Stand
                </button>
                <button
                  onClick={doubleDown}
                  disabled={!gameState.canDoubleDown || gameState.balance < gameState.bet}
                  className={`font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105 ${
                    !gameState.canDoubleDown || gameState.balance < gameState.bet
                      ? 'bg-gray-600 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-500 text-white'
                  }`}
                >
                  Double
                </button>
                <button
                  onClick={newGame}
                  className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-4 px-6 rounded-lg transition-all transform hover:scale-105"
                >
                  New Game
                </button>
              </div>
            )}

            {/* Dealer Turn Animation */}
            {gameState.gamePhase === 'dealerTurn' && (
              <div className="text-center py-8">
                <div className="text-2xl font-bold text-white mb-4">Dealer&apos;s Turn...</div>
                <div className="animate-spin text-4xl">🎰</div>
              </div>
            )}

            {/* Result Screen */}
            {gameState.showResult && (
              <div className="text-center py-8">
                <div className={`text-4xl font-bold mb-4 ${
                  gameState.resultMessage.includes('Win') || gameState.resultMessage.includes('BLACKJACK')
                    ? 'text-green-400'
                    : gameState.resultMessage.includes('Push')
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}>
                  {gameState.resultMessage}
                </div>
                {gameState.lastWin > 0 && (
                  <div className="text-2xl font-bold text-green-400 mb-4">
                    + 🍗 {gameState.lastWin} Coins
                  </div>
                )}
                <button
                  onClick={newGame}
                  className="bg-gradient-to-r from-white to-gray-200 text-black font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  Play Again
                </button>
              </div>
            )}
          </div>
        )}

        {/* Game Rules */}
        <div className="mt-12 bg-green-800/50 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-white mb-4 text-center">How to Play White Jack</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-green-100">
            <div>
              <h4 className="font-bold text-white mb-2">🎯 Objective</h4>
              <p>Get closer to 21 than the dealer without going over. Blackjack (21 with first 2 cards) pays 3:2!</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🎮 Controls</h4>
              <p><strong>Hit:</strong> Take another card<br/>
              <strong>Stand:</strong> Keep current hand<br/>
              <strong>Double:</strong> Double bet, take one card</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🤖 Dealer Rules</h4>
              <p>Dealer hits on 16, stands on 17. Must stand if dealer has 17+.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">💰 Payouts</h4>
              <p><strong>Win:</strong> 2:1<br/>
              <strong>Blackjack:</strong> 3:2<br/>
              <strong>Push:</strong> Bet returned</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}