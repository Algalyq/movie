import React, {useEffect, useState} from 'react';
import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Image,
  TouchableOpacity,
  StatusBar,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import {baseImagePath, movieCastDetails, filmDetails_back, filmVote_back, filmRemoveVote_back} from '../api/apicalls';
import RaffleTicket from '../components/Ticket';
import AppHeader from '../components/AppHeader';
import CategoryHeader from '../components/CategoryHeader';
import CastCard from '../components/CastCard';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../context/ThemeContext';

import {COLORS, SPACING, FONTSIZE, FONTFAMILY, BORDERRADIUS} from '../theme/theme';


interface Screening {
  id: number;
  time: string;
  cinema: string;
  cinema_id: number;
  hall: string;
  language: string;
  prices: {
    adult: number;
    child: number;
    student: number;
  };
}



const getMovieCastDetails = async (movieid: number) => {
  try {
    let response = await fetch(movieCastDetails(movieid));
    let json = await response.json();
    return json;
  } catch (error) {
    console.error(
      'Something Went wrong in getMovieCastDetails Function',
      error,
    );
  }
};

const fetchMovieDetails = async (movieId: number) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);

    const response = await fetch(filmDetails_back(movieId), {
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

    const data = await response.json();
    return data;
  } catch (error) {
    console.error(
      'Something went wrong in fetchMovieDetails',
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
    return null;
  }
};

const MovieDetailsScreen = ({navigation, route}: any) => {
  const { t } = useTranslation();
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today.toISOString().split("T")[0]);
  const [screeningsData, setScreeningsData] = useState<{ [key: string]: Screening[] }>({});
  const { theme,colors } = useTheme();
  const [selectedScreening, setSelectedScreening] = useState<{
    date: string;
    time: string;
    cinema: string;
  } | null>(null);

  const getNext7Days = (): { day: string; date: string }[] => {
    const days = [];
    
    for (let i = 0; i < 7; i++) {
      const nextDate = new Date(today);
      nextDate.setDate(today.getDate() + i);

      days.push({
        day: t(`days.short.${nextDate.getDay()}`),
        date: nextDate.toISOString().split("T")[0],
      });
    }
    return days;
  };

  const dates = getNext7Days();
  const screenings: Screening[] = screeningsData[selectedDate] || [];
  const [movieData, setMovieData] = useState<any>(undefined);
  const [userRating, setUserRating] = useState<number | null>(null);
  const [isVoting, setIsVoting] = useState(false);
  const handleVote = async (rating: number) => {
    try {
      setIsVoting(true);
      const response = await fetch(filmVote_back(route.params.movieid), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Add your auth token here if required
          // 'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ rating })
      });

      if (response.ok) {
        const data = await response.json();
        setUserRating(data.rating);
        setMovieData(prev => ({
          ...prev,
          vote_average: data.vote_average,
          vote_count: data.vote_count
        }));
      } else {
        // Handle error
        console.error('Failed to vote');
      }
    } catch (error) {
      console.error('Error voting:', error);
    } finally {
      setIsVoting(false);
    }
  };

  const removeVote = async () => {
    try {
      setIsVoting(true);
      const response = await fetch(filmRemoveVote_back(route.params.movieid), {
        method: 'DELETE',
        headers: {
          // Add your auth token here if required
          // 'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setUserRating(null);
        setMovieData(prev => ({
          ...prev,
          vote_average: data.vote_average,
          vote_count: data.vote_count
        }));
      }
    } catch (error) {
      console.error('Error removing vote:', error);
    } finally {
      setIsVoting(false);
    }
  };

  useEffect(() => {
    const loadMovieData = async () => {
      try {
        const data = await fetchMovieDetails(route.params.movieid);
        if (data) {
          setMovieData(data.film);
          setScreeningsData(data.sessions);
          if (data.film.user_vote) {
            setUserRating(data.film.user_vote);
          }
          
          // Set initial selected screening if available for the selected date
          if (data.sessions[selectedDate] && data.sessions[selectedDate].length > 0) {
            const firstSession = data.sessions[selectedDate][0];
            setSelectedScreening({
              date: selectedDate,
              time: firstSession.time,
              cinema: firstSession.cinema,
              price: firstSession.price
            });
          }
      } 
    }catch (error) {
      console.error('Error loading movie data:', error);
    }
  }
    loadMovieData();
  }, [route.params.movieid, selectedDate]);

  const renderCastList = () => {
    return movieData?.actors?.map((actor: any, index: number) => (
      <CastCard
        key={actor.id}
        shouldMarginatedAtEnd={true}
        cardWidth={80}
        isFirst={index == 0}
        isLast={index == movieData.actors.length - 1}
        imagePath={actor.photo}
        title={actor.name}
        subtitle={actor.bio}
      />
    ));
  };

  const handleScreeningPress = (screening: Screening) => {
    setSelectedScreening({
      date: selectedDate,
      time: screening.time,
      cinema: screening.cinema,
      price: screening.prices.adult
    });
  };

  const renderScreenings = () => {
    
    return screenings.map((item, index) => (
      <TouchableOpacity 
        key={`${item.time}-${index}`} 
        style={[styles.screeningItem, {backgroundColor: colors.card}]} 
        onPress={() => { 
          handleScreeningPress(item),
          navigation.push('SeatBooking', {
            BgImage: movieData.background_image,
            PosterImage: movieData.poster_image,
            sessionId: item.id, // Add session ID for booking
            title: movieData.title,
            date: selectedDate,
            time: item.time,
            cinema: item.cinema,
            cinema_id: item.cinema_id,
            price: item.prices.adult,
            session_id: item.id
          });

        }}
      >
        <View style={styles.timeContainerCinema}>
          <Text style={styles.time}>{item.time}</Text>
        </View>
        <View style={styles.details}>
          <Text style={[styles.cinema,{color: colors.text}]}>{item.cinema}</Text>
          <Text style={[styles.hall,{color: colors.text}]}>{t('movie.hall')}: {item.hall}</Text>
          <Text style={[styles.language,{color: colors.text}]}>{t('movie.language')}: {item.language}</Text>
          <Text style={[styles.prices,{color: colors.text}]}>{t('movie.adult')}: {item.prices.adult} ₸ {t('movie.child')}: {item.prices.child} ₸ {t('movie.student')}: {item.prices.student} ₸</Text>
        </View>
      </TouchableOpacity>
    ));
  };

  if (!movieData) {
    return (
      <View style={styles.container}>
        <View style={styles.appHeaderContainer}>
          <AppHeader
            name="arrow-back"
            header={t('movie.movieDetails')}
            action={() => navigation.goBack()}
          />
        </View>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size={'large'} color={COLORS.Orange} />
        </View>
      </View>
    );
  }
  const color_gradient = theme === 'light' ? COLORS.WhiteRGB10 : COLORS.BlackRGB10;
  const color_gradient_1 = theme === 'light' ? COLORS.White : COLORS.Black;
  return (
    <ScrollView
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.scrollViewContent}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar hidden />

      <View>
        <ImageBackground
          source={{
            uri: movieData?.background_image
          }}
          style={styles.imageBG}>
          <LinearGradient
            colors={[color_gradient, color_gradient_1]}
            style={styles.linearGradient}>
            <View style={styles.appHeaderContainer}>
              <AppHeader
                name="arrow-back"
                header={''}
                action={() => navigation.goBack()}
              />
            </View>
          </LinearGradient>
        </ImageBackground>
        <View style={styles.imageBG}></View>
        <Image
          source={{uri: movieData?.poster_image}}
          style={styles.cardImage}
        />
      </View>

      <View style={styles.timeContainer}>
        <Ionicons name="time-sharp" style={styles.clockIcon} />
        <Text style={[styles.runtimeText, { color: colors.text }]}>
          {Math.floor(movieData?.runtime / 60)}h{' '}
          {Math.floor(movieData?.runtime % 60)}m
        </Text>
      </View>

      <View>
        <Text style={[styles.title, { color: colors.text }]}>{movieData?.title}</Text>
        <View style={styles.genreContainer}>
          {movieData?.genres.map((genre: string, index: number) => {
            return (
              <View style={[styles.genreBox, {borderColor: colors.border}]} key={index}>
                <Text style={[styles.genreText, { color: colors.text }]}>{genre}</Text>
              </View>
            );
          })}
        </View>
        <Text style={[styles.tagline, { color: colors.text }]}>{t('movie.tagline')}: {movieData?.tagline}</Text>
      </View>

      <View style={styles.infoContainer}>
        <View style={styles.rateContainer}>
          <Ionicons name="star" style={styles.starIcon} />
          <View style={styles.ratingContainer}>
            <Text style={[styles.runtimeText, { color: colors.text }]}>
              {movieData?.vote_average.toFixed(1)} ({movieData?.vote_count})
            </Text>
          </View>
        </View>
        <Text style={[styles.descriptionText, { color: colors.text }]}>{movieData?.overview}</Text>
      </View>

      <View>
        <CategoryHeader title={t('movie.cast')} />
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false} 
          contentContainerStyle={styles.castScrollContainer}
        >
          {renderCastList()}
        </ScrollView>
      </View>

      <View style={styles.list_container}>
        <View style={styles.list_cinema}>
          <Text style={[styles.monthText, {color: colors.text}]}>
            {t(`months.${today.getMonth() + 1}`)}
          </Text>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false} 
            style={styles.dateContainer}
          >
            {dates.map((item, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setSelectedDate(item.date)}
                style={[styles.dateButton, selectedDate === item.date && styles.selectedDate]}
              >
                <Text style={[styles.dateText]}>{item.day}</Text>
                <Text style={[styles.dateText]}>{parseInt(item.date.split("-")[2], 10)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
        
        {screenings.length > 0 ? (

          <View>{renderScreenings()}</View>
        ) : (
          <Text style={[styles.emptyText, {color: colors.text}]}>{t('movie.noScreenings')}</Text>
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  starContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 5,
  },
  starIcon: {
    marginHorizontal: 2,
  },
  ratingContainer: {
    alignItems: 'center',
  },
  container: {
    display: 'flex',
    flex: 1,
    backgroundColor: COLORS.Black,
  },
  scrollViewContent: {
    paddingBottom: SPACING.space_20,
  },
  loadingContainer: {
    flex: 1,
    alignSelf: 'center',
    justifyContent: 'center',
  },
  appHeaderContainer: {
    marginHorizontal: SPACING.space_36,
    marginTop: SPACING.space_20 * 2,
  },
  imageBG: {
    width: '100%',
    aspectRatio: 3072 / 1727,
  },
  linearGradient: {
    height: '100%',
  },
  cardImage: {
    width: '60%',
    aspectRatio: 200 / 300,
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
  },
  clockIcon: {
    fontSize: FONTSIZE.size_20,
    color: COLORS.WhiteRGBA50,
    marginRight: SPACING.space_8,
  },
  timeContainer: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: SPACING.space_15,
  },
  timeContainerCinema: {
    justifyContent: 'center',
  },
  runtimeText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  title: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
    marginHorizontal: SPACING.space_36,
    marginVertical: SPACING.space_15,
    textAlign: 'center',
  },
  genreContainer: {
    flex: 1,
    flexDirection: 'row',
    gap: SPACING.space_20,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  genreBox: {
    borderColor: COLORS.WhiteRGBA50,
    borderWidth: 1,
    paddingHorizontal: SPACING.space_10,
    paddingVertical: SPACING.space_4,
    borderRadius: BORDERRADIUS.radius_25,
  },
  genreText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_10,
    color: COLORS.WhiteRGBA75,
  },
  tagline: {
    fontFamily: FONTFAMILY.poppins_thin,
    fontSize: FONTSIZE.size_14,
    fontStyle: 'italic',
    color: COLORS.White,
    marginHorizontal: SPACING.space_36,
    marginVertical: SPACING.space_15,
    textAlign: 'center',
  },
  infoContainer: {
    alignContent: 'center',
    alignItems: 'center',
    marginHorizontal: SPACING.space_24,
  },
  rateContainer: {
    flexDirection: 'row',
    gap: SPACING.space_10,
    alignItems: 'center',
  },
  starIcon: {
    fontSize: FONTSIZE.size_20,
    color: COLORS.Yellow,
  },
  descriptionText: {
    fontFamily: FONTFAMILY.poppins_light,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  castScrollContainer: {
    gap: SPACING.space_24,
  },
  list_cinema: {
    marginVertical: SPACING.space_10,
  },
  list_container: {
    marginHorizontal: SPACING.space_24,
    marginVertical: SPACING.space_10,
  },
  monthText: {
    fontSize: FONTSIZE.size_18,
    fontWeight: 'bold',
    color: COLORS.White,
  },
  dateContainer: {
    marginTop: 8,
    flexDirection: "row",
  },
  dateButton: {
    padding: 12,
    alignItems: "center",
    marginRight: 8,
    backgroundColor: COLORS.Grey,
    borderRadius: 8,
  },
  selectedDate: {
    backgroundColor: COLORS.Orange,
    borderRadius: 8,
  },
  dateText: {
    color: "#fff",
    fontSize: 14,
  },
  screeningItem: {
    flexDirection: "row",
    flex: 1,
    backgroundColor: COLORS.White,
    marginVertical: 8,
    padding: 8,
    borderRadius: 8,
    justifyContent:"center",
    gap: 12
  },
  time: {
    fontSize: 16,
    fontWeight: "bold",
    color: COLORS.Orange,
  },
  details: {
    width: '75%', 
  },
  cinema: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  hall: {
    fontSize: 14,
    color: "#555",
  },
  language: {
    fontSize: 12,
    color: "#999",
  },
  prices: {
    fontSize: 14,
    color: "#333",
  },
  emptyText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: "center",
    color: "#999",
  },
});

export default MovieDetailsScreen;
