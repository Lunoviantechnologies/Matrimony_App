import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Share,
} from "react-native";
import { fetchReferralSummaryApi } from "../api/api";

const ReferAndEarnScreen = () => {
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

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

  const handleShare = async () => {
    if (!summary) return;
    const msg = `Join Vivah Jeevan! Use my referral code ${summary.referralCode}.\n${summary.referralLink || ""}`;
    try {
      await Share.share({ message: msg });
    } catch {
      // ignore
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading Refer &amp; Earn...</Text>
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
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.title}>Refer &amp; Earn</Text>
        <Text style={styles.subtitle}>
          Invite 2 friends to Vivah Jeevan and get a flat <Text style={{ fontWeight: "800" }}>₹100</Text> reward.
        </Text>

        <View style={styles.card}>
          <Text style={styles.label}>Your referral code</Text>
          <View style={styles.codeRow}>
            <Text style={styles.codeText}>{summary.referralCode || "—"}</Text>
          </View>
          {summary.referralLink ? (
            <>
              <Text style={[styles.label, { marginTop: 12 }]}>Referral link</Text>
              <Text style={styles.linkText}>{summary.referralLink}</Text>
            </>
          ) : null}

          <TouchableOpacity style={styles.primaryBtn} onPress={handleShare}>
            <Text style={styles.primaryBtnText}>Share with friends</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.progressCard}>
          <Text style={styles.progressTitle}>Your progress</Text>
          <Text style={styles.progressText}>
            {completed}/{totalNeeded} referrals completed
          </Text>
          <Text style={styles.progressText}>
            Reward balance: <Text style={{ fontWeight: "800" }}>₹{summary.rewardBalance ?? 0}</Text>
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f7fb" },
  content: { padding: 16 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  loadingText: { color: "#1f2933", fontWeight: "600" },
  errorText: { color: "#b91c1c", fontWeight: "600", textAlign: "center" },
  title: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 6 },
  subtitle: { fontSize: 13, color: "#4b5563", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  label: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  codeRow: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    backgroundColor: "#f3f4ff",
    alignItems: "center",
  },
  codeText: { fontSize: 20, fontWeight: "800", letterSpacing: 2, color: "#1f2937" },
  linkText: { fontSize: 12, color: "#1d4ed8" },
  primaryBtn: {
    marginTop: 16,
    backgroundColor: "#f973b5",
    borderRadius: 999,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
  progressCard: {
    marginTop: 16,
    backgroundColor: "#fef3c7",
    borderRadius: 14,
    padding: 14,
  },
  progressTitle: { fontSize: 14, fontWeight: "800", color: "#92400e", marginBottom: 4 },
  progressText: { fontSize: 13, color: "#92400e" },
});

export default ReferAndEarnScreen;

