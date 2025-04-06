import React, { useState, useEffect } from 'react';
import { getApiUrl } from '../config/api';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  StatusBar,
  FlatList,
} from 'react-native';
import { COLORS, SPACING } from '../theme/theme';
import { baseImagePath } from '../api/apicalls';
import InputHeader from '../components/InputHeader';
import SubMovieCard from '../components/SubMovieCard';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width, height } = Dimensions.get('screen');

const getLanguageFromStorage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem('userLanguage');
    return savedLanguage || 'kk'; // Default to Kazakh if no language is saved
  } catch (error) {
    console.error('Failed to load language from storage:', error);
    return 'kk'; // Fallback to Kazakh
  }
};

const SearchScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const [searchList, setSearchList] = useState([]);
  const [error, setError] = useState<string | null>(null);
  const { colors, theme } = useTheme();

  const searchMoviesFunction = async (name: string) => {
    try {
      setError(null);
      if (!name.trim()) {
        setSearchList([]);
        return;
      }

      const language = await getLanguageFromStorage();
      const baseUrl = getApiUrl('/films/search/');
      const url = `${baseUrl}?query=${encodeURIComponent(name)}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Accept-Language': language,
        },
      });

      if (!response.ok) {
        throw new Error('Server error');
      }
      const json = await response.json();
      setSearchList(json);
    } catch (error) {
      console.error('Error searching movies:', error);
      setError(t('search.error'));
      setSearchList([]);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar hidden />
      <View style={styles.inputContainer}>
        <InputHeader searchFunction={searchMoviesFunction} />
      </View>
      <FlatList
        data={searchList}
        keyExtractor={(item: any) => item.id.toString()}
        bounces={false}
        numColumns={2}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.centerContainer,
          searchList.length === 0 && styles.centerMessageContainer,
        ]}
        ListEmptyComponent={
          <Text style={[styles.emptyMessage, { color: colors.text }]}>
            {error || (searchList.length === 0 ? t('search.typing') : t('search.noResults'))}
          </Text>
        }
        renderItem={({ item }) => (
          <SubMovieCard
            shouldMarginatedAtEnd={false}
            shouldMarginatedAround={true}
            cardFunction={() => {
              navigation.push('MovieDetails', { movieid: item.id, movie: item });
            }}
            cardWidth={width / 2 - SPACING.space_12 * 2}
            title={item.title}
            imagePath={item.poster_image}
          />
        )}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width,
    backgroundColor: COLORS.Black,
  },
  inputContainer: {
    marginHorizontal: SPACING.space_36,
    alignItems: 'center',
  },
  centerContainer: {
    alignItems: 'center',
  },
  emptyMessage: {
    fontSize: 16,
    textAlign: 'center',
    marginTop: SPACING.space_28,
  },
  centerMessageContainer: {
    justifyContent: 'center',
  },
});

export default SearchScreen;