import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { useGame } from '../../contexts/GameContext';  // 추가!

const PROVERBS = [
  { text: '가는 말이 고와야 ____ 말이 곱다', answer: '오는', options: ['오는', '가는', '먼', '큰'] },
  { text: '낮말은 새가 듣고 ____ 쥐가 듣는다', answer: '밤말은', options: ['밤말은', '큰말은', '작은말은', '긴말은'] },
  { text: '세 살 버릇 ____ 간다', answer: '여든까지', options: ['여든까지', '평생', '어른까지', '죽을때까지'] },
  { text: '뛰는 놈 위에 ____ 놈 있다', answer: '나는', options: ['나는', '뛰는', '걷는', '서는'] },
  { text: '백지장도 ____ 낫다', answer: '맞들면', options: ['맞들면', '혼자면', '둘이면', '같이면'] },
  { text: '콩 심은 데 콩 나고 ____ 심은 데 팥 난다', answer: '팥', options: ['팥', '콩', '쌀', '보리'] },
  { text: '호랑이도 ____ 하면 온다', answer: '제 말', options: ['제 말', '큰 소리', '이름', '생각'] },
];

export default function ProverbGame() {
  const router = useRouter();
  const { setGameScore } = useGame();  // 추가!

  const [current, setCurrent] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [shuffledProverbs, setShuffledProverbs] = useState<typeof PROVERBS>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [shuffledOptions, setShuffledOptions] = useState<string[]>([]);

  useEffect(() => {
    const shuffled = [...PROVERBS].sort(() => Math.random() - 0.5).slice(0, 5);
    setShuffledProverbs(shuffled);
  }, []);

  useEffect(() => {
    if (shuffledProverbs[current]) {
      setShuffledOptions([...shuffledProverbs[current].options].sort(() => Math.random() - 0.5));
    }
  }, [current, shuffledProverbs]);

  const currentProverb = shuffledProverbs[current];

  const selectAnswer = (answer: string) => {
    if (showResult || !currentProverb) return;
    
    setSelectedAnswer(answer);
    setShowResult(true);

    const isCorrect = answer === currentProverb.answer;
    if (isCorrect) {
      setCorrect(prev => prev + 1);
    }

    setTimeout(() => {
      if (current >= 4) {
        endGame(isCorrect);
      } else {
        setCurrent(prev => prev + 1);
        setSelectedAnswer(null);
        setShowResult(false);
      }
    }, 1500);
  };

  const endGame = (lastCorrect: boolean) => {
    const finalScore = (correct + (lastCorrect ? 1 : 0)) * 20;
    setScore(finalScore);
    setGameScore('proverb', finalScore);  // Context에 저장!
    setGameOver(true);
  };

  if (!currentProverb) {
    return <View style={styles.container}><Text>로딩 중...</Text></View>;
  }

  if (gameOver) {
    return (
      <View style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultIcon}>📜</Text>
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
        <Text style={styles.title}>📜 속담 완성하기</Text>
        <Text style={styles.info}>문제: {current + 1}/5 | 정답: {correct}</Text>
      </View>

      <View style={styles.proverbContainer}>
        <Text style={styles.proverbText}>{currentProverb.text.replace('____', '______')}</Text>
      </View>

      <View style={styles.optionsContainer}>
        {shuffledOptions.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              showResult && option === currentProverb.answer && styles.correctOption,
              showResult && selectedAnswer === option && option !== currentProverb.answer && styles.wrongOption,
            ]}
            onPress={() => selectAnswer(option)}
            disabled={showResult}
          >
            <Text style={[
              styles.optionText,
              showResult && option === currentProverb.answer && styles.correctText,
              showResult && selectedAnswer === option && option !== currentProverb.answer && styles.wrongText,
            ]}>
              {option}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

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
  proverbContainer: { backgroundColor: '#fff', padding: 30, borderRadius: 20, marginVertical: 20, borderWidth: 3, borderColor: '#8B4513' },
  proverbText: { fontSize: 22, fontWeight: '600', color: '#1a1a1a', textAlign: 'center', lineHeight: 36 },
  optionsContainer: { gap: 12, marginTop: 20 },
  optionButton: { backgroundColor: '#fff', padding: 18, borderRadius: 15, borderWidth: 2, borderColor: '#8B4513' },
  correctOption: { backgroundColor: '#d4edda', borderColor: '#27ae60' },
  wrongOption: { backgroundColor: '#f8d7da', borderColor: '#c0392b' },
  optionText: { fontSize: 20, fontWeight: '600', color: '#1a1a1a', textAlign: 'center' },
  correctText: { color: '#27ae60' },
  wrongText: { color: '#c0392b' },
  progressContainer: { height: 8, backgroundColor: '#ddd', borderRadius: 4, marginTop: 30, overflow: 'hidden' },
  progressBar: { height: '100%', backgroundColor: '#8B4513', borderRadius: 4 },
  resultContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultIcon: { fontSize: 80, marginBottom: 20 },
  resultTitle: { fontSize: 32, fontWeight: 'bold', marginBottom: 16 },
  resultScore: { fontSize: 48, fontWeight: 'bold', color: '#C73E3A', marginBottom: 8 },
  resultInfo: { fontSize: 18, color: '#666', marginBottom: 40 },
  finishButton: { backgroundColor: '#8B4513', paddingVertical: 16, paddingHorizontal: 60, borderRadius: 30 },
  finishButtonText: { color: '#fff', fontSize: 20, fontWeight: 'bold' },
});