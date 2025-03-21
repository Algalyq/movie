import React, { useEffect, useState } from "react";
import { getApiUrl } from '../config/api';
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity, StatusBar, Modal, ImageBackground } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { BORDERRADIUS, FONTFAMILY, FONTSIZE, SPACING, COLORS } from "../theme/theme";
import { useTheme } from '../context/ThemeContext';
import { useNavigation } from "@react-navigation/native";
import AppHeader from "../components/AppHeader";
import { LinearGradient } from 'expo-linear-gradient';
import Ionicons from '@expo/vector-icons/Ionicons';
import DashedLine from 'react-native-dashed-line';
import axios from "axios";
import { baseImagePath } from "../api/apicalls";
import { useTranslation } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Ticket {
  id: number;
  booking_time: string;
  seats: number;
  session: {
    id: number;
    available_seats: number;
    cinema: {
      id: number;
      name: string;
      address: string;
    };
    date: string;
    film: {
      id: number;
      title: string;
      poster_image: string;
    };
    hall: number;
    language: string;
    time: string;
  };
  status: string;
  active: boolean;
  total_price: string;
  user: {
    id: number;
    username: string;
    email: string;
    phone_number: string;
  };
}

const TicketScreen = ({ navigation, route }: any) => {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const getDayOfWeek = (dateString: string) => {
    const dateObject = new Date(dateString);
    return {
      date: dateObject.getDate(),
      day: t(`days.full.${dateObject.getDay()}`),
    };
  };

  const formatTime = (timeString: string) => {
    // Convert "hh:mm:ss" to "hh:mm"
    return timeString.slice(0, 5); // Takes first 5 characters, e.g., "09:17" from "09:17:14"
  };

  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [tickets, setTickets] = useState<Ticket[]>([]);

  useEffect(() => {
    if (route.params?.session && route.params?.seats) {
      const newTicket: Ticket = {
        id: tickets.length + 1,
        booking_time: new Date().toISOString(),
        seats: route.params.seats,
        session: route.params.session,
        status: 'CONFIRMED',
        total_price: route.params.totalPrice || '0',
        active: true, // Assuming new tickets are active
        user: {
          id: 0,
          username: '',
          email: '',
          phone_number: ''
        }
      };
      setTickets(prevTickets => [newTicket, ...prevTickets]);
    }
  }, [route.params]);

  useEffect(() => {
    const fetchTickets = async () => {
      const token = await AsyncStorage.getItem('userToken');
      try {
        const response = await axios.get(getApiUrl('/bookings/'), {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });
        if (response.data && Array.isArray(response.data)) {
          setTickets(response.data);
        }
      } catch (error) {
        console.error("Error fetching tickets:", error);
      }
    };
    fetchTickets();
  }, []);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day < 10 ? '0' + day : day}.${month < 10 ? '0' + month : month}.${year}`;
  };

  const renderTicket = ({ item }: { item: Ticket }) => {
    const formattedDate = formatDate(item.session.date);
    const formattedTime = formatTime(item.session.time);
    return (
      <TouchableOpacity
        style={[styles.ticketContainer_one, { backgroundColor: colors.card }]}
        onPress={() => {
          setSelectedTicket(item);
          setModalVisible(true);
        }}>
        <Image source={{ uri: item.session.film.poster_image }} style={styles.ticketImage} />
        <View style={styles.ticketInfo}>
          <Text style={[styles.ticketTitle, { color: colors.primary }]}>{item.session.film.title}</Text>
          <Text style={[styles.ticketDetails, { color: colors.text }]}>{item.session.cinema.name}</Text>
          <Text style={[styles.ticketDetails, { color: colors.text }]}>
            {formattedDate} • {formattedTime}
          </Text>
          <View style={[styles.statusBadge, { backgroundColor: item.active ? '#4CAF50' : '#F44336' }]}>
            <Text style={styles.statusText}>
              {item.active ? t('ticket.active') : t('ticket.expired')}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const styles = StyleSheet.create({
    ...baseStyles,
    container: {
      ...baseStyles.container,
      backgroundColor: colors.background
    },
    ticketTitle: {
      fontSize: 16,
      fontWeight: "bold",
      color: colors.text
    },
    ticketDetails: {
      ...baseStyles.ticketDetails,
      color: colors.text
    },
    statusBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: BORDERRADIUS.radius_4,
      marginTop: 4,
      alignSelf: 'flex-start'
    },
    statusText: {
      color: COLORS.White,
      fontSize: FONTSIZE.size_12,
      fontFamily: FONTFAMILY.poppins_medium
    },
    tabContainer: {
      ...baseStyles.tabContainer,
      borderBottomColor: colors.border
    },
    activeTab: {
      ...baseStyles.activeTab,
      borderBottomColor: colors.primary
    },
    tabText: {
      ...baseStyles.tabText,
      color: colors.text
    },
    activeTabText: {
      color: colors.primary
    },
    emptyTitle: {
      fontSize: 16,
      fontWeight: "bold",
      marginBottom: 8,
      color: colors.primary
    },
    emptySubtitle: {
      fontSize: 12,
      textAlign: "center",
      color: colors.text
    }
  });

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar hidden />
      <View style={styles.appHeaderContainer}>
        <AppHeader
          name="arrow-back"
          header={t('ticket.myTickets')}
          action={() => navigation.navigate('Tab')}
        />
      </View>
      <FlatList
        data={tickets}
        renderItem={renderTicket}
        contentContainerStyle={styles.ticketContainerList}
        keyExtractor={(item) => item.id.toString()}
      />
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}>
        <View style={[styles.modalOverlay, { backgroundColor: 'rgba(0, 0, 0, 0.9)' }]}>
          <View style={styles.ticketContainer}>
            <ImageBackground
              source={{ uri: selectedTicket?.session.film.poster_image }}
              style={styles.ticketBGImage}>
              <LinearGradient
                colors={[`${colors.primary}00`, selectedTicket?.active ? colors.primary : colors.border]}
                style={styles.linearGradient}
              />
            </ImageBackground>

            <DashedLine
              style={styles.dashedLine}
              dashLength={10}
              dashThickness={4}
              dashStyle={{ borderRadius: 12 }}
              dashColor={selectedTicket?.active ? colors.primary : colors.border}
              dashGap={14}
            />

            <View style={styles.ticketFooter}>
              <View style={styles.ticketDateContainer}>
                <View style={styles.subtitleContainer}>
                  <Text style={styles.dateTitle}>{new Date(selectedTicket?.session.date || '').getDate()}</Text>
                  <Text style={styles.subtitle}>{t(`days.full.${new Date(selectedTicket?.session.date || '').getDay()}`)}</Text>
                </View>
                <View style={styles.subtitleContainer}>
                  <Ionicons name="time-sharp" style={styles.clockIcon} />
                  <Text style={styles.subtitle}>{formatTime(selectedTicket?.session.time || '')}</Text>
                </View>
              </View>
              <View style={styles.ticketSeatContainer}>
                <View style={styles.subtitleContainer}>
                  <Text style={[styles.subheading]}>{t('ticket.hall')}</Text>
                  <Text style={styles.subtitle}>{selectedTicket?.session.hall}</Text>
                </View>
                <View style={styles.subtitleContainer}>
                  <Text style={[styles.subheading]}>{t('ticket.seats')}</Text>
                  <Text style={styles.subtitle}>
                    {selectedTicket?.seats?.map((seat: { number: number; ticket_type: string }) => seat.number).join(', ')}
                  </Text>
                </View>
                <View style={styles.subtitleContainer}>
                  <Text style={[styles.subheading]}>{t('ticket.totalPrice')}</Text>
                  <Text style={styles.subtitle}>{selectedTicket?.total_price}</Text>
                </View>
              </View>
              <Image
                source={require('../assets/image/barcode.png')}
                style={styles.barcodeImage}
              />
            </View>
          </View>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => setModalVisible(false)}>
            <Ionicons name="close-circle" size={56} color={colors.card} />
          </TouchableOpacity>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const baseStyles = StyleSheet.create({
  container: { flex: 1 },
  ticketContainerList: { padding: 16, gap: 8 },
  ticketContainer_one: { flexDirection: "row", padding: 16, borderRadius: BORDERRADIUS.radius_15 },
  ticketImage: { width: 64, height: 84, borderRadius: 4 },
  ticketInfo: { flex: 1, marginLeft: 10 },
  ticketDetails: { fontSize: 14 },
  appHeaderContainer: { marginHorizontal: SPACING.space_16, marginTop: SPACING.space_10 },
  tabContainer: { flexDirection: "row", borderBottomWidth: 1 },
  tab: { flex: 1, padding: 10, alignItems: "center" },
  activeTab: { borderBottomWidth: 2 },
  tabText: { fontSize: 14 },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  emptyImage: { width: 80, height: 80, marginBottom: 16 },
  ticketContainer: {
    flex: 1,
    justifyContent: 'center',
    top: -20,
  },
  ticketBGImage: {
    alignSelf: 'center',
    width: 280,
    aspectRatio: 200 / 300,
    borderTopLeftRadius: BORDERRADIUS.radius_25,
    borderTopRightRadius: BORDERRADIUS.radius_25,
    overflow: 'hidden',
    justifyContent: 'flex-end',
  },
  linearGradient: {
    height: '50%',
  },
  ticketFooter: {
    backgroundColor: COLORS.Orange,
    width: 280,
    alignItems: 'center',
    paddingBottom: SPACING.space_36,
    alignSelf: 'center',
    borderBottomLeftRadius: BORDERRADIUS.radius_25,
    borderBottomRightRadius: BORDERRADIUS.radius_25,
  },
  dashedLine: {
    width: 270,
    alignSelf: "center",
  },
  ticketDateContainer: {
    flexDirection: 'row',
    gap: SPACING.space_36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.space_10,
  },
  ticketSeatContainer: {
    flexDirection: 'row',
    gap: SPACING.space_36,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SPACING.space_10,
  },
  dateTitle: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
  },
  subtitle: {
    fontFamily: FONTFAMILY.poppins_regular,
    fontSize: FONTSIZE.size_14,
    color: COLORS.White,
  },
  subheading: {
    fontFamily: FONTFAMILY.poppins_medium,
    fontSize: FONTSIZE.size_18,
    color: COLORS.White,
  },
  subtitleContainer: {
    alignItems: 'center',
  },
  clockIcon: {
    fontSize: FONTSIZE.size_24,
    color: COLORS.White,
    paddingBottom: SPACING.space_10,
  },
  barcodeImage: {
    height: 50,
    aspectRatio: 158 / 52,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  closeButton: {
    position: 'absolute',
    zIndex: 1,
  },
});

export default TicketScreen;