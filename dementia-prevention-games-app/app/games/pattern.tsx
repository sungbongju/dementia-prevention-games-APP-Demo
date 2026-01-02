import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/contexts/GameContext';

const COLORS = [
  { id: 'red', color: '#e74c3c', name: '빨강' },
  { id: 'blue', color: '#3498db', name: '파랑' },
  { id: 'yellow', color: '#f1c40f', name: '노랑' },
  { id: 'green', color: '#27ae60', name: '초록' },
];

export default function PatternGame() {
  const router = useRouter();
  const { setGameScore } = useGame();

  const [sequence, setSequence] = useState<string[]>([]);
  const [playerSequence, setPlayerSequence] = useState<string[]>([]);
  const [level, setLevel] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeColor, setActiveColor] = useState<string | null>(null);
  const [canClick, setCanClick] = useState(false);
  const [message, setMessage] = useState('시작 버튼을 눌러주세요!');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);

  const maxLevel = 5;

  const startGame = () => {
    setIsPlaying(true);
    setSequence([]);
    setPlayerSequence([]);
    setLevel(1);
    setCorrect(0);
    nextRound([]);
  };

  const nextRound = (currentSequence: string[]) => {
    setCanClick(false);
    setMessage('패턴을 기억하세요!');
    
    const newColor = COLORS[Math.floor(Math.random() * COLORS.length)].id;
    const newSequence = [...currentSequence, newColor];
    setSequence(newSequence);
    setPlayerSequence([]);

    setTimeout(() => {
      playSequence(newSequence);
    }, 1000);
  };

  const playSequence = async (seq: string[]) => {
    for (let i = 0; i < seq.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 600));
      setActiveColor(seq[i]);
      await new Promise(resolve => setTimeout(resolve, 400));
      setActiveColor(null);
    }
    setCanClick(true);
    setMessage('순서대로 눌러주세요!');
  };

  const handleColorPress = (colorId: string) => {
    if (!canClick) return;

    const newPlayerSequence = [...playerSequence, colorId];
    setPlayerSequence(newPlayerSequence);

    const currentIndex = newPlayerSequence.length - 1;
    
    if (colorId !== sequence[currentIndex]) {
      endGame(correct);
      return;
    }

    if (newPlayerSequence.length === sequence.length) {
      const newCorrect = correct + 1;
      setCorrect(newCorrect);
      setCanClick(false);
      
      if (level >= maxLevel) {
        endGame(newCorrect);
      } else {
        setMessage('정답! 다음 단계로...');
        setLevel(prev => prev + 1);
        setTimeout(() => nextRound(sequence), 1500);
      }
    }
  };

  const endGame = (finalCorrect: number) => {
    const finalScore = finalCorrect * 20;
    setScore(finalScore);
    setGameOver(true);
  };

  const handleFinish = () => {
    setGameScore('pattern', score);
    router.back();
  };

  if (gameOver) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultIcon}>🎨</Text>
          <Text style={styles.resultTitle}>게임 완료!</Text>
          <Text style={styles.resultScore}>+{score}점</Text>
          <Text style={styles.resultInfo}>{score / 20}단계 성공!</Text>
          <TouchableOpacity style={styles.finishButton} onPress={handleFinish}>
            <Text style={styles.finishButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🎨 색상 패턴 기억</Text>
        <Text style={styles.info}>단계: {level}/{maxLevel}</Text>
      </View>

      <Text style={styles.message}>{message}</Text>

      <View style={styles.colorGrid}>
        {COLORS.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[
              styles.colorButton,
              { backgroundColor: c.color },
              activeColor === c.id && styles.colorActive,
            ]}
            onPress={() => handleColorPress(c.id)}
            disabled={!canClick}
          />
        ))}
      </View>

      {!isPlaying && (
        <TouchableOpacity style={styles.startButton} onPress={startGame}>
          <Text style={styles.startButtonText}>시작!</Text>
        </TouchableOpacity>
      )}

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${((level - 1) / maxLevel) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E6', padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  info: { fontSize: 16, color: '#666', marginTop: 8 },
  message: { fontSize: 18, textAlign: 'center', marginVertical: 20, color: '#333' },
  colorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 15, marginVertical: 30 },
  colorButton: { width: 120, height: 120, borderRadius: 20, opacity: 0.7 },
  colorActive: { opacity: 1, transform: [{ scale: 1.1 }] },
  startButton: { backgroundColor: '#2D5016', padding: 20, borderRadius: 30, alignSelf: 'center', marginTop: 20 },
  startButtonText: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  progressContainer: { height: 8, backgroundColor: '#ddd', borderRadius: 4, marginTop: 30, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#2D5016', borderRadius: 4 },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultIcon: { fontSize: 80, marginBottom: 20 },
  resultTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  resultScore: { fontSize: 48, fontWeight: 'bold', color: '#C73E3A', marginBottom: 8 },
  resultInfo: { fontSize: 18, color: '#666', marginBottom: 40 },
  finishButton: { backgroundColor: '#2D5016', paddingVertical: 16, paddingHorizontal: 60, borderRadius: 30 },
  finishButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});