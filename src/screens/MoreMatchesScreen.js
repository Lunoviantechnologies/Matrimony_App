import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, Text, FlatList, View, StyleSheet, ActivityIndicator } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { getSession } from "../api/authSession";

const MoreMatchesScreen = () => {
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
          axiosInstance.get("/profiles/Allprofiles"),
          axiosInstance.get(`/profiles/myprofiles/${userId}`),
        ]);
        setProfiles(Array.isArray(all.data) ? all.data : []);
        setMe(mine.data);
      } catch (e) {
        console.log("more matches load error:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const filtered = useMemo(() => {
    return profiles.filter((p) => p.id !== userId && (me?.gender ? p.gender !== me.gender : true));
  }, [profiles, me, userId]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.firstName} {item.lastName}</Text>
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
      <Text style={styles.title}>More Matches</Text>
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
  empty: { textAlign: "center", color: "#4b4a5f", marginTop: 20 },
});

export default MoreMatchesScreen;

