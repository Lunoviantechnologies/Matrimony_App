import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
  TextInput,
  Alert,
} from "react-native";
import Clipboard from "@react-native-clipboard/clipboard";
import { fetchReferralSummaryApi } from "../api/api";

const ReferAndEarnScreen = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [copyCodeDone, setCopyCodeDone] = useState(false);
  const [copyLinkDone, setCopyLinkDone] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchReferralSummaryApi();
        setSummary(res.data);
      } catch (e) {
        setError("Unable to load refer & earn details.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const copyToClipboard = (text, setDone) => {
    if (!text) return;
    Clipboard.setString(text);
    setDone(true);
    setTimeout(() => setDone(false), 1500);
  };

  const handleCopyCode = () => {
    if (summary?.referralCode) {
      copyToClipboard(summary.referralCode, setCopyCodeDone);
    }
  };

  const handleCopyLink = () => {
    if (summary?.referralLink) {
      copyToClipboard(summary.referralLink, setCopyLinkDone);
    }
  };

  const handleShare = async () => {
    if (!summary) return;
    const msg = `Join Vivah Jeevan! Use my referral code ${summary.referralCode}.\n${summary.referralLink || ""}`;
    try {
      await Share.share({ message: msg, title: "Vivah Jeevan – Refer & Earn" });
    } catch (e) {
      if (e?.message?.includes("cancel") || e?.message?.includes("dismiss")) return;
      copyToClipboard(summary.referralLink || summary.referralCode, () => {});
      Alert.alert("Copied", "Referral link copied to clipboard. Share it with friends.");
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading Refer & Earn...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !summary) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.errorText}>{error || "No referral data available."}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const completed = summary.completedReferrals ?? 0;
  const totalNeeded = summary.totalReferralsNeeded ?? 2;

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.title}>Refer & Earn</Text>
        <Text style={styles.subtitle}>
          Invite {totalNeeded} friends and get a flat ₹100 reward. Share your unique code or link below.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Your referral code</Text>
          <View style={styles.rowWithCopy}>
            <TextInput
              style={styles.readOnlyInput}
              value={summary.referralCode || "—"}
              editable={false}
              selectTextOnFocus={false}
            />
            <TouchableOpacity
              style={[styles.copyBtn, copyCodeDone && styles.copyBtnDone]}
              onPress={handleCopyCode}
            >
              <Text style={styles.copyBtnText}>{copyCodeDone ? "Copied" : "COPY"}</Text>
            </TouchableOpacity>
          </View>

          {summary.referralLink ? (
            <>
              <Text style={[styles.label, styles.labelTop]}>Referral link</Text>
              <View style={styles.rowWithCopy}>
                <TextInput
                  style={[styles.readOnlyInput, styles.linkInput]}
                  value={summary.referralLink}
                  editable={false}
                  selectTextOnFocus={false}
                  numberOfLines={1}
                />
                <TouchableOpacity
                  style={[styles.copyBtn, copyLinkDone && styles.copyBtnDone]}
                  onPress={handleCopyLink}
                >
                  <Text style={styles.copyBtnText}>{copyLinkDone ? "Copied" : "COPY"}</Text>
                </TouchableOpacity>
              </View>
            </>
          ) : null}

          <TouchableOpacity style={styles.shareBtn} onPress={handleShare}>
            <Text style={styles.shareBtnText}>Share with friends</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your progress</Text>
          <Text style={styles.progressText}>
            {completed}/{totalNeeded} referrals completed
          </Text>
          <Text style={styles.progressText}>
            Reward balance: <Text style={styles.rewardBold}>₹{summary.rewardBalance ?? 0}</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4" },
  content: { padding: 20, paddingBottom: 40 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  loadingText: { color: "#1f2933", fontWeight: "600" },
  errorText: { color: "#b91c1c", fontWeight: "600", textAlign: "center" },
  title: { fontSize: 24, fontWeight: "800", color: "#111827", marginBottom: 8 },
  subtitle: { fontSize: 14, color: "#4b5563", marginBottom: 20, lineHeight: 20 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: { fontSize: 13, color: "#4a5568", marginBottom: 8, fontWeight: "600" },
  labelTop: { marginTop: 16 },
  rowWithCopy: { flexDirection: "row", alignItems: "center", gap: 10 },
  readOnlyInput: {
    flex: 1,
    backgroundColor: "#f7fafc",
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: "#1f2937",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  linkInput: { fontSize: 13 },
  copyBtn: {
    backgroundColor: "#2563eb",
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 10,
    minWidth: 80,
    alignItems: "center",
  },
  copyBtnDone: { backgroundColor: "#059669" },
  copyBtnText: { color: "#fff", fontWeight: "800", fontSize: 13 },
  shareBtn: {
    marginTop: 20,
    backgroundColor: "#fff",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#2563eb",
  },
  shareBtnText: { color: "#2563eb", fontWeight: "700", fontSize: 15 },
  progressCard: {
    backgroundColor: "#fefce8",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#facc15",
  },
  progressTitle: { fontSize: 14, fontWeight: "800", color: "#854d0e", marginBottom: 6 },
  progressText: { fontSize: 13, color: "#92400e", marginBottom: 2 },
  rewardBold: { fontWeight: "800" },
});

export default ReferAndEarnScreen;
