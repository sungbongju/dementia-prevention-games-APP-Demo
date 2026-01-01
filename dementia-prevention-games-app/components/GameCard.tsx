import React from 'react';
import { TouchableOpacity, Text, View, StyleSheet } from 'react-native';

interface GameCardProps {
  title: string;
  description: string;
  icon: string;
  color: string;
  score?: number;
  completed?: boolean;
  disabled?: boolean;
  onPress: () => void;
}

export default function GameCard({
  title, description, icon, color, score, completed, disabled, onPress,
}: GameCardProps) {
  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderLeftColor: color },
        completed && styles.completed,
        disabled && styles.disabled,
      ]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
    >
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Text style={styles.icon}>{icon}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description} numberOfLines={2}>{description}</Text>
        {completed && score !== undefined && (
          <Text style={styles.score}>✅ {score}점</Text>
        )}
      </View>
      {!completed && (
        <View style={styles.playButton}>
          <Text style={styles.playText}>시작</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  completed: { opacity: 0.7, backgroundColor: '#f0f9f0' },
  disabled: { opacity: 0.5 },
  iconContainer: {
    width: 60, height: 60, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center',
  },
  icon: { fontSize: 32 },
  content: { flex: 1, marginLeft: 16 },
  title: { fontSize: 18, fontWeight: 'bold', color: '#1a1a1a', marginBottom: 4 },
  description: { fontSize: 14, color: '#666', lineHeight: 20 },
  score: { fontSize: 14, fontWeight: '600', color: '#27ae60', marginTop: 4 },
  playButton: {
    backgroundColor: '#3498db',
    paddingVertical: 8, paddingHorizontal: 16, borderRadius: 20,
  },
  playText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
