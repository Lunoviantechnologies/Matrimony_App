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
import { fetchMyProfileApi, updateProfileApi, updateProfileAdminApi, uploadPhotoApi, uploadProfilePhotoSlotApi, deleteProfilePhotoSlotApi, getAbsolutePhotoUrl } from "../api/api";
import { getSession, setPhotoVersion, withPhotoVersion } from "../api/authSession";

// Height options like web (4'0" to 7'0")
const heightOptions = (() => {
  const out = [];
  for (let ft = 4; ft <= 7; ft++) {
    for (let inch = 0; inch < 12; inch++) {
      if (ft === 7 && inch > 0) break;
      out.push(`${ft}'${inch}"`);
    }
  }
  return out;
})();

const HABITS_OPTIONS = ["Smoking", "Drinking", "Both", "None"];
const FOOD_OPTIONS = ["Vegetarian", "Non-Vegetarian", "Occasionally Non-Vegetarian", "Eggetarian"];
const GOTHRAM_LIST = ["Agastya", "Aitreya", "Angirasa", "Atreya", "Bharadwaj", "Bhargava", "Gautama", "Kashyapa", "Koundinya", "Vasishta", "Vishvamitra", "Other", "Prefer Not to Say"];

const SECTION_PERSONAL = [
  { key: "firstName", label: "First Name", readOnly: true },
  { key: "lastName", label: "Last Name", readOnly: true },
  { key: "mobileNumber", label: "Mobile Number", keyboardType: "phone-pad" },
  { key: "dateOfBirth", label: "Date of Birth", readOnly: true },
  { key: "gender", label: "Gender", readOnly: true },
  { key: "motherTongue", label: "Mother Tongue" },
  { key: "maritalStatus", label: "Marital Status", type: "select", options: ["Single", "Married", "Divorced", "Widowed", "Separated"] },
  { key: "religion", label: "Religion" },
  { key: "subCaste", label: "Sub Community" },
  { key: "occupation", label: "Occupation" },
  { key: "companyName", label: "Company" },
  { key: "sector", label: "Sector" },
  { key: "sports", label: "Sports" },
  { key: "aboutYourself", label: "About Yourself", multiline: true },
  { key: "isChildrenLivingWithYou", label: "Living with Children", type: "select", options: ["true", "false"] },
];
const SECTION_BASICS = [
  { key: "height", label: "Height", type: "select", options: heightOptions },
  { key: "weight", label: "Weight" },
  { key: "bodyType", label: "Body Type" },
  { key: "complexion", label: "Complexion" },
  { key: "habbits", label: "Habits", type: "select", options: HABITS_OPTIONS },
  { key: "vegiterian", label: "Food Preference", type: "select", options: FOOD_OPTIONS },
];
const SECTION_EDUCATION_CAREER = [
  { key: "highestEducation", label: "Highest Education" },
  { key: "collegeName", label: "College Name" },
  { key: "experience", label: "Working Experience" },
  { key: "sector", label: "Sector" },
  { key: "occupation", label: "Occupation" },
  { key: "companyName", label: "Company Name" },
  { key: "annualIncome", label: "Annual Income" },
  { key: "workLocation", label: "Work Location" },
  { key: "country", label: "Present Country" },
  { key: "city", label: "Present City" },
];
const SECTION_FAMILY = [
  { key: "fatherName", label: "Father's Name" },
  { key: "motherName", label: "Mother's Name" },
  { key: "numberOfBrothers", label: "Number of Brothers" },
  { key: "numberOfSisters", label: "Number of Sisters" },
  { key: "familyStatus", label: "Family Status" },
  { key: "familyType", label: "Family Type" },
];
const SECTION_ADDRESS = [
  { key: "country", label: "Country" },
  { key: "state", label: "State" },
  { key: "district", label: "District" },
  { key: "city", label: "City" },
  { key: "residenceStatus", label: "Residence Status" },
];
const SECTION_ASTRO = [
  { key: "rashi", label: "Rashi" },
  { key: "nakshatra", label: "Nakshatra" },
  { key: "dosham", label: "Dosham" },
  { key: "ascendant", label: "Ascendant" },
  { key: "basicPlanetaryPosition", label: "Basic Planetary Position", multiline: true },
  { key: "gothram", label: "Gothram", type: "select", options: GOTHRAM_LIST },
];
const SECTION_SPIRITUAL = [{ key: "spiritualPath", label: "Spiritual Path" }];
const SECTION_PARTNER = [
  { key: "partnerAgeRange", label: "Partner Age Range" },
  { key: "partnerReligion", label: "Partner Religion" },
  { key: "partnerEducation", label: "Partner Education" },
  { key: "partnerWork", label: "Partner Work" },
];

const SECTIONS = [
  { title: "Personal Details", fields: SECTION_PERSONAL },
  { title: "Basics & Lifestyle", fields: SECTION_BASICS },
  { title: "Education & Career", fields: SECTION_EDUCATION_CAREER },
  { title: "Family Details", fields: SECTION_FAMILY },
  { title: "Address", fields: SECTION_ADDRESS },
  { title: "Astrology", fields: SECTION_ASTRO },
  { title: "Spiritual Path", fields: SECTION_SPIRITUAL },
  { title: "Partner Preferences", fields: SECTION_PARTNER },
];
const PROFILE_COMPLETION_KEYS = Array.from(
  new Set([
    ...SECTIONS.flatMap((section) => section.fields.map((field) => field.key)),
    "hobbies",
    "partnerHobbies",
  ])
);

const isFilledValue = (value) => {
  if (value === undefined || value === null) return false;
  if (typeof value === "boolean") return true;
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "number") return Number.isFinite(value);
  return String(value).trim() !== "";
};

const PHOTO_SLOTS = ["updatePhoto", "updatePhoto1", "updatePhoto2", "updatePhoto3", "updatePhoto4"];
const MAX_PHOTOS = 5;
const TAB_ITEMS = ["Personal", "Lifestyle", "Education", "Photos"];

const EditProfile = ({ navigation }) => {
  const [form, setForm] = useState({});
  const [activeTab, setActiveTab] = useState("Photos");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [photos, setPhotos] = useState(Array(MAX_PHOTOS).fill(null));
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [deleting, setDeleting] = useState(false);

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
        const flat = { ...profileData };
        if (Array.isArray(profileData.hobbies)) flat.hobbies = profileData.hobbies.join(", ");
        else if (typeof profileData.hobbies === "string") flat.hobbies = profileData.hobbies;
        if (Array.isArray(profileData.partnerHobbies)) flat.partnerHobbies = profileData.partnerHobbies.join(", ");
        else if (typeof profileData.partnerHobbies === "string") flat.partnerHobbies = profileData.partnerHobbies;
        if (profileData.isChildrenLivingWithYou === true || profileData.isChildrenLivingWithYou === "true") flat.isChildrenLivingWithYou = "true";
        else if (profileData.isChildrenLivingWithYou === false || profileData.isChildrenLivingWithYou === "false") flat.isChildrenLivingWithYou = "false";
        setForm(flat);
        const photosArray = PHOTO_SLOTS.map((slot) => {
          const url =
            profileData?.[slot] ||
            (slot === "updatePhoto"
              ? profileData?.updatePhoto || profileData?.photoUrl || profileData?.image || profileData?.avatar
              : null);
          return url ? withPhotoVersion(getAbsolutePhotoUrl(url)) : null;
        });
        setPhotos(photosArray);
      } catch (e) {
        setError("Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const currentSlot = PHOTO_SLOTS[currentPhotoIndex];
  const currentPhoto = photos[currentPhotoIndex];
  const baseFilledCount = PROFILE_COMPLETION_KEYS.filter((k) => isFilledValue(form[k])).length;
  const hasAtLeastOnePhoto = photos.some(Boolean) || PHOTO_SLOTS.some((slot) => isFilledValue(form[slot]));
  const completionTotal = PROFILE_COMPLETION_KEYS.length + 1;
  const completionFilled = baseFilledCount + (hasAtLeastOnePhoto ? 1 : 0);
  const completionPercent = Math.max(0, Math.min(100, Math.round((completionFilled / completionTotal) * 100)));
  const tabSectionMap = {
    Personal: ["Personal Details", "Family Details", "Address", "Astrology", "Spiritual Path", "Partner Preferences"],
    Lifestyle: ["Basics & Lifestyle"],
    Education: ["Education & Career"],
    Photos: [],
  };
  const visibleSections = SECTIONS.filter((s) => tabSectionMap[activeTab]?.includes(s.title));

  const goPrevPhoto = () => setCurrentPhotoIndex((i) => (i <= 0 ? MAX_PHOTOS - 1 : i - 1));
  const goNextPhoto = () => setCurrentPhotoIndex((i) => (i >= MAX_PHOTOS - 1 ? 0 : i + 1));

  const pickAndUploadPhoto = async () => {
    try {
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
          formData.append("file", { uri, type, name });

          setUploading(true);
          setUploadProgress(0);
          try {
            // Slot 0 (updatePhoto) uses /api/admin/photo; slots 1-4 use /api/profile-photos/{slot}
            const res =
              currentSlot === "updatePhoto"
                ? await uploadPhotoApi(userId, formData, {
                    onUploadProgress: (progressEvent) => {
                      if (!progressEvent.total) return;
                      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                      setUploadProgress(percent);
                    },
                    timeout: 120000,
                  })
                : await uploadProfilePhotoSlotApi(userId, currentSlot, formData, {
                    onUploadProgress: (progressEvent) => {
                      if (!progressEvent.total) return;
                      const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                      setUploadProgress(percent);
                    },
                    timeout: 120000,
                  });
            const payload = res?.data || {};
            // Use only server-returned URL (never local file uri - it won't display after upload)
            const serverUrl =
              payload[currentSlot] ||
              payload.updatePhoto ||
              payload.photoUrl ||
              payload.image ||
              payload.avatar ||
              (payload.fileName ? `/profile-photos/${payload.fileName}` : null);
            if (!serverUrl || typeof serverUrl !== "string") {
              Alert.alert("Upload succeeded", "Photo saved. Pull down or reopen Edit Profile to see it.");
              setUploading(false);
              setUploadProgress(0);
              return;
            }
            const version = await setPhotoVersion(Date.now());
            const cacheBusted = `${serverUrl}${serverUrl.includes("?") ? "&" : "?"}pv=${version}`;
            setPhotos((prev) => {
              const next = [...prev];
              next[currentPhotoIndex] = cacheBusted;
              return next;
            });
            setForm((prev) => ({ ...prev, [currentSlot]: cacheBusted }));
            Alert.alert("Success", "Photo uploaded successfully.");
          } catch (e) {
            const msg = e?.response?.data?.message ?? e?.response?.data ?? e?.message ?? "";
            const isNetwork = !e?.response && (msg === "Network Error" || e?.code === "ERR_NETWORK");
            Alert.alert(
              "Upload failed",
              isNetwork ? "Check your internet connection and try again." : (typeof msg === "string" ? msg : "Please try again.")
            );
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

  const handleDeletePhoto = async () => {
    if (currentPhotoIndex === 0 || !currentPhoto) return;
    const { userId } = getSession();
    if (!userId) return;
    setDeleting(true);
    try {
      await deleteProfilePhotoSlotApi(userId, currentSlot);
      setPhotos((prev) => {
        const next = [...prev];
        next[currentPhotoIndex] = null;
        return next;
      });
      setForm((prev) => ({ ...prev, [currentSlot]: null }));
      Alert.alert("Deleted", "Photo removed.");
    } catch (e) {
      Alert.alert("Delete failed", e?.response?.data?.message || "Please try again.");
    } finally {
      setDeleting(false);
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
      const payload = { ...form, id: userId };
      if (payload.age) payload.age = parseInt(payload.age, 10) || 0;
      if (typeof payload.hobbies === "string" && payload.hobbies.trim()) payload.hobbies = payload.hobbies.trim();
      if (typeof payload.partnerHobbies === "string" && payload.partnerHobbies.trim()) payload.partnerHobbies = payload.partnerHobbies.trim();
      if (payload.isChildrenLivingWithYou === "true") payload.isChildrenLivingWithYou = true;
      else if (payload.isChildrenLivingWithYou === "false") payload.isChildrenLivingWithYou = false;

      try {
        await updateProfileAdminApi(userId, payload);
      } catch (adminErr) {
        if (adminErr?.response?.status === 404 || adminErr?.response?.status === 501) {
          const fallback = [
            "firstName", "lastName", "age", "maritalStatus", "height", "highestEducation",
            "occupation", "sector", "city", "country", "mobileNumber", "religion", "subCaste",
            "motherTongue", "weight", "bodyType", "complexion", "habbits", "vegiterian",
            "fatherName", "motherName", "numberOfBrothers", "numberOfSisters", "familyStatus", "familyType",
            "district", "state", "residenceStatus", "rashi", "nakshatra", "dosham", "ascendant",
            "basicPlanetaryPosition", "gothram", "spiritualPath", "partnerAgeRange", "partnerReligion",
            "partnerEducation", "partnerWork", "aboutYourself", "sports", "collegeName", "experience",
            "companyName", "annualIncome", "workLocation",
          ].reduce((acc, k) => {
            if (form[k] !== undefined && form[k] !== null && form[k] !== "") acc[k] = form[k];
            return acc;
          }, {});
          await updateProfileApi(userId, fallback);
        } else throw adminErr;
      }
      Alert.alert("Saved", "Profile updated successfully.", [
        { text: "OK", onPress: () => navigation.replace("Dashboard") },
      ]);
    } catch (e) {
      const msg = e?.response?.data?.message ?? e?.response?.data ?? e?.message ?? "";
      const isNetwork = !e?.response && (msg === "Network Error" || e?.code === "ERR_NETWORK");
      Alert.alert(
        "Update failed",
        isNetwork ? "Check your internet connection and try again." : (typeof msg === "string" ? msg : "Please try again.")
      );
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
          <View style={styles.heroHeader}>
            <View style={styles.heroTopRow}>
              <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Go back">
                <Text style={styles.backBtnText}>‹</Text>
              </TouchableOpacity>
              <View style={styles.heroTitleWrap}>
                <Text style={styles.heroSubTitle}>SHAADI PROFILE</Text>
                <Text style={styles.heroTitle}>Edit Profile</Text>
              </View>
              <TouchableOpacity style={[styles.topSaveBtn, saving && { opacity: 0.7 }]} onPress={onSave} disabled={saving}>
                <Text style={styles.topSaveBtnText}>{saving ? "Saving..." : "Save"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.photoHeroSection}>
              <View style={styles.photoCarouselWrap}>
                <TouchableOpacity style={styles.carouselArrow} onPress={goPrevPhoto} accessibilityLabel="Previous photo">
                  <Text style={styles.carouselArrowText}>‹</Text>
                </TouchableOpacity>
                {currentPhoto ? (
                  <Image
                    key={`photo-${currentPhotoIndex}-${getAbsolutePhotoUrl(currentPhoto) || ""}`}
                    source={{
                      uri: getAbsolutePhotoUrl(currentPhoto),
                      ...(Platform.OS === "android" ? { cache: "reload" } : {}),
                    }}
                    style={styles.photoCircle}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={[styles.photoCircle, styles.photoPlaceholder]}>
                    <Text style={{ fontSize: 30, color: "#d5afb2", fontWeight: "700" }}>
                      {(form.firstName?.[0] || "P")}{(form.lastName?.[0] || "")}
                    </Text>
                  </View>
                )}
                <TouchableOpacity style={[styles.carouselArrow, styles.carouselArrowRight]} onPress={goNextPhoto} accessibilityLabel="Next photo">
                  <Text style={styles.carouselArrowText}>›</Text>
                </TouchableOpacity>
                {currentPhotoIndex !== 0 && currentPhoto && (
                  <TouchableOpacity style={styles.deletePhotoBtn} onPress={handleDeletePhoto} disabled={deleting}>
                    <Text style={styles.deletePhotoBtnText}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              <View style={styles.heroDotsRow}>
                {Array.from({ length: MAX_PHOTOS }).map((_, i) => (
                  <TouchableOpacity
                    key={i}
                    onPress={() => setCurrentPhotoIndex(i)}
                    style={[styles.heroDot, currentPhotoIndex === i && styles.heroDotActive]}
                  />
                ))}
              </View>

              <Text style={styles.photoName} numberOfLines={1}>
                {form.fullName || [form.firstName, form.lastName].filter(Boolean).join(" ").trim() || "Profile"}
              </Text>
              <View style={styles.badgesRow}>
                <Text style={styles.badge}>• Active</Text>
                <Text style={styles.badge}>✓ Verified</Text>
                <Text style={styles.badge}>🌟 Premium</Text>
              </View>

              <TouchableOpacity
                style={[styles.updateOverlay, uploading && { opacity: 0.7 }]}
                onPress={pickAndUploadPhoto}
                disabled={uploading}
              >
                <Text style={styles.updateOverlayText}>📷 Update</Text>
              </TouchableOpacity>
              {uploadProgress > 0 && uploadProgress < 100 && (
                <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
              )}
            </View>
          </View>

          <View style={styles.completionCard}>
            <View style={styles.completionHeader}>
              <Text style={styles.completionLabel}>Profile Completeness</Text>
              <Text style={styles.completionValue}>{completionPercent}%</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${completionPercent}%` }]} />
            </View>
          </View>

          <View style={styles.tabsWrapper}>
            <View style={styles.tabsCard}>
              {TAB_ITEMS.map((tab) => {
                const isActive = activeTab === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                    onPress={() => setActiveTab(tab)}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.tabText, isActive && styles.tabTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          <View style={styles.twoColumnRow}>
            <View style={styles.rightColumn}>
          {visibleSections.map((sec) => (
            <View key={sec.title} style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleRed}>{sec.title}</Text>
              </View>
              <View style={styles.fieldsGridHorizontal}>
                {sec.fields.map((f) => (
                  <View key={f.key} style={[styles.field, (f.multiline || f.type === "select") ? styles.fieldFullWidth : styles.fieldHalf]}>
                    <Text style={styles.label}>{f.label}</Text>
                    {f.readOnly ? (
                      <View style={styles.readOnlyBox}>
                        <Text style={styles.readOnlyText}>
                          {form[f.key]?.toString?.() || "—"}
                        </Text>
                      </View>
                    ) : f.type === "select" ? (
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
                        style={[styles.input, f.multiline && styles.inputMultiline]}
                        value={form[f.key]?.toString?.() || ""}
                        onChangeText={(v) => onChange(f.key, v)}
                        placeholder={f.label}
                        keyboardType={f.keyboardType || "default"}
                        returnKeyType="next"
                        multiline={f.multiline}
                        numberOfLines={f.multiline ? 4 : 1}
                      />
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
          {activeTab === "Lifestyle" && (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleRed}>Hobbies</Text>
              </View>
              <View style={[styles.field, styles.fieldFullWidth]}>
                <Text style={styles.label}>Your Hobbies (comma-separated)</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={typeof form.hobbies === "string" ? form.hobbies : (Array.isArray(form.hobbies) ? form.hobbies.join(", ") : "")}
                  onChangeText={(v) => onChange("hobbies", v)}
                  placeholder="e.g. Reading, Music, Travel"
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>
          )}
          {activeTab === "Lifestyle" && (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleRed}>Partner Hobbies</Text>
              </View>
              <View style={[styles.field, styles.fieldFullWidth]}>
                <Text style={styles.label}>Partner Hobbies (comma-separated)</Text>
                <TextInput
                  style={[styles.input, styles.inputMultiline]}
                  value={typeof form.partnerHobbies === "string" ? form.partnerHobbies : (Array.isArray(form.partnerHobbies) ? form.partnerHobbies.join(", ") : "")}
                  onChangeText={(v) => onChange("partnerHobbies", v)}
                  placeholder="e.g. Reading, Sports"
                  multiline
                  numberOfLines={2}
                />
              </View>
            </View>
          )}
          {activeTab === "Photos" && (
            <View style={styles.card}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitleRed}>Profile Photos</Text>
              </View>
              <Text style={styles.photosHelpText}>Use the photo section above to view, upload, switch, and delete profile photos.</Text>
            </View>
          )}
          </View>
          </View>

          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.discardBtn} onPress={() => navigation.goBack()}>
              <Text style={styles.discardText}>Discard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.saveBtn, saving && { opacity: 0.7 }]} onPress={onSave} disabled={saving}>
              <Text style={styles.saveText}>{saving ? "Saving..." : "Save Changes"}</Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fdf8f4" },
  content: { paddingBottom: 50 },
  heroHeader: {
    backgroundColor: "#2a1416",
    paddingTop: 18,
    paddingHorizontal: 16,
    paddingBottom: 26,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.10)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  backBtnText: { color: "#fff", fontSize: 22, lineHeight: 24, fontWeight: "600" },
  heroTitleWrap: { alignItems: "center", flex: 1 },
  heroSubTitle: { color: "#d9a9ac", fontSize: 10, letterSpacing: 1.8, fontWeight: "500" },
  heroTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginTop: 2 },
  topSaveBtn: {
    backgroundColor: "#c0515a",
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: 999,
  },
  topSaveBtnText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  photoHeroSection: { alignItems: "center", gap: 10, paddingBottom: 4 },
  card: {
    backgroundColor: "#fffcfa",
    borderRadius: 14,
    padding: 14,
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e8ddd5",
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#1b5e20",
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#e8f5e9",
  },
  twoColumnRow: {
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
  },
  leftColumn: {
    width: "100%",
    gap: 12,
  },
  rightColumn: {
    width: "100%",
    gap: 12,
  },
  photoCircle: {
    width: 118,
    height: 118,
    borderRadius: 59,
    backgroundColor: "#4f2225",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.2)",
  },
  updateOverlay: {
    marginTop: 6,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
  },
  updateOverlayText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  sectionHeader: {
    marginBottom: 12,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: "#eadfd9",
  },
  sectionTitleRed: {
    fontSize: 14,
    fontWeight: "700",
    color: "#7a5252",
  },
  fieldsGridHorizontal: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
  },
  field: { gap: 6 },
  fieldHalf: { width: "48%", minWidth: 145 },
  fieldFullWidth: { width: "100%" },
  label: { fontSize: 12, color: "#7a6060", fontWeight: "600" },
  readOnlyBox: {
    backgroundColor: "#f7f1ec",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eadfd9",
    paddingHorizontal: 10,
    paddingVertical: 11,
  },
  readOnlyText: { fontSize: 14, color: "#7a6060" },
  input: {
    backgroundColor: "#fff",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#eadfd9",
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    color: "#1a0f0f",
  },
  inputMultiline: { minHeight: 70, textAlignVertical: "top" },
  bottomActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    paddingHorizontal: 16,
    marginTop: 16,
  },
  discardBtn: {
    paddingHorizontal: 22,
    paddingVertical: 15,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ddd5",
    backgroundColor: "#fff",
  },
  discardText: { color: "#7a6060", fontSize: 16, fontWeight: "600" },
  saveBtn: {
    flex: 1,
    backgroundColor: "#c0515a",
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    shadowColor: "#c0515a",
    shadowOpacity: 0.24,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  saveText: { color: "#fff", fontWeight: "800", fontSize: 18, letterSpacing: 0.2 },
  photoCarouselWrap: {
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  photoPlaceholder: { alignItems: "center", justifyContent: "center" },
  carouselArrow: {
    position: "absolute",
    left: -20,
    top: "50%",
    marginTop: -19,
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  carouselArrowRight: { left: undefined, right: -20 },
  carouselArrowText: { color: "#fff", fontSize: 22, fontWeight: "700" },
  deletePhotoBtn: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  deletePhotoBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
  progressText: { marginTop: 4, color: "#efd7d9", fontSize: 12 },
  photoName: { fontSize: 20, fontWeight: "800", color: "#fff", marginTop: 2 },
  badgesRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2, flexWrap: "wrap", justifyContent: "center" },
  badge: {
    color: "rgba(255,255,255,0.82)",
    fontSize: 11,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.16)",
    backgroundColor: "rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  heroDotsRow: { flexDirection: "row", gap: 7, marginTop: 8 },
  heroDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: "rgba(255,255,255,0.25)" },
  heroDotActive: { width: 22, backgroundColor: "#dcaab0" },
  completionCard: {
    marginHorizontal: 16,
    marginTop: -12,
    backgroundColor: "#fff",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e8ddd5",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  completionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 7 },
  completionLabel: { color: "#7a6060", fontSize: 12, fontWeight: "600" },
  completionValue: { color: "#c0515a", fontSize: 26, fontWeight: "800" },
  progressTrack: {
    height: 7,
    borderRadius: 999,
    backgroundColor: "#f9eaeb",
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 999,
    backgroundColor: "#c0515a",
  },
  tabsWrapper: { paddingHorizontal: 16, marginTop: 12 },
  tabsCard: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#e8ddd5",
    padding: 4,
    gap: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 9,
    borderRadius: 11,
  },
  tabBtnActive: { backgroundColor: "#2a1416" },
  tabText: {
    color: "#7a6060",
    fontWeight: "600",
    fontSize: 13,
  },
  tabTextActive: { color: "#fff" },
  photosHelpText: { color: "#7a6060", fontSize: 13, lineHeight: 20 },
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
  optionChipActive: { backgroundColor: "#c0515a", borderColor: "#c0515a" },
  optionText: { color: "#0f172a", fontWeight: "600", fontSize: 13 },
  optionTextActive: { color: "#fff" },
});

export default EditProfile;

