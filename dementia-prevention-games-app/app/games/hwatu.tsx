import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/contexts/GameContext';

const SYMBOLS = ['🌸', '🍂', '🌙', '🌊', '🦌', '🐗'];

export default function HwatuGame() {
  const router = useRouter();
  const { setGameScore } = useGame();

  const [cards, setCards] = useState<{ symbol: string; flipped: boolean; matched: boolean }[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [matched, setMatched] = useState(0);
  const [tries, setTries] = useState(0);
  const [canClick, setCanClick] = useState(false);
  const [countdown, setCountdown] = useState(3);
  const [showPreview, setShowPreview] = useState(true);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    initGame();
  }, []);

  const initGame = () => {
    const symbols = [...SYMBOLS, ...SYMBOLS].sort(() => Math.random() - 0.5);
    setCards(symbols.map(symbol => ({ symbol, flipped: false, matched: false })));
    setFlipped([]);
    setMatched(0);
    setTries(0);
    setCanClick(false);
    setShowPreview(true);
    setCountdown(3);

    let count = 3;
    const timer = setInterval(() => {
      count--;
      setCountdown(count);
      if (count === 0) {
        clearInterval(timer);
        setShowPreview(false);
        setCanClick(true);
      }
    }, 1000);
  };

  const flipCard = (index: number) => {
    if (!canClick) return;
    if (flipped.length >= 2) return;
    if (cards[index].flipped || cards[index].matched) return;

    const newCards = [...cards];
    newCards[index].flipped = true;
    setCards(newCards);

    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setTries(prev => prev + 1);
      checkMatch(newFlipped, newCards);
    }
  };

  const checkMatch = (flippedCards: number[], currentCards: { symbol: string; flipped: boolean; matched: boolean }[]) => {
    const [i1, i2] = flippedCards;
    
    if (currentCards[i1].symbol === currentCards[i2].symbol) {
      const newCards = [...currentCards];
      newCards[i1].matched = true;
      newCards[i2].matched = true;
      setCards(newCards);
      setFlipped([]);
      
      const newMatched = matched + 1;
      setMatched(newMatched);
      
      if (newMatched === 6) {
        setTimeout(() => {
          endGame(tries + 1);
        }, 500);
      }
    } else {
      setTimeout(() => {
        const newCards = [...currentCards];
        newCards[i1].flipped = false;
        newCards[i2].flipped = false;
        setCards(newCards);
        setFlipped([]);
      }, 1000);
    }
  };

  const endGame = (finalTries: number) => {
    const finalScore = Math.max(100 - (finalTries - 6) * 5, 50);
    setScore(finalScore);
    setGameOver(true);
    setCanClick(false);
  };

  const handleFinish = () => {
    setGameScore('hwatu', score);
    router.back();
  };

  if (gameOver) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultIcon}>🎴</Text>
          <Text style={styles.resultTitle}>게임 완료!</Text>
          <Text style={styles.resultScore}>+{score}점</Text>
          <Text style={styles.resultInfo}>{tries}번 만에 완료!</Text>
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
        <Text style={styles.title}>🎴 화투 짝맞추기</Text>
        <Text style={styles.info}>남은 짝: {6 - matched} | 시도: {tries}</Text>
      </View>

      <View style={styles.board}>
        {cards.map((card, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.card,
              (card.flipped || card.matched || showPreview) && styles.cardFlipped,
              card.matched && styles.cardMatched,
            ]}
            onPress={() => flipCard(index)}
            disabled={!canClick || card.flipped || card.matched}
          >
            <Text style={styles.cardText}>
              {(card.flipped || card.matched || showPreview) ? card.symbol : '?'}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {showPreview && (
        <View style={styles.countdownContainer}>
          <Text style={styles.countdownText}>{countdown}초</Text>
          <Text style={styles.countdownSubtext}>카드를 외워주세요!</Text>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(matched / 6) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E6', padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  info: { fontSize: 16, color: '#666', marginTop: 8 },
  board: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10, marginVertical: 20 },
  card: { width: 70, height: 90, backgroundColor: '#1B4965', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 3, borderColor: '#0d2d42' },
  cardFlipped: { backgroundColor: '#fff', borderColor: '#1B4965' },
  cardMatched: { backgroundColor: '#d4edda', borderColor: '#27ae60' },
  cardText: { fontSize: 36 },
  countdownContainer: {
    alignItems: 'center',
    marginTop: 20,
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 3,
    borderColor: '#C73E3A',
  },
  countdownText: { fontSize: 48, fontWeight: 'bold', color: '#C73E3A' },
  countdownSubtext: { fontSize: 16, color: '#666', marginTop: 8 },
  progressContainer: { height: 8, backgroundColor: '#ddd', borderRadius: 4, marginTop: 20, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#1B4965', borderRadius: 4 },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultIcon: { fontSize: 80, marginBottom: 20 },
  resultTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  resultScore: { fontSize: 48, fontWeight: 'bold', color: '#C73E3A', marginBottom: 8 },
  resultInfo: { fontSize: 18, color: '#666', marginBottom: 40 },
  finishButton: { backgroundColor: '#1B4965', paddingVertical: 16, paddingHorizontal: 60, borderRadius: 30 },
  finishButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});