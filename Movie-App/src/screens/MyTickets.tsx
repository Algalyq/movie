import React, { useState } from "react";
import { View, Text, StyleSheet, Image, FlatList, TouchableOpacity } from "react-native";
const img = require("../assets/image/img_av.jpg");
const tickets = [
  {
    id: 1,
    title: "Qazaq alemi",
    location: "Kinopark 7 Keruencity",
    date: "22.01.2025",
    time: "21:10",
    age: "6+",
    image:  img,
  },
  {
    id: 2,
    title: "Крейвен-охотник",
    location: "Kinopark 5 Atakent",
    date: "12.12.2024",
    time: "21:00",
    age: "18+",
    image: "https://example.com/kraven.jpg",
    tag: "Возврат",
  },
  {
    id: 3,
    title: "Sheker. Последний шанс",
    location: "Kino Forum",
    date: "23.11.2024",
    time: "20:55",
    age: "18+",
    image: "https://example.com/sheker.jpg",
  },
  {
    id: 4,
    title: "Заманбақ",
    location: "Kinopark 5 Atakent",
    date: "09.11.2024",
    time: "22:10",
    age: "",
    image: "https://example.com/zaman.jpg",
  },
];

const MyTickets = () => {
  const [activeTab, setActiveTab] = useState("active");

  const renderTicket = ({ item }: any) => (
    <View style={styles.ticketContainer}>
      <Image source={{ uri: item.image }} style={styles.ticketImage} />
      <View style={styles.ticketInfo}>
        <Text style={styles.ticketTitle}>{item.title}</Text>
        <Text style={styles.ticketDetails}>{item.location}</Text>
        <Text style={styles.ticketDetails}>
          {item.date} • {item.time}
        </Text>
        {item.tag && <Text style={styles.ticketTag}>{item.tag}</Text>}
      </View>
      <Text style={styles.ageTag}>{item.age}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Мои билеты</Text>
        <TouchableOpacity>
          <Text style={styles.returnText}>О возврате</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "active" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("active")}
        >
          <Text style={[styles.tabText, activeTab === "active" && styles.activeTabText]}>Активные билеты</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "history" && styles.activeTab,
          ]}
          onPress={() => setActiveTab("history")}
        >
          <Text style={[styles.tabText, activeTab === "history" && styles.activeTabText]}>История</Text>
        </TouchableOpacity>
      </View>

      {activeTab === "active" ? (
        <FlatList
          data={tickets}
          renderItem={renderTicket}
          keyExtractor={(item) => item.id.toString()}
        />
      ) : (
        <View style={styles.emptyContainer}>
          <Image source={{ uri: "https://example.com/empty_icon.png" }} style={styles.emptyImage} />
          <Text style={styles.emptyTitle}>Здесь пока ничего нет...</Text>
          <Text style={styles.emptySubtitle}>
            В этом разделе будут отображаться активные билеты
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
    alignItems: "center",
  },
  headerText: { fontSize: 18, fontWeight: "bold" },
  returnText: { fontSize: 14, color: "#8A2BE2" },
  tabContainer: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: "#ccc" },
  tab: { flex: 1, padding: 10, alignItems: "center" },
  activeTab: { borderBottomWidth: 2, borderBottomColor: "#8A2BE2" },
  tabText: { fontSize: 14, color: "#555" },
  activeTabText: { color: "#8A2BE2" },
  ticketContainer: { flexDirection: "row", padding: 16, borderBottomWidth: 1, borderBottomColor: "#ccc" },
  ticketImage: { width: 50, height: 70, borderRadius: 4 },
  ticketInfo: { flex: 1, marginLeft: 10 },
  ticketTitle: { fontSize: 16, fontWeight: "bold" },
  ticketDetails: { fontSize: 14, color: "#666" },
  ticketTag: {
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 12,
    color: "#fff",
    alignSelf: "flex-start",
    marginTop: 4,
  },
  ageTag: {
    fontSize: 14,
    color: "#888",
    fontWeight: "bold",
  },
  emptyContainer: { flex: 1, alignItems: "center", justifyContent: "center", padding: 16 },
  emptyImage: { width: 80, height: 80, marginBottom: 16 },
  emptyTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, color: "#666", textAlign: "center" },
});

export default MyTickets;
