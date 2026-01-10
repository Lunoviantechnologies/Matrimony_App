import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Image, Modal } from "react-native";
import { fetchMyProfileApi } from "../api/api";
import { getSession } from "../api/authSession";

const ProfileView = ({ navigation }) => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [photoModalVisible, setPhotoModalVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const { userId } = getSession();
        if (!userId) {
          setError("Please login again to view your profile.");
          setLoading(false);
          return;
        }
        const res = await fetchMyProfileApi(userId);
        setProfile(res.data);
      } catch (e) {
        setError("Failed to load profile. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
        photo:
          profile.updatePhoto ||
          profile.photoUrl ||
          profile.image ||
          profile.avatar ||
          null,
      }
    : null;

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
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 14 },
  greeting: { fontSize: 24, fontWeight: "800", color: "#101828" },
  subline: { fontSize: 13, color: "#4b5565", marginTop: 4 },
  editBtn: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#111827",
    borderRadius: 12,
  },
  editBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  cardHeader: { marginBottom: 12 },
  avatarRow: { flexDirection: "row", alignItems: "center" },
  avatarPressable: { width: 60, height: 60 },
  avatarImage: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#e9f0ff" },
  avatarCircle: { width: 60, height: 60, borderRadius: 30, backgroundColor: "#e9f0ff", alignItems: "center", justifyContent: "center" },
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
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
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
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  actionPrimary: { backgroundColor: "#111827" },
  actionGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: "#e5e7eb" },
  actionPrimaryText: { color: "#fff", fontWeight: "800" },
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
});

export default ProfileView;

