import React, { useEffect, useState, useRef } from 'react';
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../config/api';

// Message types for the chat interface
type MessageType = 'user' | 'bot' | 'thinking' | 'film';  

// Interface for a message in the chat
interface ChatMessage {
  id: string;
  type: MessageType;
  text: string;
  timestamp: Date;
  films?: FilmRecommendation[];
}

// Interface for film recommendations
interface FilmRecommendation {
  id: number;
  title: string;
  description: string;
  genres: string[];
  year?: number;
  director?: string;
  poster?: string;
  imageUrl?: string;
  rating?: number;
}

// Map frontend emotions to backend expected emotions
const EMOTION_MAPPING = {
  happy: 'Enjoyment',    // Frontend -> Backend
  sad: 'Sad',
  angry: 'Anger',
  fear: 'Fear',
  disgust: 'Disgust',
  surprise: 'Surprise',
  neutral: 'Trust',      // Default for neutral
  trust: 'Trust',
  anticipation: 'Anticipation'
};

// Film genres associated with each emotion (for display purposes)
const EMOTION_FILM_GENRES = {
  happy: ['comedy', 'animation', 'adventure', 'family'],
  sad: ['drama', 'romance', 'documentary'],
  angry: ['action', 'thriller', 'crime'],
  fear: ['horror', 'mystery', 'thriller'],
  disgust: ['horror', 'documentary', 'crime'],
  surprise: ['sci-fi', 'fantasy', 'mystery'],
  neutral: ['documentary', 'biography', 'history'],
  trust: ['adventure', 'family', 'fantasy'],
  anticipation: ['thriller', 'mystery', 'sci-fi']
};

// Map frontend emotions to descriptions for the AI
const EMOTION_DESCRIPTIONS = {
  happy: 'happy and uplifted mood, looking for something cheerful and fun',
  sad: 'feeling sad or melancholic, might want something thoughtful or cathartic',
  angry: 'feeling frustrated or angry, might need something engaging or action-packed',
  fear: 'feeling anxious or scared, possibly seeking thrill or distraction',
  disgust: 'feeling disgusted or repulsed, might want something clean or beautiful',
  surprise: 'feeling surprised or curious, open to unexpected or unusual content',
  neutral: 'feeling balanced and calm, open to thoughtful or informative content',
  trust: 'feeling trusting and open, might enjoy meaningful or inspiring stories',
  anticipation: 'feeling excited and anticipatory, might enjoy suspenseful or innovative content'
};

// Placeholder film posters based on genres
const GENRE_POSTER_PLACEHOLDERS = {
  comedy: 'https://images.unsplash.com/photo-1596727147705-61a532a659bd?q=80&w=300',
  drama: 'https://images.unsplash.com/photo-1572177191856-3cde618dee1f?q=80&w=300',
  action: 'https://images.unsplash.com/photo-1512070904629-fa988dab2fe1?q=80&w=300',
  thriller: 'https://images.unsplash.com/photo-1478720568477-152d9b164e26?q=80&w=300',
  horror: 'https://images.unsplash.com/photo-1509248961158-e54f6934749c?q=80&w=300',
  romance: 'https://images.unsplash.com/photo-1518621736915-f3b1c41bfd00?q=80&w=300',
  fantasy: 'https://images.unsplash.com/photo-1518709594023-6ebd2b2b69e4?q=80&w=300',
  'sci-fi': 'https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?q=80&w=300',
  default: 'https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=300'
};

// Helper function to get description based on emotion
const getEmotionDescription = (emotion: string, t: any) => {
  const descriptions = {
    happy: t('Uplifting and joyful films to match your happy mood.'),
    sad: t('Films that might help process feelings or offer catharsis.'),
    angry: t('Engaging and action-packed films to channel your energy.'),
    fear: t('Thrilling content that might help face your fears.'),
    disgust: t('Beautiful and uplifting content to shift your perspective.'),
    surprise: t('Unexpected and thought-provoking films for your curious mood.'),
    neutral: t('Balanced and thoughtful content for your reflective state.'),
    trust: t('Meaningful and inspiring stories that celebrate connection.'),
    anticipation: t('Suspenseful and innovative content for your excited state.')
  };
  
  return descriptions[emotion] || t('Films selected for your current mood.');
};

const FilmRecommendationsScreen = ({ route, navigation }) => {
  const { t } = useTranslation();
  const { theme, colors } = useTheme();
  const { emotion } = route.params || { emotion: 'neutral' };
  
  // Chat interface state
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [films, setFilms] = useState<FilmRecommendation[]>([]);
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Gemini API configuration
  const GEMINI_API_KEY = 'AIzaSyCFYnzF70YoyDS0NGpBVpYbb8psc7fxfhw'; // Replace with actual API key
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';
  
  // Generate a unique ID for messages
  const generateId = () => Math.random().toString(36).substr(2, 9);

  // Start a chat conversation based on the detected emotion
  useEffect(() => {
    // Add initial greeting message from the chatbot
    const initialMessage: ChatMessage = {
      id: generateId(),
      type: 'bot',
      text: t('recommendation.greeting'),
      timestamp: new Date()
    };
    
    setMessages([initialMessage]);
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    setLoading(true);
    setIsTyping(true);
    
    // Add thinking message
    const thinkingMessage: ChatMessage = {
      id: generateId(),
      type: 'thinking',
      text: t('recommendation.thinking'),
      timestamp: new Date()
    };
    setMessages(prev => [...prev, thinkingMessage]);
    
    try {
      // Get the authentication token from AsyncStorage
      const token = await AsyncStorage.getItem('userToken');
      
      if (!token) {
        throw new Error(t('recommendation.authRequired'));
      }
      
      // Map frontend emotion to backend expected emotion
      const backendEmotion = EMOTION_MAPPING[emotion] || 'Trust';
      
      // Get recommendations from backend using the AI recommend endpoint with authentication
      const response = await axios.get(
        `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/ai/recommend/`,
        {
          params: { 
            emotion: backendEmotion,
            limit: 1 // Limit to 5 films for better UI
          },
          headers: {
            'Authorization': `Token ${token}` // Include the token in the Authorization header
          }
        }
      );
      
      // Backend now returns an array of objects with title and poster_path
      const moviesData = response.data;
      console.log('Movies data:', moviesData);
      
      // Create film objects from the movie data
      const genreList = EMOTION_FILM_GENRES[emotion] || ['drama'];
      const filmRecommendations = moviesData.map((movie, index) => ({
        id: index + 1,
        title: movie.title,
        description: t(`A ${genreList[0]} film perfect for your ${emotion} mood.`),
        genres: genreList,
        poster: movie.poster_path || `https://via.placeholder.com/150?text=${encodeURIComponent(movie.title)}`,
        year: new Date().getFullYear(),
        rating: parseFloat((Math.random() * 3 + 7).toFixed(1)) // Random rating between 7.0 and 10.0
      }));
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.type !== 'thinking'));
      
      // Add recommendations message
      const recommendationsMessage: ChatMessage = {
        id: generateId(),
        type: 'bot',
        text: t('recommendation.enjoyFilms', { emotion: t(`recommendation.moodDescriptions.${emotion}`) }),
        timestamp: new Date(),
        films: filmRecommendations
      };
      
      setMessages(prev => [...prev, recommendationsMessage]);
      setFilms(filmRecommendations);
      setLoading(false);
      setIsTyping(false);
    } catch (error: any) {
      console.error('Error fetching recommendations:', error);
      
      // Remove thinking message
      setMessages(prev => prev.filter(msg => msg.type !== 'thinking'));
      
      // Create appropriate error message based on the error type
      let errorText = t('recommendation.tryAgain');
      
      if (error.response?.status === 401) {
        errorText = t('recommendation.loginRequired');
        setError(t('recommendation.authRequired'));
      } else if (error.message === t('recommendation.authRequired')) {
        errorText = t('recommendation.loginRequired');
        setError(t('recommendation.authRequired'));
      } else {
        setError(t('recommendation.loadingError'));
      }
      
      // Add error message
      const errorMessage: ChatMessage = {
        id: generateId(),
        type: 'bot',
        text: errorText,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      // Fallback mock data for testing
      const genres = EMOTION_FILM_GENRES[emotion] || ['drama'];
      const fallbackFilm = {
        id: 1,
        title: t('recommendation.loadingError'),
        description: t('recommendation.tryAgain'),
        genres: genres,
        poster: 'https://via.placeholder.com/150',
        year: new Date().getFullYear(),
        rating: 8.5
      };
      
      setFilms([fallbackFilm]);
      setLoading(false);
      setIsTyping(false);
    }
  };

  // Render a single film card
  const renderFilmCard = (film) => (
    <TouchableOpacity 
      key={film.id}
      style={[styles.filmCard, { backgroundColor: colors.card }]}
      onPress={() => navigation.navigate('MovieDetail', { movieId: film.id })}
    >
      <Image
        source={{ uri: film.poster || 'https://via.placeholder.com/150' }}
        style={styles.poster}
      />
      <View style={styles.filmInfo}>
        <Text style={[styles.filmTitle, { color: colors.text }]} numberOfLines={2}>
          {film.title}
        </Text>
        <Text style={[styles.filmYear, { color: colors.text }]}>
          {film.year}
        </Text>
        <View style={styles.genreContainer}>
          {(film.genres || []).slice(0, 2).map((genre, index) => (
            <Text key={index} style={[styles.genre, { backgroundColor: colors.primary }]}>
              {genre}
            </Text>
          ))}
        </View>
        <View style={styles.ratingContainer}>
          <Ionicons name="star" size={16} color="#FFD700" />
          <Text style={[styles.rating, { color: colors.text }]}>
            {film.rating} / 10
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  // Render a message bubble
  const renderMessage = (message) => {
    const isUser = message.type === 'user';
    const isThinking = message.type === 'thinking';
    
    return (
      <View 
        key={message.id} 
        style={[
          styles.messageBubble,
          isUser ? styles.userMessage : styles.botMessage,
          isThinking && styles.thinkingMessage,
          { backgroundColor: isUser ? colors.primary : colors.card }
        ]}
      >
        {!isUser && !isThinking && (
          <View style={styles.botAvatar}>
            <MaterialCommunityIcons name="robot" size={24} color={colors.primary} />
          </View>
        )}
        <View style={styles.messageContent}>
          <Text style={[styles.messageText, { color: isUser ? '#FFFFFF' : colors.text }]}>
            {message.text}
          </Text>
          {isThinking && (
            <ActivityIndicator style={styles.thinkingIndicator} size="small" color={colors.primary} />
          )}
          {message.films && message.films.length > 0 && (
            <View style={styles.filmCardsContainer}>
              {message.films.map(film => renderFilmCard(film))}
            </View>
          )}
          <Text style={styles.messageTime}>
            {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  // Handle sending a new message
  const handleSendMessage = () => {
    if (!inputText.trim()) return;
    
    // Add user message
    const userMessage: ChatMessage = {
      id: generateId(),
      type: 'user',
      text: inputText.trim(),
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    
    // Simulate bot response
    setIsTyping(true);
    setTimeout(() => {
      const botResponse: ChatMessage = {
        id: generateId(),
        type: 'bot',
        text: t('I would also recommend checking out similar films in the same genre.'),
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, botResponse]);
      setIsTyping(false);
      
      // Scroll to bottom
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
      }
    }, 1500);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerText, { color: colors.text }]}>
          {t('recommendation.title')}
        </Text>
      </View>

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.chatContainer}
        keyboardVerticalOffset={100}
      >
        {/* Chat Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {messages.map(message => renderMessage(message))}
          
          {/* Show typing indicator if bot is typing */}
          {isTyping && !messages.some(m => m.type === 'thinking') && (
            <View style={[styles.messageBubble, styles.botMessage, { backgroundColor: colors.card }]}>
              <View style={styles.botAvatar}>
                <MaterialCommunityIcons name="robot" size={24} color={colors.primary} />
              </View>
              <View style={styles.typingIndicator}>
                <View style={[styles.typingDot, { backgroundColor: colors.text }]} />
                <View style={[styles.typingDot, { backgroundColor: colors.text }]} />
                <View style={[styles.typingDot, { backgroundColor: colors.text }]} />
              </View>
            </View>
          )}
        </ScrollView>
        
        {/* Input Area */}
        <View style={[styles.inputContainer, { backgroundColor: colors.card }]}>
          <TextInput
            style={[styles.textInput, { color: colors.text }]}
            placeholder={t('recommendation.typeMessage')}
            placeholderTextColor={colors.text + '80'}
            value={inputText}
            onChangeText={setInputText}
            onSubmitEditing={handleSendMessage}
          />
          <TouchableOpacity 
            style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]} 
            onPress={handleSendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons name="send" size={20} color={inputText.trim() ? colors.primary : colors.text + '50'} />
            <Text style={{display: 'none'}}>{t('recommendation.send')}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.1)',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messagesContent: {
    paddingBottom: 16,
  },
  messageBubble: {
    borderRadius: 20,
    padding: 12,
    marginVertical: 8,
    maxWidth: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1,
    elevation: 2,
  },
  userMessage: {
    alignSelf: 'flex-end',
    borderBottomRightRadius: 4,
  },
  botMessage: {
    alignSelf: 'flex-start',
    borderBottomLeftRadius: 4,
    flexDirection: 'row',
  },
  thinkingMessage: {
    padding: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageContent: {
    flex: 1,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  messageTime: {
    fontSize: 12,
    marginTop: 4,
    opacity: 0.6,
    alignSelf: 'flex-end',
  },
  thinkingIndicator: {
    marginLeft: 8,
  },
  filmCardsContainer: {
    marginTop: 12,
  },
  filmCard: {
    flexDirection: 'row',
    borderRadius: 12,
    marginVertical: 8,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  poster: {
    width: 80,
    height: 120,
    borderRadius: 8,
  },
  filmInfo: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  filmTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  filmYear: {
    fontSize: 14,
    opacity: 0.8,
    marginBottom: 8,
  },
  genreContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 8,
  },
  genre: {
    fontSize: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
    color: 'white',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  rating: {
    marginLeft: 6,
    fontSize: 14,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.1)',
  },
  textInput: {
    flex: 1,
    height: 40,
    borderRadius: 20,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  botAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    backgroundColor: 'rgba(0,0,0,0.05)',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 3,
    opacity: 0.7,
  },
});

export default FilmRecommendationsScreen;
