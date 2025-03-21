import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'kk', label: 'Қазақша' }
  ];

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.button,
            i18n.language === lang.code && styles.activeButton
          ]}
          onPress={() => i18n.changeLanguage(lang.code)}
        >
          <Text style={[
            styles.buttonText,
            i18n.language === lang.code && styles.activeButtonText
          ]}>
            {lang.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    gap: 10
  },
  button: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  activeButton: {
    backgroundColor: '#2D4263',
  },
  buttonText: {
    fontSize: 14,
    color: '#2D4263',
  },
  activeButtonText: {
    color: '#ffffff',
  }
});

export default LanguageSwitcher;
