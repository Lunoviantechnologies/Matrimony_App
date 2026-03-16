import React from "react";
import { SafeAreaView, ScrollView, View, Text, StyleSheet } from "react-native";

const DisclaimerScreen = () => {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Disclaimer – Vivah Jeevan</Text>

        <View style={styles.section}>
          <Text style={styles.text}>
            Vivah Jeevan is only a matchmaking technology platform. We do not guarantee marriage,
            compatibility, or relationship success.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            We do not verify user backgrounds, identity, financial status, or criminal history.
            All interactions are at the user's own risk.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            Vivah Jeevan is not responsible for any emotional, financial, physical, or legal
            consequences arising from user interactions.
          </Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.text}>
            Users are solely responsible for their decisions, meetings, communications, and
            relationships.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f8ff" },
  content: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 20, fontWeight: "800", color: "#1f2937", marginBottom: 20, textAlign: "center" },
  section: { marginBottom: 16 },
  text: { fontSize: 14, color: "#4b5563", lineHeight: 22 },
});

export default DisclaimerScreen;
