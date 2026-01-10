import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";

const TermsScreen = () => {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Terms & Conditions</Text>
        <Text style={styles.updated}>Last updated: Jan 2026</Text>

        <View style={styles.section}>
          <Text style={styles.heading}>Last Updated</Text>
          <Text style={styles.text}>10/01/2026</Text>
          <Text style={styles.text}>
            Vivah Jeevan (“Platform”, “App”, “We”, “Us”) is operated by Vivah Jeevan / [Your Company Legal Name], India.
          </Text>
          <Text style={styles.text}>
            By registering, accessing, or using Vivah Jeevan, you unconditionally agree to these Terms. If you do not agree,
            you must immediately stop using the Platform.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>1. Eligibility</Text>
          <Text style={styles.text}>Users must be 18 years or older and legally eligible for marriage under Indian law.</Text>
          <Text style={styles.text}>Married persons, persons in live-in relationships, or those hiding marital status are strictly prohibited.</Text>
          <Text style={styles.text}>Vivah Jeevan reserves the absolute right to reject or terminate any profile without explanation.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>2. Account Registration & User Responsibility</Text>
          <Text style={styles.text}>You are solely responsible for: accuracy of profile information; photos, biodata, income, education, horoscope, marital status; and all actions done through your account.</Text>
          <Text style={styles.text}>One individual = one account only. Fake profiles, impersonation, or misleading data will result in permanent termination.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>3. Platform Role (Important Disclaimer)</Text>
          <Text style={styles.text}>Vivah Jeevan is ONLY a matchmaking technology platform.</Text>
          <Text style={styles.text}>We do NOT guarantee marriage or compatibility; do NOT conduct background or police verification; do NOT mediate disputes.</Text>
          <Text style={styles.text}>Any interaction, meeting, engagement, marriage, or financial transaction is entirely at the user’s own risk.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>4. Communication & Meetings</Text>
          <Text style={styles.text}>Users must exercise personal judgment and caution. Vivah Jeevan is not responsible for emotional harm, financial fraud, physical harm, or false promises. Meet only in public places.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>5. Strictly Prohibited Activities</Text>
          <Text style={styles.text}>No asking for/sending money, gifts, loans, crypto, or investments.</Text>
          <Text style={styles.text}>No dowry demands or discussions.</Text>
          <Text style={styles.text}>No obscene, abusive, sexual, or inappropriate language.</Text>
          <Text style={styles.text}>No dating/casual relationships/adultery via the app.</Text>
          <Text style={styles.text}>No harassment, stalking, threats, or blackmail.</Text>
          <Text style={styles.text}>No misuse of photos, screenshots, or personal data.</Text>
          <Text style={styles.text}>No promotion of hatred, violence, or illegal activities.</Text>
          <Text style={styles.text}>Violation = Immediate permanent ban + possible legal action.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>6. Account Suspension & Termination</Text>
          <Text style={styles.text}>Vivah Jeevan may suspend/delete accounts without notice, remove content at discretion, and block re-registration permanently. No compensation or refund is payable.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>7. Paid Services</Text>
          <Text style={styles.text}>All subscriptions/premium services are non-refundable, non-transferable, non-cancellable.</Text>
          <Text style={styles.text}>No refund for: no matches, account suspension, dissatisfaction, or marriage not happening.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>8. Limitation of Liability</Text>
          <Text style={styles.text}>To the maximum extent allowed by law, Vivah Jeevan is NOT liable for emotional distress, financial loss, physical injury, or marriage disputes/divorce. Maximum liability, if any, shall not exceed ₹1,000.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>9. Indemnity</Text>
          <Text style={styles.text}>You agree to indemnify Vivah Jeevan and its team against legal notices, claims, losses, and damages arising from your actions or violations.</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.heading}>10. Governing Law</Text>
          <Text style={styles.text}>These Terms are governed by Indian Law. Jurisdiction: Courts of [Hyderabad, Telangana].</Text>
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

