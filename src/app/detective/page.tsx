'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

interface Character {
  id: string;
  name: string;
  personality: string;
  motive: string;
  dialogueStyle: string;
  tells: string[];
}

interface Clue {
  id: string;
  text: string;
  character: string;
  type: 'solid' | 'red_herring' | 'personality';
}

interface GameState {
  coins: number;
  round: number;
  clues: Clue[];
  interviewed: string[];
  snitch: string;
  gamePhase: 'betting' | 'interview' | 'interrogation' | 'accusation' | 'result';
  currentInterview: string | null;
  dialogueHistory: string[];
}

const CHARACTERS: Character[] = [
  {
    id: 'envy',
    name: 'Envy',
    personality: 'loud narcassist, jealous of anyone she thinks is better than anyone and wants to be praised',
    motive: 'to knock out competition',
    dialogueStyle: 'boastful and competitive',
    tells: ['overconfident grin', 'name-dropping', 'competitive boasting']
  },
  {
    id: 'brad',
    name: 'Brad',
    personality: 'literally a little crazy, says he is Moses from the Bible, talks about being tough to cover up he\'s not',
    motive: 'he\'s crazy',
    dialogueStyle: 'biblical references and overcompensation',
    tells: ['shifty eyes', 'sweaty palms', 'contradictory statements']
  },
  {
    id: 'bamy',
    name: 'Bamy\'r',
    personality: 'needs validation, wants to be recognized',
    motive: 'spotlight',
    dialogueStyle: 'attention-seeking and dramatic',
    tells: ['fishing for compliments', 'overly dramatic reactions', 'seeking approval']
  },
  {
    id: 'al',
    name: 'Al',
    personality: 'local moonshine maker, paranoid',
    motive: 'self-preservation, divert attention',
    dialogueStyle: 'suspicious and deflecting',
    tells: ['looking over shoulder', 'changing subject quickly', 'excessive blinking']
  },
  {
    id: 'bernie',
    name: 'Bernie',
    personality: 'old guy who is creepy and vengeful',
    motive: 'might have felt threatened or wanted to steal your stuff',
    dialogueStyle: 'creepy and vindictive',
    tells: ['creepy smile', 'vengeful tone', 'possessive language']
  }
];

export default function DetectiveGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameState, setGameState] = useState<GameState>({
    coins: 20,
    round: 1,
    clues: [],
    interviewed: [],
    snitch: '',
    gamePhase: 'betting',
    currentInterview: null,
    dialogueHistory: []
  });

  // Initialize game
  useEffect(() => {
    const snitch = CHARACTERS[Math.floor(Math.random() * CHARACTERS.length)].id;
    setGameState(prev => ({ ...prev, snitch }));
  }, []);

  const generateDialogue = useCallback((character: Character, isSnitch: boolean): string[] => {
    const dialogues = [];

    if (isSnitch) {
      // Snitch gives mixed signals - some truth, some lies
      dialogues.push(`"${character.name}: I swear on my mama's grave, I didn't say nothin' to nobody!"`);
      dialogues.push(`"${character.name}: Why you lookin' at me like that? I got nothin' to hide!"`);
      dialogues.push(`"${character.name}: That pig was askin' all sorts of questions... but I kept my mouth shut!"`);
    } else {
      // Innocent characters give helpful hints
      const snitchChar = CHARACTERS.find(c => c.id === gameState.snitch);
      dialogues.push(`"${character.name}: I seen ${snitchChar?.name} actin' mighty suspicious around that cop car..."`);
      dialogues.push(`"${character.name}: ${snitchChar?.name} was the one whisperin' in the corner with that detective!"`);
    }

    return dialogues;
  }, [gameState.snitch]);

  const startInterview = (characterId: string) => {
    const character = CHARACTERS.find(c => c.id === characterId);
    if (!character) return;

    const isSnitch = characterId === gameState.snitch;
    const dialogues = generateDialogue(character, isSnitch);

    setGameState(prev => ({
      ...prev,
      currentInterview: characterId,
      gamePhase: 'interview',
      dialogueHistory: dialogues
    }));
  };

  const makeBet = (type: 'clue_helpful' | 'character_lying', amount: number) => {
    // Simple betting logic - 2x multiplier for correct bets
    const isCorrect = Math.random() > 0.5; // Simplified for demo
    const multiplier = isCorrect ? 2 : 0;

    setGameState(prev => ({
      ...prev,
      coins: prev.coins + (amount * multiplier) - amount
    }));
  };

  const gatherClue = (clue: Clue) => {
    setGameState(prev => ({
      ...prev,
      clues: [...prev.clues, clue],
      interviewed: [...prev.interviewed, prev.currentInterview!],
      currentInterview: null,
      gamePhase: 'betting'
    }));
  };

  const makeAccusation = (characterId: string) => {
    const isCorrect = characterId === gameState.snitch;
    const payout = isCorrect ? gameState.coins * 5 : gameState.coins * 0.5;

    setGameState(prev => ({
      ...prev,
      coins: payout,
      gamePhase: 'result'
    }));
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
            <span className="text-yellow-400 font-semibold">Who&apos;d Snitch?</span>
          </Link>
          <div className="flex items-center space-x-4">
            <div className="text-yellow-400 font-bold">
              🍗 {gameState.coins} Coins
            </div>
            <Link href="/" className="text-neutral-400 hover:text-yellow-400 transition-colors">
              ← Back to Garage
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Game Title */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-500 bg-clip-text text-transparent">
            Who&apos;d Snitch?
          </h1>
          <p className="text-xl text-neutral-300 max-w-2xl mx-auto">
            &ldquo;Someone ratted you out at the pondside cookout. Find the snitch before they strike again!&rdquo;
          </p>
        </div>

        {/* Game Canvas Area */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-8 mb-8">
          <canvas
            ref={canvasRef}
            width={800}
            height={600}
            className="w-full max-w-4xl mx-auto border border-neutral-700 rounded-lg"
          />

          {/* Game Controls */}
          {gameState.gamePhase === 'betting' && (
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Choose Your Next Move</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                {CHARACTERS.map(character => (
                  <button
                    key={character.id}
                    onClick={() => startInterview(character.id)}
                    disabled={gameState.interviewed.includes(character.id)}
                    className={`p-6 md:p-4 rounded-lg border-2 transition-all ${
                      gameState.interviewed.includes(character.id)
                        ? 'border-neutral-600 bg-neutral-700 opacity-50 cursor-not-allowed'
                        : 'border-yellow-500 hover:border-yellow-400 bg-neutral-700 hover:bg-neutral-600'
                    }`}
                  >
                    <img
                      src={`https://picsum.photos/120/120?random=${character.id}`}
                      alt={character.name}
                      className="w-20 h-20 md:w-16 md:h-16 rounded-full mx-auto mb-2 border-2 border-yellow-400"
                    />
                    <div className="font-bold text-yellow-400">{character.name}</div>
                  </button>
                ))}
              </div>

              {/* Clues Display */}
              {gameState.clues.length > 0 && (
                <div className="mt-6 max-w-2xl mx-auto">
                  <h4 className="text-lg font-bold text-yellow-400 mb-3">Your Clues:</h4>
                  <div className="space-y-2">
                    {gameState.clues.map((clue, index) => (
                      <div key={index} className="bg-neutral-700 p-3 rounded-lg flex items-center">
                        <span className="mr-3 text-yellow-400">🔍</span>
                        <span className="text-neutral-200">{clue.text}</span>
                        <span className="ml-auto text-xs text-neutral-400">
                          (from {CHARACTERS.find(c => c.id === clue.character)?.name})
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Accusation Option */}
              {gameState.interviewed.length >= 2 && (
                <div className="mt-8">
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'accusation' }))}
                    className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg transition-all transform hover:scale-105 shadow-lg animate-pulse"
                  >
                    🎯 Ready to Guess Who the Snitch Is?
                  </button>
                  <p className="mt-2 text-neutral-400 text-sm">
                    You&apos;ve interviewed {gameState.interviewed.length} characters and gathered {gameState.clues.length} clues
                  </p>
                </div>
              )}
            </div>
          )}

          {gameState.gamePhase === 'interview' && gameState.currentInterview && (
            <div className="mt-6">
              <div className="bg-neutral-700 rounded-lg p-6 max-w-2xl mx-auto">
                <h3 className="text-xl font-bold text-yellow-400 mb-4 text-center">
                  Interviewing {CHARACTERS.find(c => c.id === gameState.currentInterview)?.name}
                </h3>
                <div className="space-y-3">
                  {gameState.dialogueHistory.map((dialogue, index) => (
                    <div key={index} className="bg-neutral-600 p-3 rounded">
                      {dialogue}
                    </div>
                  ))}
                </div>
                <div className="mt-6 flex justify-center space-x-4">
                  <button
                    onClick={() => gatherClue({
                      id: `clue-${Date.now()}`,
                      text: 'Suspicious behavior noted',
                      character: gameState.currentInterview!,
                      type: 'solid'
                    })}
                    className="px-6 py-2 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded"
                  >
                    Gather Clue
                  </button>
                  <button
                    onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'betting', currentInterview: null }))}
                    className="px-6 py-2 bg-neutral-600 hover:bg-neutral-500 text-white rounded"
                  >
                    Continue Investigating
                  </button>
                  {gameState.interviewed.length >= 2 && (
                    <button
                      onClick={() => setGameState(prev => ({ ...prev, gamePhase: 'accusation', currentInterview: null }))}
                      className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white font-bold rounded animate-pulse"
                    >
                      🎯 Make Accusation!
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {gameState.gamePhase === 'accusation' && (
            <div className="mt-6 text-center">
              <h3 className="text-2xl font-bold text-yellow-400 mb-4">Who&apos;s the Snitch?</h3>
              <div className="grid grid-cols-3 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
                {CHARACTERS.map(character => (
                  <button
                    key={character.id}
                    onClick={() => makeAccusation(character.id)}
                    className="p-6 md:p-4 rounded-lg border-2 border-red-500 hover:border-red-400 bg-neutral-700 hover:bg-neutral-600 transition-all"
                  >
                    <img
                      src={`https://picsum.photos/120/120?random=${character.id}`}
                      alt={character.name}
                      className="w-20 h-20 md:w-16 md:h-16 rounded-full mx-auto mb-2 border-2 border-red-400"
                    />
                    <div className="font-bold text-red-400">{character.name}</div>
                    <div className="text-sm text-neutral-300">Accuse!</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {gameState.gamePhase === 'result' && (
            <div className="mt-6 text-center">
              <h3 className="text-3xl font-bold mb-4">
                {gameState.coins > 20 ? (
                  <span className="text-green-400">🎉 You Found the Snitch! 🎉</span>
                ) : (
                  <span className="text-red-400">😞 Wrong Accusation 😞</span>
                )}
              </h3>
              <p className="text-xl mb-6">
                {gameState.coins > 20
                  ? `The snitch has been DOOMED! You won ${gameState.coins - 20} coins!`
                  : 'Better luck next time, detective!'
                }
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-8 py-3 bg-yellow-600 hover:bg-yellow-500 text-black font-bold rounded-lg"
              >
                Play Again
              </button>
            </div>
          )}
        </div>

        {/* Clue Log */}
        <div className="bg-neutral-800/50 backdrop-blur-sm rounded-xl p-6">
          <h3 className="text-xl font-bold text-yellow-400 mb-4">Clue Log</h3>
          {gameState.clues.length === 0 ? (
            <p className="text-neutral-400">No clues gathered yet...</p>
          ) : (
            <div className="space-y-2">
              {gameState.clues.map(clue => (
                <div key={clue.id} className="bg-neutral-700 p-3 rounded flex items-center">
                  <span className="mr-3">🔍</span>
                  <span>{clue.text} (from {CHARACTERS.find(c => c.id === clue.character)?.name})</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}