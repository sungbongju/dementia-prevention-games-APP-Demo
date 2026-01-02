import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/components/useColorScheme';
import { GameProvider, useGame } from '@/contexts/GameContext';
import Avatar from '@/components/Avatar';

export {
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  initialRouteName: '(tabs)',
};

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  useEffect(() => {
    if (error) throw error;
  }, [error]);

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <GameProvider>
      <RootLayoutNav />
    </GameProvider>
  );
}

function RootLayoutNav() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
      
      {/* 🆕 전역 Avatar */}
      <GlobalAvatar />
    </ThemeProvider>
  );
}

// 🆕 전역 Avatar 컴포넌트
function GlobalAvatar() {
  const { isLoggedIn, playerName } = useGame();
  const pathname = usePathname();
  
  // 게임 화면인지 확인
  const isInGame = pathname.startsWith('/games');
  
  if (!isLoggedIn) return null;
  
  return <Avatar playerName={playerName} isInGame={isInGame} />;
}3