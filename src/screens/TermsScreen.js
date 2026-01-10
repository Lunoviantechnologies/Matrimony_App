import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";

const TermsScreen = () => {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.updated}>Last updated: Jan 2026</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>1. Acceptance</Text>
          <Text style={styles.text}>
            By using VivahJeevan, you agree to these terms. Please read them carefully before continuing.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. Eligibility</Text>
          <Text style={styles.text}>You must be of legal age to register and provide accurate, truthful information.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. Account & Security</Text>
          <Text style={styles.text}>
            Keep your credentials safe. You are responsible for all activity on your account.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. Content & Conduct</Text>
          <Text style={styles.text}>
            Do not post harmful, abusive, or unlawful content. Respect other members and comply with community guidelines.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. Privacy</Text>
          <Text style={styles.text}>
            We process your data as described in our Privacy Policy. Do not share sensitive information publicly.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>6. Subscriptions & Payments</Text>
          <Text style={styles.text}>
            Premium features may require paid plans. All fees are non-refundable except where required by law.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>7. Liability</Text>
          <Text style={styles.text}>
            VivahJeevan is provided “as is.” We are not liable for user interactions; please exercise caution.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>8. Termination</Text>
          <Text style={styles.text}>
            We may suspend or terminate accounts for violations. You may delete your account at any time.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>9. Changes</Text>
          <Text style={styles.text}>
            Terms may change periodically. Continued use after updates means you accept the revised terms.
          </Text>
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

export default TermsScreen;

