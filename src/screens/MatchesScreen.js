import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

const MatchesScreen = ({ navigation }) => {
  const primaryLinks = [
    { label: "New Matches", route: "Newmatches", icon: "🆕" },
    { label: "My Matches", route: "MyMatches", icon: "❤️" },
    { label: "Near Me", route: "Nearme", icon: "📍" },
    { label: "More Matches", route: "MoreMatches", icon: "✨" },
  ];

  const requestLinks = [
    { label: "Requests", route: "Requests", icon: "📩" },
    { label: "Sent Requests", route: "Sent", icon: "📤" },
    { label: "Accepted", route: "Accepted", icon: "✅" },
    { label: "Rejected", route: "Rejected", icon: "❌" },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>Browse matches like web app</Text>

        <View style={styles.tabsRow}>
          {primaryLinks.map((l) => (
            <TouchableOpacity key={l.route} style={styles.tabPill} onPress={() => navigation.navigate(l.route)}>
              <Text style={styles.tabPillText}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>Requests</Text>
        <View style={styles.grid}>
          {requestLinks.map((l) => (
            <TouchableOpacity key={l.route} style={styles.card} onPress={() => navigation.navigate(l.route)}>
              <Text style={styles.cardIcon}>{l.icon}</Text>
              <Text style={styles.cardText}>{l.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4" },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#1f1f39" },
  subtitle: { fontSize: 13, color: "#4b4a5f", marginBottom: 8 },
  sectionLabel: { fontSize: 13, color: "#6b7280", fontWeight: "700", marginTop: 6, marginBottom: 6 },
  tabsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 6,
  },
  tabPill: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#dbe4d2",
    borderRadius: 999,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  tabPillText: { color: "#1f1f39", fontWeight: "700", fontSize: 13 },
  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 14,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
    marginBottom: 12,
  },
  cardIcon: { fontSize: 24, marginBottom: 8 },
  cardText: { fontSize: 16, fontWeight: "700", color: "#1f1f39" },
});

export default MatchesScreen;

