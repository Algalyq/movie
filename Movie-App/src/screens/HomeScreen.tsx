import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  Text,
  View,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
  StatusBar,
  FlatList,
  SafeAreaView,
} from 'react-native';
import { COLORS, SPACING } from '../theme/theme';
import Ionicons from '@expo/vector-icons/Ionicons';
import {
  upcomingMovies,
  nowPlayingMovies,
  nowPlayingMovies_back,
  upcomingMovies_back,
  popularMovies_back,
  popularMovies,
  baseImagePath,
  apikey,
  token,
} from '../api/apicalls';
import InputHeader from '../components/InputHeader';
import CategoryHeader from '../components/CategoryHeader';
import SubMovieCard from '../components/SubMovieCard';
import MovieCard from '../components/MovieCard';
import { useTheme } from '../context/ThemeContext';

const { width, height } = Dimensions.get('window');

const HomeScreen = ({ navigation }: any) => {
  const { t } = useTranslation();
  const { theme, colors } = useTheme();

  // UseState for totalLanguage inside the component
  // const [totalLanguage, setTotalLanguage] = useState<string>('kk'); // Default language is 'kk'

  const getLanguageFromStorage = async () => {
    try {
      const savedLanguage = await AsyncStorage.getItem('userLanguage');
      return savedLanguage || 'kk'; // Default to Kazakh if no language is saved
    } catch (error) {
      console.error('Failed to load language from storage:', error);
      return 'kk'; // Fallback to Kazakh
    }
  };

  const fetchWithLanguage = async (url, options = {}) => {
    const language = await getLanguageFromStorage();
    setTotalLanguage(language);
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 seconds timeout

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        headers: {
          ...options.headers,
          'Accept': 'application/json',
          'Accept-Language': language,
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
      }

      const json = await response.json();
      return json;
    } catch (error) {
      console.error(
        'Detailed error in fetchWithLanguage:',
        error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack,
        } : error,
      );

      if (error instanceof TypeError) {
        console.error('Network Error Details:', {
          isNetworkError: true,
          possibleReasons: [
            'No internet connection',
            'API server is down',
            'Network timeout',
            'CORS configuration issue',
          ],
        });
      } else if (error instanceof Error && error.name === 'AbortError') {
        console.error('Request timed out after 30 seconds');
      }

      throw error;
    } finally {
      clearTimeout(timeoutId);
    }
  };

  const getNowPlayingMoviesList = async () => {
    return await fetchWithLanguage(nowPlayingMovies_back);
  };

  const getUpcomingMoviesList = async () => {
    return await fetchWithLanguage(upcomingMovies_back, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const getPopularMoviesList = async () => {
    return await fetchWithLanguage(popularMovies_back, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
  };

  const [nowPlayingMoviesList, setNowPlayingMoviesList] = useState<any>(undefined);
  const [popularMoviesList, setPopularMoviesList] = useState<any>(undefined);
  const [upcomingMoviesList, setUpcomingMoviesList] = useState<any>(undefined);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [nowPlaying, popular, upcoming] = await Promise.all([
          getNowPlayingMoviesList(),
          getPopularMoviesList(),
          getUpcomingMoviesList(),
        ]);

        setNowPlayingMoviesList([{ id: 'dummy1' }, ...nowPlaying.results, { id: 'dummy2' }]);
        setPopularMoviesList(popular.results);
        setUpcomingMoviesList(upcoming.results);
      } catch (error) {
        console.error('Failed to fetch movie lists:', error);
      }
    };

    fetchData();
  }, []);

  const searchMoviesFunction = () => {
    navigation.navigate('Search');
  };

  const backgroundColor = theme === 'dark' ? COLORS.Black : COLORS.White;

  if (
    nowPlayingMoviesList === undefined ||
    nowPlayingMoviesList === null ||
    popularMoviesList === undefined ||
    popularMoviesList === null ||
    upcomingMoviesList === undefined ||
    upcomingMoviesList === null
  ) {
    return (
      <ScrollView style={[styles.container, { backgroundColor }]} bounces={false} contentContainerStyle={styles.scrollViewContainer}>
        <StatusBar hidden />
        <View style={styles.InputHeaderContainer}>
          <InputHeader searchFunction={searchMoviesFunction} />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.Orange} />
        </View>
      </ScrollView>
    );
  }

  const showEmotionRecommendationButton = totalLanguage === 'en';

  return (
    <SafeAreaView style={[styles.container, { backgroundColor }]}>
      <ScrollView style={[styles.container, { backgroundColor }]} bounces={false}>
        <StatusBar hidden />
        <CategoryHeader title={t('movie.nowPlaying')} />
        <FlatList
          data={nowPlayingMoviesList}
          keyExtractor={(item: any) => item.id}
          bounces={false}
          snapToInterval={width * 0.7 + SPACING.space_36}
          horizontal
          showsHorizontalScrollIndicator={false}
          decelerationRate={0}
          contentContainerStyle={styles.containerGap36}
          renderItem={({ item, index }) => {
            if (!item.title) {
              return <View style={{ width: (width - (width * 0.7 + SPACING.space_36 * 2)) / 2 }} />;
            }
            return (
              <MovieCard
                shouldMarginatedAtEnd={true}
                cardFunction={() => {
                  navigation.push('MovieDetails', { movieid: item.id });
                }}
                cardWidth={width * 0.7}
                isFirst={index === 0}
                isLast={index === nowPlayingMoviesList.length - 1}
                title={item.title}
                imagePath={item.poster_image}
                genre={item.genres.slice(0, 3)}
                vote_average={item.vote_average}
                vote_count={item.vote_count}
              />
            );
          }}
        />
        <CategoryHeader title={t('movie.popular')} />
        <FlatList
          data={popularMoviesList}
          keyExtractor={(item: any) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          bounces={false}
          contentContainerStyle={styles.containerGap36}
          renderItem={({ item, index }) => (
            <SubMovieCard
              shouldMarginatedAtEnd={true}
              cardFunction={() => {
                navigation.push('MovieDetails', { movieid: item.id });
              }}
              cardWidth={width / 3}
              isFirst={index === 0}
              isLast={index === popularMoviesList.length - 1}
              title={item.title}
              imagePath={item.poster_image}
            />
          )}
        />
        <CategoryHeader title={t('movie.upcoming')} />
        <FlatList
          data={upcomingMoviesList}
          keyExtractor={(item: any) => item.id}
          horizontal
          bounces={false}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.containerGap36}
          renderItem={({ item, index }) => (
            <SubMovieCard
              shouldMarginatedAtEnd={true}
              cardFunction={() => {
                navigation.push('MovieDetails', { movieid: item.id });
              }}
              cardWidth={width / 3}
              isFirst={index === 0}
              isLast={index === upcomingMoviesList.length - 1}
              title={item.title}
              imagePath={item.poster_image}
            />
          )}
        />
      </ScrollView>
     
      {showEmotionRecommendationButton && (
        <TouchableOpacity onPress={() => navigation.push('EmotionRecommendationPage')}
        style={{...styles.iconContainer, backgroundColor: theme == 'dark' ? COLORS.White : COLORS.Black}}>
          <Ionicons name="happy" size={32} color={theme == 'dark' ? COLORS.Orange : COLORS.White} />
        </TouchableOpacity>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  scrollViewContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  InputHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_28,
  },
  containerGap36: {
    gap: SPACING.space_36,
  },
  iconContainer: {
    position: 'absolute',
    bottom: SPACING.space_20,
    right: SPACING.space_20,
    padding: SPACING.space_12,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Optional: semi-transparent background
    borderRadius: 50, // Optional: circular background
  },
});

export default HomeScreen;
