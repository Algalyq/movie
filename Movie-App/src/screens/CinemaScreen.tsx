import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";

interface Screening {
  time: string;
  cinema: string;
  hall: string;
  language: string;
  prices: number[];
}

const CinemaScreen: React.FC = () => {
  const screenings: Screening[] = [
    {
      time: "14:05",
      cinema: "Chaplin MEGA Alma-Ata",
      hall: "Зал 13",
      language: "РУС",
      prices: [2900, 1700, 1900],
    },
    {
      time: "14:20",
      cinema: "Kinopark 4 Globus",
      hall: "Зал 2",
      language: "РУС",
      prices: [1700, 1000, 1300],
    },
    {
      time: "14:30",
      cinema: "Kinopark 5 Premium Forum",
      hall: "Зал 3 Comfort – 3 этаж",
      language: "РУС",
      prices: [2600, 1600, 2100],
    },
    {
      time: "16:30",
      cinema: "Kinopark 5 Premium Forum",
      hall: "Зал 3 Comfort",
      language: "РУС",
      prices: [2600, 1600, 2100],
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.monthText}>Февраль</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.dateContainer}>
          {[...Array(7)].map((_, i) => (
            <TouchableOpacity
              key={i}
              style={[styles.dateButton, i === 0 && styles.selectedDate]}
            >
              <Text style={styles.dateText}>{["Сб", "Вс", "Пн", "Вт", "Ср", "Чт", "Пт"][i]}</Text>
              <Text style={styles.dateText}>{8 + i}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <View style={styles.filters}>
          <TouchableOpacity style={[styles.filterButton, styles.activeFilter]}>
            <Text style={styles.filterText}>По времени</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.filterButton}>
            <Text style={styles.filterText}>По кинотеатру</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.subFilters}>
          <TouchableOpacity style={styles.subFilterButton}>
            <Text style={styles.subFilterText}>Дневные</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.subFilterButton}>
            <Text style={styles.subFilterText}>Вечерние</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.subFilterButton, styles.activeSubFilter]}>
            <Text style={styles.subFilterText}>Все</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* List */}
      <ScrollView style={styles.listContainer}>
        {screenings.map((item, index) => (
          <TouchableOpacity key={index} style={styles.screeningItem}>
            <Text style={styles.time}>{item.time}</Text>
            <View style={styles.details}>
              <Text style={styles.cinema}>{item.cinema}</Text>
              <Text style={styles.hall}>
                {item.hall} • {item.language}
              </Text>
            </View>
            <View style={styles.prices}>
              {item.prices.map((price, i) => (
                <Text key={i} style={styles.price}>
                  {price} ₸
                </Text>
              ))}
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 16,
  },
  header: {
    marginVertical: 10,
  },
  monthText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  dateContainer: {
    marginTop: 8,
    flexDirection: "row",
  },
  dateButton: {
    padding: 8,
    alignItems: "center",
    marginRight: 8,
  },
  selectedDate: {
    backgroundColor: "#7b61ff",
    borderRadius: 8,
  },
  dateText: {
    color: "#fff",
    fontSize: 14,
  },
  filterContainer: {
    marginVertical: 10,
  },
  filters: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  activeFilter: {
    backgroundColor: "#7b61ff",
  },
  filterText: {
    color: "#000",
    fontWeight: "bold",
  },
  subFilters: {
    flexDirection: "row",
    marginTop: 8,
  },
  subFilterButton: {
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginRight: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  activeSubFilter: {
    backgroundColor: "#7b61ff",
  },
  subFilterText: {
    color: "#fff",
  },
  listContainer: {
    marginTop: 10,
  },
  screeningItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  time: {
    fontSize: 16,
    fontWeight: "bold",
  },
  details: {
    flex: 1,
    marginLeft: 10,
  },
  cinema: {
    fontSize: 14,
    fontWeight: "600",
  },
  hall: {
    fontSize: 12,
    color: "#666",
  },
  prices: {
    flexDirection: "column",
    alignItems: "flex-end",
  },
  price: {
    fontSize: 14,
    color: "#333",
  },
});

export default CinemaScreen;
