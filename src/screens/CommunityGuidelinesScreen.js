import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";

const bullets = {
  must: ["Be honest", "Be respectful", "Communicate responsibly", "Report suspicious behavior"],
  mustNot: ["Scam or ask for money", "Harass or abuse", "Misuse photos or data", "Treat platform as a dating app"],
};

const CommunityGuidelinesScreen = () => {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Community Guidelines</Text>
        <Text style={styles.subtitle}>Vivah Jeevan is meant for serious, respectful matrimonial purposes only.</Text>

        <View style={styles.card}>
          <Text style={styles.heading}>You Must</Text>
          {bullets.must.map((b) => (
            <Text key={b} style={styles.item}>✔ {b}</Text>
          ))}
        </View>

        <View style={[styles.card, styles.dangerCard]}>
          <Text style={styles.heading}>You Must Not</Text>
          {bullets.mustNot.map((b) => (
            <Text key={b} style={styles.item}>✖ {b}</Text>
          ))}
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Enforcement</Text>
          <Text style={styles.item}>• Warning</Text>
          <Text style={styles.item}>• Suspension</Text>
          <Text style={styles.item}>• Permanent ban</Text>
          <Text style={styles.item}>• Legal action if required</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Contact</Text>
          <Text style={styles.item}>📧 Support Email: [your-support@email.com]</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f7fb" },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#475467", marginTop: 4, lineHeight: 19 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 6,
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  dangerCard: { borderColor: "#fca5a5", backgroundColor: "#fff5f5" },
  heading: { fontSize: 16, fontWeight: "800", color: "#111827" },
  item: { fontSize: 14, color: "#1f2937" },
});

export default CommunityGuidelinesScreen;


