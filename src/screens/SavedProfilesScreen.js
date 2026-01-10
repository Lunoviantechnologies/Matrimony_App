import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";

const SavedProfilesScreen = () => {
  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Saved Profiles</Text>
        <Text style={styles.text}>Coming soon — connect this to saved profiles API.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f7fb", padding: 16, justifyContent: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a", marginBottom: 8 },
  text: { fontSize: 14, color: "#475467" },
});

export default SavedProfilesScreen;

