/**
 * 인지 대시보드 화면
 * 5대 인지 영역 시각화 + 점수 추이 + AI 인사이트
 */

import { useGame } from '@/contexts/GameContext';
import { getRecords } from '@/services/api';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  View
} from 'react-native';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// 색상 테마
const COLORS = {
  hanjiCream: '#F5F0E6',
  dancheongRed: '#C73E3A',
  dancheongBlue: '#1B4965',
  dancheongGreen: '#2D5016',
  dancheongYellow: '#E8B931',
  woodBrown: '#8B4513',
  inkBlack: '#1A1A1A',
  white: '#FFFFFF',
  lightGray: '#F0F0F0',
  darkGray: '#666666',
};

// 인지 영역 정보
const COGNITIVE_AREAS = [
  { key: 'memory', name: '기억력', icon: '🧠', color: COLORS.dancheongRed },
  { key: 'attention', name: '주의력', icon: '👁️', color: COLORS.dancheongGreen },
  { key: 'language', name: '언어력', icon: '💬', color: COLORS.woodBrown },
  { key: 'calculation', name: '계산력', icon: '🔢', color: COLORS.dancheongBlue },
  { key: 'reasoning', name: '추론력', icon: '🔄', color: '#6B5B95' },
];

interface GameRecord {
  id: number;
  session_number: number;
  hwatu_score: number;
  pattern_score: number;
  memory_score: number;
  proverb_score: number;
  calc_score: number;
  sequence_score: number;
  total_score: number;
  created_at: string;
}

interface CognitiveScores {
  memory: number;
  attention: number;
  language: number;
  calculation: number;
  reasoning: number;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { playerName, sessionScores, isLoggedIn } = useGame();
  
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [cognitiveScores, setCognitiveScores] = useState<CognitiveScores>({
    memory: 0, attention: 0, language: 0, calculation: 0, reasoning: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [weakArea, setWeakArea] = useState<{ name: string; score: number } | null>(null);

  useEffect(() => {
    if (playerName) {
      loadDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [playerName]);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      const result = await getRecords(playerName);
      if (result.success && result.records) {
        setRecords(result.records);
        calculateCognitiveScores(result.records);
      }
    } catch (error) {
      console.error('Dashboard load error:', error);
    }
    setIsLoading(false);
  };

  const calculateCognitiveScores = (recordList: GameRecord[]) => {
    if (recordList.length === 0) {
      setCognitiveScores({ memory: 0, attention: 0, language: 0, calculation: 0, reasoning: 0 });
      return;
    }

    // 각 회차별 인지 점수 배열
    const memoryScores: number[] = [];
    const attentionScores: number[] = [];
    const languageScores: number[] = [];
    const calculationScores: number[] = [];
    const reasoningScores: number[] = [];

    recordList.forEach(record => {
      const hwatu = Number(record.hwatu_score) || 0;
      const memory = Number(record.memory_score) || 0;
      const pattern = Number(record.pattern_score) || 0;
      const proverb = Number(record.proverb_score) || 0;
      const calc = Number(record.calc_score) || 0;
      const sequence = Number(record.sequence_score) || 0;

      // 기억력: 해당 회차의 (화투 + 숫자기억) / 2
      memoryScores.push((hwatu + memory) / 2);
      attentionScores.push(pattern);
      languageScores.push(proverb);
      calculationScores.push(calc);
      reasoningScores.push(sequence);
    });

    // 전체 평균 계산 (각 점수는 이미 0~100 범위)
    const avg = (arr: number[]) => arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0;

    const scores: CognitiveScores = {
      memory: avg(memoryScores),
      attention: avg(attentionScores),
      language: avg(languageScores),
      calculation: avg(calculationScores),
      reasoning: avg(reasoningScores),
    };

    setCognitiveScores(scores);

    // 취약 영역 찾기 (70% 미만 중 가장 낮은 것)
    const entries = Object.entries(scores).filter(([_, score]) => score > 0 && score < 70);
    if (entries.length > 0) {
      const [weakKey, weakScore] = entries.reduce((min, curr) => curr[1] < min[1] ? curr : min);
      const areaInfo = COGNITIVE_AREAS.find(a => a.key === weakKey);
      setWeakArea({ name: areaInfo?.name || weakKey, score: weakScore });
    } else {
      setWeakArea(null);
    }
  };

  const generateInsights = (): string[] => {
    const insights: string[] = [];
    
    if (records.length === 0) {
      insights.push('📋 게임을 완료하면 상세한 분석 결과를 볼 수 있어요.');
      return insights;
    }

    // 전체 평균 분석
    const avgTotal = records.reduce((sum, r) => sum + r.total_score, 0) / records.length;
    if (avgTotal >= 500) {
      insights.push('🌟 훌륭해요! 전체적으로 매우 높은 인지 능력을 보여주고 계세요.');
    } else if (avgTotal >= 400) {
      insights.push('👍 좋아요! 꾸준히 연습하시면 더 좋은 결과를 얻을 수 있어요.');
    } else {
      insights.push('💪 조금씩 연습하면 실력이 늘어날 거예요. 화이팅!');
    }

    // 취약 영역
    if (weakArea) {
      const gameRecommend: Record<string, string> = {
        '기억력': '화투 짝맞추기나 숫자 기억 게임',
        '주의력': '색상 패턴 기억 게임',
        '언어력': '속담 완성하기 게임',
        '계산력': '산수 계산 게임',
        '추론력': '순서 맞추기 게임',
      };
      insights.push(`⚠️ ${weakArea.name}이 ${weakArea.score}%로 다소 낮아요. ${gameRecommend[weakArea.name]}을 더 연습해 보세요!`);
    }

    // 플레이 횟수
    if (records.length >= 10) {
      insights.push(`🎮 벌써 ${records.length}번이나 플레이하셨네요! 꾸준함이 최고의 비결이에요.`);
    }

    return insights;
  };

  if (!isLoggedIn) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyState}>
          <Text style={styles.emptyIcon}>🔒</Text>
          <Text style={styles.emptyText}>먼저 이름을 입력해주세요</Text>
        </View>
      </View>
    );
  }

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.dancheongBlue} />
        <Text style={styles.loadingText}>데이터를 불러오는 중...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 인지 대시보드</Text>
        <Text style={styles.headerSubtitle}>{playerName}님의 두뇌 건강 현황</Text>
      </View>

      {/* 5대 인지 영역 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>🧠 5대 인지 영역</Text>
        <Text style={styles.cardSubtitle}>전체 회차 평균 점수</Text>
        
        {COGNITIVE_AREAS.map((area) => {
          const score = cognitiveScores[area.key as keyof CognitiveScores];
          return (
            <View key={area.key} style={styles.cognitiveRow}>
              <View style={styles.cognitiveLabel}>
                <Text style={styles.cognitiveIcon}>{area.icon}</Text>
                <Text style={styles.cognitiveName}>{area.name}</Text>
              </View>
              <View style={styles.barContainer}>
                <View 
                  style={[
                    styles.barFill, 
                    { 
                      width: `${score > 0 ? Math.max(score, 15) : 0}%`,
                      backgroundColor: area.color,
                    }
                  ]} 
                />
              </View>
              <Text style={styles.barPercent}>{score > 0 ? `${score}%` : '-'}</Text>
            </View>
          );
        })}
      </View>

      {/* 취약 영역 알림 */}
      {weakArea && (
        <View style={styles.alertCard}>
          <Text style={styles.alertIcon}>⚠️</Text>
          <Text style={styles.alertText}>
            {weakArea.name} 영역이 {weakArea.score}%로 다소 낮아요.{'\n'}
            해당 게임을 더 연습해 보세요!
          </Text>
        </View>
      )}

      {/* 최근 점수 추이 */}
      {records.length > 0 && (
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📈 최근 점수 추이</Text>
          <View style={styles.trendContainer}>
            {records.slice(-5).map((record) => (
              <View key={record.id} style={styles.trendItem}>
                <View 
                  style={[
                    styles.trendBar, 
                    { height: Math.max(20, (record.total_score / 600) * 100) }
                  ]} 
                />
                <Text style={styles.trendScore}>{record.total_score}</Text>
                <Text style={styles.trendSession}>{record.session_number}회</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {/* AI 인사이트 */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>💡 AI 분석</Text>
        {generateInsights().map((insight, index) => (
          <View key={index} style={styles.insightItem}>
            <Text style={styles.insightText}>{insight}</Text>
          </View>
        ))}
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.hanjiCream,
  },
  contentContainer: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.hanjiCream,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: COLORS.darkGray,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyIcon: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 18,
    color: COLORS.darkGray,
  },
  header: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 26,
    fontWeight: 'bold',
    color: COLORS.inkBlack,
  },
  headerSubtitle: {
    fontSize: 16,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.inkBlack,
    marginBottom: 8,
  },
  cardSubtitle: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginBottom: 16,
  },
  cognitiveRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cognitiveLabel: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 85,
  },
  cognitiveIcon: {
    fontSize: 18,
    marginRight: 6,
  },
  cognitiveName: {
    fontSize: 14,
    color: COLORS.inkBlack,
  },
  barContainer: {
    flex: 1,
    height: 24,
    backgroundColor: COLORS.lightGray,
    borderRadius: 12,
    overflow: 'hidden',
    marginRight: 10,
  },
  barFill: {
    height: '100%',
    borderRadius: 12,
  },
  barPercent: {
    width: 45,
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.inkBlack,
    textAlign: 'right',
  },
  alertCard: {
    backgroundColor: '#FFF3CD',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: COLORS.dancheongYellow,
  },
  alertIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.inkBlack,
    lineHeight: 22,
  },
  trendContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: 140,
    paddingTop: 20,
  },
  trendItem: {
    alignItems: 'center',
  },
  trendBar: {
    width: 40,
    backgroundColor: COLORS.dancheongBlue,
    borderRadius: 8,
    marginBottom: 8,
  },
  trendScore: {
    fontSize: 14,
    fontWeight: 'bold',
    color: COLORS.inkBlack,
  },
  trendSession: {
    fontSize: 12,
    color: COLORS.darkGray,
  },
  insightItem: {
    backgroundColor: COLORS.lightGray,
    padding: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    color: COLORS.inkBlack,
    lineHeight: 22,
  },
});