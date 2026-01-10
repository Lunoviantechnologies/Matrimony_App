import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { getSession } from "../api/authSession";

const AstroTalkScreen = ({ navigation }) => {
  const { userId } = getSession();
  const [astro, setAstro] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const [astroRes, meRes] = await Promise.all([
          axiosInstance.get("/astro-number/All"),
          userId ? axiosInstance.get(`/profiles/myprofiles/${userId}`) : Promise.resolve({ data: null }),
        ]);
        setAstro(Array.isArray(astroRes.data) ? astroRes.data : []);
        setMe(meRes.data);
      } catch (e) {
        console.log("astro load error:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.name}</Text>
      <Text style={styles.meta}>{item.experience || "--"} yrs experience</Text>
      <Text style={styles.meta}>Languages: {item.languages || "--"}</Text>
      <Text style={styles.meta}>Mobile: {item.astroNumber || "--"}</Text>
      <Text style={styles.price}>₹{item.price || item.pricePerMinute || 0} / min</Text>
    </View>
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <ActivityIndicator style={{ marginTop: 20 }} />
      </SafeAreaView>
    );
  }

  if (me && !me.premium) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.upgradeCard}>
          <Text style={styles.title}>Premium Feature</Text>
          <Text style={styles.subtitle}>Upgrade to access Astrology consultations.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate("PremiumSubscription")}>
            <Text style={styles.btnText}>Upgrade Now</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Talk to our Astrologers</Text>
      <Text style={styles.subtitle}>Get guidance for marriage, compatibility & future life.</Text>
      <FlatList
        data={astro}
        keyExtractor={(i) => `${i.id || i.name}`}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, gap: 12 }}
        ListEmptyComponent={<Text style={styles.empty}>No astrologers available.</Text>}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4" },
  title: { fontSize: 20, fontWeight: "800", color: "#1f1f39", margin: 16 },
  subtitle: { fontSize: 12, color: "#4b4a5f", marginHorizontal: 16, marginBottom: 10 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  name: { fontSize: 16, fontWeight: "800", color: "#1f1f39" },
  meta: { fontSize: 12, color: "#4b4a5f", marginTop: 4 },
  price: { fontSize: 14, fontWeight: "800", color: "#1f1f39", marginTop: 6 },
  upgradeCard: { margin: 16, backgroundColor: "#fff", borderRadius: 14, padding: 16, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 6, shadowOffset: { width: 0, height: 3 }, elevation: 3 },
  btn: { marginTop: 12, backgroundColor: "#1f1f39", paddingVertical: 12, borderRadius: 10, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800" },
  empty: { textAlign: "center", color: "#4b4a5f", marginTop: 20 },
});

export default AstroTalkScreen;

