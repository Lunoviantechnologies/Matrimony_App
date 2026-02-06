import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal } from "react-native";
import { fetchMyProfileApi } from "../api/api";
import { getSession, withPhotoVersion } from "../api/authSession";

const ProfileView = ({ navigation, route }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { userId } = getSession();
        const targetId = route?.params?.profileId || userId;
        if (!targetId) {
          setError("Please login again to view profile.");
          setLoading(false);
          return;
        }
        const res = await fetchMyProfileApi(targetId);
        setProfile(res.data);
      } catch (e) {
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [route?.params?.profileId]);

  const user = profile
    ? {
        name: `${profile.firstName || ""} ${profile.lastName || ""}`.trim() || "My Profile",
        id: profile.id ? `MAT${profile.id}` : profile.emailId || "",
        age: profile.age || "—",
        location: profile.city ? `${profile.city}${profile.country ? ", " + profile.country : ""}` : profile.country || "—",
        profession: profile.occupation || profile.sector || "—",
        education: profile.highestEducation || "—",
        height: profile.height || "—",
        maritalStatus: profile.maritalStatus || "—",
        photo: withPhotoVersion(
          profile.updatePhoto ||
          profile.photoUrl ||
          profile.image ||
          profile.avatar ||
          null
        ),
      }
    : null;

  const session = getSession();
  const isOwnProfile = !route?.params?.profileId || route?.params?.profileId === session?.userId;

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#1f1f39" />
          <Text style={styles.loaderText}>Loading profile...</Text>
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
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        {isOwnProfile ? (
          <>
            <View style={styles.headerRow}>
              <View>
                <Text style={styles.greeting}>Profile</Text>
                <Text style={styles.subline}>Manage and share your details</Text>
              </View>
              <TouchableOpacity style={styles.editBtn} onPress={() => navigation?.navigate?.("EditProfile")}>
                <Text style={styles.editBtnText}>Edit</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <View style={styles.avatarRow}>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => user?.photo && setPhotoModalVisible(true)}
                    style={styles.avatarPressable}
                  >
                    {user?.photo ? (
                      <Image source={{ uri: user.photo }} style={styles.avatarImage} />
                    ) : (
                      <View style={styles.avatarCircle}>
                        <Text style={styles.avatarEmoji}>💑</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                  <View style={{ marginLeft: 12, flex: 1 }}>
                    <Text style={styles.name}>{user?.name}</Text>
                    <Text style={styles.id}>ID: {user?.id}</Text>
                    <Text style={styles.meta}>{user?.profession}</Text>
                  </View>
                </View>
              </View>

              <View style={styles.infoGrid}>
                <View style={styles.infoItem}>
                  <Text style={styles.pillLabel}>Age</Text>
                  <Text style={styles.pillValue}>{user?.age}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.pillLabel}>Height</Text>
                  <Text style={styles.pillValue}>{user?.height}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.pillLabel}>Location</Text>
                  <Text style={styles.pillValue}>{user?.location}</Text>
                </View>
                <View style={styles.infoItem}>
                  <Text style={styles.pillLabel}>Status</Text>
                  <Text style={styles.pillValue}>{user?.maritalStatus}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>About</Text>
              <View style={styles.sectionCard}>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionLabel}>Education</Text>
                  <Text style={styles.sectionValue}>{user?.education}</Text>
                </View>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionLabel}>Profession</Text>
                  <Text style={styles.sectionValue}>{user?.profession}</Text>
                </View>
                <View style={styles.sectionRow}>
                  <Text style={styles.sectionLabel}>Location</Text>
                  <Text style={styles.sectionValue}>{user?.location}</Text>
                </View>
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Actions</Text>
              <View style={styles.actionRow}>
                <TouchableOpacity style={[styles.actionBtn, styles.actionPrimary]} onPress={() => navigation?.navigate?.("PremiumSubscription")}>
                  <Text style={styles.actionPrimaryText}>Upgrade</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionGhost]} onPress={() => navigation?.navigate?.("EditProfile")}>
                  <Text style={styles.actionText}>Edit Profile</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.actionBtn, styles.actionGhost]} onPress={() => navigation?.navigate?.("Settings")}>
                  <Text style={styles.actionText}>Settings</Text>
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : (
          <View style={styles.card}>
            <Text style={styles.greeting}>Profile Photo</Text>
            <Text style={styles.subline}>You are viewing a member</Text>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={() => user?.photo && setPhotoModalVisible(true)}
              style={[styles.viewerImageWrap]}
            >
              {user?.photo ? (
                <Image source={{ uri: user.photo }} style={styles.viewerImage} />
              ) : (
                <View style={[styles.viewerImage, styles.avatarCircle, { alignItems: "center", justifyContent: "center" }]}>
                  <Text style={styles.avatarEmoji}>💑</Text>
                </View>
              )}
            </TouchableOpacity>
            <View style={{ marginTop: 12 }}>
              <Text style={styles.name}>{user?.name}</Text>
              <Text style={styles.meta}>{[user?.age && `${user.age} yrs`, user?.location].filter(Boolean).join(" • ") || "—"}</Text>
              <Text style={styles.meta}>{user?.profession}</Text>
            </View>

            <View style={styles.viewerInfo}>
              {[
                { label: "Gender", value: profile?.gender },
                { label: "Height", value: profile?.height },
                { label: "Religion / Community", value: [profile?.religion, profile?.caste].filter(Boolean).join(" • ") },
                { label: "Mother Tongue", value: profile?.motherTongue },
                { label: "Marital Status", value: profile?.maritalStatus },
                { label: "Education", value: profile?.highestEducation },
                { label: "Occupation", value: profile?.occupation },
                { label: "Company", value: profile?.companyName },
                { label: "Income", value: profile?.annualIncome },
                { label: "Location", value: user?.location },
                { label: "Phone", value: profile?.mobileNumber },
                { label: "Email", value: profile?.emailId },
              ]
                .filter((row) => row.value)
                .map((row) => (
                  <View key={row.label} style={styles.viewerRow}>
                    <Text style={styles.viewerLabel}>{row.label}</Text>
                    <Text style={styles.viewerValue}>{row.value}</Text>
                  </View>
                ))}
              {(!profile ||
                ![
                  profile?.gender,
                  profile?.height,
                  profile?.religion,
                  profile?.caste,
                  profile?.motherTongue,
                  profile?.maritalStatus,
                  profile?.highestEducation,
                  profile?.occupation,
                  profile?.companyName,
                  profile?.annualIncome,
                  user?.location,
                  profile?.mobileNumber,
                  profile?.emailId,
                ].some(Boolean)) && <Text style={styles.viewerValue}>No additional details available.</Text>}
            </View>
          </View>
        )}
      </ScrollView>

      <Modal
        visible={photoModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setPhotoModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setPhotoModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={() => setPhotoModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
            {user?.photo ? (
              <Image source={{ uri: user.photo }} style={styles.modalImage} resizeMode="contain" />
            ) : (
              <View style={[styles.modalImage, styles.avatarCircle, { alignItems: "center", justifyContent: "center" }]}>
                <Text style={styles.avatarEmoji}>💑</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4" },
  content: { padding: 16, paddingBottom: 40, gap: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  greeting: { fontSize: 24, fontWeight: "800", color: "#101828" },
  subline: { fontSize: 13, color: "#4b5565", marginTop: 4 },
  editBtn: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: "#f75b8a",
    borderRadius: 999,
  },
  editBtnText: { color: "#fff", fontWeight: "700", fontSize: 13, letterSpacing: 0.3 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardHeader: { marginBottom: 12 },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarPressable: { width: 70, height: 70 },
  avatarImage: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#e9f0ff", borderWidth: 2, borderColor: "#f75b8a" },
  avatarCircle: { width: 70, height: 70, borderRadius: 35, backgroundColor: "#e9f0ff", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#f75b8a" },
  avatarEmoji: { fontSize: 30 },
  name: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  id: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  meta: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 12,
    gap: 10,
  },
  infoItem: {
    flexBasis: "48%",
    backgroundColor: "#fdf2f8",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#fbcfe8",
  },
  pillLabel: { fontSize: 12, color: "#6b7280" },
  pillValue: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginTop: 4 },
  section: { gap: 8 },
  sectionTitle: { fontSize: 17, fontWeight: "800", color: "#0f172a" },
  sectionCard: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    borderWidth: 1,
    borderColor: "#eef2f7",
  },
  sectionRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 10 },
  sectionLabel: { fontSize: 13, color: "#6b7280" },
  sectionValue: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  actionRow: { flexDirection: "row", justifyContent: "space-between", gap: 12 },
  actionBtn: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  actionPrimary: { backgroundColor: "#f75b8a" },
  actionGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  actionPrimaryText: { color: "#fff", fontWeight: "800", letterSpacing: 0.3 },
  actionText: { color: "#0f172a", fontWeight: "700" },
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
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    padding: 16,
  },
  modalContent: { flex: 1, alignItems: "center", justifyContent: "center" },
  modalImage: { width: "90%", height: "70%" },
  viewerImageWrap: { marginTop: 12, borderRadius: 14, overflow: "hidden", alignItems: "center", justifyContent: "center" },
  viewerImage: { width: "100%", height: 260, borderRadius: 14 },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    zIndex: 2,
  },
  closeBtnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  viewerInfo: { marginTop: 12, gap: 8 },
  viewerRow: { flexDirection: "row", justifyContent: "space-between", gap: 10 },
  viewerLabel: { color: "#6b7280", fontWeight: "700" },
  viewerValue: { color: "#0f172a", fontWeight: "700", flex: 1, textAlign: "right" },
});

export default ProfileView;

