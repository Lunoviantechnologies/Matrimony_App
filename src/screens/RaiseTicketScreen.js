import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { launchImageLibrary } from "react-native-image-picker";
import { createTicketApi, createTicketFormDataApi } from "../api/api";
import { getSession } from "../api/authSession";

const CATEGORIES = [
  "Profile Request Issue",
  "Premium Membership",
  "Login / Account Recovery",
  "Report Fake / Fraud Profile",
  "Payment Issue",
  "Profile Privacy & Safety",
  "Matchmaking Assistance",
  "Technical",
  "Other Queries",
];

const CATEGORY_MAP = {
  "Profile Request Issue": "Profile_Request_Issue",
  "Premium Membership": "Premium_Membership",
  "Login / Account Recovery": "Login_Account_Recovery",
  "Report Fake / Fraud Profile": "Report_Fraud_Profile",
  "Payment Issue": "Payment_Issue",
  "Profile Privacy & Safety": "Profile_Privacy_Safety",
  "Matchmaking Assistance": "Matchmaking_Assistance",
  Technical: "TECHNICAL",
  "Other Queries": "OTHER",
};

const RaiseTicketScreen = () => {
  const session = getSession();
  const [form, setForm] = useState({
    category: "",
    name: "",
    email: session?.email || "",
    phone: "",
    message: "",
    memberId: session?.userId ?? "",
  });
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);

  const handleChange = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handlePickAttachments = () => {
    if (form.category !== "Payment Issue") {
      Alert.alert("Payment proof", "Payment proof is only needed for Payment Issue tickets.");
      return;   
    }
    launchImageLibrary(
      {
        mediaType: "photo",
        selectionLimit: 3,
      },
      (response) => {
        if (response.didCancel) return;
        if (response.errorCode) {
          if (__DEV__) console.log("image picker error:", response.errorMessage);
          Alert.alert("Error", "Could not open gallery. Please try again.");
          return;
        }
        if (response.assets && response.assets.length > 0) {
          setAttachments(response.assets);
        }
      }
    );
  };

  const handleSubmit = async () => {
    if (!form.category || !form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.message.trim()) {
      Alert.alert("Missing fields", "Please fill all required fields.");
      return;
    }
    setLoading(true);
    try {
      if (form.category === "Payment Issue") {
        const formData = new FormData();
        formData.append("issueCategory", "Payment_Issue");
        formData.append("name", form.name.trim());
        formData.append("email", form.email.trim());
        formData.append("phoneNumber", form.phone.trim());
        formData.append("description", form.message.trim());
        formData.append("memberId", String(form.memberId || ""));

        (attachments || []).forEach((asset, index) => {
          if (!asset?.uri) return;
          formData.append("attachments", {
            uri: asset.uri,
            name: asset.fileName || `proof-${index + 1}.jpg`,
            type: asset.type || "image/jpeg",
          });
        });

        await createTicketFormDataApi(formData);
      } else {
        await createTicketApi({
          issueCategory: CATEGORY_MAP[form.category] || "OTHER",
          name: form.name.trim(),
          email: form.email.trim(),
          phoneNumber: form.phone.trim(),
          description: form.message.trim(),
          memberId: form.memberId || undefined,
        });
      }
      Alert.alert("Success", "Ticket raised successfully. We will get back to you soon.");
      setForm((prev) => ({
        ...prev,
        category: "",
        name: "",
        phone: "",
        message: "",
      }));
      setAttachments([]);
    } catch (err) {
      if (__DEV__) console.log("Raise ticket error:", err?.response?.data || err.message);
      Alert.alert("Failed", err?.response?.data?.message || "Could not submit ticket. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={80}
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.title}>Raise Support Ticket</Text>
          <Text style={styles.subtitle}>
            Our team is here to help you find love without worries.
          </Text>

          <View style={styles.card}>
            <Text style={styles.label}>Issue Category *</Text>
            <View style={styles.pickerWrap}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[styles.chip, form.category === cat && styles.chipActive]}
                  onPress={() => handleChange("category", cat)}
                >
                  <Text style={[styles.chipText, form.category === cat && styles.chipTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Your Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="Full name"
              value={form.name}
              onChangeText={(v) => handleChange("name", v)}
            />
            <Text style={styles.label}>Registered Email *</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              placeholder="Email"
              value={form.email}
              editable={false}
            />
            <Text style={styles.label}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={form.phone}
              onChangeText={(v) => handleChange("phone", v)}
              keyboardType="phone-pad"
            />
            <Text style={styles.label}>VivahJeevan Member ID</Text>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={String(form.memberId || "")}
              editable={false}
            />
            <Text style={styles.label}>Describe the Issue *</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Describe your issue in detail..."
              value={form.message}
              onChangeText={(v) => handleChange("message", v)}
              multiline
              numberOfLines={4}
            />
            {form.category === "Payment Issue" && (
              <>
                <Text style={styles.label}>Upload Payment Proof (Screenshots / Photos)</Text>
                <View style={styles.uploadBox}>
                  <TouchableOpacity style={styles.uploadBtn} onPress={handlePickAttachments}>
                    <Text style={styles.uploadBtnText}>Choose Files</Text>
                  </TouchableOpacity>
                  <Text style={styles.uploadFileText}>
                    {attachments.length === 0
                      ? "No file chosen"
                      : attachments.length === 1
                      ? attachments[0]?.fileName || "1 file selected"
                      : `${attachments.length} files selected`}
                  </Text>
                </View>
                <Text style={styles.hint}>
                  Enabled only when <Text style={{ fontWeight: "700" }}>Payment Issue</Text> is
                  selected.
                </Text>
              </>
            )}
            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={loading}
            >
              <Text style={styles.btnText}>{loading ? "Submitting..." : "Submit Ticket"}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4" },
  scroll: { padding: 20, paddingBottom: 40 },
  title: { fontSize: 22, fontWeight: "800", color: "#1f2937", textAlign: "center", marginBottom: 4 },
  subtitle: { fontSize: 14, color: "#6b7280", textAlign: "center", marginBottom: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 4,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6, marginTop: 12 },
  pickerWrap: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 4 },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  chipActive: { backgroundColor: "#ede9fe", borderColor: "#6c3cff" },
  chipText: { fontSize: 12, color: "#4b5563" },
  chipTextActive: { color: "#6c3cff", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: "#fafafa",
  },
  inputDisabled: { backgroundColor: "#f3f4f6", color: "#6b7280" },
  textArea: { minHeight: 100, textAlignVertical: "top" },
  hint: { fontSize: 12, color: "#6b7280", marginTop: 8, fontStyle: "italic" },
  btn: {
    marginTop: 20,
    backgroundColor: "#022c22",
    borderRadius: 999,
    paddingVertical: 16,
    alignItems: "center",
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  uploadBox: {
    marginTop: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    backgroundColor: "#f9fafb",
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: "row",
    alignItems: "center",
  },
  uploadBtn: {
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    backgroundColor: "#2563eb",
    alignItems: "center",
  },
  uploadBtnText: { color: "#ffffff", fontWeight: "700", fontSize: 13 },
  uploadFileText: {
    marginLeft: 10,
    flex: 1,
    color: "#6b7280",
    fontSize: 13,
  },
});

export default RaiseTicketScreen;
