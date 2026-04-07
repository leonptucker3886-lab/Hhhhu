'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';

interface Drink {
  id: string;
  name: string;
  ingredients: string[];
  difficulty: number;
  value: number;
  emoji: string;
  description: string;
}

interface Customer {
  id: string;
  name: string;
  emoji: string;
  drinkOrder: string;
  patience: number; // seconds until they leave
  tipMultiplier: number;
  isServed: boolean;
  isHappy: boolean;
}

interface GameState {
  balance: number;
  bet: number;
  customers: Customer[];
  currentOrder: string | null;
  selectedIngredients: string[];
  score: number;
  timeLeft: number;
  round: number;
  gamePhase: 'setup' | 'playing' | 'results';
  lastWin: number;
  gamesPlayed: number;
  gamesWon: number;
  showResult: boolean;
  resultMessage: string;
  perfectDrinks: number;
  happyCustomers: number;
}

const DRINKS: Drink[] = [
  {
    id: 'beer',
    name: 'Cold Beer',
    ingredients: ['beer'],
    difficulty: 1,
    value: 5,
    emoji: '🍺',
    description: 'Simple but always popular!'
  },
  {
    id: 'wine',
    name: 'Red Wine',
    ingredients: ['wine'],
    difficulty: 1,
    value: 8,
    emoji: '🍷',
    description: 'Classy and smooth'
  },
  {
    id: 'whiskey',
    name: 'Whiskey Shot',
    ingredients: ['whiskey'],
    difficulty: 2,
    value: 10,
    emoji: '🥃',
    description: 'Straight and strong!'
  },
  {
    id: 'mojito',
    name: 'Mojito',
    ingredients: ['rum', 'lime', 'mint', 'soda'],
    difficulty: 3,
    value: 15,
    emoji: '🍸',
    description: 'Refreshing summer drink'
  },
  {
    id: 'old_fashioned',
    name: 'Old Fashioned',
    ingredients: ['whiskey', 'sugar', 'bitters', 'orange'],
    difficulty: 4,
    value: 20,
    emoji: '🍹',
    description: 'Timeless classic cocktail'
  },
  {
    id: 'special',
    name: 'Cookout Special',
    ingredients: ['beer', 'whiskey', 'lime', 'hot_sauce'],
    difficulty: 5,
    value: 25,
    emoji: '🔥',
    description: 'Our signature pondside special!'
  }
];

const INGREDIENTS = [
  'beer', 'wine', 'whiskey', 'rum', 'vodka', 'gin',
  'lime', 'orange', 'mint', 'sugar', 'soda', 'bitters', 'hot_sauce'
];

const CUSTOMER_NAMES = [
  'Billy Bob', 'Susie Q', 'Jedediah', 'Daisy Mae', 'Cletus', 'Bubba',
  'Betty Lou', 'Earl', 'Pearl', 'Rusty', 'Mabel', 'Zeke'
];

export default function DrinkingGame() {
  const [gameState, setGameState] = useState<GameState>({
    balance: 5000,
    bet: 100,
    customers: [],
    currentOrder: null,
    selectedIngredients: [],
    score: 0,
    timeLeft: 120,
    round: 1,
    gamePhase: 'setup',
    lastWin: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    showResult: false,
    resultMessage: '',
    perfectDrinks: 0,
    happyCustomers: 0
  });

  // Start new game
  const startGame = useCallback(() => {
    if (gameState.balance < gameState.bet) return;

    // Generate initial customers
    const initialCustomers = Array.from({ length: 3 }, (_, i) => {
      const drink = DRINKS[Math.floor(Math.random() * DRINKS.length)];
      return {
        id: `customer-${i}`,
        name: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
        emoji: ['👨', '👩', '🧔', '👩‍🦱', '👨‍🦰'][Math.floor(Math.random() * 5)],
        drinkOrder: drink.name,
        patience: 30 + Math.random() * 30, // 30-60 seconds
        tipMultiplier: 1 + Math.random() * 0.5, // 1x to 1.5x
        isServed: false,
        isHappy: false
      };
    });

    setGameState(prev => ({
      ...prev,
      balance: prev.balance - prev.bet,
      customers: initialCustomers,
      currentOrder: null,
      selectedIngredients: [],
      score: 0,
      timeLeft: 120,
      round: 1,
      gamePhase: 'playing',
      gamesPlayed: prev.gamesPlayed + 1,
      showResult: false,
      perfectDrinks: 0,
      happyCustomers: 0
    }));
  }, [gameState.balance, gameState.bet]);

  // Add customer
  const addCustomer = useCallback(() => {
    if (gameState.customers.length >= 5) return;

    const drink = DRINKS[Math.floor(Math.random() * DRINKS.length)];
    const newCustomer: Customer = {
      id: `customer-${Date.now()}`,
      name: CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)],
      emoji: ['👨', '👩', '🧔', '👩‍🦱', '👨‍🦰'][Math.floor(Math.random() * 5)],
      drinkOrder: drink.name,
      patience: 30 + Math.random() * 30,
      tipMultiplier: 1 + Math.random() * 0.5,
      isServed: false,
      isHappy: false
    };

    setGameState(prev => ({
      ...prev,
      customers: [...prev.customers, newCustomer]
    }));
  }, [gameState.customers.length]);

  // Select customer order
  const selectOrder = useCallback((customerId: string) => {
    const customer = gameState.customers.find(c => c.id === customerId);
    if (!customer || customer.isServed) return;

    setGameState(prev => ({
      ...prev,
      currentOrder: customer.drinkOrder,
      selectedIngredients: []
    }));
  }, [gameState.customers]);

  // Add ingredient to mix
  const addIngredient = useCallback((ingredient: string) => {
    if (!gameState.currentOrder) return;

    setGameState(prev => ({
      ...prev,
      selectedIngredients: [...prev.selectedIngredients, ingredient]
    }));
  }, [gameState.currentOrder]);

  // Remove ingredient
  const removeIngredient = useCallback((index: number) => {
    setGameState(prev => ({
      ...prev,
      selectedIngredients: prev.selectedIngredients.filter((_, i) => i !== index)
    }));
  }, []);

  // Serve drink
  const serveDrink = useCallback(() => {
    if (!gameState.currentOrder) return;

    const orderedDrink = DRINKS.find(d => d.name === gameState.currentOrder);
    if (!orderedDrink) return;

    // Check if ingredients match (allowing for some flexibility)
    const correctIngredients = orderedDrink.ingredients;
    const hasAllIngredients = correctIngredients.every(ing =>
      gameState.selectedIngredients.includes(ing)
    );
    const hasExtraIngredients = gameState.selectedIngredients.some(ing =>
      !correctIngredients.includes(ing)
    );

    let quality = 0;
    if (hasAllIngredients && !hasExtraIngredients) {
      quality = 100; // Perfect drink
    } else if (hasAllIngredients && hasExtraIngredients) {
      quality = 75; // Good but extra stuff
    } else if (correctIngredients.length === 1 && gameState.selectedIngredients.length === 1) {
      quality = 50; // Simple drink, close enough
    } else {
      quality = 25; // Not even close
    }

    // Find customer and update
    const customer = gameState.customers.find(c =>
      c.drinkOrder === gameState.currentOrder && !c.isServed
    );
    if (!customer) return;

    const isHappy = quality >= 75;
    const tipAmount = Math.floor(orderedDrink.value * customer.tipMultiplier * (quality / 100));

    setGameState(prev => {
      const updatedCustomers = prev.customers.map(c =>
        c.id === customer.id
          ? { ...c, isServed: true, isHappy }
          : c
      );

      return {
        ...prev,
        customers: updatedCustomers,
        currentOrder: null,
        selectedIngredients: [],
        score: prev.score + tipAmount,
        perfectDrinks: quality === 100 ? prev.perfectDrinks + 1 : prev.perfectDrinks,
        happyCustomers: isHappy ? prev.happyCustomers + 1 : prev.happyCustomers
      };
    });
  }, [gameState.currentOrder, gameState.selectedIngredients, gameState.customers]);

  // Game loop - update customer patience
  useEffect(() => {
    if (gameState.gamePhase !== 'playing') return;

    const gameLoop = setInterval(() => {
      setGameState(prev => {
        const updatedCustomers = prev.customers.map(customer => ({
          ...customer,
          patience: customer.isServed ? customer.patience : Math.max(0, customer.patience - 1)
        }));

        // Remove unhappy customers
        const remainingCustomers = updatedCustomers.filter(customer =>
          customer.isServed || customer.patience > 0
        );

        // Add new customers occasionally
        if (remainingCustomers.length < 3 && Math.random() < 0.3) {
          // This would add a customer, but we'll handle it separately
        }

        const timeUp = prev.timeLeft <= 1;

        return {
          ...prev,
          customers: remainingCustomers,
          timeLeft: timeUp ? 0 : prev.timeLeft - 1,
          gamePhase: timeUp ? 'results' : prev.gamePhase
        };
      });
    }, 1000);

    return () => clearInterval(gameLoop);
  }, [gameState.gamePhase]);

  // Calculate final results
  useEffect(() => {
    if (gameState.gamePhase === 'results') {
      const accuracy = gameState.customers.length > 0 ?
        (gameState.happyCustomers / gameState.customers.length) * 100 : 0;

      let multiplier = 1;
      if (accuracy >= 90) multiplier = 5;
      else if (accuracy >= 75) multiplier = 4;
      else if (accuracy >= 60) multiplier = 3;
      else if (accuracy >= 45) multiplier = 2;

      const winAmount = Math.floor(gameState.bet * multiplier);

      setGameState(prev => ({
        ...prev,
        balance: prev.balance + winAmount,
        lastWin: winAmount,
        gamesWon: winAmount > 0 ? prev.gamesWon + 1 : prev.gamesWon,
        showResult: true,
        resultMessage: getResultMessage(accuracy, gameState.perfectDrinks)
      }));
    }
  }, [gameState.gamePhase, gameState.customers.length, gameState.happyCustomers, gameState.bet, gameState.perfectDrinks]);

  const getResultMessage = useCallback((accuracy: number, perfectDrinks: number): string => {
    if (accuracy >= 90) return "🏆 BARTENDER EXTRAORDINAIRE! The customers are raving about your drinks!";
    if (accuracy >= 75) return "🎉 EXCELLENT SERVICE! You're the talk of the cookout!";
    if (accuracy >= 60) return "👍 SOLID SHIFT! The tips are flowing!";
    return "🍺 KEEP PRACTICING! Even the best bartenders have off nights!";
  }, []);

  // Adjust bet
  const adjustBet = (amount: number) => {
    setGameState(prev => ({
      ...prev,
      bet: Math.max(25, Math.min(1000, prev.bet + amount))
    }));
  };

  const currentDrink = DRINKS.find(d => d.name === gameState.currentOrder);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-800 via-purple-700 to-purple-600 text-white">
      {/* Header */}
      <header className="border-b border-purple-600 bg-purple-800/95 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-yellow-500 bg-clip-text text-transparent">
              Company Cookout
            </span>
            <span className="text-yellow-400 font-semibold">Drinking Again</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="text-yellow-400 font-bold">
              🍗 {gameState.balance.toLocaleString()} Coins
            </div>
            <Link href="/lobby" className="text-purple-300 hover:text-white transition-colors">
              ← Back to Garage
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Drinking Again
          </h1>
          <p className="text-xl text-purple-100 max-w-2xl mx-auto">
            &ldquo;Welcome to the pondside bar! Mix drinks, serve customers, and earn those tips!&rdquo;
          </p>
        </div>

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8 max-w-3xl mx-auto">
          <div className="bg-purple-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesPlayed}</div>
            <div className="text-sm text-purple-200">Shifts Worked</div>
          </div>
          <div className="bg-purple-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.gamesWon}</div>
            <div className="text-sm text-purple-200">Good Shifts</div>
          </div>
          <div className="bg-purple-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.score}</div>
            <div className="text-sm text-purple-200">Tips Earned</div>
          </div>
          <div className="bg-purple-700/50 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-white">{gameState.perfectDrinks}</div>
            <div className="text-sm text-purple-200">Perfect Drinks</div>
          </div>
        </div>

        {/* Setup Phase */}
        {gameState.gamePhase === 'setup' && (
          <div className="max-w-md mx-auto bg-purple-700/50 backdrop-blur-sm rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">Bar Shift Time!</h3>

            <div className="flex items-center justify-center space-x-6 mb-6">
              <button
                onClick={() => adjustBet(-25)}
                className="w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-full text-xl font-bold transition-colors"
              >
                -
              </button>
              <div className="text-center">
                <div className="text-3xl font-bold text-white mb-1">{gameState.bet}</div>
                <div className="text-sm text-purple-200">Stake per Shift</div>
              </div>
              <button
                onClick={() => adjustBet(25)}
                className="w-12 h-12 bg-purple-600 hover:bg-purple-500 rounded-full text-xl font-bold transition-colors"
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
              🍸 Start Bartending!
            </button>

            {gameState.lastWin > 0 && (
              <div className="mt-4 text-center text-green-300 font-bold">
                Last Shift: 🍗 {gameState.lastWin} in tips
              </div>
            )}
          </div>
        )}

        {/* Game Area */}
        {gameState.gamePhase === 'playing' && (
          <div className="max-w-6xl mx-auto">
            {/* Game HUD */}
            <div className="bg-purple-700/50 backdrop-blur-sm rounded-xl p-6 mb-6">
              <div className="grid md:grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-white">{Math.floor(gameState.timeLeft / 60)}:{(gameState.timeLeft % 60).toString().padStart(2, '0')}</div>
                  <div className="text-sm text-purple-200">Time Remaining</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{gameState.score}</div>
                  <div className="text-sm text-purple-200">Tips Earned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{gameState.customers.filter(c => c.isServed).length}/{gameState.customers.length}</div>
                  <div className="text-sm text-purple-200">Customers Served</div>
                </div>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
              {/* Customers */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Waiting Customers</h3>
                <div className="space-y-3">
                  {gameState.customers.map(customer => (
                    <div
                      key={customer.id}
                      onClick={() => selectOrder(customer.id)}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        customer.isServed
                          ? customer.isHappy
                            ? 'border-green-400 bg-green-600/20'
                            : 'border-yellow-400 bg-yellow-600/20'
                          : customer.patience < 10
                          ? 'border-red-400 bg-red-600/20 animate-pulse'
                          : 'border-purple-400 bg-purple-600/20 hover:bg-purple-500/30'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{customer.emoji}</span>
                          <div>
                            <div className="font-bold text-white">{customer.name}</div>
                            <div className="text-sm text-purple-200">
                              Wants: {customer.drinkOrder}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          {customer.isServed ? (
                            <div className={`font-bold ${customer.isHappy ? 'text-green-400' : 'text-yellow-400'}`}>
                              {customer.isHappy ? '😊 Served!' : '😐 Served'}
                            </div>
                          ) : (
                            <div className="text-sm text-purple-300">
                              Patience: {Math.ceil(customer.patience)}s
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {gameState.customers.length < 5 && (
                  <button
                    onClick={addCustomer}
                    className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg font-bold transition-colors"
                  >
                    👥 Add Customer
                  </button>
                )}
              </div>

              {/* Bartending Station */}
              <div className="space-y-4">
                <h3 className="text-xl font-bold text-yellow-400 mb-4">Bartending Station</h3>

                {/* Current Order */}
                {gameState.currentOrder && (
                  <div className="bg-purple-600/50 rounded-lg p-4 mb-4">
                    <h4 className="font-bold text-white mb-2">Mixing: {gameState.currentOrder}</h4>
                    <div className="text-sm text-purple-200">
                      Required: {currentDrink?.ingredients.join(', ')}
                    </div>
                  </div>
                )}

                {/* Selected Ingredients */}
                <div className="bg-purple-700/50 rounded-lg p-4 mb-4">
                  <h4 className="font-bold text-white mb-2">Current Mix:</h4>
                  <div className="flex flex-wrap gap-2">
                    {gameState.selectedIngredients.map((ingredient, index) => (
                      <button
                        key={index}
                        onClick={() => removeIngredient(index)}
                        className="px-3 py-1 bg-purple-600 hover:bg-purple-500 rounded text-sm transition-colors"
                      >
                        {ingredient} ❌
                      </button>
                    ))}
                  </div>
                </div>

                {/* Ingredients */}
                <div className="grid grid-cols-4 gap-2">
                  {INGREDIENTS.map(ingredient => (
                    <button
                      key={ingredient}
                      onClick={() => addIngredient(ingredient)}
                      disabled={!gameState.currentOrder}
                      className={`p-2 rounded text-sm font-bold transition-all ${
                        gameState.currentOrder
                          ? 'bg-blue-600 hover:bg-blue-500 text-white'
                          : 'bg-gray-600 cursor-not-allowed text-gray-400'
                      }`}
                    >
                      {ingredient.replace('_', ' ')}
                    </button>
                  ))}
                </div>

                {/* Serve Button */}
                {gameState.currentOrder && gameState.selectedIngredients.length > 0 && (
                  <button
                    onClick={serveDrink}
                    className="w-full py-4 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    🍹 Serve Drink!
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Results */}
        {gameState.showResult && (
          <div className="max-w-2xl mx-auto bg-purple-700/50 backdrop-blur-sm rounded-xl p-8 text-center">
            <h3 className="text-3xl font-bold mb-4">
              {gameState.lastWin >= gameState.bet * 4 ? (
                <span className="text-green-400 animate-pulse">🏆 BARTENDING LEGEND! The customers are lining up!</span>
              ) : gameState.lastWin >= gameState.bet * 2 ? (
                <span className="text-yellow-400 animate-bounce">🎉 EXCELLENT SERVICE! You're the bar hero!</span>
              ) : gameState.lastWin >= gameState.bet ? (
                <span className="text-blue-400">🍸 SOLID SHIFT! The tips were flowing!</span>
              ) : (
                <span className="text-red-400 animate-pulse">🥃 ROUGH NIGHT! Better luck next shift!</span>
              )}
            </h3>

            {/* Funny Commentary */}
            <div className="bg-purple-800/50 rounded-lg p-4 mb-6 border-2 border-purple-600">
              <p className="text-purple-100 italic text-lg">
                {gameState.happyCustomers >= gameState.customers.length * 0.8 ? (
                  <span className="animate-pulse">\"Well shake my martini! You're mixin' drinks like a cocktail wizard! The cookout crowd is cheering your name!\"</span>
                ) : gameState.happyCustomers >= gameState.customers.length * 0.6 ? (
                  <span className="animate-bounce">\"Not too shabby behind the bar! You're keepin' the customers happy and the tips comin'!\"</span>
                ) : gameState.happyCustomers >= gameState.customers.length * 0.4 ? (
                  <span>\"Solid effort! Some drinks hit the spot, others... well, at least they're drinking!\"</span>
                ) : (
                  <span className="animate-pulse">\"Oof! Looks like some of those drinks needed a little more love! But hey, that's why they call it 'bartending practice'!\"</span>
                )}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center bg-purple-800/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{gameState.happyCustomers}</div>
                <div className="text-sm text-purple-200">Happy Customers</div>
              </div>
              <div className="text-center bg-purple-800/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-white">{gameState.perfectDrinks}</div>
                <div className="text-sm text-purple-200">Perfect Drinks</div>
              </div>
            </div>

            {gameState.lastWin > 0 ? (
              <div className="text-2xl font-bold text-green-400 mb-6 animate-bounce">
                + 🍗 {gameState.lastWin} Coins in Tips!
                <div className="text-sm text-green-300 mt-1">Cha-ching! The bar is your friend!</div>
              </div>
            ) : (
              <div className="text-xl font-bold text-red-400 mb-6">
                "Don't worry, even the best bartenders have slow nights! Try again tomorrow!"
              </div>
            )}

            <button
              onClick={() => setGameState(prev => ({
                ...prev,
                gamePhase: 'setup',
                customers: [],
                currentOrder: null,
                selectedIngredients: [],
                showResult: false
              }))}
              className="bg-gradient-to-r from-yellow-500 to-yellow-600 text-black font-bold py-4 px-8 rounded-lg transition-all transform hover:scale-105 shadow-lg"
            >
              🍸 Another Shift!
            </button>
          </div>
        )}

        {/* How to Play */}
        <div className="mt-12 bg-purple-700/50 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">How to Play: Drinking Again</h3>
          <div className="grid md:grid-cols-2 gap-6 text-sm text-purple-100">
            <div>
              <h4 className="font-bold text-white mb-2">🎯 Objective</h4>
              <p>Serve drinks to customers before their patience runs out! Mix correctly for bigger tips!</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">🍹 Bartending</h4>
              <p>Click customers to see their orders, then mix drinks using the ingredient buttons!</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">💰 Tips & Quality</h4>
              <p>Perfect drinks = max tips! Good drinks = decent tips. Bad drinks = small tips.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-2">⏱️ Customer Patience</h4>
              <p>Customers wait 30-60 seconds. Keep them happy or they'll leave without tipping!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}