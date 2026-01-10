import React from "react";
import { SafeAreaView, View, Text, StyleSheet, Switch } from "react-native";

const SettingsScreen = () => {
  const [notifications, setNotifications] = React.useState(true);
  const [darkMode, setDarkMode] = React.useState(false);

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.card}>
        <Text style={styles.title}>Settings</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Notifications</Text>
          <Switch value={notifications} onValueChange={setNotifications} />
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Dark Mode</Text>
          <Switch value={darkMode} onValueChange={setDarkMode} />
        </View>
        <Text style={styles.note}>These toggles are local only. Hook to backend when ready.</Text>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f7fb", padding: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 12,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 15, color: "#0f172a", fontWeight: "600" },
  note: { fontSize: 12, color: "#94a3b8", marginTop: 8 },
});

export default SettingsScreen;

