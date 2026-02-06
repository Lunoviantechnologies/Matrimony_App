import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, Text, FlatList, View, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { getSession } from "../api/authSession";
import { maskName } from "../utils/nameMask";

const NearmeScreen = () => {
  const { userId } = getSession();
  const [profiles, setProfiles] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [all, mine] = await Promise.all([
          axiosInstance.get("/api/profiles/Allprofiles"),
          axiosInstance.get(`/api/profiles/myprofiles/${userId}`),
        ]);
        setProfiles(Array.isArray(all.data) ? all.data : []);
        setMe(mine.data);
      } catch (e) {
        console.log("nearme load error:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const filtered = useMemo(() => {
    if (!me?.city) return [];
    return profiles.filter((p) => p.id !== userId && p.city && p.city === me.city);
  }, [profiles, me, userId]);

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
      <Text style={styles.title}>Near Me</Text>
      <FlatList
        data={filtered}
        keyExtractor={(i) => `${i.id}`}
        renderItem={renderItem}
        ListEmptyComponent={<Text style={styles.empty}>No nearby matches found.</Text>}
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

export default NearmeScreen;

