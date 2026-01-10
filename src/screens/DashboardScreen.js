import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, SafeAreaView, ActivityIndicator, TouchableWithoutFeedback, Image } from "react-native";
import NotificationBell from "../components/NotificationBell";
import { fetchMyProfileApi, fetchUserProfilesApi } from "../api/api";
import { getSession, clearSession } from "../api/authSession";

const makeProfileStats = ({ matches }) => [
  { label: "Profile Views", value: "234", icon: "👁️", colors: ["#5b8dff", "#5f6bff"] },
  { label: "Matches", value: matches ?? "—", icon: "🤝", colors: ["#f973b5", "#ff5f8a"] },
  { label: "Interests", value: "12", icon: "💌", colors: ["#ff6a6a", "#ff8a8a"] },
  { label: "Messages", value: "8", icon: "💬", colors: ["#8f74ff", "#5e6bff"] },
];

const quickActions = [
  { name: "Search", icon: "🔍" },
  { name: "Filters", icon: "🎛️" },
  { name: "Saved", icon: "❤️" },
  { name: "Premium", icon: "⭐" },
];

const recentMatches = [
  {
    name: "Priya Sharma",
    age: 26,
    profession: "Software Engineer",
    location: "Mumbai, Maharashtra",
    education: "B.Tech, IIT Delhi",
    matchScore: 95,
    image: "👩‍💼",
    online: true,
  },
  {
    name: "Anjali Patel",
    age: 25,
    profession: "Doctor",
    location: "Ahmedabad, Gujarat",
    education: "MBBS, AIIMS",
    matchScore: 92,
    image: "👩‍⚕️",
    online: false,
  },
  {
    name: "Neha Reddy",
    age: 27,
    profession: "Marketing Manager",
    location: "Hyderabad, Telangana",
    education: "MBA, IIM Bangalore",
    matchScore: 88,
    image: "👩‍💼",
    online: true,
  },
];

const navTabs = [
  { id: "home", label: "Home", icon: "🏠" },
  { id: "search", label: "Search", icon: "🔍" },
  { id: "matches", label: "Matches", icon: "❤️" },
  { id: "chat", label: "Chat", icon: "💬" },
  { id: "profile", label: "Profile", icon: "👤" },
];

const menuItems = [
  { label: "My Profile", route: "ProfileView" },
  { label: "Upgrade to Premium", route: "PremiumSubscription" },
  { label: "Saved Profiles", route: "SavedProfiles" },
  { label: "Notifications", route: "Notifications" },
  { label: "Help & Support", route: "HelpSupport" },
  { label: "Logout", action: "logout" },
];

const DashboardScreen = ({ navigation, route }) => {
  const [activeTab, setActiveTab] = useState("home");
  const [showMenu, setShowMenu] = useState(false);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [newProfiles, setNewProfiles] = useState([]);
  const [matchCount, setMatchCount] = useState("—");

  useEffect(() => {
    const load = async () => {
      try {
        const session = getSession();
        const userId = route?.params?.userId || session.userId;
        if (!userId) {
          setError("Please login again to load your dashboard.");
          setLoading(false);
          return;
        }
        const res = await fetchMyProfileApi(userId);
        setProfile(res.data);

        try {
          const profilesRes = await fetchUserProfilesApi();
          const list = Array.isArray(profilesRes?.data) ? profilesRes.data : [];
          const filtered = list
            .filter((p) => p?.id && p.id !== userId)
            .sort((a, b) => {
              if (a.createdAt && b.createdAt) return new Date(b.createdAt) - new Date(a.createdAt);
              return (b.id || 0) - (a.id || 0);
            })
            .slice(0, 3)
            .map((p) => ({
              name: `${p.firstName || ""} ${p.lastName || ""}`.trim() || "New Member",
              age: p.age || "—",
              profession: p.occupation || p.sector || "—",
              location: p.city ? `${p.city}${p.country ? ", " + p.country : ""}` : p.country || "—",
              education: p.highestEducation || "—",
              image:
                p.updatePhoto ||
                p.photoUrl ||
                p.image ||
                p.avatar ||
                null,
              online: false,
            }));
          setNewProfiles(filtered);
        } catch {
          setNewProfiles([]);
        }

        // basic matches count derived from all profiles (excluding self)
        try {
          const profilesRes = await fetchUserProfilesApi();
          const list = Array.isArray(profilesRes?.data) ? profilesRes.data : [];
          const others = list.filter((p) => p?.id && p.id !== userId);
          setMatchCount(others.length.toString());
        } catch {
          setMatchCount("—");
        }
      } catch (e) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [route?.params?.userId]);

  const userName = profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Welcome" : "Welcome";
  const userIdText = profile?.id ? `MAT${profile.id}` : profile?.emailId || "";
  const profession = profile?.occupation || profile?.sector || "—";
  const location = profile?.city ? `${profile.city}${profile.country ? ", " + profile.country : ""}` : profile?.country || "—";
  const age = profile?.age || "—";
  const photo =
    profile?.updatePhoto ||
    profile?.photoUrl ||
    profile?.image ||
    profile?.avatar ||
    null;
  const completion = computeProfileCompletion(profile);

  const handleNotificationNavigate = (type, targetId) => {
    if (type === "PROFILE" && targetId) {
      navigation.navigate("ProfileView", { profileId: targetId });
      return;
    }
    if (type === "CHAT" || type === "MESSAGE") {
      navigation.navigate("Chat");
      return;
    }
    if (type === "MATCHES") {
      navigation.navigate("Matches");
      return;
    }
    navigation.navigate("Notifications");
  };

  const handleTabPress = (id) => {
    setActiveTab(id);
    const target = {
      home: "Dashboard",
      search: "Search",
      matches: "Matches",
      chat: "Chat",
      profile: "ProfileView",
    }[id];
    if (target) {
      navigation.navigate(target);
    }
  };

  const handleNavigate = (route) => {
    if (navigation && route) {
      navigation.navigate(route);
    }
  };

  const handleLogout = () => {
    try {
      clearSession();
    } catch (e) {
      // ignore
    }
    navigation.replace("Login");
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#1f1f39" />
          <Text style={styles.loaderText}>Loading dashboard...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loaderWrap}>
          <Text style={styles.loaderText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => navigation.replace("Login")}>
            <Text style={styles.retryText}>Go to Login</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <View style={styles.heroProfile}>
            <View style={styles.heroAvatar}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.heroAvatarImg} />
              ) : (
                <Text style={styles.heroAvatarText}>💑</Text>
              )}
            </View>
            <View style={styles.heroProfileInfo}>
              <Text style={styles.heroWelcome}>Welcome to VivahJeevan</Text>
              <Text style={styles.heroName}>{userName}</Text>
            </View>
          </View>

          <View style={styles.heroActions}>
            <NotificationBell onNavigate={handleNotificationNavigate} />
            <TouchableOpacity style={[styles.iconButton, styles.iconButtonSpacer]} onPress={() => setShowMenu((v) => !v)}>
              <Text style={styles.iconButtonText}>{showMenu ? "✖️" : "☰"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.completionCard}>
          <View style={styles.completionRow}>
            <Text style={styles.completionLabel}>Profile Completion</Text>
            <Text style={styles.completionValue}>{completion}%</Text>
          </View>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${completion}%` }]} />
          </View>
            <Text style={styles.completionHint}>Location: {location}</Text>
        </View>
      </View>

      {showMenu && (
        <TouchableWithoutFeedback onPress={() => setShowMenu(false)}>
          <View style={styles.overlay}>
            <View style={styles.drawer} onStartShouldSetResponder={() => true}>
              <View style={styles.drawerHeader}>
                <Text style={styles.drawerTitle}>Menu</Text>
                <TouchableOpacity onPress={() => setShowMenu(false)}>
                  <Text style={styles.drawerClose}>✖️</Text>
                </TouchableOpacity>
              </View>
              {menuItems.map((item) => (
                <TouchableOpacity
                  key={item.label}
                  style={styles.drawerItem}
                  onPress={() => {
                    setShowMenu(false);
                    if (item.action === "logout") {
                      handleLogout();
                    } else if (item.route) {
                      handleNavigate(item.route);
                    }
                  }}
                >
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Top Matches</Text>
            <TouchableOpacity onPress={() => handleNavigate("Matches")}>
              <Text style={styles.sectionLink}>View All</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.matchList}>
            {(newProfiles.length ? newProfiles : recentMatches).map((match) => (
              <View key={match.name} style={styles.matchCard}>
                <View style={styles.matchTopRow}>
                  <View style={styles.matchPerson}>
                    <View>
                      <View style={styles.matchAvatar}>
                        {match.image ? (
                          <Image source={{ uri: match.image }} style={{ width: 64, height: 64, borderRadius: 18 }} />
                        ) : (
                          <Text style={styles.matchAvatarText}>{match.image || "🧑"}</Text>
                        )}
                      </View>
                      {match.online && <View style={styles.onlineDot} />}
                    </View>
                    <View style={styles.matchMeta}>
                      <Text style={styles.matchName}>{`${match.name}, ${match.age}`}</Text>
                      <Text style={styles.matchDetail}>💼 {match.profession}</Text>
                      <Text style={styles.matchDetail}>📍 {match.location}</Text>
                    </View>
                  </View>
                  <View style={styles.matchScore}>
                    <Text style={styles.matchScoreText}>{match.matchScore ? `${match.matchScore}% Match` : "New"}</Text>
                  </View>
                </View>
                <Text style={styles.matchDetail}>🎓 {match.education}</Text>
                <View style={styles.matchActions}>
                  <TouchableOpacity style={styles.primaryButton} onPress={() => handleNavigate("Requests")}>
                    <Text style={styles.primaryButtonText}>❤️ Send Interest</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={[styles.secondaryButton, styles.secondaryButtonSpacer]} onPress={() => handleNavigate("Requests")}>
                    <Text style={styles.secondaryButtonText}>💬 Message</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.statsGrid}>
          {makeProfileStats({ matches: matchCount }).map((stat) => (
            <View key={stat.label} style={styles.statCard}>
              <View style={[styles.statIcon, { backgroundColor: stat.colors[0] }]}>
                <Text style={styles.statIconText}>{stat.icon}</Text>
              </View>
              <Text style={styles.statLabel}>{stat.label}</Text>
              <Text style={styles.statValue}>{stat.value}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Quick Actions</Text>
          </View>
          <View style={styles.quickGrid}>
            {quickActions.map((action) => (
              <TouchableOpacity key={action.name} style={styles.quickCard} onPress={() => handleNavigate("ProfileView")}>
                <View style={styles.quickIconWrap}>
                  <Text style={styles.quickIcon}>{action.icon}</Text>
                </View>
                <Text style={styles.quickText}>{action.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.premiumCard}>
          <View>
          <View style={styles.premiumTitleRow}>
            <Text style={styles.premiumStar}>⭐</Text>
            <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
          </View>
          <Text style={styles.premiumSubtitle}>Unlock unlimited matches & more</Text>
          <TouchableOpacity style={styles.premiumButton} onPress={() => handleNavigate("PremiumSubscription")}>
            <Text style={styles.premiumButtonText}>Upgrade Now</Text>
          </TouchableOpacity>
          </View>
          <Text style={styles.premiumCrown}>👑</Text>
        </View>

      </ScrollView>

      {/* bottom nav removed; handled by global tab navigator */}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4", paddingTop: 28 },
  hero: {
    backgroundColor: "#D9F5E4",
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 18,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
  },
  heroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  heroProfile: { flexDirection: "row", alignItems: "center" },
  heroProfileInfo: { marginLeft: 12 },
  heroAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  heroAvatarImg: { width: 56, height: 56, borderRadius: 28 },
  heroAvatarText: { fontSize: 26 },
  heroWelcome: { color: "#2f2d52", fontSize: 12 },
  heroName: { color: "#1f1f39", fontSize: 20, fontWeight: "800" },
  heroId: { color: "#4b4a5f", fontSize: 11 },
  heroActions: { flexDirection: "row", alignItems: "center" },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#1f1f39",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  iconButtonText: { color: "#fff", fontSize: 18 },
  iconButtonSpacer: { marginLeft: 10 },
  badge: {
    position: "absolute",
    top: -2,
    right: -2,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: "#ff3b3b",
    alignItems: "center",
    justifyContent: "center",
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "700" },
  completionCard: { backgroundColor: "rgba(255,255,255,0.75)", padding: 12, borderRadius: 16 },
  completionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  completionLabel: { color: "#1f1f39", fontWeight: "600" },
  completionValue: { color: "#1f1f39", fontWeight: "800" },
  progressTrack: { height: 8, backgroundColor: "rgba(0,0,0,0.07)", borderRadius: 8 },
  progressFill: { width: "85%", height: 8, backgroundColor: "#22c58b", borderRadius: 8 },
  completionHint: { color: "#3f3e52", fontSize: 11, marginTop: 6 },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.4)",
    zIndex: 20,
    justifyContent: "flex-start",
    alignItems: "flex-end",
  },
  drawer: {
    width: "70%",
    backgroundColor: "#D9F5E4",
    height: "100%",
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 10,
    shadowOffset: { width: -2, height: 0 },
    elevation: 8,
  },
  drawerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  drawerTitle: { fontSize: 18, fontWeight: "800", color: "#1f1f39" },
  drawerClose: { fontSize: 18 },
  drawerItem: {
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: "#f7f7fb",
    marginBottom: 8,
  },
  drawerItemText: { color: "#2f2d52", fontWeight: "600" },
  content: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 220 },
  statsGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  statCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  statIconText: { fontSize: 20 },
  statLabel: { color: "#777", fontSize: 12, marginBottom: 4 },
  statValue: { color: "#1f1f39", fontSize: 20, fontWeight: "800" },
  section: { marginTop: 12, marginBottom: 6 },
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#1f1f39" },
  sectionLink: { color: "#f75b8a", fontWeight: "700", fontSize: 13 },
  quickGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  quickCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    alignItems: "flex-start",
  },
  quickIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#f7f0ff", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  quickIcon: { fontSize: 20 },
  quickText: { fontWeight: "800", color: "#2f2d52", fontSize: 14 },
  premiumCard: {
    backgroundColor: "#f7a93f",
    borderRadius: 18,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  premiumTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  premiumStar: { fontSize: 18, marginRight: 6 },
  premiumTitle: { color: "#fff", fontSize: 18, fontWeight: "800" },
  premiumSubtitle: { color: "#fff", opacity: 0.9, fontSize: 13 },
  premiumButton: { marginTop: 10, backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  premiumButtonText: { color: "#d76400", fontWeight: "800" },
  premiumCrown: { fontSize: 40 },
  matchList: {},
  matchCard: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    marginBottom: 10,
  },
  matchTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 8 },
  matchPerson: { flexDirection: "row" },
  matchAvatar: { width: 64, height: 64, borderRadius: 18, backgroundColor: "#ffe0ea", alignItems: "center", justifyContent: "center" },
  matchAvatarText: { fontSize: 30 },
  onlineDot: { width: 12, height: 12, borderRadius: 6, backgroundColor: "#34c759", position: "absolute", bottom: -2, right: 6, borderWidth: 2, borderColor: "#fff" },
  matchMeta: { justifyContent: "center", marginLeft: 10 },
  matchName: { fontWeight: "800", fontSize: 15, color: "#1f1f39" },
  matchDetail: { fontSize: 12, color: "#6b6a7a", marginTop: 2 },
  matchScore: { backgroundColor: "#22c58b", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  matchScoreText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  matchActions: { flexDirection: "row", marginTop: 12 },
  primaryButton: { flex: 1, backgroundColor: "#f75b8a", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  primaryButtonText: { color: "#fff", fontWeight: "800" },
  secondaryButton: { flex: 1, backgroundColor: "#f2f2f6", paddingVertical: 12, borderRadius: 12, alignItems: "center" },
  secondaryButtonSpacer: { marginLeft: 10 },
  secondaryButtonText: { color: "#1f1f39", fontWeight: "800" },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#e6e7f2",
    flexDirection: "row",
    justifyContent: "space-around",
    paddingVertical: 12,
    paddingBottom: 44,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: -2 },
    elevation: 10,
  },
  navItem: { alignItems: "center", flex: 1 },
  navIcon: { fontSize: 18, color: "#9aa0b8", marginBottom: 2 },
  navIconActive: { color: "#f75b8a", transform: [{ scale: 1.05 }] },
  navLabel: { fontSize: 11, color: "#9aa0b8", fontWeight: "600" },
  navLabelActive: { color: "#f75b8a" },
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  loaderText: { marginTop: 10, color: "#1f1f39", fontWeight: "700" },
  retryBtn: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#1f1f39",
    borderRadius: 10,
  },
  retryText: { color: "#fff", fontWeight: "700" },
});

export default DashboardScreen;

const computeProfileCompletion = (p) => {
  if (!p) return 0;
  const fields = [
    p.firstName,
    p.lastName,
    p.age,
    p.maritalStatus,
    p.height,
    p.highestEducation,
    p.occupation || p.sector,
    p.city || p.country,
    p.updatePhoto || p.photoUrl || p.image || p.avatar,
  ];
  const filled = fields.filter((v) => v !== undefined && v !== null && `${v}`.trim() !== "").length;
  const percent = Math.round((filled / fields.length) * 100);
  return Math.min(100, Math.max(0, percent));
};

