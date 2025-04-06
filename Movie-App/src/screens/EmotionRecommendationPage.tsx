import React, { useState } from 'react';
import axios from 'axios';
import { 
  View, 
  Text, 
  Pressable, 
  FlatList, 
  StyleSheet, 
  ActivityIndicator, 
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AppHeader from '../components/AppHeader';
import { COLORS } from '../theme/theme';
import { useNavigation } from '@react-navigation/native';

const EmotionRecommendationPage: React.FC = () => {
  const [emotion, setEmotion] = useState<string>('');
  const [movies, setMovies] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigation();

  const emotions = ['Sad', 'Disgust', 'Anger', 'Anticipation', 'Fear', 'Enjoyment', 'Trust', 'Surprise'];

  const emotionIcons = {
    Sad: 'sad',
    Disgust: 'heart-dislike',
    Anger: 'flash',
    Anticipation: 'alarm',
    Fear: 'alert',
    Enjoyment: 'happy',
    Trust: 'shield-checkmark',
    Surprise: 'happy-sharp',
  };

  const handleEmotionSelect = (selectedEmotion: string) => {
    setEmotion(selectedEmotion);
  };

  const fetchRecommendedMovies = async () => {
    if (!emotion) {
      setError('Please select an emotion');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        setError('No token found');
        return;
      }
      const language = 'es-ES';
      const response = await axios.get('http://localhost:8000/api/films/recommend/', {
        params: { emotion, language },
      });

      setMovies(response.data);
    } catch (err) {
      setError('Error fetching movie recommendations');
    } finally {
      setLoading(false);
    }
  };

  const renderEmotionButton = ({ item }: { item: string }) => (
    <Pressable 
      style={[styles.emotionButton, emotion === item && styles.selectedEmotionButton]} 
      onPress={() => handleEmotionSelect(item)}
    >
      <Ionicons name={emotionIcons[item as keyof typeof emotionIcons]} size={30} color="#333" style={styles.emotionIcon} />
      <Text style={styles.emotionText}>{item}</Text>
    </Pressable>
  );

  const renderMovieItem = ({ item }: { item: string }) => (
    <View style={styles.movieCard}>
      <Text style={styles.movieTitle}>{item}</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>

      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.iconBG} 
            onPress={() => navigate.goBack()}
          >
            <Ionicons name={"arrow-back"} size={24} color={COLORS.card} />
          </TouchableOpacity>
          <Text style={styles.title}>Movie Recommendations</Text>
        </View>

        <View style={styles.emotionSelector}>
          <Text style={styles.label}>How are you feeling?</Text>
          <FlatList
            data={emotions}
            renderItem={renderEmotionButton}
            keyExtractor={(item) => item}
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.emotionList}
          />
        </View>

        <Pressable 
          style={styles.recommendButton} 
          onPress={fetchRecommendedMovies}
          disabled={!emotion}
        >
          <Text style={styles.recommendButtonText}>Get Recommendations</Text>
        </Pressable>

        {loading && (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loading} />
        )}

        {error && <Text style={styles.error}>{error}</Text>}

        {movies.length > 0 && (
          <View style={styles.resultsContainer}>
            <Text style={styles.resultsTitle}>Recommended Movies:</Text>
            <FlatList
              data={movies}
              renderItem={renderMovieItem}
              keyExtractor={(item, index) => index.toString()}
              numColumns={2}
              columnWrapperStyle={styles.movieRow}
              style={styles.movieGrid}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  container: {
    flex: 1,
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
  },
  iconBG: {
    marginRight: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
  },
  emotionSelector: {
    marginBottom: 20,
  },
  label: {
    fontSize: 18,
    color: '#666',
    marginBottom: 15,
    textAlign: 'center',
  },
  emotionList: {
    marginTop: 10,
  },
  emotionButton: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginHorizontal: 5,
    backgroundColor: '#FFF',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DDD',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedEmotionButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  emotionIcon: {
    marginBottom: 5,
  },
  emotionText: {
    fontSize: 14,
    color: '#333',
  },
  recommendButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recommendButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  loading: {
    marginVertical: 20,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginVertical: 10,
  },
  resultsContainer: {
    marginTop: 20,
    flex: 1,
  },
  resultsTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  movieGrid: {
    flex: 1,
  },
  movieRow: {
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  movieCard: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    padding: 15,
    marginHorizontal: 5,
    flex: 1,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    marginBottom: 10,
  },
  movieTitle: {
    fontSize: 16,
    color: '#444',
    textAlign: 'center',
  },
});

export default EmotionRecommendationPage;
