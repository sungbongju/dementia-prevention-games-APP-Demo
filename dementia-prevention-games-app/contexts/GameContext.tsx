import React, { createContext, useContext, useState, ReactNode } from 'react';

interface GameScores {
  hwatu: number;
  pattern: number;
  memory: number;
  proverb: number;
  calc: number;
  sequence: number;
}

interface Stats {
  totalGames: number;
  bestScore: number;
  avgScore: number;
}

interface GameContextType {
  playerName: string;
  setPlayerName: (name: string) => void;
  isLoggedIn: boolean;
  setIsLoggedIn: (value: boolean) => void;
  sessionScores: GameScores;
  setGameScore: (game: keyof GameScores, score: number) => void;
  resetSessionScores: () => void;
  bestScores: GameScores;
  setBestScores: (scores: GameScores) => void;
  stats: Stats;
  setStats: (stats: Stats) => void;
  logout: () => void;
}

const initialScores: GameScores = {
  hwatu: 0, pattern: 0, memory: 0, proverb: 0, calc: 0, sequence: 0,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [playerName, setPlayerName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionScores, setSessionScores] = useState<GameScores>(initialScores);
  const [bestScores, setBestScores] = useState<GameScores>(initialScores);
  const [stats, setStats] = useState<Stats>({ totalGames: 0, bestScore: 0, avgScore: 0 });

  const setGameScore = (game: keyof GameScores, score: number) => {
    setSessionScores(prev => ({ ...prev, [game]: score }));
  };

  const resetSessionScores = () => setSessionScores(initialScores);

  const logout = () => {
    setIsLoggedIn(false);
    setPlayerName('');
    setSessionScores(initialScores);
    setBestScores(initialScores);
    setStats({ totalGames: 0, bestScore: 0, avgScore: 0 });
  };

  return (
    <GameContext.Provider value={{
      playerName, setPlayerName,
      isLoggedIn, setIsLoggedIn,
      sessionScores, setGameScore, resetSessionScores,
      bestScores, setBestScores,
      stats, setStats,
      logout,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
}