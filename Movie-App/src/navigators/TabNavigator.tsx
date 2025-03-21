import React from 'react';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import UserAccountScreen from '../screens/UserAccountScreen';
import {COLORS, FONTSIZE, SPACING} from '../theme/theme';
import { Ionicons } from '@expo/vector-icons';
import {View, StyleSheet} from 'react-native';
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs';
import TicketScreen from '../screens/TicketScreen';
import { useTranslation } from 'react-i18next';
import ProfileScreen from '../screens/ProfileScreen';
import { useTheme } from '../context/ThemeContext';
const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const { t } = useTranslation();
  const { colors,theme } = useTheme();
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarHideOnKeyboard: true,
        headerShown: false,
        tabBarStyle: {
          backgroundColor: theme === 'dark' ? COLORS.Black : COLORS.GreyRGBA0,
          borderTopWidth: 0,
          height: SPACING.space_10 * 10,
        },
      }}>
      <Tab.Screen
        name={t('common.home')}
        component={HomeScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({focused, color, size}) => {
            return (
              <View
                style={[
                  styles.activeTabBackground,
                  focused ? {backgroundColor: COLORS.Orange} : {},
                ]}>
                <Ionicons
                  name="film"
                  color={COLORS.White}
                  size={FONTSIZE.size_30}
                />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name={t('common.search')}
        component={SearchScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({focused, color, size}) => {
            return (
              <View
                style={[
                  styles.activeTabBackground,
                  focused ? {backgroundColor: COLORS.Orange} : {},
                ]}>
                <Ionicons
                  name="search"
                  color={COLORS.White}
                  size={FONTSIZE.size_30}
                />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name={t('common.ticket')}
        component={TicketScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({focused, color, size}) => {
            return (
              <View
                style={[
                  styles.activeTabBackground,
                  focused ? {backgroundColor: COLORS.Orange} : {},
                ]}>
                <Ionicons
                  name="ticket"
                  color={COLORS.White}
                  size={FONTSIZE.size_30}
                />
              </View>
            );
          },
        }}
      />
      <Tab.Screen
        name="User"
        component={ProfileScreen}
        options={{
          tabBarShowLabel: false,
          tabBarIcon: ({focused, color, size}) => {
            return (
              <View
                style={[
                  styles.activeTabBackground,
                  focused ? {backgroundColor: COLORS.Orange} : {},
                ]}>
                <Ionicons
                  name="person"
                  color={COLORS.White}
                  size={FONTSIZE.size_30}
                />
              </View>
            );
          },
        }}
      />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  activeTabBackground: {
    backgroundColor: COLORS.Black,
    padding: SPACING.space_18,
    borderRadius: SPACING.space_18 * 10,
  },
});

export default TabNavigator;
