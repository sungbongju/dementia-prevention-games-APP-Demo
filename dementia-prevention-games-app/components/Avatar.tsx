import React, { useRef, useState } from 'react';
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

const AVATAR_URL = 'https://dementia-prevent-game-bot-sbj.netlify.app';
const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const PIP_SMALL = { width: 180, height: 120 };
const PIP_LARGE = { width: 300, height: 200 };
const CIRCLE_SIZE = 60;

interface AvatarProps {
  playerName: string;
}

export default function Avatar({ playerName }: AvatarProps) {
  const webViewRef = useRef<WebView>(null);
  
  const [pipSize, setPipSize] = useState(PIP_SMALL);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isClosed, setIsClosed] = useState(false);
  
  const lastTap = useRef<number>(0);
  
  // 초기 위치 (우측 하단 구석)
  const pan = useRef(new Animated.ValueXY({ 
    x: SCREEN_WIDTH - PIP_SMALL.width - 16, 
    y: SCREEN_HEIGHT - PIP_SMALL.height - 50 
  })).current;

  // 드래그용 (WebView 영역)
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

  // 동그라미 드래그용
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
    setIsClosed(false);
  };

  const injectedJS = `
    window.addEventListener('load', function() {
      window.postMessage(JSON.stringify({
        type: 'SET_PLAYER',
        playerName: '${playerName}'
      }), '*');
    });
    true;
  `;

  // 닫힌 상태 - AI 동그라미 버튼
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

  // 일반 PIP 상태
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

      {/* 드래그 가능한 WebView 영역 */}
      <View style={styles.dragArea} {...panResponder.panHandlers}>
        <TouchableOpacity 
          activeOpacity={1} 
          onPress={handleDoubleTap}
          style={styles.webviewWrapper}
        >
          <WebView
            ref={webViewRef}
            source={{ uri: AVATAR_URL }}
            style={styles.webview}
            injectedJavaScript={injectedJS}
            javaScriptEnabled={true}
            domStorageEnabled={true}
            allowsInlineMediaPlayback={true}
            mediaPlaybackRequiresUserAction={false}
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
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderBottomLeftRadius: 8,
  },
  controlBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  controlText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  dragArea: {
    flex: 1,
    marginTop: 28,
  },
  webviewWrapper: {
    flex: 1,
  },
  webview: {
    flex: 1,
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