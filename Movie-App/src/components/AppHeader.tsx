import * as React from 'react';
import { Text, View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next'; // Import useTranslation if not already imported

const AppHeader = (props: any) => {
  const { colors } = useTheme();
  const { t } = useTranslation(); // Add translation hook if you want to handle localization here

  return (
    <View style={styles.container}>
      {/* Back Icon on the Left */}
      <TouchableOpacity 
        style={[styles.iconBG, { backgroundColor: colors.primary }]} 
        onPress={() => props.action()}
      >
        <Ionicons name={props.name} size={24} color={colors.card} />
      </TouchableOpacity>

      {/* Centered Text (using flex to center) */}
      <View style={styles.centerTextContainer}>
        <Text style={[styles.headerText, { color: colors.text }]}>
          {props.header ? props.header : t(props.headerKey || 'default.header')} {/* Use props or l10n */}
        </Text>
      </View>

      {/* Empty View on the Right for balance (optional) */}
      <View style={styles.emptyContainer} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row', // Horizontal layout
    alignItems: 'center', // Vertically center all items
    paddingHorizontal: SPACING.space_16, // Add horizontal padding for spacing
    paddingVertical: SPACING.space_12, // Add vertical padding for height
  },
  centerTextContainer: {
    flex: 1, // Take up remaining space
    alignItems: 'center', // Center text horizontally
  },
  headerText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_20,
    fontWeight: 'bold'
  },
  emptyContainer: {
    width: SPACING.space_20 * 2, // Match the width of the icon for balance
    height: SPACING.space_20 * 2,
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