import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '@/contexts/GameContext';

export default function CalcGame() {
  const router = useRouter();
  const { setGameScore } = useGame();

  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [problems, setProblems] = useState<{ text: string; answer: number }[]>([]);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [resultMessage, setResultMessage] = useState('');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const initialized = useRef(false);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      generateProblems();
    }
  }, []);

  const generateProblems = () => {
    const newProblems = [];
    for (let i = 0; i < 5; i++) {
      const type = Math.random() > 0.5 ? '+' : '-';
      let a, b;
      if (type === '+') {
        a = Math.floor(Math.random() * 50) + 10;
        b = Math.floor(Math.random() * 40) + 5;
      } else {
        a = Math.floor(Math.random() * 50) + 30;
        b = Math.floor(Math.random() * 25) + 5;
      }
      newProblems.push({ text: `${a} ${type} ${b} = ?`, answer: type === '+' ? a + b : a - b });
    }
    setProblems(newProblems);
  };

  const submitAnswer = () => {
    if (!userAnswer || problems.length === 0) return;
    
    const isCorrect = parseInt(userAnswer) === problems[current].answer;
    const newCorrect = isCorrect ? correct + 1 : correct;
    
    setShowResult(true);
    if (isCorrect) {
      setCorrect(newCorrect);
      setResultMessage('정답! 👏');
    } else {
      setResultMessage(`오답! 정답: ${problems[current].answer}`);
    }

    setTimeout(() => {
      if (current >= 4) {
        const finalScore = newCorrect * 20;
        setScore(finalScore);
        setGameOver(true);
      } else {
        setCurrent(prev => prev + 1);
        setUserAnswer('');
        setShowResult(false);
      }
    }, 1500);
  };

  const handleFinish = () => {
    setGameScore('calc', score);
    router.back();
  };

  if (problems.length === 0) {
    return <View style={styles.container}><Text>로딩 중...</Text></View>;
  }

  if (gameOver) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultIcon}>🧮</Text>
          <Text style={styles.resultTitle}>게임 완료!</Text>
          <Text style={styles.resultScore}>+{score}점</Text>
          <Text style={styles.resultInfo}>{score / 20}개 정답!</Text>
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
        <Text style={styles.title}>🧮 산수 계산</Text>
        <Text style={styles.info}>문제: {current + 1}/5 | 정답: {correct}</Text>
      </View>

      <View style={styles.problemContainer}>
        <Text style={styles.problemText}>{showResult ? resultMessage : problems[current].text}</Text>
      </View>

      {!showResult && (
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            value={userAnswer}
            onChangeText={setUserAnswer}
            keyboardType="numeric"
            placeholder="정답 입력"
            placeholderTextColor="#999"
          />
          <TouchableOpacity style={styles.submitButton} onPress={submitAnswer}>
            <Text style={styles.submitButtonText}>확인</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${(current / 5) * 100}%` }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F5F0E6', padding: 20 },
  header: { alignItems: 'center', marginTop: 40, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1a1a1a' },
  info: { fontSize: 16, color: '#666', marginTop: 8 },
  problemContainer: { backgroundColor: '#fff', padding: 40, borderRadius: 20, alignItems: 'center', marginVertical: 30, borderWidth: 3, borderColor: '#C73E3A' },
  problemText: { fontSize: 36, fontWeight: 'bold', color: '#1a1a1a' },
  inputContainer: { alignItems: 'center', gap: 16 },
  input: { width: '80%', height: 60, backgroundColor: '#fff', borderRadius: 15, fontSize: 28, textAlign: 'center', borderWidth: 2, borderColor: '#C73E3A' },
  submitButton: { backgroundColor: '#C73E3A', paddingVertical: 16, paddingHorizontal: 60, borderRadius: 30 },
  submitButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
  progressContainer: { height: 8, backgroundColor: '#ddd', borderRadius: 4, marginTop: 40, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#C73E3A', borderRadius: 4 },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultIcon: { fontSize: 80, marginBottom: 20 },
  resultTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  resultScore: { fontSize: 48, fontWeight: 'bold', color: '#C73E3A', marginBottom: 8 },
  resultInfo: { fontSize: 18, color: '#666', marginBottom: 40 },
  finishButton: { backgroundColor: '#C73E3A', paddingVertical: 16, paddingHorizontal: 60, borderRadius: 30 },
  finishButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});