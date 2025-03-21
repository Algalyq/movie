import * as React from 'react';
import {Text, View, StyleSheet, TouchableOpacity} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import { useTheme } from '../context/ThemeContext';

const AppHeader = (props: any) => {
  const { colors } = useTheme();

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={[styles.iconBG, { backgroundColor: colors.primary }]} 
        onPress={() => props.action()}
      >
        <Ionicons name={props.name} size={24} color={colors.card} />
      </TouchableOpacity>
      <Text style={[styles.headerText, { color: colors.text }]}>{props.header}</Text>
      <View style={styles.emptyContainer}></View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_20,
    textAlign: 'center',
  },
  emptyContainer: {
    height: SPACING.space_20 * 2,
    width: SPACING.space_20 * 2,
  },
  iconBG: {
    height: SPACING.space_20 * 2,
    width: SPACING.space_20 * 2,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BORDERRADIUS.radius_20,
  },
});

export default AppHeader;
