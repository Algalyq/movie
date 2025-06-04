import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Image, 
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';

// Define emotion colors for visualization
const EMOTION_COLORS: Record<string, string> = {
  angry: '#FF4D4D',  // Red
  disgust: '#9ACD32', // Yellow-green
  fear: '#9932CC',   // Purple
  happy: '#FFD700',  // Gold
  neutral: '#A9A9A9', // Dark gray
  sad: '#4682B4',    // Steel blue
  surprise: '#FF8C00' // Dark orange
};

// Type definition for emotion data from Luxand API
interface EmotionData {
  dominant_emotion: string;
  emotion: Record<string, number>;
  region: { h: number; w: number; x: number; y: number };
}
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useTranslation } from 'react-i18next';

const EmotionRecognitionScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const { theme, colors } = useTheme();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [image, setImage] = useState<string | null>(null);
  const [emotionResults, setEmotionResults] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    (async () => {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    })();
  }, []);

  const takePicture = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setImage(result.assets[0].uri);
        analyzeEmotion(result.assets[0].uri);
      }
    } catch (error) {
      console.error('Error taking picture:', error);
      Alert.alert(t('Error'), t('Failed to take picture'));
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
      analyzeEmotion(result.assets[0].uri);
    }
  };

  const analyzeEmotion = async (uri: string) => {
    setLoading(true);
    setEmotionResults(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append('image', {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any);

      // Send to backend
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.API_PREFIX}/emotions/`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );
      setEmotionResults(response.data);
    } catch (error) {
      console.error('Error analyzing emotion:', error);
      Alert.alert('Error', 'Failed to analyze emotion. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (hasPermission === null) {
    return <View style={styles.container}><Text>{t('emotion.cameraPermission')}</Text></View>;
  }

  if (hasPermission === false) {
    return <View style={styles.container}><Text>{t('emotion.noCamera')}</Text></View>;
  }

  // Function to get recommended films based on dominant emotion
  const getFilmRecommendations = () => {
    // Check if we have faces in the result
    // Handle both possible response formats (faces under result or at top level)
    const faces = emotionResults?.result?.faces || emotionResults?.faces;
    
    if (faces && faces.length > 0) {
      // Get the dominant emotion of the primary face (first/largest face)
      const primaryFace = faces[0];
      const dominantEmotion = primaryFace.dominant_emotion;
      
      // Navigate to a chat or recommendation screen with the emotion
      navigation.navigate('FilmRecommendations', { emotion: dominantEmotion });
    }
  };

  const renderEmotionResults = () => {
    if (!emotionResults) return null;
    
    // Check if we have faces in the result - API might return faces array inside result object
    // or directly at the top level
    const faces = (emotionResults.result?.faces || emotionResults.faces) as EmotionData[] | undefined;
    
    if (faces && faces.length > 0) {
      // Get the dominant emotion of the primary face for the recommendation button
      const primaryEmotion = faces[0].dominant_emotion;
      
      return (
        <View style={styles.resultsContainer}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>
            {t('Emotion Analysis Results')}
          </Text>
          
          {/* Recommendation button based on dominant emotion */}
          <TouchableOpacity 
            style={[styles.recommendButton, { backgroundColor: EMOTION_COLORS[primaryEmotion] || colors.primary }]}
            onPress={getFilmRecommendations}
          >
            <Text style={styles.recommendButtonText}>
              {t('Get Film Recommendations Based on ')} 
              {primaryEmotion.charAt(0).toUpperCase() + primaryEmotion.slice(1)} {t('Mood')}
            </Text>
          </TouchableOpacity>
        
        </View>
      );
    } else if (loading) {
      return <ActivityIndicator size="large" color="#0000ff" />;
    } else if (image) {
      return (
        <Text style={[styles.errorText, { color: colors.text }]}>
          {t('No faces detected or error in analysis')}
        </Text>
      );
    }
    
    return null;
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
        <Text style={[styles.headerText, { color: colors.text }]}>{t('emotion.title')}</Text>
      </View>
      
      <ScrollView style={styles.scrollContent}>
        {!image ? (
          <View style={styles.camera}>
            <View style={styles.cameraButtonContainer}>
              <TouchableOpacity
                style={styles.captureButton}
                onPress={takePicture}>
                <Ionicons name="camera-outline" size={36} color="white" />
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.imageContainer}>
            <Image source={{ uri: image }} style={styles.image} />
            <TouchableOpacity 
              style={styles.resetButton}
              onPress={() => {
                setImage(null);
                setEmotionResults(null);
              }}
            >
              <Ionicons name="refresh" size={24} color="white" />
            </TouchableOpacity>
          </View>
        )}
        
        {loading && (
          <View style={[styles.loadingContainer, { backgroundColor: colors.background }]}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={[{ color: colors.text, marginTop: 10, fontSize: 16 }]}>
              {t('emotion.analyzing')}
            </Text>
          </View>
        )}
        
        {emotionResults && renderEmotionResults()}
        
        <View style={styles.buttonContainer}>
          {!image ? (
            <>
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={takePicture}
              >
                <Ionicons name="camera" size={24} color="white" />
                <Text style={styles.buttonText}>{t('emotion.takePhoto')}</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.button, { backgroundColor: colors.primary }]}
                onPress={pickImage}
              >
                <Ionicons name="image" size={24} color="white" />
                <Text style={styles.buttonText}>{t('emotion.pickFromGallery')}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={() => analyzeEmotion(image)}
            >
              <Ionicons name="refresh" size={24} color="white" />
              <Text style={styles.buttonText}>{t('emotion.analyzeEmotion')}</Text>
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
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
    borderBottomColor: '#eee',
  },
  backButton: {
    marginRight: 16,
  },
  headerText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  scrollContent: {
    flex: 1,
  },
  camera: {
    height: 400,
    width: '100%',
    justifyContent: 'flex-end',
    backgroundColor: '#222',
  },
  cameraButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  flipButton: {
    alignSelf: 'flex-end',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 30,
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginBottom: 20,
  },
  captureButton: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    borderRadius: 50,
    backgroundColor: 'rgba(0,0,0,0.6)',
    marginBottom: 20,
  },
  imageContainer: {
    position: 'relative',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: 300,
    resizeMode: 'cover',
  },
  resetButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 16,
  },
  button: {
    backgroundColor: '#3498db',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  resultsContainer: {
    padding: 16,
    marginBottom: 20,
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  emotionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emotionText: {
    width: 80,
  },
  barContainer: {
    flex: 1,
    height: 10,
    backgroundColor: '#ddd',
    borderRadius: 5,
    marginHorizontal: 8,
  },
  bar: {
    height: '100%',
    borderRadius: 5,
  },
  percentText: {
    width: 50,
    textAlign: 'right',
  },
  // New styles for face emotion display
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  faceContainer: {
    marginBottom: 24,
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 10,
    padding: 12,
  },
  dominantEmotionContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 8,
  },
  faceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  dominantEmotion: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emotionContainer: {
    marginBottom: 8,
  },
  emotionName: {
    marginBottom: 4,
  },
  percentageBarContainer: {
    height: 16,
    backgroundColor: '#eee',
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  percentageBar: {
    height: 10,
    borderRadius: 5,
  },
  errorText: {
    textAlign: 'center',
    marginTop: 20,
    padding: 16,
    fontSize: 16,
  },
  recommendButton: {
    padding: 15,
    borderRadius: 10,
    marginVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  recommendButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});

export default EmotionRecognitionScreen;
