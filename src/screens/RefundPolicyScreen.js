import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";

const RefundPolicyScreen = () => {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Refund & Cancellation Policy</Text>
        <Text style={styles.subtitle}>Vivah Jeevan</Text>

        <View style={styles.card}>
          <Text style={styles.heading}>Strict No-Refund Policy</Text>
          <Text style={styles.text}>All payments are final.</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>No refunds for:</Text>
          <Text style={styles.text}>• No matches</Text>
          <Text style={styles.text}>• Unsuccessful marriage</Text>
          <Text style={styles.text}>• Technical issues beyond reasonable control</Text>
          <Text style={styles.text}>• Account suspension or termination</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.heading}>Non-Transferable</Text>
          <Text style={styles.text}>Subscription fees are non-transferable.</Text>
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
  heading: { fontSize: 16, fontWeight: "800", color: "#111827" },
  text: { fontSize: 14, color: "#1f2937" },
});

export default RefundPolicyScreen;


