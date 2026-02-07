import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Switch, ActivityIndicator, ScrollView, TouchableOpacity } from "react-native";
import { fetchLatestPaymentApi, fetchPaymentHistoryApi, fetchReferralSummaryApi } from "../api/api";
import { getSession } from "../api/authSession";

const SettingsScreen = ({ navigation }) => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [payment, setPayment] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [refSummary, setRefSummary] = useState(null);
  const [loadingReferral, setLoadingReferral] = useState(true);

  useEffect(() => {
    const loadPayment = async () => {
      try {
        const session = getSession();
        if (!session?.userId) {
          setPaymentError("Login to see premium status.");
          return;
        }
        const res = await fetchLatestPaymentApi(session.userId);
        setPayment(res.data);
      } catch (e) {
        setPaymentError("No premium plan found.");
      } finally {
        setLoadingPayment(false);
      }
    };
    loadPayment();

    const loadHistory = async () => {
      try {
        const session = getSession();
        if (!session?.userId) {
          setHistoryError("Login to see payment history.");
          return;
        }
        const res = await fetchPaymentHistoryApi(session.userId);
        const list = Array.isArray(res.data) ? res.data : [];
        setHistory(list);
      } catch (e) {
        setHistoryError("No payment history found.");
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();

    const loadReferral = async () => {
      try {
        const res = await fetchReferralSummaryApi();
        setRefSummary(res.data);
      } catch (e) {
        // ignore
      } finally {
        setLoadingReferral(false);
      }
    };
    loadReferral();
  }, []);

  return (
    <SafeAreaView style={[styles.root, darkMode && styles.rootDark]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={[styles.card, darkMode && styles.cardDark]}>
          <Text style={[styles.title, darkMode && styles.titleDark]}>Settings</Text>
          <View style={styles.row}>
            <Text style={[styles.label, darkMode && styles.labelDark]}>Notifications</Text>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
          <View style={styles.row}>
            <Text style={[styles.label, darkMode && styles.labelDark]}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
          <Text style={[styles.note, darkMode && styles.noteDark]}>
            These toggles are local only. Hook to backend when ready.
          </Text>

          <View style={[styles.divider, darkMode && styles.dividerDark]} />
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Refer &amp; Earn</Text>
          {loadingReferral ? (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color={darkMode ? "#f973b5" : "#f973b5"} />
              <Text style={[styles.statusText, darkMode && styles.statusTextDark]}>Loading...</Text>
            </View>
          ) : refSummary ? (
            <View style={[styles.statusCard, darkMode && styles.statusCardDark]}>
              <Text style={styles.statusActive}>Invite friends &amp; earn ₹100</Text>
              <Text style={[styles.statusDetail, darkMode && styles.statusDetailDark]}>
                Progress: {refSummary.completedReferrals}/{refSummary.totalReferralsNeeded} referrals completed
              </Text>
              <Text style={[styles.statusDetail, darkMode && styles.statusDetailDark]}>
                Reward balance: ₹{refSummary.rewardBalance ?? 0}
              </Text>
              <TouchableOpacity
                style={[styles.primaryBtn]}
                onPress={() => navigation.navigate("ReferAndEarn")}
              >
                <Text style={styles.primaryBtnText}>View Refer &amp; Earn</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <Text style={[styles.statusDetail, darkMode && styles.statusDetailDark]}>
              Refer &amp; Earn details are not available.
            </Text>
          )}

          <View style={[styles.divider, darkMode && styles.dividerDark]} />
          <Text style={[styles.sectionTitle, darkMode && styles.sectionTitleDark]}>Premium Status</Text>
          {loadingPayment ? (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color={darkMode ? "#f9a8d4" : "#6c3cff"} />
              <Text style={[styles.statusText, darkMode && styles.statusTextDark]}>Checking status...</Text>
            </View>
          ) : payment ? (
            <View style={[styles.statusCard, darkMode && styles.statusCardDark]}>
              <Text style={styles.statusActive}>Active</Text>
              <Text style={[styles.statusDetail, darkMode && styles.statusDetailDark]}>
                Plan: {payment.planCode || "—"}
              </Text>
              <Text style={[styles.statusDetail, darkMode && styles.statusDetailDark]}>
                Amount: ₹{payment.amount ?? "—"}
              </Text>
              {payment.premiumEnd && (
                <Text style={[styles.statusDetail, darkMode && styles.statusDetailDark]}>
                  Expires: {payment.premiumEnd?.split?.("T")?.[0] || payment.premiumEnd}
                </Text>
              )}
            </View>
          ) : (
            <View style={[styles.statusCard, darkMode && styles.statusCardDark]}>
              <Text style={styles.statusInactive}>No active premium</Text>
              <Text style={[styles.statusDetail, darkMode && styles.statusDetailDark]}>{paymentError}</Text>
            </View>
          )}
        </View>

        <View style={[styles.card, darkMode && styles.cardDark]}>
          <Text style={[styles.title, darkMode && styles.titleDark]}>Payment History</Text>
          {loadingHistory ? (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color={darkMode ? "#f9a8d4" : "#6c3cff"} />
              <Text style={[styles.statusText, darkMode && styles.statusTextDark]}>Loading history...</Text>
            </View>
          ) : history.length ? (
            history.map((h) => (
              <View key={`${h.id}-${h.razorpayOrderId || h.createdAt}`} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.historyPlan, darkMode && styles.historyPlanDark]}>
                    {h.planCode || "Plan"}
                  </Text>
                  <Text style={[styles.historyMeta, darkMode && styles.historyMetaDark]}>
                    ₹{h.amount ?? "—"} • {h.status || "—"}
                  </Text>
                  {h.createdAt && (
                    <Text style={[styles.historyDate, darkMode && styles.historyDateDark]}>
                      {h.createdAt?.split?.("T")?.[0] || h.createdAt}
                    </Text>
                  )}
                </View>
                <View style={[styles.statusPill, pillStyleForStatus(h.status)]}>
                  <Text style={styles.statusPillText}>{(h.status || "").toUpperCase()}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={[styles.historyEmpty, darkMode && styles.historyEmptyDark]}>
              {historyError || "No payments yet."}
            </Text>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const pillStyleForStatus = (status) => {
  const s = (status || "").toUpperCase();
  if (s === "PAID") return { backgroundColor: "#e6f8ef", borderColor: "#bbf7d0" };
  if (s === "CREATED" || s === "PENDING") return { backgroundColor: "#fff7e6", borderColor: "#fde68a" };
  return { backgroundColor: "#fdecec", borderColor: "#fecdd3" };
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f7fb", padding: 16 },
  rootDark: { backgroundColor: "#020617" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
    gap: 12,
  },
  cardDark: {
    backgroundColor: "#02091d",
    borderColor: "#1f2937",
    shadowOpacity: 0.25,
  },
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  titleDark: { color: "#e5e7eb" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 15, color: "#0f172a", fontWeight: "600" },
  labelDark: { color: "#e5e7eb" },
  note: { fontSize: 12, color: "#94a3b8", marginTop: 8 },
  noteDark: { color: "#64748b" },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 10 },
  dividerDark: { backgroundColor: "#1e293b" },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  sectionTitleDark: { color: "#e5e7eb" },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusText: { color: "#0f172a", fontWeight: "600" },
  statusTextDark: { color: "#e5e7eb" },
  statusCard: {
    backgroundColor: "#f8f5ff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ebe5ff",
    gap: 4,
  },
  statusCardDark: {
    backgroundColor: "#02091d",
    borderColor: "#1f2937",
  },
  statusActive: { color: "#16a34a", fontWeight: "800" },
  statusInactive: { color: "#f97373", fontWeight: "800" },
  statusDetail: { color: "#0f172a", fontSize: 13, fontWeight: "600" },
  statusDetailDark: { color: "#e5e7eb" },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  historyPlan: { color: "#0f172a", fontWeight: "700", fontSize: 14 },
  historyPlanDark: { color: "#e5e7eb" },
  historyMeta: { color: "#475569", fontWeight: "600", marginTop: 2 },
  historyMetaDark: { color: "#cbd5f5" },
  historyDate: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  historyDateDark: { color: "#64748b" },
  historyEmpty: { color: "#94a3b8", fontWeight: "600", marginTop: 4 },
  historyEmptyDark: { color: "#6b7280" },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillText: { fontWeight: "800", color: "#0f172a", fontSize: 12 },
  primaryBtn: {
    marginTop: 10,
    backgroundColor: "#f973b5",
    borderRadius: 999,
    paddingVertical: 10,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "800" },
});

export default SettingsScreen;

