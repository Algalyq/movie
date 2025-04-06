import React, { useEffect, useState } from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LanguageSwitcher = () => {
  const { i18n } = useTranslation();
  const [currentLanguage, setCurrentLanguage] = useState(i18n.language);

  // Load saved language from AsyncStorage when component mounts
  useEffect(() => {
    const loadSavedLanguage = async () => {
      try {
        const savedLanguage = await AsyncStorage.getItem('userLanguage');
        if (savedLanguage) {
          i18n.changeLanguage(savedLanguage); // Set the saved language
          setCurrentLanguage(savedLanguage); // Update state
        }
      } catch (error) {
        console.error('Failed to load saved language:', error);
      }
    };

    loadSavedLanguage();
  }, [i18n]);

  // Save language to AsyncStorage when changed
  const handleLanguageChange = async (lang) => {
    try {
      await i18n.changeLanguage(lang); // Change the language in i18n
      await AsyncStorage.setItem('userLanguage', lang); // Save to AsyncStorage
      setCurrentLanguage(lang); // Update state
    } catch (error) {
      console.error('Failed to save language:', error);
    }
  };

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'ru', label: 'Русский' },
    { code: 'kk', label: 'Қазақша' },
  ];

  return (
    <View style={styles.container}>
      {languages.map((lang) => (
        <TouchableOpacity
          key={lang.code}
          style={[
            styles.button,
            currentLanguage === lang.code && styles.activeButton, // Use state for consistency
          ]}
          onPress={() => handleLanguageChange(lang.code)}
        >
          <Text style={[
            styles.buttonText,
            currentLanguage === lang.code && styles.activeButtonText,
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
    gap: 10,
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
  },
});

export default LanguageSwitcher;