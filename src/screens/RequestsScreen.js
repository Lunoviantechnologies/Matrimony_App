import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, Text, FlatList, View, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import {
  fetchFriendRequestsFilterApi,
  respondToFriendRequestApi,
  fetchMyProfileApi,
  getAbsolutePhotoUrl,
} from "../api/api";
import { getSession } from "../api/authSession";
import { maskName } from "../utils/nameMask";

const RequestsScreen = () => {
  const { userId } = getSession();
  const [received, setReceived] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [recRes, mineRes] = await Promise.all([
          fetchFriendRequestsFilterApi(userId, "received"),
          fetchMyProfileApi(userId),
        ]);
        setReceived(Array.isArray(recRes.data) ? recRes.data : []);
        setMe(mineRes?.data ?? null);
      } catch (e) {
        if (__DEV__) console.log("received load error:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const handleRespond = async (requestId, status) => {
    try {
      await respondToFriendRequestApi(requestId, status === "accept");
      setReceived((prev) => prev.filter((r) => r.requestId !== requestId));
    } catch (e) {
      if (__DEV__) console.log("respond error:", e?.response?.data || e?.message);
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
    const profile = item.profile;
    const displayName = profile?.name?.trim() || "User";
    const nameToShow = premiumActive ? displayName : maskName(profile?.name?.split(" ")[0], profile?.name?.split(" ").slice(1).join(" "));
    return (
      <View style={styles.card}>
        <Text style={styles.name}>{nameToShow}</Text>
        <Text style={styles.meta}>{profile?.city || "—"}</Text>
        <View style={styles.actions}>
          <TouchableOpacity style={styles.accept} onPress={() => handleRespond(item.requestId, "accept")}>
            <Text style={styles.btnText}>Accept</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.reject} onPress={() => handleRespond(item.requestId, "reject")}>
            <Text style={styles.btnText}>Reject</Text>
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
      <Text style={styles.title}>Requests</Text>
      <FlatList
        data={received}
        keyExtractor={(i) => `${i.requestId || i.senderId}`}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No incoming requests.</Text>}
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
  actions: { flexDirection: "row", gap: 10, marginTop: 10 },
  accept: { flex: 1, backgroundColor: "#22c58b", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  reject: { flex: 1, backgroundColor: "#e94d6a", paddingVertical: 10, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800" },
  empty: { textAlign: "center", color: "#4b4a5f", marginTop: 20 },
});

export default RequestsScreen;

