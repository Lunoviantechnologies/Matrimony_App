import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";

const AboutScreen = () => {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>VivahJeevan.com</Text>
        <Text style={styles.subtitle}>Serving members worldwide</Text>

        <View style={styles.trustBar}>
          <Text style={styles.trustTitle}>A global matrimony community</Text>
          <View style={styles.trustRow}>
            <Text style={styles.trustIcon}>💝</Text>
            <Text style={styles.trustText}>Best Matches</Text>
          </View>
          <View style={styles.trustRow}>
            <Text style={styles.trustIcon}>✓</Text>
            <Text style={styles.trustText}>Verified Profiles</Text>
          </View>
          <View style={styles.trustRow}>
            <Text style={styles.trustIcon}>🔒</Text>
            <Text style={styles.trustText}>100% Privacy</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Our Journey to Finding Happiness</Text>
          <Text style={styles.text}>
            <Text style={styles.bold}>VivahJeevan.com</Text> was established with a singular mission:
            to redefine the way people meet and find their life partners. We combine tradition with
            technology to offer a safe, respectful, and effective platform for serious matchmaking.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Our Promise</Text>
          <Text style={styles.text}>
            We are committed to authenticity, privacy, and dignity. Every profile is treated with
            care, and we work to create meaningful connections that can lead to lasting partnerships.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>Contact</Text>
          <Text style={styles.text}>
            For any queries, visit Contact Us from the login screen or reach out through the app
            support options in Settings.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f8ff" },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "800", color: "#6c3cff", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#666", textAlign: "center", marginBottom: 20 },
  trustBar: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  trustTitle: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 12, textAlign: "center" },
  trustRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  trustIcon: { fontSize: 18, marginRight: 10 },
  trustText: { fontSize: 14, color: "#4b5563", fontWeight: "600" },
  section: { marginBottom: 20 },
  heading: { fontSize: 16, fontWeight: "700", color: "#1f2937", marginBottom: 8 },
  text: { fontSize: 14, color: "#4b5563", lineHeight: 22 },
  bold: { fontWeight: "700" },
});

export default AboutScreen;
