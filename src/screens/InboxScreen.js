import React from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

const rows = [
  { label: "Requests", route: "Requests", icon: "📩" },
  { label: "Sent Requests", route: "Sent", icon: "📤" },
  { label: "Accepted", route: "Accepted", icon: "✅" },
  { label: "Rejected", route: "Rejected", icon: "❌" },
];

const InboxScreen = ({ navigation }) => {
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Inbox</Text>
        <Text style={styles.subtitle}>Manage your requests and responses</Text>

        <View style={styles.card}>
          {rows.map((row, idx) => (
            <TouchableOpacity
              key={row.route}
              style={[styles.row, idx !== rows.length - 1 && styles.rowDivider]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate(row.route)}
            >
              <View style={styles.rowLeft}>
                <Text style={styles.rowIcon}>{row.icon}</Text>
                <Text style={styles.rowLabel}>{row.label}</Text>
              </View>
              <Text style={styles.rowChevron}>›</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4" },
  content: { padding: 16, paddingBottom: 40, gap: 12 },
  title: { fontSize: 22, fontWeight: "800", color: "#1f1f39" },
  subtitle: { fontSize: 13, color: "#4b4a5f" },
  card: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 18,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  rowLeft: { flexDirection: "row", alignItems: "center", columnGap: 10 },
  rowIcon: { fontSize: 18 },
  rowLabel: { fontSize: 15, fontWeight: "600", color: "#111827" },
  rowChevron: { fontSize: 20, color: "#9ca3af" },
});

export default InboxScreen;

