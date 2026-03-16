import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, Text, FlatList, View, StyleSheet, ActivityIndicator, TouchableOpacity, Image, Alert } from "react-native";
import { fetchMatchesSearchApi, fetchMyProfileApi, getAbsolutePhotoUrl, sendFriendRequestApi } from "../api/api";
import { getSession, withPhotoVersion } from "../api/authSession";
import { maskName } from "../utils/nameMask";

const MoreMatchesScreen = ({ navigation }) => {
  const { userId } = getSession();
  const [profiles, setProfiles] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const mineRes = await fetchMyProfileApi(userId);
        const profileData = mineRes?.data ?? null;
        setMe(profileData);
        const matchRes = await fetchMatchesSearchApi({
          matchType: "ALL",
          sort: "createdAt",
          page: 0,
          size: 50,
          filters: { myId: userId, myGender: profileData?.gender ?? null },
        });
        const content = matchRes?.data?.content;
        setProfiles(Array.isArray(content) ? content : []);
      } catch (e) {
        if (__DEV__) console.log("more matches load error:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId]);

  const filtered = useMemo(() => profiles, [profiles]);

  const premiumActive = useMemo(() => {
    if (!me) return false;
    const end = me.premiumEnd ? new Date(me.premiumEnd) : null;
    const activeFlag = me.premium === true;
    const notExpired = end ? end > new Date() : true;
    return activeFlag && notExpired;
  }, [me]);

  const handleSendRequest = async (receiverId) => {
    if (!premiumActive) {
      Alert.alert(
        "Premium required",
        "Please upgrade to a Premium plan to send interests or requests."
      );
      return;
    }
    try {
      await sendFriendRequestApi(userId, receiverId);
    } catch (e) {
      if (__DEV__) console.log("send request error:", e?.response?.data || e?.message);
    }
  };

  const renderItem = ({ item }) => {
    const displayName = premiumActive
      ? `${(item.firstName || "").trim()} ${(item.lastName || "").trim()}`.trim() || "User"
      : maskName(item.firstName, item.lastName);

    const imgUri = item.updatePhoto
      ? withPhotoVersion(getAbsolutePhotoUrl(item.updatePhoto))
      : null;

    return (
      <View style={styles.card}>
        <View style={styles.cardTop}>
          <View style={styles.avatarWrap}>
            {imgUri && !item.hideProfilePhoto ? (
              <Image source={{ uri: imgUri }} style={styles.avatar} />
            ) : (
              <Text style={styles.avatarFallback}>
                {item.gender?.toLowerCase() === "female" ? "👩" : "🧑"}
              </Text>
            )}
          </View>
          <View style={styles.metaWrap}>
            <Text style={styles.name} numberOfLines={1}>{displayName}</Text>
            <Text style={styles.meta}>
              {[item.age && `${item.age} yrs`, item.city].filter(Boolean).join(" • ") || "—"}
            </Text>
            <Text style={styles.meta}>
              {item.occupation || "—"} • {item.highestEducation || "—"}
            </Text>
          </View>
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity
            style={styles.viewBtn}
            activeOpacity={0.9}
            onPress={() => navigation.navigate("ProfileView", { profileId: item.id })}
          >
            <Text style={styles.viewText}>View Profile</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.connectBtn}
            activeOpacity={0.9}
            onPress={() => handleSendRequest(item.id)}
          >
            <Text style={styles.connectText}>Connect</Text>
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
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardTop: { flexDirection: "row", alignItems: "center" },
  avatarWrap: {
    width: 70,
    height: 70,
    borderRadius: 18,
    backgroundColor: "#fde8ec",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { width: 70, height: 70, borderRadius: 18 },
  avatarFallback: { fontSize: 32 },
  metaWrap: { marginLeft: 12, flex: 1 },
  name: { fontSize: 16, fontWeight: "800", color: "#1f1f39" },
  meta: { fontSize: 12, color: "#4b4a5f", marginTop: 4 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    gap: 10,
  },
  viewBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  viewText: { color: "#e5e7eb", fontWeight: "700", fontSize: 13 },
  connectBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: "#16a34a",
  },
  connectText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  empty: { textAlign: "center", color: "#4b4a5f", marginTop: 20 },
});

export default MoreMatchesScreen;

