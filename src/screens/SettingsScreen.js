import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet, Switch, ActivityIndicator, ScrollView } from "react-native";
import { fetchLatestPaymentApi, fetchPaymentHistoryApi } from "../api/api";
import { getSession } from "../api/authSession";

const SettingsScreen = () => {
  const [notifications, setNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [loadingPayment, setLoadingPayment] = useState(true);
  const [payment, setPayment] = useState(null);
  const [paymentError, setPaymentError] = useState("");
  const [history, setHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState("");

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
  }, []);

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.card}>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Notifications</Text>
            <Switch value={notifications} onValueChange={setNotifications} />
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dark Mode</Text>
            <Switch value={darkMode} onValueChange={setDarkMode} />
          </View>
          <Text style={styles.note}>These toggles are local only. Hook to backend when ready.</Text>

          <View style={styles.divider} />
          <Text style={styles.sectionTitle}>Premium Status</Text>
          {loadingPayment ? (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color="#6c3cff" />
              <Text style={styles.statusText}>Checking status...</Text>
            </View>
          ) : payment ? (
            <View style={styles.statusCard}>
              <Text style={styles.statusActive}>Active</Text>
              <Text style={styles.statusDetail}>Plan: {payment.planCode || "—"}</Text>
              <Text style={styles.statusDetail}>Amount: ₹{payment.amount ?? "—"}</Text>
              {payment.premiumEnd && (
                <Text style={styles.statusDetail}>Expires: {payment.premiumEnd?.split?.("T")?.[0] || payment.premiumEnd}</Text>
              )}
            </View>
          ) : (
            <View style={styles.statusCard}>
              <Text style={styles.statusInactive}>No active premium</Text>
              <Text style={styles.statusDetail}>{paymentError}</Text>
            </View>
          )}
        </View>

        <View style={styles.card}>
          <Text style={styles.title}>Payment History</Text>
          {loadingHistory ? (
            <View style={styles.statusRow}>
              <ActivityIndicator size="small" color="#6c3cff" />
              <Text style={styles.statusText}>Loading history...</Text>
            </View>
          ) : history.length ? (
            history.map((h) => (
              <View key={`${h.id}-${h.razorpayOrderId || h.createdAt}`} style={styles.historyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.historyPlan}>{h.planCode || "Plan"}</Text>
                  <Text style={styles.historyMeta}>
                    ₹{h.amount ?? "—"} • {h.status || "—"}
                  </Text>
                  {h.createdAt && <Text style={styles.historyDate}>{h.createdAt?.split?.("T")?.[0] || h.createdAt}</Text>}
                </View>
                <View style={[styles.statusPill, pillStyleForStatus(h.status)]}>
                  <Text style={styles.statusPillText}>{(h.status || "").toUpperCase()}</Text>
                </View>
              </View>
            ))
          ) : (
            <Text style={styles.historyEmpty}>{historyError || "No payments yet."}</Text>
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
  title: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  label: { fontSize: 15, color: "#0f172a", fontWeight: "600" },
  note: { fontSize: 12, color: "#94a3b8", marginTop: 8 },
  divider: { height: 1, backgroundColor: "#e5e7eb", marginVertical: 10 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#0f172a", marginBottom: 6 },
  statusRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  statusText: { color: "#0f172a", fontWeight: "600" },
  statusCard: {
    backgroundColor: "#f8f5ff",
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#ebe5ff",
    gap: 4,
  },
  statusActive: { color: "#16a34a", fontWeight: "800" },
  statusInactive: { color: "#ef4444", fontWeight: "800" },
  statusDetail: { color: "#0f172a", fontSize: 13, fontWeight: "600" },
  historyRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  historyPlan: { color: "#0f172a", fontWeight: "700", fontSize: 14 },
  historyMeta: { color: "#475569", fontWeight: "600", marginTop: 2 },
  historyDate: { color: "#94a3b8", fontSize: 12, marginTop: 2 },
  historyEmpty: { color: "#94a3b8", fontWeight: "600", marginTop: 4 },
  statusPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
  },
  statusPillText: { fontWeight: "800", color: "#0f172a", fontSize: 12 },
});

export default SettingsScreen;

