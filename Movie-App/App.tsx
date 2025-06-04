import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TabNavigator from './src/navigators/TabNavigator';
import AuthNavigator from './src/navigators/AuthNavigator';
import MovieDetailsScreen from './src/screens/MovieDetailsScreen';
import SeatBookingScreen from './src/screens/SeatBookingScreen';
import SearchScreen from './src/screens/SearchScreen';
import CinemaScreen from './src/screens/CinemaScreen';
import MyTicketsScreen from './src/screens/MyTickets';
import TicketScreen from './src/screens/TicketScreen';
import SuccessScreen from './src/screens/SuccessScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import LoginScreen from './src/screens/LoginScreen';
import EmotionRecognitionScreen from './src/screens/EmotionRecognitionScreen';
import FilmRecommendationsScreen from './src/screens/FilmRecommendationsScreen';
import './src/i18n/i18n';
import { useTranslation } from 'react-i18next';
import { isAuthenticated } from './src/api/authApi';
import { ActivityIndicator, View } from 'react-native';
import { COLORS } from './src/theme/theme';
import { ThemeProvider } from './src/context/ThemeContext';
import {RegisterScreen} from './src/screens/RegisterScreen';
const Stack = createNativeStackNavigator();

const App = () => {
  const { i18n } = useTranslation();
  const [isLoading, setIsLoading] = React.useState(true);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  React.useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const authStatus = await isAuthenticated();
      setIsLoggedIn(authStatus);
    } catch (error) {
      setIsLoggedIn(false);
    } finally {
      setIsLoading(false);
    }
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: COLORS.Black }}>
        <ActivityIndicator size="large" color={COLORS.Orange} />
      </View>
    );
  }

  return (
    <ThemeProvider>
      <NavigationContainer>
      <Stack.Navigator screenOptions={{headerShown: false}}>
        {!isLoggedIn ? (
          <Stack.Screen name="Auth" component={AuthNavigator} />
        ) : (
          <>
            <Stack.Screen
              name="Tab"
              component={TabNavigator}
              options={{animation: 'default'}}
            />
            <Stack.Screen
              name="Screen"
              component={SearchScreen}
              options={{animation: 'default'}}
            />
            <Stack.Screen
              name="MovieDetails"
              component={MovieDetailsScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="SeatBooking"
              component={SeatBookingScreen}
              options={{animation: 'slide_from_bottom'}}
            />
            <Stack.Screen
              name="CinemaScreen"
              component={CinemaScreen}
              options={{animation: 'default'}}
            />
            <Stack.Screen
              name="MyTicketsScreen"
              component={MyTicketsScreen}
              options={{animation: 'default'}}
            />
            <Stack.Screen
              name="TicketScreen"
              component={TicketScreen}
              options={{animation: 'default'}}
            />
            <Stack.Screen
              name="SuccessScreen"
              component={SuccessScreen}
              options={{animation: 'slide_from_bottom'}}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{animation: 'default'}}
            />
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{animation: 'default'}}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{animation: 'default'}}
            />
            <Stack.Screen
              name="EmotionRecognition"
              component={EmotionRecognitionScreen}
              options={{animation: 'slide_from_right'}}
            />
            <Stack.Screen
              name="FilmRecommendations"
              component={FilmRecommendationsScreen}
              options={{animation: 'slide_from_right'}}
            />
          </>


        )}
      </Stack.Navigator>
    </NavigationContainer>
    </ThemeProvider>
  );
};

export default App;
