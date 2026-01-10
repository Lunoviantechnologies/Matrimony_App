import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";

const PrivacyPolicyScreen = () => {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Privacy Policy</Text>
        <Text style={styles.updated}>Last updated: Jan 2026</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>1. Information We Collect</Text>
          <Text style={styles.text}>
            We collect account details (name, email, phone), profile information, device data, and usage analytics to
            provide and improve our services.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. How We Use Your Data</Text>
          <Text style={styles.text}>
            To operate the app, personalize matches, communicate updates, and ensure safety. We do not sell your data.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. Sharing</Text>
          <Text style={styles.text}>
            We may share data with trusted vendors for hosting, analytics, and notifications. We do not share your
            personal contact details with other members without consent.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. Security</Text>
          <Text style={styles.text}>We use reasonable safeguards, but no method is 100% secure. Protect your account credentials.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. Your Choices</Text>
          <Text style={styles.text}>
            You can update or delete your profile. You may opt-out of marketing communications. Some data may be retained
            as required by law or for legitimate interests.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>6. Cookies & Tracking</Text>
          <Text style={styles.text}>We may use cookies or similar technologies for analytics and session management.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>7. Children</Text>
          <Text style={styles.text}>The service is not intended for minors. Do not register if you are under the legal age.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>8. Changes</Text>
          <Text style={styles.text}>We may update this policy. Continued use after changes means you accept the updates.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>9. Contact</Text>
          <Text style={styles.text}>For questions, contact support@vivahjeevan.com.</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f7fb" },
  content: { padding: 16, paddingBottom: 32, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#0f172a" },
  updated: { fontSize: 12, color: "#6b7280" },
  section: { gap: 6, marginTop: 8 },
  heading: { fontSize: 15, fontWeight: "700", color: "#111827" },
  text: { fontSize: 13, color: "#475467", lineHeight: 19 },
});

export default PrivacyPolicyScreen;

