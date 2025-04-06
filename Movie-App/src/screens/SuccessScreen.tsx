import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { CheckCircle } from "lucide-react-native"; // Install lucide-react-native for icons
import { COLORS, SPACING } from "../theme/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";

type RootStackParamList = {
  TicketScreen: undefined;
};
import { useTranslation } from "react-i18next";
import { useTheme } from '../context/ThemeContext';
const SuccessPage = () => {
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();
    const { t } = useTranslation();
    const { theme, colors } = useTheme();

    // Navigate to tickets after 2 seconds
    React.useEffect(() => {
      const timer = setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ 
            name: 'TicketScreen', 
            params: { 
              from: 'SuccessScreen', // Indicate the source
              timestamp: new Date().toISOString(), // Optional: add timestamp or other data
            } 
          }],
        });
      }, 2000);

      return () => clearTimeout(timer);
    }, [navigation]);

    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme ? COLORS.White : COLORS.Black }]}>
        <View style={styles.content}>
          <CheckCircle size={80} color={COLORS.Orange}/>
          <Text style={[styles.message, {color: theme ? COLORS.Black : COLORS.White}]}>{t('success.message')}</Text>
          <Text style={styles.submessage}>{t('success.viewTicket')}</Text>
        </View>
      </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: SPACING.space_16,
    paddingHorizontal: SPACING.space_24,
  },
  message: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
    color: COLORS.White,
  },
  submessage: {
    fontSize: 16,
    color: COLORS.Orange,
    textAlign: "center",
    opacity: 0.8,
  },
});

export default SuccessPage;
