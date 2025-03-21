import React, {useEffect, useState} from 'react';
import { useTranslation } from 'react-i18next';
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
  SafeAreaView
} from 'react-native';
import {COLORS, SPACING} from '../theme/theme';
import {
  upcomingMovies,
  nowPlayingMovies,
  nowPlayingMovies_back,
  upcomingMovies_back,
  popularMovies_back,
  popularMovies,
  baseImagePath,
  apikey,
  token
} from '../api/apicalls';
import InputHeader from '../components/InputHeader';
import CategoryHeader from '../components/CategoryHeader';
import SubMovieCard from '../components/SubMovieCard';
import MovieCard from '../components/MovieCard';
import { useTheme } from '../context/ThemeContext';
const {width, height} = Dimensions.get('window');

const getNowPlayingMoviesList = async () => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 30000); // Increased timeout to 30 seconds

  try {
    let response = await fetch(nowPlayingMovies_back, { 
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}, statusText: ${response.statusText}`);
    }

    let json = await response.json();
    return json;
  } catch (error) {
    console.error(
      'Detailed error in getNowPlayingMoviesList Function:',
      error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    );
    
    if (error instanceof TypeError) {
      console.error('Network Error Details:', {
        isNetworkError: true,
        possibleReasons: [
          'No internet connection',
          'API server is down',
          'Network timeout',
          'CORS configuration issue'
        ]
      });
    } else if (error instanceof Error && error.name === 'AbortError') {
      console.error('Request timed out after 30 seconds');
    }

    throw error;
  } finally {
    clearTimeout(timeoutId); // Ensure timeout is cleared in all cases
  }
};

const getUpcomingMoviesList = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response = await fetch(upcomingMovies_back, { 
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let json = await response.json();
    return json;
  } catch (error) {
    console.error(
      'Something went wrong in getUpcomingMoviesList Function',
      error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    );
    
    if (error instanceof TypeError) {
      console.error('Network Error Details:', {
        isNetworkError: true,
        errorType: 'TypeError',
        message: error.message
      });
    }

    throw error;
  }
};

const getPopularMoviesList = async () => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    let response = await fetch(popularMovies_back, { 
      method: 'GET',
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    let json = await response.json();
    return json;
  } catch (error) {
    console.error(
      'Something went wrong in getPopularMoviesList Function',
      error instanceof Error ? {
        message: error.message,
        stack: error.stack
      } : error
    );
    
    if (error instanceof TypeError) {
      console.error('Network Error Details:', {
        isNetworkError: true,
        errorType: 'TypeError',
        message: error.message
      });
    }

    throw error;
  }
};

const HomeScreen = ({navigation}: any) => {
  const { t } = useTranslation();
  const { theme , colors } = useTheme();
  const [nowPlayingMoviesList, setNowPlayingMoviesList] =
    useState<any>(undefined);
  const [popularMoviesList, setPopularMoviesList] = useState<any>(undefined);
  const [upcomingMoviesList, setUpcomingMoviesList] = useState<any>(undefined);

  useEffect(() => {
    (async () => {
      let tempNowPlaying = await getNowPlayingMoviesList();
      setNowPlayingMoviesList([
        {id: 'dummy1'},
        ...tempNowPlaying.results,
        {id: 'dummy2'},
      ]);

      let tempPopular = await getPopularMoviesList();
      setPopularMoviesList(tempPopular.results);

      let tempUpcoming = await getUpcomingMoviesList();
      setUpcomingMoviesList(tempUpcoming.results);
    })();
  }, []);

  const searchMoviesFunction = () => {
    navigation.navigate('Search');
  };
  const backgroundColor = theme  == 'dark' ? COLORS.Black : COLORS.White;
  if (
    nowPlayingMoviesList == undefined &&
    nowPlayingMoviesList == null &&
    popularMoviesList == undefined &&
    popularMoviesList == null &&
    upcomingMoviesList == undefined &&
    upcomingMoviesList == null
  ) {
    return (
      <ScrollView
      style={[styles.container, { backgroundColor }]}
        bounces={false}
        contentContainerStyle={styles.scrollViewContainer}>
        <StatusBar hidden />

        <View style={styles.InputHeaderContainer}>
          <InputHeader searchFunction={searchMoviesFunction} />
        </View>

        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color={COLORS.Orange} />
        </View>
      </ScrollView>
    );
  }
  
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
        renderItem={({item, index}) => {
          if (!item.title) {
            return (
              <View
                style={{
                  width: (width - (width * 0.7 + SPACING.space_36 * 2)) / 2,
                }}></View>
            );
          }
          return (
            <MovieCard
              shoudlMarginatedAtEnd={true}
              cardFunction={() => {
                navigation.push('MovieDetails', {movieid: item.id});
              }}
              cardWidth={width * 0.7}
              isFirst={index == 0 ? true : false}
              isLast={index == upcomingMoviesList?.length - 1 ? true : false}
              title={item.title}
              imagePath={item.poster_image}
              genre={item.genres.slice(0,3)}
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
        renderItem={({item, index}) => (
          <SubMovieCard
            shoudlMarginatedAtEnd={true}
            cardFunction={() => {
              navigation.push('MovieDetails', {movieid: item.id});
            }}
            cardWidth={width / 3}
            isFirst={index == 0 ? true : false}
            isLast={index == upcomingMoviesList?.length - 1 ? true : false}
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
        renderItem={({item, index}) => (
          <SubMovieCard
            shoudlMarginatedAtEnd={true}
            cardFunction={() => {
              navigation.push('MovieDetails', {movieid: item.id});
            }}
            cardWidth={width / 3}
            isFirst={index == 0 ? true : false}
            isLast={index == upcomingMoviesList?.length - 1 ? true : false}
            title={item.title}
            imagePath={item.poster_image}
          />
        )}
      />
    </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    display: 'flex',
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
});

export default HomeScreen;
