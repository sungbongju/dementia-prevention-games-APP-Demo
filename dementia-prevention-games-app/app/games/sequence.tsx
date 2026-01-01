import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '../../contexts/GameContext';  // 추가!

const QUESTIONS = [
  { items: ['🥚', '🐣', '🐥', '🐔'], instruction: '달걀에서 닭이 되는 순서를 맞춰보세요!', answer: ['🥚', '🐣', '🐥', '🐔'] },
  { items: ['🌱', '🌿', '🌳', '🍂'], instruction: '나무가 자라는 순서를 맞춰보세요!', answer: ['🌱', '🌿', '🌳', '🍂'] },
  { items: ['🌅', '☀️', '🌆', '🌙'], instruction: '하루의 순서를 맞춰보세요!', answer: ['🌅', '☀️', '🌆', '🌙'] },
];

export default function SequenceGame() {
  const router = useRouter();
  const { setGameScore } = useGame();  // 추가!

  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [shuffledItems, setShuffledItems] = useState<string[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    shuffleItems();
  }, [current]);

  const shuffleItems = () => {
    const items = [...QUESTIONS[current].items].sort(() => Math.random() - 0.5);
    setShuffledItems(items);
    setSelected([]);
    setShowResult(false);
  };

  const selectItem = (item: string) => {
    if (selected.includes(item) || showResult) return;
    setSelected(prev => [...prev, item]);
  };

  const resetSelection = () => setSelected([]);

  const submitAnswer = () => {
    if (selected.length !== QUESTIONS[current].answer.length) {
      Alert.alert('알림', '모든 그림을 순서대로 선택해주세요!');
      return;
    }

    const isCorrect = selected.every((item, index) => item === QUESTIONS[current].answer[index]);
    
    setShowResult(true);
    if (isCorrect) {
      setCorrect(prev => prev + 1);
      setResultMessage('정답입니다! 👏');
    } else {
      setResultMessage(`오답! 정답: ${QUESTIONS[current].answer.join(' → ')}`);
    }

    setTimeout(() => {
      if (current >= 2) {
        endGame(isCorrect);
      } else {
        setCurrent(prev => prev + 1);
      }
    }, 2000);
  };

  const endGame = (lastCorrect: boolean) => {
    const finalScore = Math.round((correct + (lastCorrect ? 1 : 0)) * 33.33);
    setScore(finalScore);
    setGameScore('sequence', finalScore);  // Context에 저장!
    setGameOver(true);
  };

  if (gameOver) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultIcon}>🔄</Text>
          <Text style={styles.resultTitle}>게임 완료!</Text>
          <Text style={styles.resultScore}>+{score}점</Text>
          <Text style={styles.resultInfo}>{Math.round(score / 33.33)}개 정답!</Text>
          <TouchableOpacity style={styles.finishButton} onPress={() => router.back()}>
            <Text style={styles.finishButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🔄 순서 맞추기</Text>
        <Text style={styles.info}>문제: {current + 1}/3 | 정답: {correct}</Text>
      </View>

      <View style={styles.instructionContainer}>
        <Text style={styles.instructionText}>{showResult ? resultMessage : QUESTIONS[current].instruction}</Text>
      </View>

      <Text style={styles.sectionLabel}>선택할 그림:</Text>
      <View style={styles.itemsContainer}>
        {shuffledItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.itemButton, selected.includes(item) && styles.itemSelected]}
            onPress={() => selectItem(item)}
            disabled={selected.includes(item) || showResult}
          >
            <Text style={styles.itemText}>{item}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionLabel}>선택한 순서:</Text>
      <View style={styles.selectedContainer}>
        {selected.map((item, index) => (
          <View key={index} style={styles.selectedItem}>
            <Text style={styles.selectedText}>{item}</Text>
            {index < selected.length - 1 && <Text style={styles.arrow}>→</Text>}
          </View>
        ))}
        {selected.length === 0 && <Text style={styles.placeholder}>그림을 순서대로 선택하세요</Text>}
      </View>

      {!showResult && (
        <View style={styles.buttonRow}>
          <TouchableOpacity style={styles.resetButton} onPress={resetSelection}>
            <Text style={styles.resetButtonText}>다시 선택</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.submitButtonSeq} onPress={submitAnswer}>
            <Text style={styles.submitButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(current / 3) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E6', padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  info: { fontSize: 16, color: '#666', marginTop: 8 },
  instructionContainer: { backgroundColor: '#fff', padding: 20, borderRadius: 16, marginVertical: 16, borderWidth: 3, borderColor: '#6B5B95' },
  instructionText: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', textAlign: 'center' },
  sectionLabel: { fontSize: 16, fontWeight: '600', color: '#666', marginTop: 16, marginBottom: 8 },
  itemsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 12, flexWrap: 'wrap' },
  itemButton: { width: 70, height: 70, backgroundColor: '#fff', borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#6B5B95' },
  itemSelected: { backgroundColor: '#e0e0e0', opacity: 0.5 },
  itemText: { fontSize: 36 },
  selectedContainer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 12, minHeight: 80, flexWrap: 'wrap' },
  selectedItem: { flexDirection: 'row', alignItems: 'center' },
  selectedText: { fontSize: 36 },
  arrow: { fontSize: 24, marginHorizontal: 8, color: '#6B5B95' },
  placeholder: { fontSize: 16, color: '#999' },
  buttonRow: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 20 },
  resetButton: { backgroundColor: '#999', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 25 },
  resetButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  submitButtonSeq: { backgroundColor: '#6B5B95', paddingVertical: 14, paddingHorizontal: 30, borderRadius: 25 },
  submitButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  progressContainer: { height: 8, backgroundColor: '#ddd', borderRadius: 4, marginTop: 30, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#6B5B95', borderRadius: 4 },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultIcon: { fontSize: 80, marginBottom: 20 },
  resultTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  resultScore: { fontSize: 48, fontWeight: 'bold', color: '#C73E3A', marginBottom: 8 },
  resultInfo: { fontSize: 18, color: '#666', marginBottom: 40 },
  finishButton: { backgroundColor: '#6B5B95', paddingVertical: 16, paddingHorizontal: 60, borderRadius: 30 },
  finishButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});