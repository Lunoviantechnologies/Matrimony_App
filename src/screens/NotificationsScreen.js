import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { fetchNotificationsApi, markNotificationReadApi, markAllNotificationsReadApi } from "../api/api";
import { getSession } from "../api/authSession";

const NotificationsScreen = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = async () => {
    try {
      setError("");
      const { userId } = getSession();
      if (!userId) {
        setError("Please login again.");
        return;
      }
      const res = await fetchNotificationsApi(userId);
      const data = Array.isArray(res?.data) ? res.data : res?.data?.content || [];
      const normalized = data.map((n) => ({ ...n, read: Boolean(n.read) }));
      setItems(normalized);
    } catch (e) {
      setError("Failed to load notifications");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const onMarkRead = async (id) => {
    try {
      await markNotificationReadApi(id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {}
  };

  const onMarkAll = async () => {
    try {
      const { userId } = getSession();
      if (!userId) return;
      await markAllNotificationsReadApi(userId);
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch {}
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.card, item.read && styles.cardRead]} onPress={() => onMarkRead(item.id)}>
      <View style={styles.cardRow}>
        <Text style={styles.title}>{item.title || "Notification"}</Text>
        {!item.read && <View style={styles.dot} />}
      </View>
      {item.message ? <Text style={styles.message}>{item.message}</Text> : null}
      {item.createdAt ? <Text style={styles.time}>{item.createdAt}</Text> : null}
    </TouchableOpacity>
  );

  let content = null;
  if (loading) {
    content = <ActivityIndicator size="large" color="#1f1f39" />;
  } else if (error) {
    content = (
      <>
        <Text style={styles.error}>{error}</Text>
        <TouchableOpacity style={styles.primaryBtn} onPress={load}>
          <Text style={styles.primaryText}>Retry</Text>
        </TouchableOpacity>
      </>
    );
  } else {
    content = (
      <>
      <View style={styles.headerRow}>
        <Text style={styles.header}>Notifications</Text>
        <TouchableOpacity onPress={onMarkAll}>
          <Text style={styles.link}>Mark all read</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={items}
        keyExtractor={(item, idx) => `${item.id || idx}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
          keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />}
        ListEmptyComponent={<Text style={styles.empty}>No notifications</Text>}
      />
      </>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
    >
      <SafeAreaView style={styles.root}>{content}</SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f7fb", padding: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  header: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  link: { color: "#2563eb", fontWeight: "700" },
  list: { paddingBottom: 40, gap: 10 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#eef2f7",
    gap: 4,
  },
  cardRead: { opacity: 0.7 },
  cardRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 15, fontWeight: "700", color: "#0f172a" },
  message: { fontSize: 13, color: "#475467" },
  time: { fontSize: 12, color: "#94a3b8" },
  dot: { width: 10, height: 10, borderRadius: 5, backgroundColor: "#22c55e" },
  error: { color: "#b91c1c", marginBottom: 12, fontWeight: "700" },
  primaryBtn: { backgroundColor: "#111827", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  primaryText: { color: "#fff", fontWeight: "800" },
  empty: { textAlign: "center", color: "#475467", marginTop: 20 },
});

export default NotificationsScreen;

