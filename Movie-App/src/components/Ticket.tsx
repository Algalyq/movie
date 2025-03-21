import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface TicketProps {
  time: string;
  cinema: string;
  hall: string;
  language: string;
  prices: number[];
}


const Ticket: React.FC<TicketProps> = ({ time, cinema, hall, language, prices }) => {
  return (
    <View style={styles.ticketContainer}>
      {/* Left Section: Time */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeText}>{time}</Text>
      </View>

      {/* Right Section: Details */}
      <View style={styles.detailsContainer}>
        <Text style={styles.cinemaText}>{cinema}</Text>
        <Text style={styles.hallText}>{hall}</Text>
        <Text style={styles.languageText}>{language}</Text>

        {/* Prices Row */}
        <View style={styles.pricesRow}>
          <Text style={styles.priceText}>ВЗР: {prices[0]} ₸</Text>
          <Text style={styles.priceText}>ДЕТ: {prices[1]} ₸</Text>
          <Text style={styles.priceText}>СТУД: {prices[2]} ₸</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  ticketContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    marginVertical: 8,
    backgroundColor: "#f9f9f9",
    borderRadius: 12,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  timeContainer: {
    width: 80,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ece9f6",
    borderRadius: 8,
    paddingVertical: 8,
  },
  timeText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6f42c1",
  },
  detailsContainer: {
    flex: 1,
    paddingLeft: 12,
  },
  cinemaText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  hallText: {
    fontSize: 14,
    color: "#666",
    marginVertical: 4,
  },
  languageText: {
    fontSize: 14,
    color: "#6f42c1",
    fontWeight: "600",
    marginBottom: 8,
  },
  pricesRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  priceText: {
    fontSize: 14,
    color: "#555",
  },
});

export default Ticket;
