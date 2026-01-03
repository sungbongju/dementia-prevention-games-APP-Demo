import React, { useRef, useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  PanResponder,
  TouchableOpacity,
  Text,
  Dimensions,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { useGame } from '@/contexts/GameContext';

const AVATAR_URL = 'https://dementia-prevent-game-bot-sbj.netlify.app';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PIP_SMALL = { width: 180, height: 100 };
const PIP_LARGE = { width: 300, height: 170 };
const CIRCLE_SIZE = 60;

interface AvatarProps {
  playerName: string;
  isInGame?: boolean;
}

export default function Avatar({ playerName, isInGame = false }: AvatarProps) {
  const webViewRef = useRef<WebView>(null);
  const { stats, bestScores, pendingGameExplain, clearGameExplain } = useGame();
  
  const [pipSize, setPipSize] = useState(PIP_SMALL);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [webViewKey, setWebViewKey] = useState(0);
  
  const lastTap = useRef<number>(0);
  
  const pan = useRef(new Animated.ValueXY({ 
    x: SCREEN_WIDTH - PIP_SMALL.width - 16, 
    y: SCREEN_HEIGHT - PIP_SMALL.height - 50 
  })).current;

  // 게임 설명 요청 감지
  useEffect(() => {
    if (pendingGameExplain && isLoaded && !isClosed) {
      console.log('📤 EXPLAIN_GAME 전송:', pendingGameExplain);
      
      const message = {
        type: 'EXPLAIN_GAME',
        game: pendingGameExplain,
      };
      
      const js = `
        (function() {
          window.postMessage(${JSON.stringify(message)}, '*');
          console.log('📤 EXPLAIN_GAME 전송됨');
        })();
        true;
      `;
      
      webViewRef.current?.injectJavaScript(js);
      clearGameExplain();
    }
  }, [pendingGameExplain, isLoaded, isClosed, clearGameExplain]);

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
        const currentX = (pan.x as any)._value;
        const currentY = (pan.y as any)._value;
        const currentSize = isExpanded ? PIP_LARGE : PIP_SMALL;
        const maxX = SCREEN_WIDTH - currentSize.width - 10;
        const maxY = SCREEN_HEIGHT - currentSize.height - 50;
        
        Animated.spring(pan, {
          toValue: {
            x: Math.max(10, Math.min(currentX, maxX)),
            y: Math.max(50, Math.min(currentY, maxY)),
          },
          useNativeDriver: false,
        }).start();
      },
    })
  ).current;

  const circlePanResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5 || Math.abs(gestureState.dy) > 5;
      },
      onPanResponderGrant: () => {
        pan.setOffset({
          x: (pan.x as any)._value,
          y: (pan.y as any)._value,
        });
      },
      onPanResponderMove: Animated.event([null, { dx: pan.x, dy: pan.y }], {
        useNativeDriver: false,
      }),
      onPanResponderRelease: () => {
        pan.flattenOffset();
      },
    })
  ).current;

  const handleDoubleTap = () => {
    const now = Date.now();
    if (now - lastTap.current < 300) {
      const currentX = (pan.x as any)._value;
      const currentY = (pan.y as any)._value;
      
      if (isExpanded) {
        const newX = currentX + (PIP_LARGE.width - PIP_SMALL.width);
        const newY = currentY + (PIP_LARGE.height - PIP_SMALL.height);
        pan.setValue({ x: newX, y: newY });
        setPipSize(PIP_SMALL);
        setIsExpanded(false);
      } else {
        const newX = currentX - (PIP_LARGE.width - PIP_SMALL.width);
        const newY = currentY - (PIP_LARGE.height - PIP_SMALL.height);
        pan.setValue({ x: newX, y: newY });
        setPipSize(PIP_LARGE);
        setIsExpanded(true);
      }
    }
    lastTap.current = now;
  };

  const handleClose = () => {
    const js = `
      (function() {
        window.postMessage({ type: 'STOP_AVATAR' }, '*');
      })();
      true;
    `;
    webViewRef.current?.injectJavaScript(js);
    
    const currentX = (pan.x as any)._value;
    const currentY = (pan.y as any)._value;
    const currentSize = isExpanded ? PIP_LARGE : PIP_SMALL;
    
    const circleX = currentX + currentSize.width - CIRCLE_SIZE;
    const circleY = currentY + currentSize.height - CIRCLE_SIZE;
    
    pan.setValue({ x: circleX, y: circleY });
    setIsClosed(true);
  };

  const handleReopen = () => {
    const currentX = (pan.x as any)._value;
    const currentY = (pan.y as any)._value;
    const targetSize = isExpanded ? PIP_LARGE : PIP_SMALL;
    
    const pipX = currentX - targetSize.width + CIRCLE_SIZE;
    const pipY = currentY - targetSize.height + CIRCLE_SIZE;
    
    pan.setValue({ x: pipX, y: pipY });
    
    setWebViewKey(prev => prev + 1);
    setIsLoaded(false);
    setIsClosed(false);
  };

  const sendStartMessage = () => {
    const message = {
      type: 'START_AVATAR',
      name: playerName,
      stats: {
        total_games: stats.totalGames,
        best_score: stats.bestScore,
        avg_score: stats.avgScore,
        best_hwatu: bestScores.hwatu,
        best_pattern: bestScores.pattern,
        best_memory: bestScores.memory,
        best_proverb: bestScores.proverb,
        best_calc: bestScores.calc,
        best_sequence: bestScores.sequence,
      }
    };
    
    const js = `
      (function() {
        window.postMessage(${JSON.stringify(message)}, '*');
        console.log('📤 START_AVATAR 전송됨');
      })();
      true;
    `;
    
    webViewRef.current?.injectJavaScript(js);
    console.log('📤 START_AVATAR 전송:', message);
  };

  const handleWebViewLoad = () => {
    console.log('🌐 WebView 로드 완료');
    setIsLoaded(true);
    
    setTimeout(() => {
      sendStartMessage();
    }, 2000);
  };

  if (isClosed) {
    return (
      <Animated.View
        style={[
          styles.closedButton,
          { transform: pan.getTranslateTransform() },
        ]}
        {...circlePanResponder.panHandlers}
      >
        <TouchableOpacity 
          onPress={handleReopen} 
          style={styles.reopenButton}
          activeOpacity={0.7}
        >
          <Text style={styles.aiEmoji}>🤖</Text>
        </TouchableOpacity>
      </Animated.View>
    );
  }

  return (
    <Animated.View
      style={[
        styles.pipContainer,
        {
          width: pipSize.width,
          height: pipSize.height,
          transform: pan.getTranslateTransform(),
        },
      ]}
    >
      {/* X 버튼 */}
      <View style={styles.controlBar}>
        <TouchableOpacity 
          onPress={handleClose} 
          style={styles.controlBtn}
          activeOpacity={0.6}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.controlText}>×</Text>
        </TouchableOpacity>
      </View>

      {/* 로딩 표시 */}
      {!isLoaded && (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>로딩 중...</Text>
        </View>
      )}

      {/* WebView */}
      <View 
        style={styles.webviewContainer} 
        {...panResponder.panHandlers}
      >
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={handleDoubleTap}
          style={styles.webviewWrapper}
        >
          <WebView
            key={webViewKey}
            ref={webViewRef}
            source={{ uri: AVATAR_URL }}
            style={styles.webview}
            onLoad={handleWebViewLoad}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
            mediaCapturePermissionGrantType="grant"
            allowsProtectedMedia={true}
            userAgent="Mozilla/5.0 (Linux; Android 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.120 Mobile Safari/537.36"
          />
        </TouchableOpacity>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  pipContainer: {
    position: 'absolute',
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 9999,
  },
  controlBar: {
    position: 'absolute',
    top: 0,
    right: 0,
    zIndex: 10001,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderBottomLeftRadius: 8,
  },
  controlBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  controlText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  webviewContainer: {
    flex: 1,
  },
  webviewWrapper: {
    flex: 1,
  },
  webview: {
    flex: 1,
  },
  loadingContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    zIndex: 10000,
  },
  loadingText: {
    color: '#fff',
    fontSize: 14,
  },
  closedButton: {
    position: 'absolute',
    zIndex: 9999,
  },
  reopenButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#C73E3A',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  aiEmoji: {
    fontSize: 28,
  },
});