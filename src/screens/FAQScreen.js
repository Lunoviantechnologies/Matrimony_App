import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

const faqs = [
  { q: "How do I upgrade to Premium?", a: "Go to Premium in the dashboard or actions and follow the plans." },
  { q: "How do I edit my profile?", a: "Open Profile > Edit, update fields, then save." },
  { q: "How do notifications work?", a: "You receive alerts for matches, requests, and messages." },
];

const FAQScreen = () => (
  <SafeAreaView style={styles.root}>
    <View style={styles.card}>
      <Text style={styles.title}>FAQs</Text>
      {faqs.map((item) => (
        <View key={item.q} style={styles.item}>
          <Text style={styles.question}>{item.q}</Text>
          <Text style={styles.answer}>{item.a}</Text>
        </View>
      ))}
    </View>
  </SafeAreaView>
);

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f7fb", padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  item: { gap: 4 },
  question: { fontSize: 15, fontWeight: "700", color: "#111827" },
  answer: { fontSize: 13, color: "#475467" },
});

export default FAQScreen;

