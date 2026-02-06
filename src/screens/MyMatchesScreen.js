import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { getSession } from "../api/authSession";
import { maskName } from "../utils/nameMask";

const MyMatchesScreen = () => {
  const { userId } = getSession();
  const [profiles, setProfiles] = useState([]);
  const [sent, setSent] = useState([]);
  const [received, setReceived] = useState([]);
  const [accepted, setAccepted] = useState([]);
  const [rejected, setRejected] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [all, mine, sentReq, recvReq, accRecv, accSent, rejRecv, rejSent] = await Promise.all([
          axiosInstance.get("/api/profiles/Allprofiles"),
          axiosInstance.get(`/api/profiles/myprofiles/${userId}`),
          axiosInstance.get(`/api/friends/sent/${userId}`),
          axiosInstance.get(`/api/friends/received/${userId}`),
          axiosInstance.get(`/api/friends/accepted/received/${userId}`),
          axiosInstance.get(`/api/friends/accepted/sent/${userId}`),
          axiosInstance.get(`/api/friends/rejected/received/${userId}`),
          axiosInstance.get(`/api/friends/rejected/sent/${userId}`),
        ]);
        setProfiles(Array.isArray(all.data) ? all.data : []);
        setMe(mine.data);
        setSent(sentReq.data || []);
        setReceived(recvReq.data || []);
        setAccepted([...(accRecv.data || []), ...(accSent.data || [])]);
        setRejected([...(rejRecv.data || []), ...(rejSent.data || [])]);
      } catch (e) {
        console.log("my matches load error:", e?.response?.data || e?.message);
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

  const premiumActive = useMemo(() => {
    if (!me) return false;
    const end = me.premiumEnd ? new Date(me.premiumEnd) : null;
    const activeFlag = me.premium === true;
    const notExpired = end ? end > new Date() : true;
    return activeFlag && notExpired;
  }, [me]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>
        {premiumActive
          ? `${(item.firstName || "").trim()} ${(item.lastName || "").trim()}`.trim() || "User"
          : maskName(item.firstName, item.lastName)}
      </Text>
      <Text style={styles.meta}>{item.city || "—"}</Text>
      <Text style={styles.meta}>{item.occupation || "—"} • {item.highestEducation || "—"}</Text>
      <TouchableOpacity style={styles.btn} onPress={() => handleSendRequest(item.id)}>
        <Text style={styles.btnText}>Send Request</Text>
      </TouchableOpacity>
    </View>
  );

  const handleSendRequest = async (receiverId) => {
    if (!premiumActive) {
      Alert.alert(
        "Premium required",
        "Please upgrade to a Premium plan to send interests or requests."
      );
      return;
    }
    try {
      await axiosInstance.post(`/api/friends/send/${userId}/${receiverId}`);
      setSent((prev) => [...prev, { senderId: userId, receiverId }]);
    } catch (e) {
      console.log("send request error:", e?.response?.data || e?.message);
    }
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
      <Text style={styles.title}>My Matches</Text>
      <FlatList
        data={filtered}
        keyExtractor={(i) => `${i.id}`}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No matches found.</Text>}
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

export default MyMatchesScreen;

