type TicketType = 'adult' | 'child' | 'student';

interface Seat {
    number: number;
    taken: boolean;
    selected: boolean;
    ticketType: TicketType | null;
}

import React, { useState } from 'react';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { getApiUrl } from '../config/api';

type RootStackParamList = {
  Login: undefined;
  SuccessScreen: undefined;
};

import {
  Text,
  View,
  StyleSheet,
  ScrollView,
  StatusBar,
  ImageBackground,
  TouchableOpacity,
  ToastAndroid,
  SafeAreaView,
  Modal,
  Dimensions,
  Alert,
} from 'react-native';
import axios from 'axios';
import { useTranslation } from 'react-i18next';
import {
  BORDERRADIUS,
  COLORS,
  FONTFAMILY,
  FONTSIZE,
  SPACING,
} from '../theme/theme';
import { LinearGradient } from 'expo-linear-gradient';
import AppHeader from '../components/AppHeader';
import * as SecureStore from 'expo-secure-store';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '../context/ThemeContext';
import AsyncStorage from '@react-native-async-storage/async-storage';



const { width } = Dimensions.get('window');

const generateDate = (t: (key: string) => string) => {
  const date = new Date();
  let weekdays = [];
  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(date.getTime() + i * 24 * 60 * 60 * 1000);
    weekdays.push({
      date: nextDate.getDate(),
      day: t(`days.short.${nextDate.getDay()}`),
    });
  }
  return weekdays;
};

const generateSeats = (): Seat[][] => {
  const numRows = 5;
  const numColumns = 7;
  let seatNumber = 1;
  let seatLayout = [];

  for (let i = 0; i < numRows; i++) {
    let rowArray = [];
    for (let j = 0; j < numColumns; j++) {
      rowArray.push({
        number: seatNumber,
        taken: Boolean(Math.round(Math.random())),
        selected: false,
        ticketType: null,
      });
      seatNumber++;
    }
    seatLayout.push(rowArray);
  }
  return seatLayout;
};

interface SeatBookingScreenProps {
  navigation: any;
  route: {
    params: {
      date: string;
      time: number;
      PosterImage: string;
      MovieName: string;
      BgImage: string;
      sessionId: number; // Added sessionId for booking
    };
  };
}

const SeatBookingScreen = ({ route }: SeatBookingScreenProps) => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t } = useTranslation();
  const { theme, colors } = useTheme();

  const [dateArray] = useState<any[]>(generateDate(t));
  const [selectedDateIndex] = useState({
    fullDate: route.params.date,
    day: new Date(route.params.date).toLocaleString('en-US', { weekday: 'long' }),
    date: String(new Date(route.params.date).getDate()).padStart(2, '0'),
  });
  const [price, setPrice] = useState<number>(0);
  const [twoDSeatArray, setTwoDSeatArray] = useState<Seat[][]>(generateSeats());
  const [selectedSeatArray, setSelectedSeatArray] = useState<{number: number; ticketType: TicketType}[]>([]);
  const [selectedTimeIndex] = useState(route.params.time);
  const [ticketImage] = useState(route.params.PosterImage);
  const [modalVisible, setModalVisible] = useState(false);
  const [currentSeat, setCurrentSeat] = useState<{ index: number; subindex: number; number: number } | null>(null);

  type TicketType = 'adult' | 'child' | 'student';

const TICKET_TYPES = {
    ADULT: 'adult',
    CHILD: 'child',
    STUDENT: 'student'
  } as const;

interface Seat {
    number: number;
    taken: boolean;
    selected: boolean;
    ticketType: TicketType | null;
}

  const ticketPrices = {
    [TICKET_TYPES.ADULT]: 1200,
    [TICKET_TYPES.CHILD]: 800,
    [TICKET_TYPES.STUDENT]: 1000
  };

  const color_gradient = theme === 'light' ? COLORS.WhiteRGB10 : COLORS.BlackRGB10;
  const color_gradient_1 = theme === 'light' ? COLORS.White : COLORS.Black;

  const selectSeat = (index: number, subindex: number, num: number) => {
    if (!twoDSeatArray[index][subindex].taken) {
      const temp = [...twoDSeatArray];
      if (!temp[index][subindex].selected) {
        setCurrentSeat({ index, subindex, number: num });
        setModalVisible(true);
      } else {
        temp[index][subindex].selected = false;
        temp[index][subindex].ticketType = null;
        setTwoDSeatArray(temp);
        updateSelectedSeatsAndPrice(temp);
      }
    }
  };

  const handleTicketTypeSelection = (ticketType: TicketType) => {
    if (currentSeat) {
      const { index, subindex, number } = currentSeat;
      const temp = [...twoDSeatArray];
      temp[index][subindex].selected = true;
      temp[index][subindex].ticketType = ticketType;
      setTwoDSeatArray(temp);
      updateSelectedSeatsAndPrice(temp);
      setModalVisible(false);
      setCurrentSeat(null);
    }
  };

  const updateSelectedSeatsAndPrice = (seatArray: Seat[][]) => {
    const selectedSeats = [];
    let totalPrice = 0;

    seatArray.forEach((row) =>
      row.forEach((seat) => {
        if (seat.selected) {
          selectedSeats.push({ number: seat.number, ticketType: seat.ticketType });
          totalPrice += ticketPrices[seat.ticketType as keyof typeof ticketPrices] || 0;
        }
      })
    );

    setSelectedSeatArray(selectedSeats);
    setPrice(totalPrice);
  };

  const BookSeats = async () => {
    if (selectedSeatArray.length !== 0) {
      try {
        // First, send booking data to backend
        const bookingData = {
          session_id: route.params.sessionId,
          seats: selectedSeatArray.map(seat => ({
            number: seat.number,
            ticket_type: seat.ticketType
          })),
          total_price: price
        };
        const token = await AsyncStorage.getItem('userToken');
        if (!token) {
          Alert.alert(
            t('common.error'),
            t('auth.loginRequired'),
            [{ text: t('common.ok'), onPress: () => navigation.navigate('Login') }]
          );
          return;
        }

        const response = await axios.post(getApiUrl('/bookings/'), bookingData, {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        if (response.status === 201) {
          // If booking is successful, store ticket data locally
          await SecureStore.setItemAsync(
            'ticket',
            JSON.stringify({
              seatArray: selectedSeatArray,
              time: selectedTimeIndex,
              date: selectedDateIndex,
              ticketImage: ticketImage,
              bookingId: response.data.id // Store the booking ID from backend
            })
          );
          navigation.dispatch({
            type: 'RESET',
            payload: {
              index: 0,
              routes: [{ name: 'SuccessScreen' }]
            }
          });
        }
      } catch (error: any) {
        console.error('Error booking seats:', error);
        let errorMessage = t('seat.bookingError');
        
        if (error.response) {
          // Handle specific backend error responses
          switch (error.response.status) {
            case 400:
              errorMessage = error.response.data.detail || t('seat.invalidBookingData');
              break;
            case 401:
              errorMessage = t('auth.loginRequired');
              navigation.navigate('Login');
              break;
            case 403:
              errorMessage = t('auth.notAuthorized');
              break;
            case 409:
              errorMessage = t('seat.alreadyBooked');
              break;
            default:
              errorMessage = t('seat.bookingError');
          }
        }

        Alert.alert(
          t('common.error'),
          errorMessage,
          [{ text: t('common.ok') }]
        );
      }
    } else {
      ToastAndroid.showWithGravity(
        t('seat.selectSeatsAndTypes'),
        ToastAndroid.SHORT,
        ToastAndroid.BOTTOM
      );
    }
  };

  const color_seat_blue_white = theme === 'dark' ? COLORS.White : COLORS.Blue;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme === 'dark' ? COLORS.Black : COLORS.White }]}>
      <ScrollView
        style={[styles.container, { backgroundColor: theme === 'dark' ? COLORS.Black : COLORS.White }]}
        bounces={false}
        showsVerticalScrollIndicator={false}>
        <StatusBar hidden />
        <View>
          <ImageBackground
            source={{ uri: route.params?.BgImage }}
            style={[styles.ImageBG, { backgroundColor: theme === 'dark' ? COLORS.Black : COLORS.White }]}>
            <LinearGradient colors={[color_gradient, color_gradient_1]} style={styles.linearGradient}>
              <View style={styles.appHeaderContainer}>
                <AppHeader name="arrow-back" header={t('ticket.seats')} action={() => navigation.goBack()} />
              </View>
            </LinearGradient>
            <Text style={[styles.screenText, { color: theme === 'dark' ? COLORS.White : COLORS.Black }]}>
              {t('seat.screenThisWay')}
            </Text>
          </ImageBackground>
        </View>

        <View style={styles.seatContainer}>
          <View style={styles.containerGap20}>
            {twoDSeatArray?.map((item, index) => (
              <View key={index} style={styles.seatRow}>
                <Text style={[styles.screenText, { color: theme === 'dark' ? COLORS.White : COLORS.Black }]}>
                  {index + 1}
                </Text>
                {item?.map((subitem, subindex) => (
                  <TouchableOpacity
                    key={subitem.number}
                    onPress={() => selectSeat(index, subindex, subitem.number)}>
                    <MaterialIcons
                      name="event-seat"
                      style={[
                        styles.seatIcon,
                        { color: theme === 'dark' ? COLORS.White : COLORS.Blue },
                        subitem.taken ? { color: COLORS.Grey } : {},
                        subitem.selected ? { color: COLORS.Orange } : {},
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            ))}
          </View>
          <View style={styles.seatRadioContainer}>
            <View style={styles.radioContainer}>
              <MaterialIcons name="event-seat" style={[styles.radioIcon, { color: color_seat_blue_white }]} />
              <Text style={[styles.radioText, { color: colors.text }]}>{t('seat.available')}</Text>
            </View>
            <View style={styles.radioContainer}>
              <MaterialIcons name="event-seat" style={[styles.radioIcon, { color: COLORS.Grey }]} />
              <Text style={[styles.radioText, { color: colors.text }]}>{t('seat.taken')}</Text>
            </View>
            <View style={styles.radioContainer}>
              <MaterialIcons name="event-seat" style={[styles.radioIcon, { color: COLORS.Orange }]} />
              <Text style={[styles.radioText, { color: colors.text }]}>{t('seat.selected')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.buttonPriceContainer}>
          <View style={styles.priceContainer}>
            <Text style={[styles.totalPriceText, { color: colors.text }]}>{t('seat.totalPrice')}</Text>
            <Text style={[styles.price, { color: colors.text }]}>₸ {price}.00</Text>
          </View>
          <TouchableOpacity onPress={BookSeats}>
            <Text style={[styles.buttonText, { color: colors.text }]}>{t('seat.buyTickets')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Redesigned Modal for Ticket Type Selection */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContainer, { backgroundColor: theme === 'dark' ? COLORS.DarkGrey : COLORS.White }]}>
            <Text style={[styles.modalTitle, { color: colors.text }]}>
              {t('seat.chooseTicketType')} {currentSeat?.number}
            </Text>
            <View style={styles.ticketOptionsContainer}>
              <TouchableOpacity
                style={[styles.ticketButton, { borderColor: COLORS.Orange }]}
                onPress={() => handleTicketTypeSelection(TICKET_TYPES.ADULT)}>
                <Text style={[styles.ticketButtonText, { color: COLORS.Orange }]}>{t('seat.adult')}</Text>
                <Text style={[styles.ticketPriceText, { color: colors.text }]}>₸{ticketPrices[TICKET_TYPES.ADULT]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ticketButton, { borderColor: COLORS.Yellow }]}
                onPress={() => handleTicketTypeSelection(TICKET_TYPES.CHILD)}>
                <Text style={[styles.ticketButtonText, { color: COLORS.Yellow }]}>{t('seat.child')}</Text>
                <Text style={[styles.ticketPriceText, { color: colors.text }]}>₸{ticketPrices[TICKET_TYPES.CHILD]}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.ticketButton, { borderColor: COLORS.Grey }]}
                onPress={() => handleTicketTypeSelection(TICKET_TYPES.STUDENT)}>
                <Text style={[styles.ticketButtonText, { color: COLORS.Grey }]}>{t('seat.student')}</Text>
                <Text style={[styles.ticketPriceText, { color: colors.text }]}>₸{ticketPrices[TICKET_TYPES.STUDENT]}</Text>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setModalVisible(false)}>
              <Text style={[styles.closeButtonText, { color: COLORS.Orange }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    
  },
  ImageBG: {
    width: '100%',
    aspectRatio: 3072 / 1727,
  },
  linearGradient: {
    height: '100%',
  },
  screenText: {
    textAlign: 'center',
    fontFamily: FONTFAMILY.poppins_thin,
    fontSize: FONTSIZE.size_12,
    color: COLORS.White,
  },
  appHeaderContainer: {
  },
  seatContainer: {
    marginVertical: SPACING.space_36,
  },
  containerGap20: {
    gap: SPACING.space_20,
  },
  seatRow: {
    flexDirection: 'row',
    gap: SPACING.space_20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seatIcon: {
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
  },
  seatRadioContainer: {
    flexDirection: 'row',
    marginTop: SPACING.space_36,
    marginBottom: SPACING.space_10,
    alignItems: 'center',
    justifyContent: 'space-evenly',
  },
  radioContainer: {
    flexDirection: 'row',
    gap: SPACING.space_10,
    alignItems: 'center',
  },
  radioIcon: {
    fontSize: FONTSIZE.size_20,
    color: COLORS.White,
  },
  radioText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_12,
    color: COLORS.White,
  },
  buttonPriceContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.space_24,
    paddingBottom: SPACING.space_24,
  },
  priceContainer: {
    alignItems: 'center',
  },
  totalPriceText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.Grey,
  },
  price: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
  },
  buttonText: {
    borderRadius: BORDERRADIUS.radius_25,
    paddingHorizontal: SPACING.space_24,
    paddingVertical: SPACING.space_10,
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_16,
    color: COLORS.White,
    backgroundColor: COLORS.Orange,
  },
  // Redesigned Modal Styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)', // Darker overlay for better contrast
  },
  modalContainer: {
    width: width * 0.85,
    padding: SPACING.space_20,
    borderRadius: BORDERRADIUS.radius_20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5, // Adds shadow on Android
  },
  modalTitle: {
    fontFamily: FONTFAMILY.poppins_semibold,
    fontSize: FONTSIZE.size_20,
    textAlign: 'center',
    marginBottom: SPACING.space_20,
  },
  ticketOptionsContainer: {
    gap: SPACING.space_15,
  },
  ticketButton: {
    paddingVertical: SPACING.space_12,
    paddingHorizontal: SPACING.space_20,
    borderWidth: 2,
    borderRadius: BORDERRADIUS.radius_15,
    alignItems: 'center',
    backgroundColor: 'transparent',
  },
  ticketButtonText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_16,
  },
  ticketPriceText: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    marginTop: SPACING.space_4,
  },
  closeButton: {
    marginTop: SPACING.space_20,
    paddingVertical: SPACING.space_10,
    paddingHorizontal: SPACING.space_20,
    borderRadius: BORDERRADIUS.radius_10,
    backgroundColor: COLORS.WhiteRGBA15,
  },
  closeButtonText: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_16,
  },
});

export default SeatBookingScreen;