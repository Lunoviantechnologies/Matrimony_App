import React from "react";
import { View, Text, StyleSheet, ScrollView } from "react-native";

const GenericScreen = ({ route }) => {
  const title = route?.params?.title || "Screen";
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.subtitle}>This screen is scaffolded. Hook up API/views later.</Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f8ff",
  },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#555", textAlign: "center" },
});

export default GenericScreen;

