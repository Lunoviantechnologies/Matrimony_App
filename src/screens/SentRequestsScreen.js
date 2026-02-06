import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, Text, FlatList, View, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { getSession } from "../api/authSession";
import { maskName } from "../utils/nameMask";
import { fetchSentRequestsApi } from "../api/api";

const SentRequestsScreen = () => {
  const { userId } = getSession();
  const [sent, setSent] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [sentRes, allProfiles, mine, accSent] = await Promise.all([
          fetchSentRequestsApi(userId),
          axiosInstance.get("/api/profiles/Allprofiles"),
          axiosInstance.get(`/api/profiles/myprofiles/${userId}`),
          axiosInstance.get(`/api/friends/accepted/sent/${userId}`),
        ]);

        const acceptedIds = new Set(
          (accSent.data || [])
            .map((r) => r.receiverId)
            .filter(Boolean)
        );

        const pendingOnly = (sentRes.data || []).filter(
          (r) => !acceptedIds.has(r.receiverId)
        );

        setSent(pendingOnly);
        setProfiles(Array.isArray(allProfiles.data) ? allProfiles.data : []);
        setMe(mine.data);
      } catch (e) {
        console.log("sent requests load error:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleCancel = async (requestId) => {
    try {
      await axiosInstance.delete(`/api/friends/sent/delete/${requestId}`);
      setSent((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (e) {
      console.log("cancel error:", e?.response?.data || e?.message);
    }
  };

  const premiumActive = useMemo(() => {
    if (!me) return false;
    const end = me.premiumEnd ? new Date(me.premiumEnd) : null;
    const activeFlag = me.premium === true;
    const notExpired = end ? end > new Date() : true;
    return activeFlag && notExpired;
  }, [me]);

  const renderItem = ({ item }) => {
    const otherProfile = profiles.find((p) => p.id === item.receiverId);
    return (
      <View style={styles.card}>
        <Text style={styles.name}>
          {otherProfile
            ? premiumActive
              ? `${(otherProfile.firstName || "").trim()} ${(otherProfile.lastName || "").trim()}`.trim() || "User"
              : maskName(otherProfile.firstName, otherProfile.lastName)
            : item.receiverName || "User"}
        </Text>
        <Text style={styles.meta}>{otherProfile?.city || "—"}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => handleCancel(item.requestId)}>
          <Text style={styles.btnText}>Cancel</Text>
        </TouchableOpacity>
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
      <Text style={styles.title}>Sent Requests</Text>
      <FlatList
        data={sent}
        keyExtractor={(i) => `${i.requestId || i.receiverId}`}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No sent requests.</Text>}
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

export default SentRequestsScreen;

