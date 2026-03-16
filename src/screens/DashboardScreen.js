import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
  TouchableWithoutFeedback,
  Image,
  Alert,
  FlatList,
  Dimensions,
} from "react-native";
import NotificationBell from "../components/NotificationBell";
import {
  fetchMyProfileApi,
  fetchDashboardSummaryApi,
  fetchProfileViewsApi,
  sendFriendRequestApi,
  getAbsolutePhotoUrl,
} from "../api/api";
import { getSession, clearSession, withPhotoVersion } from "../api/authSession";
import { maskName } from "../utils/nameMask";

const SCREEN_W = Dimensions.get("window").width;
const FEAT_CARD_W = Math.min(200, SCREEN_W * 0.48);
const FEAT_IMG_H = 180;
const CARD_GAP = 14;

const isPremiumActive = (p) => {
  if (!p) return false;
  const end = p.premiumEnd ? new Date(p.premiumEnd) : null;
  const notExpired = end ? end > new Date() : true;
  return p.premium === true && notExpired;
};

const quickActions = [
  { name: "Astrology", icon: "🔮", route: "AstroTalkQuery" },
  { name: "Premium", icon: "⭐", route: "PremiumSubscription" },
];

const menuItems = [
  { label: "My Profile", route: "ProfileView" },
  { label: "Upgrade to Premium", route: "PremiumSubscription" },
  { label: "Notifications", route: "Notifications" },
  { label: "Raise Ticket", route: "RaiseTicket" },
  { label: "Referral", route: "ReferAndEarn" },
  { label: "Blogs", route: "BlogList" },
  { label: "Logout", action: "logout" },
];

const formatDate = (dt) => {
  if (!dt) return "—";
  try {
    return new Date(dt).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
};

const DashboardScreen = ({ navigation, route }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [profile, setProfile] = useState(null);
  const [summary, setSummary] = useState(null);
  const [profileViewsCount, setProfileViewsCount] = useState("—");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [sendingInterestId, setSendingInterestId] = useState(null);
  const [sentIds, setSentIds] = useState(new Set());
  const [showReferBanner, setShowReferBanner] = useState(false);

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

        const [profileRes, summaryRes, viewsRes] = await Promise.all([
          fetchMyProfileApi(userId),
          fetchDashboardSummaryApi().catch(() => ({ data: null })),
          fetchProfileViewsApi(userId).catch(() => null),
        ]);

        setProfile(profileRes.data);

        const s = summaryRes?.data;
        setSummary(s);

        if (s?.referral && s.referral.completedReferrals < s.referral.totalReferralsNeeded) {
          setShowReferBanner(true);
        }

        const viewsRaw = viewsRes?.data;
        const viewsNumber =
          typeof viewsRaw === "number"
            ? viewsRaw
            : Number(String(viewsRaw ?? "").match(/\d+/)?.[0] || 0);
        setProfileViewsCount(String(viewsNumber || "—"));
      } catch (e) {
        setError("Failed to load dashboard.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [route?.params?.userId]);

  // ─── Derived data from summary (same as web) ────────────────────────────
  const newMatches = summary?.newMatches || [];
  const premiumMatches = summary?.premiumMatches || [];
  const receivedCount = summary?.receivedCount ?? 0;
  const acceptedCount = summary?.acceptedCount ?? 0;
  const rejectedCount = summary?.rejectedCount ?? 0;
  const referSummary = summary?.referral || null;
  const currentPlan = summary?.subscription || null;

  const featuredProfiles = newMatches.slice(0, 6);
  const premiumActive = isPremiumActive(profile);

  const photo = profile?.updatePhoto || profile?.photoUrl || profile?.image || profile?.avatar || null;
  const photoWithVersion = withPhotoVersion(getAbsolutePhotoUrl(photo));
  const userName = profile ? `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "Welcome" : "Welcome";

  const getDisplayName = (name) => {
    if (!name) return "—";
    return premiumActive ? name : maskName(name.split(" ")[0], name.split(" ").slice(1).join(" "));
  };

  const handleAvatarPress = (item) => {
    if (!premiumActive) {
      Alert.alert("Upgrade to Premium", "Unlock profile photos with a Premium plan.", [
        { text: "Later", style: "cancel" },
        { text: "Upgrade", onPress: () => navigation.navigate("PremiumSubscription") },
      ]);
      return;
    }
    if (item?.id) navigation.navigate("ProfileView", { profileId: item.id });
  };

  const handleSendInterest = async (item) => {
    if (!premiumActive) {
      Alert.alert("Premium required", "Please upgrade to a Premium plan to send interests.");
      return;
    }
    const session = getSession();
    if (!session?.userId || !item?.id) return;
    if (sentIds.has(item.id)) return;
    try {
      setSendingInterestId(item.id);
      await sendFriendRequestApi(session.userId, item.id);
      Alert.alert("Interest sent", "Your interest has been sent successfully.");
      setSentIds((prev) => { const n = new Set(prev); n.add(item.id); return n; });
    } catch (e) {
      const msg = e?.response?.data || e?.message || "Failed to send interest.";
      Alert.alert("Failed", typeof msg === "string" ? msg : "Failed to send interest.");
    } finally {
      setSendingInterestId(null);
    }
  };

  const handleNotificationNavigate = (type, targetId) => {
    if (type === "PROFILE" && targetId) { navigation.navigate("ProfileView", { profileId: targetId }); return; }
    if (type === "CHAT" || type === "MESSAGE") { navigation.navigate("Chat"); return; }
    if (type === "MATCHES") { navigation.navigate("Matches"); return; }
    navigation.navigate("Notifications");
  };

  const handleNavigate = (r) => { if (r) navigation.navigate(r); };

  const handleLogout = () => {
    try { clearSession(); } catch (e) { /* ignore */ }
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
      {/* ── Header ── */}
      <View style={styles.hero}>
        <View style={styles.heroHeader}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.navigate("ProfileView", { profileId: profile?.id })}
          >
            <Text style={styles.backBtnText}>‹</Text>
          </TouchableOpacity>
          <View style={styles.heroCenter}>
            <View style={styles.heroLogoRow}>
              <View style={styles.heroLogoWrap}>
                <Text style={styles.heroLogoIcon}>💑</Text>
              </View>
              <Text style={styles.heroEyebrow}>VivahJeevan</Text>
            </View>
            {/* <Text style={styles.heroTitle}>Dashboard</Text> */}
          </View>
          <View style={styles.heroRight}>
            <NotificationBell onNavigate={handleNotificationNavigate} />
            <TouchableOpacity style={styles.filterBtn} onPress={() => setShowMenu((v) => !v)}>
              <Text style={styles.filterBtnText}>{showMenu ? "✖" : "☰"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* User welcome pill */}
        <View style={styles.welcomePill}>
          {photoWithVersion ? (
            <Image source={{ uri: photoWithVersion }} style={styles.welcomeAvatar} />
          ) : (
            <View style={styles.welcomeAvatarPh}><Text>👤</Text></View>
          )}
          <View style={{ flex: 1 }}>
            <Text style={styles.welcomeGreet}>Welcome back,</Text>
            <Text style={styles.welcomeName} numberOfLines={1}>{userName}</Text>
          </View>
          {premiumActive && (
            <View style={styles.crownBadge}><Text style={styles.crownText}>👑 Premium</Text></View>
          )}
        </View>
      </View>

      {/* ── Side Drawer ── */}
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
                    if (item.action === "logout") handleLogout();
                    else if (item.route) handleNavigate(item.route);
                  }}
                >
                  <Text style={styles.drawerItemText}>{item.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      )}

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Refer & Earn Banner (same as web) ── */}
        {showReferBanner && referSummary && (
          <View style={styles.referBanner}>
            <View style={{ flex: 1 }}>
              <View style={styles.referTitleRow}>
                <Text style={styles.referTitle}>🎁 Refer &amp; Earn</Text>
                <View style={styles.referBadge}><Text style={styles.referBadgeText}>NEW</Text></View>
              </View>
              <Text style={styles.referText}>
                Invite friends &amp; get{" "}
                <Text style={{ fontWeight: "800" }}>₹100 instant reward</Text> on your next upgrade.
              </Text>
              {/* Progress bar */}
              <View style={styles.referProgressRow}>
                <View style={styles.referProgressBar}>
                  <View
                    style={[
                      styles.referProgressFill,
                      {
                        width: `${referSummary.totalReferralsNeeded
                          ? (referSummary.completedReferrals / referSummary.totalReferralsNeeded) * 100
                          : 0}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.referProgressText}>
                  {referSummary.completedReferrals}/{referSummary.totalReferralsNeeded} done
                </Text>
              </View>
              <Text style={styles.referBalance}>
                Reward balance: <Text style={{ fontWeight: "800" }}>₹{referSummary.rewardBalance ?? 0}</Text>
              </Text>
            </View>
            <View style={styles.referActions}>
              <TouchableOpacity
                style={styles.referCta}
                onPress={() => { setShowReferBanner(false); navigation.navigate("ReferAndEarn"); }}
              >
                <Text style={styles.referCtaText}>Invite Now</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowReferBanner(false)}>
                <Text style={styles.referSkip}>Maybe later</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* ── Stats Row ── */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <View style={[styles.statIcon, { backgroundColor: "#5b8dff" }]}>
              <Text style={styles.statIconText}>👁️</Text>
            </View>
            <Text style={styles.statLabel}>Profile Views</Text>
            <Text style={styles.statValue}>{profileViewsCount}</Text>
          </View>
          <TouchableOpacity
            style={styles.statCard}
            activeOpacity={0.85}
            onPress={() => navigation.navigate("Sent")}
          >
            <View style={[styles.statIcon, { backgroundColor: "#ff6a6a" }]}>
              <Text style={styles.statIconText}>💌</Text>
            </View>
            <Text style={styles.statLabel}>Interests Sent</Text>
            <Text style={styles.statValue}>{summary?.sentCount ?? "—"}</Text>
          </TouchableOpacity>
        </View>

        {/* ── New Profile Matches (same as web) ── */}
        <View style={styles.secHead}>
          <View style={styles.secTitleRow}>
            <Text style={styles.secTitle}>✨ New Matches</Text>
            <View style={styles.countBadge}>
              <Text style={styles.countBadgeText}>{featuredProfiles.length}</Text>
            </View>
          </View>
          <TouchableOpacity style={styles.viewAllBtn} onPress={() => handleNavigate("Matches")}>
            <Text style={styles.viewAllText}>View All</Text>
          </TouchableOpacity>
        </View>

        {featuredProfiles.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyTitle}>No New Profiles Available</Text>
            <Text style={styles.emptyText}>Check back later or update your preferences.</Text>
          </View>
        ) : (
          <FlatList
            data={featuredProfiles}
            keyExtractor={(item) => String(item.id)}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingVertical: 8 }}
            ItemSeparatorComponent={() => <View style={{ width: CARD_GAP }} />}
            renderItem={({ item }) => {
              const imgUri = item.updatePhoto
                ? withPhotoVersion(getAbsolutePhotoUrl(item.updatePhoto))
                : null;
              const isSending = sendingInterestId === item.id;
              const alreadySent = sentIds.has(item.id);
              return (
                <View style={styles.featCard}>
                  <View style={styles.featImgWrap}>
                    {imgUri && !item.hideProfilePhoto ? (
                      <Image source={{ uri: imgUri }} style={styles.featImg} />
                    ) : (
                      <View style={styles.featImgPh}>
                        <Text style={styles.featImgEmoji}>
                          {item.gender?.toLowerCase() === "female" ? "👩" : "👨"}
                        </Text>
                      </View>
                    )}
                  </View>
                  {/* Premium badge */}
                  {item.premium && (
                    <View style={styles.premiumBadge}><Text style={styles.premiumBadgeText}>👑</Text></View>
                  )}
                  <View style={styles.featOverlay}>
                    <Text style={styles.featName} numberOfLines={1}>
                      {getDisplayName(item.name)}
                    </Text>
                    <Text style={styles.featAgeLoc} numberOfLines={1}>
                      📍 {item.age ? `${item.age} yrs` : "—"} · {item.city || "—"}
                    </Text>
                    {item.profession ? (
                      <View style={styles.featTagWrap}>
                        <Text style={styles.featTag}>{item.profession}</Text>
                      </View>
                    ) : null}
                  </View>
                  <View style={styles.featActionsRow}>
                    <TouchableOpacity
                      style={styles.featViewBtn}
                      activeOpacity={0.9}
                      onPress={() => handleAvatarPress(item)}
                    >
                      <Text style={styles.featViewBtnText}>View</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.featRequestBtn,
                        (isSending || alreadySent) && styles.featRequestBtnDisabled,
                      ]}
                      activeOpacity={0.9}
                      onPress={() => handleSendInterest(item)}
                      disabled={isSending || alreadySent}
                    >
                      <Text style={styles.featRequestBtnText}>
                        {isSending ? "Sending..." : alreadySent ? "Requested" : "Connect"}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            }}
          />
        )}

        {/* ── Interest Requests Section (same as web) ── */}
        <View style={[styles.secHead, { marginTop: 20 }]}>
          <Text style={styles.secTitle}>💌 Interest Requests</Text>
        </View>
        <View style={styles.interestRow}>
          <TouchableOpacity
            style={styles.interestBtn}
            onPress={() => navigation.navigate("Requests")}
          >
            <Text style={styles.interestBtnLabel}>New Requests</Text>
            <View style={styles.interestBadge}>
              <Text style={styles.interestBadgeText}>{receivedCount}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.interestBtn}
            onPress={() => navigation.navigate("Accepted")}
          >
            <Text style={styles.interestBtnLabel}>Accepted</Text>
            <View style={styles.interestBadge}>
              <Text style={styles.interestBadgeText}>{acceptedCount}</Text>
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.interestBtn}
            onPress={() => navigation.navigate("Rejected")}
          >
            <Text style={styles.interestBtnLabel}>Denied</Text>
            <View style={styles.interestBadge}>
              <Text style={styles.interestBadgeText}>{rejectedCount}</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* ── My Subscription Plan (same as web) ── */}
        <View style={[styles.secHead, { marginTop: 20 }]}>
          <Text style={styles.secTitle}>💳 My Subscription</Text>
        </View>
        {!currentPlan ? (
          <View style={styles.planCard}>
            <Text style={styles.planEmpty}>No active subscription plan</Text>
            <TouchableOpacity
              style={styles.upgradeBtn}
              onPress={() => navigation.navigate("PremiumSubscription")}
            >
              <Text style={styles.upgradeBtnText}>Upgrade Now</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.planCard}>
            <Text style={styles.planName}>{currentPlan.planName}</Text>
            {currentPlan.amount != null && (
              <Text style={styles.planDetail}>Amount: ₹{currentPlan.amount}</Text>
            )}
            <Text style={styles.planDetail}>
              Valid From: {formatDate(currentPlan.premiumStart)}
            </Text>
            <Text style={styles.planDetail}>
              Valid Till: {formatDate(currentPlan.premiumEnd)}
            </Text>
            {currentPlan.expiryMessage ? (
              <Text style={styles.planExpiry}>{currentPlan.expiryMessage}</Text>
            ) : null}
          </View>
        )}

        {/* ── Premium Members (same as web) ── */}
        {premiumMatches.length > 0 && (
          <>
            <View style={[styles.secHead, { marginTop: 20 }]}>
              <Text style={styles.secTitle}>👑 Premium Members</Text>
            </View>
            {premiumMatches.map((item) => {
              const imgUri = item.updatePhoto
                ? withPhotoVersion(getAbsolutePhotoUrl(item.updatePhoto))
                : null;
              return (
                <TouchableOpacity
                  key={item.id}
                  style={styles.premiumMemberRow}
                  onPress={() => handleAvatarPress(item)}
                  activeOpacity={0.85}
                >
                  {imgUri && !item.hideProfilePhoto ? (
                    <Image source={{ uri: imgUri }} style={styles.premiumMemberImg} />
                  ) : (
                    <View style={[styles.premiumMemberImg, styles.premiumMemberImgPh]}>
                      <Text>{item.gender?.toLowerCase() === "female" ? "👩" : "👨"}</Text>
                    </View>
                  )}
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.premiumMemberName}>
                      {getDisplayName(item.name)}
                    </Text>
                    <Text style={styles.premiumMemberMeta} numberOfLines={1}>
                      {[item.city, item.country].filter(Boolean).join(", ")}
                      {item.age ? ` · ${item.age} yrs` : ""}
                      {item.motherTongue ? ` · ${item.motherTongue}` : ""}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={[styles.featLikeBtn, sentIds.has(item.id) && styles.featLikeBtnDisabled]}
                    onPress={() => handleSendInterest(item)}
                    disabled={sendingInterestId === item.id || sentIds.has(item.id)}
                  >
                    <Text style={styles.featLikeBtnText}>
                      {sendingInterestId === item.id ? "..." : sentIds.has(item.id) ? "✓" : "❤️"}
                    </Text>
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </>
        )}

        {/* ── Quick Actions ── */}
        <View style={[styles.secHead, { marginTop: 20 }]}>
          <Text style={styles.secTitle}>⚡ Quick Actions</Text>
        </View>
        <View style={styles.quickGrid}>
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.name}
              style={styles.quickCard}
              onPress={() => handleNavigate(action.route)}
            >
              <View style={styles.quickIconWrap}>
                <Text style={styles.quickIcon}>{action.icon}</Text>
              </View>
              <Text style={styles.quickText}>{action.name}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Premium promo (if not subscribed) ── */}
        {!currentPlan && (
          <View style={styles.premiumPromoCard}>
            <View>
              <View style={styles.premiumTitleRow}>
                <Text style={styles.premiumStar}>⭐</Text>
                <Text style={styles.premiumTitle}>Upgrade to Premium</Text>
              </View>
              <Text style={styles.premiumSubtitle}>Unlock unlimited matches &amp; more</Text>
              <TouchableOpacity
                style={styles.premiumButton}
                onPress={() => handleNavigate("PremiumSubscription")}
              >
                <Text style={styles.premiumButtonText}>Upgrade Now</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.premiumCrown}>👑</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4", paddingTop: 28 },

  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  loaderText: { marginTop: 10, color: "#1c1116", fontWeight: "700" },
  retryBtn: { marginTop: 12, paddingHorizontal: 14, paddingVertical: 10, backgroundColor: "#7d1f2e", borderRadius: 10 },
  retryText: { color: "#fff", fontWeight: "700" },

  /* Header */
  hero: { backgroundColor: "#D9F5E4", paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 },
  heroHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  backBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e6e7f2", alignItems: "center", justifyContent: "center" },
  backBtnText: { color: "#1f2937", fontSize: 22, fontWeight: "300" },
  heroCenter: { flex: 1, alignItems: "center" },
  heroLogoRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  heroLogoWrap: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#CDEFD9", alignItems: "center", justifyContent: "center" },
  heroLogoIcon: { fontSize: 18 },
  heroEyebrow: { fontSize: 17, fontWeight: "700", color: "#1f1f39" },
  heroTitle: { fontSize: 20, fontWeight: "700", color: "#1f1f39", marginTop: 2 },
  heroRight: { flexDirection: "row", alignItems: "center", gap: 10 },
  filterBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e6e7f2", alignItems: "center", justifyContent: "center" },
  filterBtnText: { color: "#1f2937", fontSize: 18 },

  /* Welcome pill */
  welcomePill: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 12, gap: 10, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  welcomeAvatar: { width: 42, height: 42, borderRadius: 21 },
  welcomeAvatarPh: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#CDEFD9", alignItems: "center", justifyContent: "center" },
  welcomeGreet: { fontSize: 11, color: "#888" },
  welcomeName: { fontSize: 15, fontWeight: "800", color: "#1f1f39" },
  crownBadge: { backgroundColor: "#fef3c7", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 10 },
  crownText: { fontSize: 11, fontWeight: "700", color: "#92400e" },

  /* Drawer */
  overlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: "rgba(0,0,0,0.4)", zIndex: 20, justifyContent: "flex-start", alignItems: "flex-end" },
  drawer: { width: "70%", backgroundColor: "#D9F5E4", height: "100%", padding: 16, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 10, elevation: 8 },
  drawerHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  drawerTitle: { fontSize: 18, fontWeight: "800", color: "#1c1116" },
  drawerClose: { fontSize: 18 },
  drawerItem: { paddingVertical: 12, paddingHorizontal: 10, borderRadius: 12, backgroundColor: "#fff", marginBottom: 8 },
  drawerItemText: { color: "#1f1f39", fontWeight: "600" },

  content: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 120 },

  /* Section header */
  secHead: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 10 },
  secTitleRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  secTitle: { fontSize: 18, fontWeight: "700", color: "#1c1116" },
  countBadge: { backgroundColor: "#CDEFD9", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10 },
  countBadgeText: { fontSize: 11, fontWeight: "600", color: "#166534" },
  viewAllBtn: { backgroundColor: "#CDEFD9", paddingHorizontal: 12, paddingVertical: 5, borderRadius: 12 },
  viewAllText: { fontSize: 12, fontWeight: "600", color: "#166534" },

  /* Stats */
  statsGrid: { flexDirection: "row", justifyContent: "space-between", marginBottom: 4 },
  statCard: { width: "48%", backgroundColor: "#fff", borderRadius: 18, padding: 14, borderWidth: 1, borderColor: "#f0e4e4", shadowColor: "#1c1116", shadowOpacity: 0.05, shadowRadius: 12, elevation: 3 },
  statIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statIconText: { fontSize: 20 },
  statLabel: { color: "#8a7070", fontSize: 12, marginBottom: 4 },
  statValue: { color: "#1c1116", fontSize: 20, fontWeight: "800" },

  /* Empty state */
  emptyCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, alignItems: "center", marginVertical: 8 },
  emptyTitle: { fontSize: 15, fontWeight: "700", color: "#1c1116", marginBottom: 6 },
  emptyText: { fontSize: 12, color: "#888", textAlign: "center" },

  /* Featured cards */
  featCard: { width: FEAT_CARD_W, borderRadius: 22, overflow: "hidden", backgroundColor: "#fff", shadowColor: "#1c1116", shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.14, shadowRadius: 32, elevation: 8 },
  featImgWrap: { width: FEAT_CARD_W, height: FEAT_IMG_H, overflow: "hidden" },
  featImg: { width: "100%", height: "100%", resizeMode: "cover" },
  featImgPh: { width: "100%", height: "100%", backgroundColor: "#fde8ec", alignItems: "center", justifyContent: "center" },
  featImgEmoji: { fontSize: 56 },
  premiumBadge: { position: "absolute", top: 8, left: 8, backgroundColor: "rgba(255,200,0,0.9)", borderRadius: 10, paddingHorizontal: 6, paddingVertical: 2 },
  premiumBadgeText: { fontSize: 11 },
  featOverlay: {
    position: "absolute",
    bottom: 48,
    left: 0,
    right: 0,
    paddingVertical: 14,
    paddingHorizontal: 14,
    backgroundColor: "rgba(15,23,42,0.92)",
  },
  featName: { fontSize: 17, fontWeight: "700", color: "#fff" },
  featAgeLoc: { fontSize: 11, color: "rgba(255,255,255,0.7)", marginTop: 3 },
  featTagWrap: { flexDirection: "row", marginTop: 8 },
  featTag: { fontSize: 9, color: "rgba(255,255,255,0.85)", backgroundColor: "rgba(255,255,255,0.12)", paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, overflow: "hidden" },
  featActionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#0f172a",
    gap: 10,
  },
  featViewBtn: {
    flex: 1,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "#4b5563",
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: "#111827",
  },
  featViewBtnText: { fontSize: 13, fontWeight: "700", color: "#e5e7eb" },
  featRequestBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 9,
    alignItems: "center",
    backgroundColor: "#16a34a",
  },
  featRequestBtnDisabled: { opacity: 0.6 },
  featRequestBtnText: { fontSize: 13, fontWeight: "800", color: "#ffffff" },

  /* Interest Requests */
  interestRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  interestBtn: { flex: 1, backgroundColor: "#fff", borderRadius: 14, padding: 14, alignItems: "center", borderWidth: 1, borderColor: "#e0f0e8", shadowColor: "#000", shadowOpacity: 0.04, elevation: 2 },
  interestBtnLabel: { fontSize: 11, fontWeight: "700", color: "#166534", marginBottom: 6, textAlign: "center" },
  interestBadge: { backgroundColor: "#e8586a", borderRadius: 20, minWidth: 28, paddingHorizontal: 6, paddingVertical: 2, alignItems: "center" },
  interestBadgeText: { color: "#fff", fontSize: 13, fontWeight: "800" },

  /* Subscription Plan */
  planCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, borderWidth: 1, borderColor: "#e0f0e8", marginBottom: 4 },
  planName: { fontSize: 16, fontWeight: "800", color: "#166534", marginBottom: 8 },
  planDetail: { fontSize: 13, color: "#444", marginBottom: 4 },
  planExpiry: { fontSize: 12, color: "#888", marginTop: 4 },
  planEmpty: { color: "#999", fontStyle: "italic", marginBottom: 10 },
  upgradeBtn: { alignSelf: "flex-start", backgroundColor: "#16a34a", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 10 },
  upgradeBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },

  /* Premium Members list */
  premiumMemberRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 14, padding: 12, marginBottom: 10, borderWidth: 1, borderColor: "#e0f0e8", shadowColor: "#000", shadowOpacity: 0.04, elevation: 2 },
  premiumMemberImg: { width: 56, height: 56, borderRadius: 14, resizeMode: "cover" },
  premiumMemberImgPh: { backgroundColor: "#fde8ec", alignItems: "center", justifyContent: "center" },
  premiumMemberName: { fontSize: 15, fontWeight: "800", color: "#5C4218" },
  premiumMemberMeta: { fontSize: 12, color: "#8A6F47", marginTop: 2 },

  /* Quick Actions */
  quickGrid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  quickCard: { width: "48%", backgroundColor: "#fff", borderRadius: 18, paddingVertical: 14, paddingHorizontal: 12, marginBottom: 12, borderWidth: 1, borderColor: "#f0e4e4", elevation: 3, alignItems: "flex-start" },
  quickIconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#fdf0dc", alignItems: "center", justifyContent: "center", marginBottom: 8 },
  quickIcon: { fontSize: 20 },
  quickText: { fontWeight: "700", color: "#1c1116", fontSize: 14 },

  /* Premium promo */
  premiumPromoCard: { backgroundColor: "#16a34a", borderRadius: 20, padding: 18, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 12, marginBottom: 8, elevation: 6 },
  premiumTitleRow: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  premiumStar: { fontSize: 18, marginRight: 6 },
  premiumTitle: { color: "#fff", fontSize: 14, fontWeight: "700" },
  premiumSubtitle: { color: "rgba(255,255,255,0.85)", fontSize: 11, marginTop: 2 },
  premiumButton: { marginTop: 10, backgroundColor: "#fff", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 12 },
  premiumButtonText: { color: "#15803d", fontWeight: "800" },
  premiumCrown: { fontSize: 40 },

  /* Refer banner */
  referBanner: { backgroundColor: "#fef3c7", borderRadius: 16, padding: 14, marginBottom: 12, flexDirection: "row", alignItems: "flex-start", gap: 10 },
  referTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  referTitle: { fontSize: 14, fontWeight: "800", color: "#92400e" },
  referBadge: { backgroundColor: "#f59e0b", borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 },
  referBadgeText: { fontSize: 10, color: "#fff", fontWeight: "700" },
  referText: { fontSize: 12, color: "#92400e", marginBottom: 8 },
  referProgressRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 4 },
  referProgressBar: { flex: 1, height: 6, backgroundColor: "#fde68a", borderRadius: 3, overflow: "hidden" },
  referProgressFill: { height: "100%", backgroundColor: "#f59e0b", borderRadius: 3 },
  referProgressText: { fontSize: 11, color: "#92400e", fontWeight: "600" },
  referBalance: { fontSize: 12, color: "#92400e" },
  referActions: { alignItems: "flex-end", gap: 6, justifyContent: "flex-start" },
  referCta: { backgroundColor: "#e8586a", borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6 },
  referCtaText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  referSkip: { fontSize: 11, color: "#92400e", marginTop: 4 },
});

export default DashboardScreen;
