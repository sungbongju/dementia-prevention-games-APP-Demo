import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '../../contexts/GameContext';  // 추가!

export default function MemoryGame() {
  const router = useRouter();
  const { setGameScore } = useGame();  // 추가!

  const [level, setLevel] = useState(1);
  const [numbers, setNumbers] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [correct, setCorrect] = useState(0);
  const [phase, setPhase] = useState<'ready' | 'show' | 'input' | 'result'>('ready');
  const [message, setMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const maxLevel = 5;

  useEffect(() => {
    startRound();
  }, []);

  const startRound = () => {
    const numCount = level + 2;
    let nums = '';
    for (let i = 0; i < numCount; i++) {
      nums += Math.floor(Math.random() * 10);
    }
    setNumbers(nums);
    setUserAnswer('');
    setPhase('ready');
    setMessage('준비...');

    setTimeout(() => {
      setPhase('show');
      setMessage(nums);

      setTimeout(() => {
        setPhase('input');
        setMessage('?');
      }, 1500 + level * 500);
    }, 1000);
  };

  const inputNumber = (num: number) => {
    if (phase !== 'input') return;
    setUserAnswer(prev => prev + num);
  };

  const clearAnswer = () => setUserAnswer('');

  const submitAnswer = () => {
    if (phase !== 'input') return;
    
    setPhase('result');
    const isCorrect = userAnswer === numbers;
    
    if (isCorrect) {
      setCorrect(prev => prev + 1);
      setMessage('정답! 👏');
    } else {
      setMessage(`오답! 정답: ${numbers}`);
    }

    setTimeout(() => {
      if (level >= maxLevel) {
        endGame(isCorrect);
      } else {
        setLevel(prev => prev + 1);
      }
    }, 1500);
  };

  useEffect(() => {
    if (level > 1 && !gameOver) {
      startRound();
    }
  }, [level]);

  const endGame = (lastCorrect: boolean) => {
    const finalScore = (correct + (lastCorrect ? 1 : 0)) * 20;
    setScore(finalScore);
    setGameScore('memory', finalScore);  // Context에 저장!
    setGameOver(true);
  };

  if (gameOver) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultIcon}>🔢</Text>
          <Text style={styles.resultTitle}>게임 완료!</Text>
          <Text style={styles.resultScore}>+{score}점</Text>
          <Text style={styles.resultInfo}>{Math.floor(score / 20)}개 정답!</Text>
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
        <Text style={styles.title}>🔢 숫자 기억하기</Text>
        <Text style={styles.info}>단계: {level}/{maxLevel} | 정답: {correct}</Text>
      </View>

      <View style={styles.displayContainer}>
        <Text style={styles.displayText}>{message}</Text>
      </View>

      {phase === 'input' && (
        <>
          <View style={styles.answerContainer}>
            <Text style={styles.answerText}>{userAnswer || '숫자를 입력하세요'}</Text>
          </View>

          <View style={styles.numpad}>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 0].map(num => (
              <TouchableOpacity key={num} style={styles.numButton} onPress={() => inputNumber(num)}>
                <Text style={styles.numButtonText}>{num}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={[styles.numButton, styles.clearButton]} onPress={clearAnswer}>
              <Text style={styles.actionButtonText}>지우기</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.numButton, styles.submitButton]} onPress={submitAnswer}>
              <Text style={styles.actionButtonText}>확인</Text>
            </TouchableOpacity>
          </View>
        </>
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
  displayContainer: { backgroundColor: '#fff', padding: 40, borderRadius: 20, alignItems: 'center', marginVertical: 20, borderWidth: 3, borderColor: '#E8B931' },
  displayText: { fontSize: 48, fontWeight: 'bold', color: '#1a1a1a', letterSpacing: 10 },
  answerContainer: { backgroundColor: '#FFF9E6', padding: 20, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  answerText: { fontSize: 32, fontWeight: 'bold', color: '#E8B931', letterSpacing: 8 },
  numpad: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 10 },
  numButton: { width: 70, height: 60, backgroundColor: '#fff', borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#ddd' },
  numButtonText: { fontSize: 24, fontWeight: 'bold', color: '#1a1a1a' },
  clearButton: { backgroundColor: '#C73E3A' },
  submitButton: { backgroundColor: '#2D5016' },
  actionButtonText: { fontSize: 16, fontWeight: 'bold', color: '#fff' },
  progressContainer: { height: 8, backgroundColor: '#ddd', borderRadius: 4, marginTop: 30, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#E8B931', borderRadius: 4 },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultIcon: { fontSize: 80, marginBottom: 20 },
  resultTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  resultScore: { fontSize: 48, fontWeight: 'bold', color: '#C73E3A', marginBottom: 8 },
  resultInfo: { fontSize: 18, color: '#666', marginBottom: 40 },
  finishButton: { backgroundColor: '#E8B931', paddingVertical: 16, paddingHorizontal: 60, borderRadius: 30 },
  finishButtonText: { color: '#1a1a1a', fontSize: 20, fontWeight: 'bold' },
});