import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { getSession } from "../api/authSession";

const AcceptedMatchesScreen = ({ navigation }) => {
  const { userId } = getSession();
  const [accepted, setAccepted] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [accRecv, accSent, allProfiles] = await Promise.all([
          axiosInstance.get(`/api/friends/accepted/received/${userId}`),
          axiosInstance.get(`/api/friends/accepted/sent/${userId}`),
          axiosInstance.get("/api/profiles/Allprofiles"),
        ]);
        setAccepted([...(accRecv.data || []), ...(accSent.data || [])]);
        setProfiles(Array.isArray(allProfiles.data) ? allProfiles.data : []);
      } catch (e) {
        console.log("accepted load error:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const renderItem = ({ item }) => {
    const otherId = Number(item.senderId) === Number(userId) ? item.receiverId : item.senderId;
    const p = profiles.find((x) => x.id === otherId);
    const name = p ? `${p.firstName || ""} ${p.lastName || ""}`.trim() || "User" : item.receiverName || item.senderName || "User";
    const city = p?.city || p?.country || "—";
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.meta}>{city}</Text>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.chatBtn}
            onPress={() => navigation.navigate("Dashboard", { screen: "Chat", params: { selectedId: otherId } })}
          >
            <Text style={styles.chatText}>Chat</Text>
          </TouchableOpacity>
        </View>
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
      <Text style={styles.title}>Accepted</Text>
      <FlatList
        data={accepted}
        keyExtractor={(i) => `${i.requestId || i.senderId}-${i.receiverId}`}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No accepted requests yet.</Text>}
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
  actions: { flexDirection: "row", marginTop: 10 },
  chatBtn: { flex: 1, backgroundColor: "#1f1f39", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  chatText: { color: "#fff", fontWeight: "800" },
  empty: { textAlign: "center", color: "#4b4a5f", marginTop: 20 },
});

export default AcceptedMatchesScreen;

