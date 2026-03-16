import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet } from "react-native";

const PaymentSuccessScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.box}>
        <Text style={styles.icon}>✓</Text>
        <Text style={styles.title}>Payment Successful</Text>
        <Text style={styles.message}>Your premium plan is activated. Thank you for subscribing.</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("Dashboard")}>
          <Text style={styles.btnText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f8ff", justifyContent: "center", alignItems: "center", padding: 20 },
  box: { alignItems: "center", maxWidth: 320 },
  icon: { fontSize: 64, color: "#10b981", marginBottom: 16 },
  title: { fontSize: 22, fontWeight: "800", color: "#1f2937", marginBottom: 8, textAlign: "center" },
  message: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 24 },
  btn: { backgroundColor: "#6c3cff", paddingVertical: 14, paddingHorizontal: 24, borderRadius: 10 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});

export default PaymentSuccessScreen;
