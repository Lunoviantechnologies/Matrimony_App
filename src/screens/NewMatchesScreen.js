import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, Text, FlatList, View, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { getSession } from "../api/authSession";

const NewMatchesScreen = () => {
  const { userId } = getSession();
  const [profiles, setProfiles] = useState([]);
  const [me, setMe] = useState(null);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const now = new Date();
        const fourDaysAgo = new Date();
        fourDaysAgo.setDate(now.getDate() - 4);

        const [all, mine, sentReq, recvReq, accRecv, accSent, rejRecv, rejSent] = await Promise.all([
          axiosInstance.get("/profiles/Allprofiles"),
          axiosInstance.get(`/profiles/myprofiles/${userId}`),
          axiosInstance.get(`/friends/sent/${userId}`),
          axiosInstance.get(`/friends/received/${userId}`),
          axiosInstance.get(`/friends/accepted/received/${userId}`),
          axiosInstance.get(`/friends/accepted/sent/${userId}`),
          axiosInstance.get(`/friends/rejected/received/${userId}`),
          axiosInstance.get(`/friends/rejected/sent/${userId}`),
        ]);
        const onlyRecent = (Array.isArray(all.data) ? all.data : []).filter((p) => {
          if (!p.createdAt) return false;
          const created = new Date(p.createdAt);
          return created >= fourDaysAgo && created <= now;
        });
        setProfiles(onlyRecent);
        setMe(mine.data);
        setSent(sentReq.data || []);
        setReceived(recvReq.data || []);
        setAccepted([...(accRecv.data || []), ...(accSent.data || [])]);
        setRejected([...(rejRecv.data || []), ...(rejSent.data || [])]);
      } catch (e) {
        console.log("new matches load error:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const hiddenIds = useMemo(() => {
    const sentIds = sent.map((r) => r.receiverId);
    const recvIds = received.map((r) => r.senderId);
    const accIds = accepted.map((r) => (r.receiverId === userId ? r.senderId : r.receiverId));
    const rejIds = rejected.map((r) => (r.receiverId === userId ? r.senderId : r.receiverId));
    return new Set([...sentIds, ...recvIds, ...accIds, ...rejIds, userId || -1]);
  }, [sent, received, accepted, rejected, userId]);

  const filtered = useMemo(() => {
    return profiles
      .filter((p) => !hiddenIds.has(p.id))
      .filter((p) => (me?.gender ? p.gender !== me.gender : true));
  }, [profiles, hiddenIds, me]);

  const handleSendRequest = async (receiverId) => {
    try {
      await axiosInstance.post(`/friends/send/${userId}/${receiverId}`);
      setSent((prev) => [...prev, { senderId: userId, receiverId }]);
    } catch (e) {
      console.log("send request error:", e?.response?.data || e?.message);
    }
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
      <Text style={styles.meta}>{item.city || "—"}</Text>
      <Text style={styles.meta}>{item.occupation || "—"} • {item.highestEducation || "—"}</Text>
      <TouchableOpacity style={styles.btn} onPress={() => handleSendRequest(item.id)}>
        <Text style={styles.btnText}>Send Request</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>New Matches</Text>
      <FlatList
        data={filtered}
        keyExtractor={(i) => `${i.id}`}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No new matches.</Text>}
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
  btn: { marginTop: 10, backgroundColor: "#1f1f39", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800" },
  empty: { textAlign: "center", color: "#4b4a5f", marginTop: 20 },
});

export default NewMatchesScreen;

