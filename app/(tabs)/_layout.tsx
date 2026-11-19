import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import { ColorValue, StyleSheet } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';

import { AppProvider } from '@/context/AppContext';
import { ProfileProvider } from '@/context/ProfileContext';
import { colors, radius, shadows, spacing } from '@/theme';

type TabIconName = keyof typeof Ionicons.glyphMap;

interface TabIconProps {
  name: TabIconName;
  color: ColorValue;
  size: number;
  focused: boolean;
}

function TabIcon({ name, color, size, focused }: TabIconProps) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withSpring(focused ? 1.12 : 1, { damping: 14, stiffness: 280 });
  }, [focused, scale]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name={name} size={size} color={color} />
    </Animated.View>
  );
}

interface TabBarIconProps {
  focused: boolean;
  color: ColorValue;
  size: number;
}

function HomeTabIcon({ focused, color, size }: TabBarIconProps) {
  return <TabIcon name={focused ? 'home' : 'home-outline'} color={color} size={size} focused={focused} />;
}

function RecipesTabIcon({ focused, color, size }: TabBarIconProps) {
  return (
    <TabIcon
      name={focused ? 'restaurant' : 'restaurant-outline'}
      color={color}
      size={size}
      focused={focused}
    />
  );
}

function DiscountsTabIcon({ focused, color, size }: TabBarIconProps) {
  return (
    <TabIcon
      name={focused ? 'pricetag' : 'pricetag-outline'}
      color={color}
      size={size}
      focused={focused}
    />
  );
}

function ShoppingTabIcon({ focused, color, size }: TabBarIconProps) {
  return (
    <TabIcon name={focused ? 'cart' : 'cart-outline'} color={color} size={size} focused={focused} />
  );
}

function ProfileTabIcon({ focused, color, size }: TabBarIconProps) {
  return (
    <TabIcon name={focused ? 'person' : 'person-outline'} color={color} size={size} focused={focused} />
  );
}

export default function TabLayout() {
  return (
    <AppProvider>
      <ProfileProvider>
        <Tabs
          screenOptions={{
            headerShown: false,
            tabBarActiveTintColor: colors.primary,
            tabBarInactiveTintColor: colors.tabInactive,
            tabBarStyle: styles.tabBar,
            tabBarLabelStyle: styles.tabBarLabel,
            tabBarItemStyle: styles.tabBarItem,
          }}
        >
          <Tabs.Screen
            name="index"
            options={{
              title: 'Ana Sayfa',
              tabBarIcon: HomeTabIcon,
            }}
          />
          <Tabs.Screen
            name="recipes"
            options={{
              title: 'Tarifler',
              tabBarIcon: RecipesTabIcon,
            }}
          />
          <Tabs.Screen
            name="discounts"
            options={{
              title: 'İndirimler',
              tabBarIcon: DiscountsTabIcon,
            }}
          />
          <Tabs.Screen
            name="shopping"
            options={{
              title: 'Alışveriş',
              tabBarIcon: ShoppingTabIcon,
            }}
          />
          <Tabs.Screen
            name="profile"
            options={{
              title: 'Profil',
              tabBarIcon: ProfileTabIcon,
            }}
          />
        </Tabs>
      </ProfileProvider>
    </AppProvider>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: spacing.md,
    height: 64,
    paddingBottom: spacing.sm,
    paddingTop: spacing.sm,
    backgroundColor: colors.glass,
    borderTopWidth: 0,
    borderWidth: 1,
    borderColor: colors.glassBorder,
    borderRadius: radius.xl,
    ...shadows.md,
  },
  tabBarLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  tabBarItem: {
    paddingTop: 4,
  },
});
