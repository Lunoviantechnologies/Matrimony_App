import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";

const PaymentFailedScreen = ({ navigation, route }) => {
  const message = route?.params?.message || "Payment could not be completed. No charges were made.";

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.box}>
        <Text style={styles.icon}>✕</Text>
        <Text style={styles.title}>Payment Failed</Text>
        <Text style={styles.message}>{message}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("PremiumSubscription")}>
          <Text style={styles.btnText}>Try Again</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate("Dashboard")}>
          <Text style={styles.linkText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f8ff", justifyContent: "center", alignItems: "center", padding: 20 },
  box: { alignItems: "center", maxWidth: 320 },
  icon: { fontSize: 64, color: "#ef4444", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#1f2937", marginBottom: 8, textAlign: "center" },
  message: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 24 },
  btn: { backgroundColor: "#6c3cff", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  linkBtn: { marginTop: 12 },
  linkText: { color: "#6c3cff", fontWeight: "600", fontSize: 14 },
});

export default PaymentFailedScreen;
