import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Image,
} from "react-native";
import { fetchMyProfileApi, updateProfileApi, uploadPhotoApi } from "../api/api";
import { getSession, setPhotoVersion, withPhotoVersion } from "../api/authSession";

const fields = [
  { key: "firstName", label: "First Name" },
  { key: "lastName", label: "Last Name" },
  { key: "age", label: "Age", keyboardType: "number-pad" },
  { key: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed", "Separated"] },
  { key: "height", label: "Height (e.g. 5'8 or 173)" },
  {
    key: "highestEducation",
    label: "Highest Education",
    type: "select",
    options: ["High School", "Diploma", "Bachelors", "Masters", "Doctorate", "PG Diploma", "PGDM", "PhD",  "Other"],
  },
  { key: "occupation", label: "Occupation" },
  { key: "sector", label: "Sector" },
  { key: "city", label: "City" },
  { key: "country", label: "Country" },
];

const EditProfile = ({ navigation }) => {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photo, setPhoto] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  useEffect(() => {
    const load = async () => {
      try {
        const { userId } = getSession();
        if (!userId) {
          setError("Please login again.");
          setLoading(false);
          return;
        }
        const res = await fetchMyProfileApi(userId);
        const profileData = res.data || {};
        setForm(profileData);
        const remotePhoto =
          profileData?.updatePhoto ||
          profileData?.photoUrl ||
          profileData?.image ||
          profileData?.avatar ||
          null;
        if (remotePhoto) {
          setPhoto(withPhotoVersion(remotePhoto));
        }
      } catch (e) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const pickAndUploadPhoto = async () => {
    try {
      // Lazy import to avoid bundler issues if the module is missing
      const ImagePicker = require("react-native-image-picker");
      const { launchImageLibrary } = ImagePicker;
      launchImageLibrary(
        { mediaType: "photo", quality: 0.8 },
        async (response) => {
          if (response.didCancel) return;
          if (response.errorCode || response.errorMessage) {
            Alert.alert("Image picker error", response.errorMessage || response.errorCode);
            return;
          }
          const asset = response.assets?.[0];
          if (!asset?.uri) {
            Alert.alert("No image selected", "Please choose a photo.");
            return;
          }

          const { userId } = getSession();
          if (!userId) {
            Alert.alert("Session expired", "Please login again.");
            navigation.replace("Login");
            return;
          }

          const uri = asset.uri;
          const type = asset.type || "image/jpeg";
          const name = asset.fileName || `photo_${Date.now()}.jpg`;

          const formData = new FormData();
          formData.append("file", {
            uri,
            type,
            name,
          });

          setUploading(true);
          setUploadProgress(0);
          try {
            const res = await uploadPhotoApi(userId, formData, {
              onUploadProgress: (progressEvent) => {
                if (!progressEvent.total) return;
                const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percent);
              },
              timeout: 120000,
            });
            const payload = res?.data || {};
            const newUrl =
              payload.updatePhoto ||
              payload.photoUrl ||
              payload.image ||
              payload.avatar ||
              (payload.fileName ? `/profile-photos/${payload.fileName}` : null) ||
              uri;
            const version = await setPhotoVersion(Date.now());
            const cacheBusted = newUrl ? `${newUrl}${newUrl.includes("?") ? "&" : "?"}pv=${version}` : newUrl;
            setPhoto(cacheBusted);
            setForm((prev) => ({ ...prev, updatePhoto: cacheBusted }));
            Alert.alert("Success", "Photo uploaded successfully.");
          } catch (e) {
            Alert.alert("Upload failed", e?.response?.data || "Please try again.");
          } finally {
            setUploading(false);
            setUploadProgress(0);
          }
        }
      );
    } catch (e) {
      Alert.alert(
        "Image picker not available",
        "Please install react-native-image-picker and rebuild the app."
      );
    }
  };

  const onSave = async () => {
    try {
      const { userId } = getSession();
      if (!userId) {
        Alert.alert("Session expired", "Please login again.");
        navigation.replace("Login");
        return;
      }
      setSaving(true);
      // Only send whitelisted editable fields to avoid backend parse issues on dates/metadata.
      const allowedKeys = [
        "firstName",
        "lastName",
        "age",
        "maritalStatus",
        "height",
        "highestEducation",
        "occupation",
        "sector",
        "city",
        "country",
      ];
      const payload = allowedKeys.reduce((acc, key) => {
        if (form[key] !== undefined && form[key] !== null) {
          acc[key] = key === "age" ? (form.age ? parseInt(form.age, 10) || 0 : 0) : form[key];
        }
        return acc;
      }, {});

      await updateProfileApi(userId, payload);
      Alert.alert("Saved", "Profile updated successfully.", [
        { text: "OK", onPress: () => navigation.navigate("ProfileView") },
      ]);
    } catch (e) {
      const msg = e?.response?.data || e?.message || "Please try again.";
      Alert.alert("Update failed", `${msg}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#1f1f39" />
          <Text style={styles.loaderText}>Loading...</Text>
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentInset={{ bottom: 140 }}
          scrollIndicatorInsets={{ bottom: 140 }}
        >
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.title}>Edit Profile</Text>
              <Text style={styles.subtitle}>Update your details to get better matches</Text>
            </View>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.secondaryBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Profile Photo</Text>
            <View style={styles.photoCard}>
              {photo ? (
                <Image source={{ uri: photo }} style={styles.photo} resizeMode="cover" />
              ) : (
                <View style={[styles.photo, styles.photoPlaceholder]}>
                  <Text style={{ fontSize: 24 }}>📷</Text>
                </View>
              )}
              <TouchableOpacity
                style={[styles.uploadBtn, uploading && { opacity: 0.7 }]}
                onPress={pickAndUploadPhoto}
                disabled={uploading}
              >
                <Text style={styles.uploadText}>{uploading ? "Uploading..." : "Upload Photo"}</Text>
              </TouchableOpacity>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
              )}
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Basic Info</Text>
            <View style={styles.fieldsGrid}>
              {fields.map((f) => (
                <View key={f.key} style={styles.field}>
                  <Text style={styles.label}>{f.label}</Text>
                  {f.type === "select" ? (
                    <View style={styles.optionsRow}>
                      {f.options.map((opt) => {
                        const active = form[f.key] === opt;
                        return (
                          <TouchableOpacity
                            key={opt}
                            style={[styles.optionChip, active && styles.optionChipActive]}
                            onPress={() => onChange(f.key, opt)}
                          >
                            <Text style={[styles.optionText, active && styles.optionTextActive]}>{opt}</Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  ) : (
                    <TextInput
                      style={styles.input}
                      value={form[f.key]?.toString?.() || ""}
                      onChangeText={(v) => onChange(f.key, v)}
                      placeholder={f.label}
                      keyboardType={f.keyboardType || "default"}
                      returnKeyType="next"
                    />
                  )}
                </View>
              ))}
            </View>
          </View>

          <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={onSave} disabled={saving}>
            <Text style={styles.saveText}>{saving ? "Saving..." : "Save Changes"}</Text>
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#e9f5ee" },
  content: { padding: 16, paddingBottom: 60, gap: 16 },
  headerRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  title: { fontSize: 24, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 13, color: "#4b5565", marginTop: 4 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 4,
    borderWidth: 1,
    borderColor: "#eef2f7",
    gap: 12,
  },
  cardTitle: { fontSize: 16, fontWeight: "700", color: "#0f172a" },
  fieldsGrid: { gap: 12 },
  field: { gap: 6 },
  label: { fontSize: 13, color: "#475467", fontWeight: "600" },
  input: {
    backgroundColor: "#f8fafc",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 14,
    color: "#0f172a",
  },
  saveBtn: {
    marginTop: 8,
    backgroundColor: "#111827",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 15 },
  photoCard: { alignItems: "center", gap: 10 },
  photo: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  photoPlaceholder: { alignItems: "center", justifyContent: "center" },
  uploadBtn: {
    backgroundColor: "#111827",
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  uploadText: { color: "#fff", fontWeight: "700" },
  progressText: { marginTop: 6, color: "#4b5565", fontSize: 12 },
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
  optionsRow: { flexDirection: "row", flexWrap: "wrap", marginTop: 4 },
  optionChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
    marginBottom: 8,
  },
  optionChipActive: { backgroundColor: "#111827", borderColor: "#111827" },
  optionText: { color: "#0f172a", fontWeight: "600", fontSize: 13 },
  optionTextActive: { color: "#fff" },
  secondaryBtn: {
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  secondaryBtnText: { color: "#111827", fontWeight: "700" },
});

export default EditProfile;

