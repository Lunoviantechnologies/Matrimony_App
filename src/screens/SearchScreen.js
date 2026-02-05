import React, { useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import { fetchMyProfileApi, fetchUserProfilesApi } from "../api/api";
import { getSession, withPhotoVersion } from "../api/authSession";

const isPremiumActive = (p) => {
  if (!p) return false;
  const end = p.premiumEnd ? new Date(p.premiumEnd) : null;
  const activeFlag = p.premium === true;
  const notExpired = end ? end > new Date() : true;
  return activeFlag && notExpired;
};

const getOppositeGender = (p) => {
  const g = (p?.gender || "").toString().toLowerCase();
  if (g === "male") return "female";
  if (g === "female") return "male";
  return null;
};

const SearchScreen = ({ navigation, route }) => {
  const [query, setQuery] = useState("");
  const [profiles, setProfiles] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const isFocused = useIsFocused();

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const session = getSession();
        const userId = route?.params?.userId || session.userId;
        if (!userId) {
          setError("Please login again to search profiles.");
          return;
        }

        const [meRes, allRes] = await Promise.all([fetchMyProfileApi(userId), fetchUserProfilesApi()]);
        setMyProfile(meRes.data);
        const list = Array.isArray(allRes?.data) ? allRes.data : [];
        const withoutSelf = list.filter((p) => p?.id && p.id !== userId);
        setProfiles(withoutSelf);
      } catch (e) {
        setError("Failed to load search data.");
      } finally {
        setLoading(false);
      }
    };

    if (isFocused) {
      load();
    }
  }, [route?.params?.userId, isFocused]);

  const filteredProfiles = useMemo(() => {
    if (!profiles.length || !myProfile) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];

    const targetGender = getOppositeGender(myProfile);

    return profiles
      .filter((p) => (targetGender ? (p.gender || "").toString().toLowerCase() === targetGender : true))
      .filter((p) => {
        const fields = [
          p.firstName,
          p.lastName,
          p.city,
          p.hobbies,
          p.occupation,
          p.caste,
          p.religion,
          p.motherTongue,
          p.annualIncome,
          p.age ? String(p.age) : "",
        ]
          .filter(Boolean)
          .map((v) => v.toString().toLowerCase());
        return fields.some((f) => f.includes(q));
      });
  }, [profiles, myProfile, query]);

  const handleViewProfile = (profileId) => {
    if (!profileId) return;
    if (!isPremiumActive(myProfile)) {
      Alert.alert("Upgrade to Premium", "Unlock full profile views with a Premium plan.", [
        { text: "Later", style: "cancel" },
        { text: "Upgrade", onPress: () => navigation.navigate("PremiumSubscription") },
      ]);
      return;
    }
    navigation.navigate("ProfileView", { profileId });
  };

  const handleAvatarPress = (profileId) => {
    if (!isPremiumActive(myProfile)) {
      Alert.alert("Upgrade to Premium", "Unlock profile photos with a Premium plan.", [
        { text: "Later", style: "cancel" },
        { text: "Upgrade", onPress: () => navigation.navigate("PremiumSubscription") },
      ]);
      return;
    }
    if (profileId) {
      navigation.navigate("ProfileView", { profileId });
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centerWrap}>
          <ActivityIndicator size="large" color="#1f1f39" />
          <Text style={styles.statusText}>Loading search...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centerWrap}>
          <Text style={styles.statusText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => setQuery((q) => q)}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.title}>Search Profiles</Text>
        <Text style={styles.subtitle}>Find your best matches by name, city, interests, and more.</Text>
        <View style={styles.searchBox}>
          <TextInput
            placeholder="Search by name, city, education, etc."
            placeholderTextColor="#8b8b99"
            value={query}
            onChangeText={setQuery}
            style={styles.searchInput}
            autoCorrect={false}
            autoCapitalize="none"
          />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {!query.trim() ? (
          <Text style={styles.hint}>Type to search profiles. Results will appear here.</Text>
        ) : filteredProfiles.length === 0 ? (
          <Text style={styles.hint}>No profiles match your search yet.</Text>
        ) : (
          filteredProfiles.map((p) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.cardTop}>
                <TouchableOpacity activeOpacity={0.9} onPress={() => handleAvatarPress(p.id)}>
                  <View style={styles.avatarWrap}>
                    {p.updatePhoto || p.photoUrl || p.image || p.avatar ? (
                    <Image
                      source={{ uri: withPhotoVersion(p.updatePhoto || p.photoUrl || p.image || p.avatar) }}
                      style={styles.avatar}
                      blurRadius={isPremiumActive(myProfile) ? 0 : 50}
                    />
                    ) : (
                      <Text style={styles.avatarFallback}>{p.gender?.toString().toLowerCase() === "female" ? "👩" : "🧑"}</Text>
                    )}
                    {!isPremiumActive(myProfile) && <View style={styles.avatarMask} pointerEvents="none" />}
                  </View>
                </TouchableOpacity>
                <View style={styles.meta}>
                  <Text style={styles.name}>
                    {(p.firstName || "New") + " " + (p.lastName || "Member")}
                    {p.age ? `, ${p.age}` : ""}
                  </Text>
                  <Text style={styles.line}>{p.occupation || "—"}</Text>
                  <Text style={styles.line}>{p.highestEducation || "—"}</Text>
                  <Text style={styles.line}>{p.city || p.country || "—"}</Text>
                </View>
              </View>
              <TouchableOpacity style={styles.viewBtn} onPress={() => handleViewProfile(p.id)}>
                <Text style={styles.viewBtnText}>View Profile</Text>
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4", paddingTop: 14 },
  header: { paddingHorizontal: 16, paddingBottom: 8 },
  title: { fontSize: 22, fontWeight: "800", color: "#1f1f39" },
  subtitle: { fontSize: 13, color: "#4b4a5f", marginTop: 4 },
  searchBox: {
    marginTop: 12,
    backgroundColor: "#fff",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  searchInput: { fontSize: 16, color: "#1f1f39" },
  content: { paddingHorizontal: 16, paddingBottom: 180, gap: 12 },
  hint: { color: "#4b4a5f", fontSize: 14, marginTop: 12 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTop: { flexDirection: "row" },
  avatarWrap: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#ffe0ea",
    alignItems: "center",
    justifyContent: "center",
  },
  avatar: { width: 64, height: 64, borderRadius: 18 },
  avatarMask: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  avatarFallback: { fontSize: 30 },
  meta: { marginLeft: 12, flex: 1, justifyContent: "center" },
  name: { fontSize: 16, fontWeight: "800", color: "#1f1f39" },
  line: { color: "#6b6a7a", fontSize: 12, marginTop: 2 },
  viewBtn: {
    marginTop: 12,
    backgroundColor: "#f75b8a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  viewBtnText: { color: "#fff", fontWeight: "800" },
  centerWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  statusText: { marginTop: 10, color: "#1f1f39", fontWeight: "700" },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#1f1f39",
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "700" },
});

export default SearchScreen;

