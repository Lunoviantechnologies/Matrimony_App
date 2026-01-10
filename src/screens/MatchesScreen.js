import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

const MatchesScreen = ({ navigation }) => {
  const links = [
    { label: "My Matches", route: "MyMatches" },
    { label: "Near Me", route: "Nearme" },
    { label: "More Matches", route: "MoreMatches" },
    { label: "Requests", route: "Requests" },
    { label: "Sent Requests", route: "Sent" },
  ];

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Matches</Text>
        <Text style={styles.subtitle}>Browse matches and requests</Text>

        {links.map((l) => (
          <TouchableOpacity key={l.route} style={styles.card} onPress={() => navigation.navigate(l.route)}>
            <Text style={styles.cardText}>{l.label}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4" },
  content: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#1f1f39" },
  subtitle: { fontSize: 13, color: "#4b4a5f", marginBottom: 8 },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  cardText: { fontSize: 16, fontWeight: "700", color: "#1f1f39" },
});

export default MatchesScreen;

