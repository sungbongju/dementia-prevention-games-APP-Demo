/**
 * 내 기록 보기 모달
 * 회차별 상세 기록 + 통계
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  ScrollView,
} from 'react-native';
import { getRecords, getStats } from '@/services/api';

const COLORS = {
  hanjiCream: '#F5F0E6',
  dancheongRed: '#C73E3A',
  dancheongBlue: '#1B4965',
  dancheongGreen: '#2D5016',
  white: '#FFFFFF',
  lightGray: '#F0F0F0',
  darkGray: '#666666',
  inkBlack: '#1A1A1A',
};

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

interface PlayerStats {
  total_games: number;
  best_score: number;
  avg_score: number;
  best_hwatu: number;
  best_pattern: number;
  best_memory: number;
  best_proverb: number;
  best_calc: number;
  best_sequence: number;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  playerName: string;
}

export default function MyRecordsModal({ visible, onClose, playerName }: Props) {
  const [records, setRecords] = useState<GameRecord[]>([]);
  const [stats, setStats] = useState<PlayerStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'records' | 'stats'>('records');

  useEffect(() => {
    if (visible && playerName) {
      loadData();
    }
  }, [visible, playerName]);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [recordsResult, statsResult] = await Promise.all([
        getRecords(playerName),
        getStats(playerName),
      ]);

      if (recordsResult.success && recordsResult.records) {
        setRecords(recordsResult.records.reverse()); // 최신순
      }
      if (statsResult.success && statsResult.stats) {
        setStats(statsResult.stats);
      }
    } catch (error) {
      console.error('Load records error:', error);
    }
    setIsLoading(false);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()} ${date.getHours()}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  const renderRecordItem = ({ item }: { item: GameRecord }) => (
    <View style={styles.recordItem}>
      <View style={styles.recordHeader}>
        <Text style={styles.sessionNumber}>{item.session_number}회차</Text>
        <Text style={styles.recordDate}>{formatDate(item.created_at)}</Text>
        <Text style={styles.totalScore}>{item.total_score}점</Text>
      </View>
      <View style={styles.recordScores}>
        <View style={styles.scoreChip}><Text>🎴 {item.hwatu_score}</Text></View>
        <View style={styles.scoreChip}><Text>🎨 {item.pattern_score}</Text></View>
        <View style={styles.scoreChip}><Text>🔢 {item.memory_score}</Text></View>
        <View style={styles.scoreChip}><Text>📜 {item.proverb_score}</Text></View>
        <View style={styles.scoreChip}><Text>🧮 {item.calc_score}</Text></View>
        <View style={styles.scoreChip}><Text>🔄 {item.sequence_score}</Text></View>
      </View>
    </View>
  );

  const renderStatsTab = () => {
    if (!stats) {
      return <Text style={styles.emptyText}>통계 정보가 없습니다</Text>;
    }

    return (
      <ScrollView style={styles.statsContainer}>
        {/* 전체 통계 */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>📊 전체 통계</Text>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{stats.total_games}</Text>
              <Text style={styles.statLabel}>총 플레이</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statValue, { color: COLORS.dancheongRed }]}>{stats.best_score}</Text>
              <Text style={styles.statLabel}>최고 점수</Text>
            </View>
            <View style={styles.statItem}>
              <Text style={styles.statValue}>{Math.round(stats.avg_score)}</Text>
              <Text style={styles.statLabel}>평균 점수</Text>
            </View>
          </View>
        </View>

        {/* 게임별 최고 기록 */}
        <View style={styles.statsCard}>
          <Text style={styles.statsTitle}>🏆 게임별 최고 기록</Text>
          <View style={styles.gameStatsGrid}>
            {[
              { icon: '🎴', name: '화투', score: stats.best_hwatu },
              { icon: '🎨', name: '색상패턴', score: stats.best_pattern },
              { icon: '🔢', name: '숫자기억', score: stats.best_memory },
              { icon: '📜', name: '속담', score: stats.best_proverb },
              { icon: '🧮', name: '산수', score: stats.best_calc },
              { icon: '🔄', name: '순서', score: stats.best_sequence },
            ].map((game, index) => (
              <View key={index} style={styles.gameStatItem}>
                <Text style={styles.gameStatIcon}>{game.icon}</Text>
                <Text style={styles.gameStatName}>{game.name}</Text>
                <Text style={styles.gameStatScore}>{game.score || 0}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* 헤더 */}
          <View style={styles.header}>
            <Text style={styles.headerTitle}>📋 {playerName}님의 기록</Text>
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>✕</Text>
            </TouchableOpacity>
          </View>

          {/* 탭 */}
          <View style={styles.tabContainer}>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'records' && styles.activeTab]}
              onPress={() => setActiveTab('records')}
            >
              <Text style={[styles.tabText, activeTab === 'records' && styles.activeTabText]}>
                기록 목록
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === 'stats' && styles.activeTab]}
              onPress={() => setActiveTab('stats')}
            >
              <Text style={[styles.tabText, activeTab === 'stats' && styles.activeTabText]}>
                통계
              </Text>
            </TouchableOpacity>
          </View>

          {/* 콘텐츠 */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.dancheongBlue} />
            </View>
          ) : activeTab === 'records' ? (
            records.length > 0 ? (
              <FlatList
                data={records}
                renderItem={renderRecordItem}
                keyExtractor={(item) => String(item.id)}
                contentContainerStyle={styles.listContainer}
              />
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyIcon}>📭</Text>
                <Text style={styles.emptyText}>저장된 기록이 없습니다</Text>
              </View>
            )
          ) : (
            renderStatsTab()
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContainer: {
    backgroundColor: COLORS.hanjiCream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
    minHeight: '50%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.inkBlack,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButtonText: {
    fontSize: 18,
    color: COLORS.darkGray,
  },
  tabContainer: {
    flexDirection: 'row',
    padding: 10,
    gap: 8,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.lightGray,
    alignItems: 'center',
  },
  activeTab: {
    backgroundColor: COLORS.dancheongBlue,
  },
  tabText: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.darkGray,
  },
  activeTabText: {
    color: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  listContainer: {
    padding: 16,
  },
  recordItem: {
    backgroundColor: COLORS.white,
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sessionNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dancheongBlue,
  },
  recordDate: {
    fontSize: 14,
    color: COLORS.darkGray,
  },
  totalScore: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.dancheongRed,
  },
  recordScores: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  scoreChip: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyText: {
    fontSize: 16,
    color: COLORS.darkGray,
  },
  statsContainer: {
    flex: 1,
    padding: 16,
  },
  statsCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
  },
  statsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.inkBlack,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.dancheongBlue,
  },
  statLabel: {
    fontSize: 14,
    color: COLORS.darkGray,
    marginTop: 4,
  },
  gameStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gameStatItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    padding: 12,
    borderRadius: 10,
  },
  gameStatIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  gameStatName: {
    flex: 1,
    fontSize: 14,
    color: COLORS.inkBlack,
  },
  gameStatScore: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.dancheongBlue,
  },
});
