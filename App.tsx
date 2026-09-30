import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useFonts } from 'expo-font';
import Ionicons from '@expo/vector-icons/Ionicons';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { StoreProvider } from './lib/store';
import { colors } from './lib/theme';
import HomeScreen from './screens/HomeScreen';
import LibraryScreen from './screens/LibraryScreen';
import FavoritesScreen from './screens/FavoritesScreen';
import ProfileScreen from './screens/ProfileScreen';
import DetailScreen from './screens/DetailScreen';
import PlayScreen from './screens/PlayScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, border: colors.border, primary: colors.pink },
};

const ICONS: Record<string, [any, any]> = {
  Accueil: ['home', 'home-outline'],
  Jeux: ['game-controller', 'game-controller-outline'],
  Favoris: ['heart', 'heart-outline'],
  Profil: ['person', 'person-outline'],
};

function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.pink,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: Platform.OS === 'web' ? 62 : undefined, paddingTop: 4 },
        tabBarLabelStyle: { fontWeight: '700', fontSize: 11, marginBottom: Platform.OS === 'web' ? 6 : 0 },
        tabBarIcon: ({ focused, color, size }) => (
          <Ionicons name={ICONS[route.name][focused ? 0 : 1]} size={size} color={color} />
        ),
      })}
    >
      <Tab.Screen name="Accueil" component={HomeScreen} />
      <Tab.Screen name="Jeux" component={LibraryScreen} />
      <Tab.Screen name="Favoris" component={FavoritesScreen} />
      <Tab.Screen name="Profil" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded] = useFonts({ ...Ionicons.font });
  if (!fontsLoaded) return null;

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <StoreProvider>
          <View style={styles.outer}>
            <View style={styles.inner}>
              <NavigationContainer theme={theme}>
                <Stack.Navigator
                  screenOptions={{
                    headerStyle: { backgroundColor: colors.bg },
                    headerTintColor: '#fff',
                    headerTitleStyle: { fontWeight: '800' },
                    headerShadowVisible: false,
                    headerBackTitle: 'Retour',
                    contentStyle: { backgroundColor: colors.bg },
                  }}
                >
                  <Stack.Screen name="Tabs" component={Tabs} options={{ headerShown: false }} />
                  <Stack.Screen name="Detail" component={DetailScreen} />
                  <Stack.Screen name="Play" component={PlayScreen} options={{ presentation: 'fullScreenModal', animation: 'slide_from_bottom' }} />
                </Stack.Navigator>
              </NavigationContainer>
            </View>
          </View>
          <StatusBar style="light" />
        </StoreProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#05050F' },
  outer: { flex: 1, backgroundColor: '#05050F', alignItems: 'center' },
  inner: { flex: 1, width: '100%', maxWidth: 820, backgroundColor: colors.bg },
});
