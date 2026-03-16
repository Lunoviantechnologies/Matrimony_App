import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  Alert,
} from "react-native";
import { useIsFocused } from "@react-navigation/native";
import {
  fetchMyProfileApi,
  fetchSentRequestsApi,
  fetchReceivedRequestsApi,
  fetchAcceptedReceivedApi,
  fetchAcceptedSentApi,
  fetchRejectedReceivedApi,
  fetchRejectedSentApi,
  sendFriendRequestApi,
  searchProfilesApi,
} from "../api/api";
import { getAbsolutePhotoUrl } from "../api/api";
import { getSession, withPhotoVersion } from "../api/authSession";
import { maskName } from "../utils/nameMask";

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


const getProfileAge = (profile) => {
  if (profile?.age !== undefined && profile?.age !== null && `${profile.age}`.trim() !== "") {
    const ageNum = Number(profile.age);
    if (Number.isFinite(ageNum)) return ageNum;
  }
  if (profile?.dateOfBirth) {
    const dob = new Date(profile.dateOfBirth);
    if (!Number.isNaN(dob.getTime())) {
      const diff = Date.now() - dob.getTime();
      return Math.floor(diff / (365.25 * 24 * 60 * 60 * 1000));
    }
  }
  return null;
};

const asText = (value, fallback = "—") => {
  if (value === undefined || value === null) return fallback;
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    const out = String(value).trim();
    return out || fallback;
  }
  if (Array.isArray(value)) {
    const out = value
      .map((v) => (typeof v === "string" || typeof v === "number" || typeof v === "boolean" ? String(v) : ""))
      .filter(Boolean)
      .join(", ");
    return out || fallback;
  }
  if (typeof value === "object") {
    const preferred = value.name ?? value.label ?? value.value ?? "";
    const out = String(preferred).trim();
    return out || fallback;
  }
  return fallback;
};

const SearchProfileCard = React.memo(({ item, premiumActive, sendingId, onViewProfile, onAvatarPress, onSendRequest }) => {
  const p = item;
  return (
    <View style={styles.card}>
      <View style={styles.cardTop}>
        <TouchableOpacity activeOpacity={0.9} onPress={() => onAvatarPress(p.id)}>
          <View style={styles.avatarWrap}>
            {p.updatePhoto || p.photoUrl || p.image || p.avatar ? (
              <Image
                source={{ uri: withPhotoVersion(getAbsolutePhotoUrl(p.updatePhoto || p.photoUrl || p.image || p.avatar)) }}
                style={styles.avatar}
              />
            ) : (
              <Text style={styles.avatarFallback}>{p.gender?.toString().toLowerCase() === "female" ? "👩" : "🧑"}</Text>
            )}
          </View>
        </TouchableOpacity>
        <View style={styles.meta}>
          <Text style={styles.name}>
            {premiumActive
              ? `${asText(p.firstName, "New")} ${asText(p.lastName, "Member")}`.trim()
              : maskName(asText(p.firstName, "New"), asText(p.lastName, "Member"))}
            {p.age ? `, ${asText(p.age, "")}` : ""}
          </Text>
          <Text style={styles.line}>{asText(p.occupation)}</Text>
          <Text style={styles.line}>{asText(p.highestEducation)}</Text>
          <Text style={styles.line}>{asText(p.city, asText(p.country))}</Text>
        </View>
      </View>
      <View style={styles.btnRow}>
        <TouchableOpacity style={styles.viewBtn} onPress={() => onViewProfile(p.id)}>
          <Text style={styles.viewBtnText}>View Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.sendBtn, sendingId === p.id && styles.sendBtnDisabled]}
          onPress={() => onSendRequest(p.id)}
          disabled={sendingId === p.id}
        >
          <Text style={styles.sendBtnText}>{sendingId === p.id ? "Sending..." : "Send Request"}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
});

const SearchScreen = ({ navigation, route }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [myProfile, setMyProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [hiddenIds, setHiddenIds] = useState(new Set());
  const [sendingId, setSendingId] = useState(null);
  const [page, setPage] = useState(0);
  const [size] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
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

        const [
          meRes,
          sentRes,
          receivedRes,
          acceptedRecRes,
          acceptedSentRes,
          rejectedRecRes,
          rejectedSentRes,
        ] = await Promise.all([
          fetchMyProfileApi(userId),
          fetchSentRequestsApi(userId).catch(() => ({ data: [] })),
          fetchReceivedRequestsApi(userId).catch(() => ({ data: [] })),
          fetchAcceptedReceivedApi(userId).catch(() => ({ data: [] })),
          fetchAcceptedSentApi(userId).catch(() => ({ data: [] })),
          fetchRejectedReceivedApi(userId).catch(() => ({ data: [] })),
          fetchRejectedSentApi(userId).catch(() => ({ data: [] })),
        ]);
        setMyProfile(meRes.data);

        const sentIds = (sentRes?.data || []).map((r) => r.receiverId);
        const receivedIds = (receivedRes?.data || []).map((r) => r.senderId);
        const acceptedRec = (acceptedRecRes?.data || []).map((r) => (r.receiverId === userId ? r.senderId : r.receiverId));
        const acceptedSent = (acceptedSentRes?.data || []).map((r) => (r.receiverId === userId ? r.senderId : r.receiverId));
        const rejectedRec = (rejectedRecRes?.data || []).map((r) => (r.receiverId === userId ? r.senderId : r.receiverId));
        const rejectedSent = (rejectedSentRes?.data || []).map((r) => (r.receiverId === userId ? r.senderId : r.receiverId));
        const allHidden = [...sentIds, ...receivedIds, ...acceptedRec, ...acceptedSent, ...rejectedRec, ...rejectedSent];
        setHiddenIds(new Set(allHidden));
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

  const runSearch = useCallback(
    async (pageNo = 0, reset = true) => {
      if (!myProfile) return;
      const session = getSession();
      const userId = route?.params?.userId || session.userId;
      if (!userId) return;

      const searchText = query.trim();
      if (!searchText) {
        setResults([]);
        setPage(0);
        setTotalPages(1);
        return;
      }

      setLoading(true);
      setError("");
      try {
        const filters = {
          myId: userId,
          myGender: myProfile.gender,
          search: searchText,
        };
        const res = await searchProfilesApi(filters, pageNo, size);
        const { content = [], totalPages: tp = 1 } = res.data || {};
        setTotalPages(tp);
        setPage(pageNo);
        setResults((prev) => (reset ? content : [...prev, ...content]));
      } catch (e) {
        setError("Failed to run search.");
      } finally {
        setLoading(false);
      }
    },
    [myProfile, query, route?.params?.userId, size]
  );

  useEffect(() => {
    // debounce text input
    const id = setTimeout(() => {
      if (myProfile) {
        runSearch(0, true);
      }
    }, 400);
    return () => clearTimeout(id);
  }, [query, myProfile, runSearch]);

  const premiumActive = isPremiumActive(myProfile);

  const handleViewProfile = useCallback((profileId) => {
    if (!profileId) return;
    if (!isPremiumActive(myProfile)) {
      Alert.alert("Upgrade to Premium", "Unlock full profile views with a Premium plan.", [
        { text: "Later", style: "cancel" },
        { text: "Upgrade", onPress: () => navigation.navigate("PremiumSubscription") },
      ]);
      return;
    }
    navigation.navigate("ProfileView", { profileId });
  }, [myProfile, navigation]);

  const handleAvatarPress = useCallback((profileId) => {
    if (!profileId) return;
    if (!isPremiumActive(myProfile)) {
      Alert.alert("Upgrade to Premium", "Unlock profile photos with a Premium plan.", [
        { text: "Later", style: "cancel" },
        { text: "Upgrade", onPress: () => navigation.navigate("PremiumSubscription") },
      ]);
      return;
    }
    navigation.navigate("ProfileView", { profileId });
  }, [myProfile, navigation]);

  const handleSendRequest = async (receiverId) => {
    const session = getSession();
    const userId = session?.userId;
    if (!userId || !receiverId) return;
    setSendingId(receiverId);
    try {
      await sendFriendRequestApi(userId, receiverId);
      setHiddenIds((prev) => new Set([...prev, receiverId]));
      Alert.alert("Sent", "Interest sent successfully.");
    } catch (e) {
      const raw = e?.response?.data;
      const msg =
        typeof raw === "string"
          ? raw
          : raw?.message || e?.message || "Could not send request.";
      Alert.alert("Failed", msg);
    } finally {
      setSendingId(null);
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

      {!query.trim() ? (
        <View style={styles.content}>
          <Text style={styles.hint}>Type in search to see matching profiles.</Text>
        </View>
      ) : results.length === 0 ? (
        <View style={styles.content}>
          <Text style={styles.hint}>No profiles match your search yet.</Text>
        </View>
      ) : (
        <FlatList
          data={results.filter((p) => !hiddenIds.has(p.id))}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <SearchProfileCard
              item={item}
              premiumActive={premiumActive}
              sendingId={sendingId}
              onViewProfile={handleViewProfile}
              onAvatarPress={handleAvatarPress}
              onSendRequest={handleSendRequest}
            />
          )}
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          initialNumToRender={12}
          maxToRenderPerBatch={10}
          windowSize={6}
          removeClippedSubviews={true}
          onEndReached={() => {
            if (!loading && page + 1 < totalPages) {
              runSearch(page + 1, false);
            }
          }}
          onEndReachedThreshold={0.5}
        />
      )}

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
    borderRadius: 16,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  searchInput: { fontSize: 16, color: "#1f1f39" },
  filterActionsRow: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  openFiltersBtn: {
    backgroundColor: "#1f1f39",
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 10,
  },
  openFiltersText: { color: "#fff", fontWeight: "700" },
  appliedCountText: { color: "#4b4a5f", fontSize: 12, fontWeight: "700" },
  drawerOverlay: {
    flex: 1,
    flexDirection: "row",
  },
  drawerBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  drawerPanel: {
    width: "82%",
    maxWidth: 360,
    backgroundColor: "#fff",
    padding: 14,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    borderLeftWidth: 1,
    borderLeftColor: "#dbe4d2",
  },
  filterTitle: { fontSize: 28, fontWeight: "800", color: "#7a4c00", textAlign: "center", marginBottom: 8 },
  filterGroupTitle: { fontSize: 18, fontWeight: "800", color: "#1f1f39", marginTop: 8, marginBottom: 6 },
  filterOptionsWrap: { gap: 6, marginBottom: 8 },
  filterOptionRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 4 },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: "#9ca3af",
    backgroundColor: "#fff",
  },
  checkboxChecked: { backgroundColor: "#3b82f6", borderColor: "#3b82f6" },
  filterOptionText: { fontSize: 16, fontWeight: "700", color: "#1f1f39" },
  applyFiltersBtn: {
    marginTop: 8,
    backgroundColor: "#5f9cf4",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  applyFiltersText: { color: "#fff", fontWeight: "800", fontSize: 20 },
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
  btnRow: { flexDirection: "row", marginTop: 12, gap: 10 },
  viewBtn: {
    flex: 1,
    backgroundColor: "#111827",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  viewBtnText: { color: "#e5e7eb", fontWeight: "800" },
  sendBtn: {
    flex: 1,
    backgroundColor: "#16a34a",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  sendBtnDisabled: { opacity: 0.7 },
  sendBtnText: { color: "#fff", fontWeight: "800" },
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

