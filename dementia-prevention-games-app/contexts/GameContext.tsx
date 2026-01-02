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
  setIsLoggedIn: (v: boolean) => void;
  sessionScores: GameScores;
  setGameScore: (game: keyof GameScores, score: number) => void;
  resetSessionScores: () => void;
  bestScores: GameScores;
  setBestScores: (scores: GameScores) => void;
  stats: Stats;
  setStats: (stats: Stats) => void;
  logout: () => void;
  // 🆕 게임 설명 요청
  pendingGameExplain: string | null;
  requestGameExplain: (gameId: string) => void;
  clearGameExplain: () => void;
}

const initialScores: GameScores = {
  hwatu: 0,
  pattern: 0,
  memory: 0,
  proverb: 0,
  calc: 0,
  sequence: 0,
};

const initialStats: Stats = {
  totalGames: 0,
  bestScore: 0,
  avgScore: 0,
};

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [playerName, setPlayerName] = useState('');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [sessionScores, setSessionScores] = useState<GameScores>(initialScores);
  const [bestScores, setBestScores] = useState<GameScores>(initialScores);
  const [stats, setStats] = useState<Stats>(initialStats);
  const [pendingGameExplain, setPendingGameExplain] = useState<string | null>(null);

  const setGameScore = (game: keyof GameScores, score: number) => {
    setSessionScores(prev => ({ ...prev, [game]: score }));
  };

  const resetSessionScores = () => setSessionScores(initialScores);

  const logout = () => {
    setPlayerName('');
    setIsLoggedIn(false);
    setSessionScores(initialScores);
    setBestScores(initialScores);
    setStats(initialStats);
    setPendingGameExplain(null);
  };

  // 🆕 게임 설명 요청
  const requestGameExplain = (gameId: string) => {
    // gameId 매핑 (numMemory → memory, pattern → yut)
    const gameKeyMap: Record<string, string> = {
      hwatu: 'hwatu',
      pattern: 'yut',  // route.ts에서 yut으로 되어있음
      numMemory: 'memory',
      memory: 'memory',
      proverb: 'proverb',
      calc: 'calc',
      sequence: 'sequence',
    };
    const mappedKey = gameKeyMap[gameId] || gameId;
    setPendingGameExplain(mappedKey);
  };

  const clearGameExplain = () => setPendingGameExplain(null);

  return (
    <GameContext.Provider value={{
      playerName, setPlayerName,
      isLoggedIn, setIsLoggedIn,
      sessionScores, setGameScore, resetSessionScores,
      bestScores, setBestScores,
      stats, setStats,
      logout,
      pendingGameExplain, requestGameExplain, clearGameExplain,
    }}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}