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
          <Text style={styles.text}>Name, age, gender</Text>
          <Text style={styles.text}>Photos, marital details</Text>
          <Text style={styles.text}>Contact information</Text>
          <Text style={styles.text}>Horoscope and preferences</Text>
          <Text style={styles.text}>Device & usage data</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. Data Usage</Text>
          <Text style={styles.text}>Provide matchmaking services</Text>
          <Text style={styles.text}>Improve app performance</Text>
          <Text style={styles.text}>Prevent fraud and misuse</Text>
          <Text style={styles.text}>Comply with legal obligations</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. Data Sharing</Text>
          <Text style={styles.text}>If required by law or court order</Text>
          <Text style={styles.text}>To prevent fraud or illegal activity</Text>
          <Text style={styles.text}>With government or law enforcement agencies</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. Data Storage</Text>
          <Text style={styles.text}>Data may be stored on cloud servers inside or outside India.</Text>
          <Text style={styles.text}>We use reasonable security measures but cannot guarantee 100% security.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. User Responsibility</Text>
          <Text style={styles.text}>Users must not share sensitive data unnecessarily.</Text>
          <Text style={styles.text}>Do not upload others’ photos without consent.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>6. Account Deletion</Text>
          <Text style={styles.text}>Users may request account deletion.</Text>
          <Text style={styles.text}>Backup data may be retained for legal and compliance purposes.</Text>
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

