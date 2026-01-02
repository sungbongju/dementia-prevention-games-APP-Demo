import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  FlatList,
  Keyboard,
} from 'react-native';
import { useRouter } from 'expo-router';
import GameCard from '../../components/GameCard';
import { getStats, saveRecord, getRanking } from '../../services/api';
import { useGame } from '@/contexts/GameContext';

const GAMES = [
  { id: 'hwatu', title: '화투 짝맞추기', description: '같은 그림의 화투 패를 찾아 짝을 맞춰보세요.', icon: '🎴', color: '#1B4965' },
  { id: 'pattern', title: '색상 패턴 기억', description: '색상이 깜빡이는 순서를 기억하고 따라해 보세요.', icon: '🎨', color: '#2D5016' },
  { id: 'numMemory', title: '숫자 기억하기', description: '화면에 나타나는 숫자를 순서대로 기억하세요.', icon: '🔢', color: '#E8B931' },
  { id: 'proverb', title: '속담 완성하기', description: '빈 칸에 알맞은 단어를 넣어 속담을 완성하세요.', icon: '📜', color: '#8B4513' },
  { id: 'calc', title: '산수 계산', description: '간단한 덧셈과 뺄셈 문제를 풀어보세요.', icon: '🧮', color: '#C73E3A' },
  { id: 'sequence', title: '순서 맞추기', description: '그림들을 논리적인 순서대로 배열하세요.', icon: '🔄', color: '#6B5B95' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const {
    playerName, setPlayerName,
    isLoggedIn, setIsLoggedIn,
    sessionScores, resetSessionScores,
    bestScores, setBestScores,
    stats, setStats,
    logout,
    requestGameExplain,
  } = useGame();

  const [isLoading, setIsLoading] = useState(false);
  const [showRanking, setShowRanking] = useState(false);
  const [rankingData, setRankingData] = useState<any[]>([]);
  const [rankingLoading, setRankingLoading] = useState(false);
  const [inputName, setInputName] = useState('');

  const handleLogin = async () => {
    if (!inputName.trim()) {
      Alert.alert('알림', '이름을 입력해주세요!');
      return;
    }
    
    Keyboard.dismiss();
    setIsLoading(true);
    
    try {
      const result = await getStats(inputName.trim());
      
      if (result.success && result.stats) {
        const s = result.stats;
        setStats({
          totalGames: s.total_games || 0,
          bestScore: s.best_score || 0,
          avgScore: Math.round(s.avg_score) || 0,
        });
        setBestScores({
          hwatu: s.best_hwatu || 0,
          pattern: s.best_pattern || 0,
          memory: s.best_memory || 0,
          proverb: s.best_proverb || 0,
          calc: s.best_calc || 0,
          sequence: s.best_sequence || 0,
        });
      }
    } catch (error) {
      console.error('DB 연결 오류:', error);
    }
    
    setPlayerName(inputName.trim());
    setIsLoading(false);
    setIsLoggedIn(true);
  };

  const handleGamePress = (gameId: string) => {
    requestGameExplain(gameId);
    router.push(`/games/${gameId}` as any);
  };

  const handleSaveRecord = async () => {
    const totalSessionScore = Object.values(sessionScores).reduce((a, b) => a + b, 0);
    
    if (totalSessionScore === 0) {
      Alert.alert('알림', '저장할 기록이 없습니다.\n게임을 먼저 플레이해주세요!');
      return;
    }

    setIsLoading(true);
    
    try {
      const result = await saveRecord({
        player_name: playerName,
        hwatu_score: sessionScores.hwatu,
        pattern_score: sessionScores.pattern,
        memory_score: sessionScores.memory,
        proverb_score: sessionScores.proverb,
        calc_score: sessionScores.calc,
        sequence_score: sessionScores.sequence,
      });

      if (result.success) {
        Alert.alert('🎉 저장 완료!', `${result.session_number}번째 기록이 저장되었습니다.\n총점: ${totalSessionScore}점`);
        
        const statsResult = await getStats(playerName);
        if (statsResult.success && statsResult.stats) {
          const s = statsResult.stats;
          setStats({
            totalGames: s.total_games || 0,
            bestScore: s.best_score || 0,
            avgScore: Math.round(s.avg_score) || 0,
          });
          setBestScores({
            hwatu: s.best_hwatu || 0,
            pattern: s.best_pattern || 0,
            memory: s.best_memory || 0,
            proverb: s.best_proverb || 0,
            calc: s.best_calc || 0,
            sequence: s.best_sequence || 0,
          });
        }
      } else {
        Alert.alert('오류', result.error || '저장에 실패했습니다.');
      }
    } catch (error) {
      Alert.alert('오류', 'DB 연결에 실패했습니다.');
    }
    
    setIsLoading(false);
  };

  const handleShowRanking = async () => {
    setShowRanking(true);
    setRankingLoading(true);
    
    try {
      const result = await getRanking();
      if (result.success && result.ranking) {
        setRankingData(result.ranking);
      }
    } catch (error) {
      console.error('랭킹 로드 오류:', error);
    }
    
    setRankingLoading(false);
  };

  const handleRestart = () => {
    Alert.alert(
      '다시 시작',
      '현재 세션의 점수가 초기화됩니다.\n계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: resetSessionScores },
      ]
    );
  };

  const handleLogout = () => {
    Alert.alert(
      '다른 사용자로 전환',
      '저장하지 않은 점수는 사라집니다.\n계속하시겠습니까?',
      [
        { text: '취소', style: 'cancel' },
        { text: '확인', onPress: () => { logout(); setInputName(''); } },
      ]
    );
  };

  const totalSessionScore = Object.values(sessionScores).reduce((a, b) => a + b, 0);

  const getGameScore = (gameId: string) => {
    const sessionKey = gameId === 'numMemory' ? 'memory' : gameId;
    const sessionScore = sessionScores[sessionKey as keyof typeof sessionScores] || 0;
    const bestScore = bestScores[sessionKey as keyof typeof bestScores] || 0;
    return sessionScore > 0 ? sessionScore : bestScore;
  };

  const isGameCompleted = (gameId: string) => {
    const sessionKey = gameId === 'numMemory' ? 'memory' : gameId;
    return (sessionScores[sessionKey as keyof typeof sessionScores] || 0) > 0;
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F5F0E6' }}>
      <ScrollView 
        style={styles.container}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>🧠 두뇌 건강 게임</Text>
          <Text style={styles.headerSubtitle}>즐겁게 두뇌를 단련해요!</Text>
        </View>

        <View style={styles.playerSection}>
          {!isLoggedIn ? (
            <View style={styles.loginForm}>
              <Text style={styles.label}>이름을 입력하세요</Text>
              <TextInput
                style={styles.input}
                value={inputName}
                onChangeText={setInputName}
                placeholder="이름"
                placeholderTextColor="#999"
                onSubmitEditing={handleLogin}
                returnKeyType="done"
              />
              <TouchableOpacity 
                style={[styles.loginButton, isLoading && styles.buttonDisabled]} 
                onPress={handleLogin}
                disabled={isLoading}
              >
                <Text style={styles.loginButtonText}>
                  {isLoading ? '불러오는 중...' : '시작하기'}
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.scoreBoard}>
              <Text style={styles.welcomeText}>{playerName}님 환영합니다!</Text>
              
              <View style={styles.scoreRow}>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>총 게임</Text>
                  <Text style={styles.scoreValue}>{stats.totalGames}회</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>최고 점수</Text>
                  <Text style={styles.scoreValue}>{stats.bestScore}점</Text>
                </View>
                <View style={styles.scoreItem}>
                  <Text style={styles.scoreLabel}>평균</Text>
                  <Text style={styles.scoreValue}>{stats.avgScore}점</Text>
                </View>
              </View>

              <View style={styles.sessionScore}>
                <Text style={styles.sessionLabel}>이번 점수</Text>
                <Text style={styles.sessionValue}>{totalSessionScore}점</Text>
              </View>

              <View style={styles.buttonContainer}>
                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.saveButton]}
                    onPress={handleSaveRecord}
                    disabled={isLoading}
                  >
                    <Text style={styles.actionButtonText}>💾 기록 저장하기</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.rankingButton]}
                    onPress={handleShowRanking}
                  >
                    <Text style={[styles.actionButtonText, styles.rankingButtonText]}>🏆 전체 랭킹</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.buttonRow}>
                  <TouchableOpacity 
                    style={[styles.actionButton, styles.restartButton]}
                    onPress={handleRestart}
                  >
                    <Text style={styles.actionButtonText}>🔄 다시 시작</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={[styles.actionButton, styles.logoutButton]}
                    onPress={handleLogout}
                  >
                    <Text style={styles.actionButtonText}>👋 다른 이름으로</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          )}
        </View>

        <View style={styles.gamesSection}>
          <Text style={styles.sectionTitle}>🎮 게임 선택</Text>
          {GAMES.map((game) => (
            <GameCard
              key={game.id}
              title={game.title}
              description={game.description}
              icon={game.icon}
              color={game.color}
              score={getGameScore(game.id)}
              completed={isGameCompleted(game.id)}
              disabled={!isLoggedIn}
              onPress={() => handleGamePress(game.id)}
            />
          ))}
        </View>
        <View style={{ height: 200 }} />
      </ScrollView>

      <Modal
        visible={showRanking}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowRanking(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>🏆 전체 랭킹</Text>
              <TouchableOpacity onPress={() => setShowRanking(false)}>
                <Text style={styles.modalClose}>✕</Text>
              </TouchableOpacity>
            </View>
            
            {rankingLoading ? (
              <Text style={styles.loadingText}>불러오는 중...</Text>
            ) : (
              <FlatList
                data={rankingData}
                keyExtractor={(item, index) => index.toString()}
                renderItem={({ item, index }) => (
                  <View style={[
                    styles.rankingItem,
                    item.player_name === playerName && styles.rankingItemMe
                  ]}>
                    <Text style={styles.rankingRank}>
                      {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `${index + 1}`}
                    </Text>
                    <Text style={styles.rankingName}>{item.player_name}</Text>
                    <Text style={styles.rankingScore}>{item.best_score}점</Text>
                  </View>
                )}
                ListEmptyComponent={
                  <Text style={styles.emptyText}>아직 기록이 없습니다.</Text>
                }
              />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    backgroundColor: '#C73E3A',
    padding: 24,
    paddingTop: 60,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  headerTitle: { fontSize: 28, fontWeight: 'bold', color: '#fff', textAlign: 'center' },
  headerSubtitle: { fontSize: 16, color: 'rgba(255,255,255,0.9)', textAlign: 'center', marginTop: 8 },
  playerSection: {
    margin: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  loginForm: { alignItems: 'center' },
  label: { fontSize: 18, fontWeight: '600', color: '#1a1a1a', marginBottom: 12 },
  input: {
    width: '100%',
    height: 50,
    borderWidth: 2,
    borderColor: '#1B4965',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    marginBottom: 16,
  },
  loginButton: { backgroundColor: '#1B4965', paddingVertical: 14, paddingHorizontal: 40, borderRadius: 25 },
  buttonDisabled: { backgroundColor: '#999' },
  loginButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  scoreBoard: { alignItems: 'center' },
  welcomeText: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 16 },
  scoreRow: { flexDirection: 'row', justifyContent: 'space-around', width: '100%', marginBottom: 16 },
  scoreItem: { alignItems: 'center' },
  scoreLabel: { fontSize: 12, color: '#666', marginBottom: 4 },
  scoreValue: { fontSize: 18, fontWeight: 'bold', color: '#C73E3A' },
  sessionScore: {
    backgroundColor: '#FFF9E6',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#E8B931',
  },
  sessionLabel: { fontSize: 12, color: '#666', textAlign: 'center' },
  sessionValue: { fontSize: 28, fontWeight: 'bold', color: '#E8B931', textAlign: 'center' },
  buttonContainer: { width: '100%' },
  buttonRow: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  actionButton: { 
    flex: 1,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveButton: { backgroundColor: '#2D5016' },
  rankingButton: { backgroundColor: '#E8B931' },
  restartButton: { backgroundColor: '#C73E3A' },
  logoutButton: { backgroundColor: '#1B4965' },
  actionButtonText: { color: '#fff', fontSize: 15, fontWeight: '700', textAlign: 'center' },
  rankingButtonText: { color: '#1a1a1a' },
  gamesSection: { marginTop: 8 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#1a1a1a', marginLeft: 20, marginBottom: 8 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: { width: '85%', maxHeight: '70%', backgroundColor: '#fff', borderRadius: 20, padding: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 12 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', color: '#1a1a1a' },
  modalClose: { fontSize: 24, color: '#999', padding: 4 },
  loadingText: { textAlign: 'center', color: '#666', paddingVertical: 20 },
  emptyText: { textAlign: 'center', color: '#666', paddingVertical: 20 },
  rankingItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 8, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  rankingItemMe: { backgroundColor: '#FFF9E6', borderRadius: 8 },
  rankingRank: { fontSize: 18, width: 40, textAlign: 'center' },
  rankingName: { flex: 1, fontSize: 16, fontWeight: '500', color: '#1a1a1a' },
  rankingScore: { fontSize: 16, fontWeight: 'bold', color: '#C73E3A' },
});