import React, { useEffect, useState } from "react";
import { SafeAreaView, Text, FlatList, View, StyleSheet, ActivityIndicator } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { getSession } from "../api/authSession";

const RejectedScreen = () => {
  const { userId } = getSession();
  const [rejected, setRejected] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [recv, sent, all] = await Promise.all([
          axiosInstance.get(`/friends/rejected/received/${userId}`),
          axiosInstance.get(`/friends/rejected/sent/${userId}`),
          axiosInstance.get("/profiles/Allprofiles"),
        ]);
        setRejected([...(recv.data || []), ...(sent.data || [])]);
        setProfiles(Array.isArray(all.data) ? all.data : []);
      } catch (e) {
        console.log("rejected load error:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const renderItem = ({ item }) => {
    const otherId = item.senderId === userId ? item.receiverId : item.senderId;
    const p = profiles.find((x) => x.id === otherId);
    const name = p ? `${p.firstName} ${p.lastName}` : item.senderId === userId ? item.receiverName : item.senderName || "User";
    const note = item.senderId === userId ? "They rejected your request" : "You rejected their request";
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{name}</Text>
        <Text style={[styles.meta, { color: "#d62828", fontWeight: "700" }]}>{note}</Text>
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Rejected Requests</Text>
      <FlatList
        data={rejected}
        keyExtractor={(i) => `${i.requestId || i.senderId}`}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No rejected requests.</Text>}
        contentContainerStyle={{ padding: 16, gap: 12 }}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4" },
  title: { fontSize: 20, fontWeight: "800", color: "#1f1f39", margin: 16 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  name: { fontSize: 16, fontWeight: "800", color: "#1f1f39" },
  meta: { fontSize: 12, color: "#4b4a5f", marginTop: 4 },
  empty: { textAlign: "center", color: "#4b4a5f", marginTop: 20 },
});

export default RejectedScreen;

