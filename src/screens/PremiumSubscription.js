import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, TouchableOpacity, StyleSheet, ScrollView, ActivityIndicator, Alert } from "react-native";
import { fetchPlansApi } from "../api/api";

const PremiumSubscription = ({ navigation }) => {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [now, setNow] = useState(new Date());
  const faqs = [
    {
      q: "What do I get with Premium?",
      a: "Unlimited chats, see who viewed you, and higher visibility to matches.",
    },
    {
      q: "What payment options are available?",
      a: "UPI, cards, net banking, and wallet payments supported by Razorpay.",
    },
    {
      q: "Is it safe?",
      a: "All transactions are encrypted and handled by trusted payment partners.",
    },
  ];

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetchPlansApi();
        const data = Array.isArray(res.data) ? res.data : [];
        console.log("plans api response length:", data);
        setPlans(
          data.map((p) => ({
            id: p.planCode || p.plan_code || p.id || p.name,
            name: p.planName || p.plan_name || p.name || "Premium Plan",
            priceRupees: p.priceRupees ?? p.price_rupees ?? null,
            durationMonths: p.durationMonths ?? p.duration_months ?? inferMonths(p.planCode || p.plan_code),
            discountType: p.discountType || p.discount_type || null,
            discountValue: p.discountValue ?? p.discount_value ?? null,
            festivalPrice: p.festivalPrice ?? p.festival_price_rupees ?? null,
            festivalStart: p.festivalStart ?? p.festival_start ?? null,
            festivalEnd: p.festivalEnd ?? p.festival_end ?? null,
            discountStart: p.discountStart ?? p.discount_start ?? null,
            discountEnd: p.discountEnd ?? p.discount_end ?? null,
            planCode: p.planCode || p.plan_code,
            badge: p.badge,
            features: p.features || [
              "Unlimited messages",
              "View more contacts",
              "Priority support",
            ],
          }))
        );
      } catch (e) {
        const msg = e?.response?.data || e?.message || "Failed to load plans";
        console.error("plans api error:", e?.response?.status, msg);
        setError(typeof msg === "string" ? msg : "Failed to load plans");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const inferMonths = (code) => {
    if (!code) return null;
    const match = code.match(/(\d+)[mM]/);
    return match ? parseInt(match[1], 10) : null;
  };

  const isFestivalActive = (plan) => {
    if (!plan.festivalStart || !plan.festivalEnd) return false;
    const start = new Date(plan.festivalStart);
    const end = new Date(plan.festivalEnd);
    return now >= start && now <= end;
  };

  const isDiscountActive = (plan) => {
    if (!plan.discountType || !plan.discountValue) return false;
    if (!plan.discountStart || !plan.discountEnd) return true;
    const start = new Date(plan.discountStart);
    const end = new Date(plan.discountEnd);
    return now >= start && now <= end;
  };

  const getCountdown = (plan) => {
    if (!plan.festivalEnd) return null;
    const end = new Date(plan.festivalEnd);
    const diff = end - now;
    if (diff <= 0) return null;
    const h = Math.floor(diff / (1000 * 60 * 60));
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${h}h ${m}m ${s}s`;
  };

  const formatPrice = (v) => {
    if (v === undefined || v === null || Number.isNaN(v)) return "₹—";
    return `₹${v}`;
  };

  const computePlanDisplay = (plan) => {
    const festivalActive = isFestivalActive(plan);
    const basePrice = festivalActive && plan.festivalPrice ? plan.festivalPrice : plan.priceRupees;
    const hasDiscount = isDiscountActive(plan);
    let discounted = basePrice;
    if (hasDiscount && plan.discountType && plan.discountValue && basePrice) {
      if (plan.discountType === "PERCENTAGE") {
        discounted = Math.max(0, Math.round(basePrice - (basePrice * plan.discountValue) / 100));
      } else if (plan.discountType === "FLAT") {
        discounted = Math.max(0, basePrice - plan.discountValue);
      }
    }
    const perMonth =
      plan.durationMonths && discounted
        ? `₹${(discounted / plan.durationMonths).toFixed(0)}/month`
        : "";
    return { festivalActive, basePrice, discounted, perMonth, countdown: getCountdown(plan) };
  };

  const onChoose = (plan) => {
    Alert.alert("Plan selected", `${plan.name || plan.planName} (${formatPrice(plan.priceRupees || plan.price)})`);
    navigation.goBack();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.loaderWrap}>
          <ActivityIndicator size="large" color="#1f1f39" />
          <Text style={styles.loaderText}>Loading plans...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Upgrade to Premium</Text>
          <Text style={styles.bannerSubtitle}>Get more visibility, unlimited chats, and priority support.</Text>
          <TouchableOpacity style={styles.bannerCta} onPress={() => plans[0] && onChoose(plans[0])}>
            <Text style={styles.bannerCtaText}>Pick a plan</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.title}>Plans for you</Text>
        <Text style={styles.subtitle}>{error || "Choose a plan that fits you best"}</Text>
        {error ? <Text style={styles.debugText}>Error: {error}</Text> : null}

        {plans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>{error || "No plans available right now. Please try again later."}</Text>
          </View>
        ) : (
          plans.map((p) => {
            const display = computePlanDisplay(p);
            const showStrike = display.basePrice && display.discounted && display.discounted !== display.basePrice;
            return (
              <View key={p.id || p.name} style={styles.card}>
                <View style={styles.cardHeader}>
                  <View>
                    <Text style={styles.planName}>{p.name}</Text>
                    {p.badge ? <Text style={styles.badge}>{p.badge}</Text> : null}
                  </View>
                  <View style={{ alignItems: "flex-end" }}>
                    {showStrike ? <Text style={styles.planPriceStrike}>{formatPrice(display.basePrice)}</Text> : null}
                    <Text style={styles.planPrice}>{formatPrice(display.discounted || display.basePrice)}</Text>
                    {display.perMonth ? <Text style={styles.perMonth}>{display.perMonth}</Text> : null}
                  </View>
                </View>
                <View style={styles.rowBetween}>
                  {p.discount ? <Text style={styles.discount}>{p.discount}</Text> : <View />}
                  {p.duration ? <Text style={styles.planDuration}>{p.duration}</Text> : null}
                </View>
                {display.countdown ? <Text style={styles.countdown}>⏱ Ends in {display.countdown}</Text> : null}
                {p.features && p.features.length > 0 ? (
                  p.features.map((f) => (
                    <Text key={f} style={styles.feature}>
                      • {f}
                    </Text>
                  ))
                ) : (
                  <Text style={styles.feature}>• Premium support and visibility</Text>
                )}
                <TouchableOpacity style={styles.cta} onPress={() => onChoose(p)}>
                  <Text style={styles.ctaText}>Choose {p.name}</Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Why go Premium?</Text>
          <Text style={styles.sectionItem}>• Stand out to more matches</Text>
          <Text style={styles.sectionItem}>• Unlock messaging and contact views</Text>
          <Text style={styles.sectionItem}>• Priority support and faster responses</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FAQs</Text>
          {faqs.map((f) => (
            <View key={f.q} style={styles.faqCard}>
              <Text style={styles.faqQ}>{f.q}</Text>
              <Text style={styles.faqA}>{f.a}</Text>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Need help?</Text>
          <TouchableOpacity style={styles.helpBtn} onPress={() => Alert.alert("Support", "Contact support at support@saathjanam.com")}>
            <Text style={styles.helpBtnText}>Contact Support</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4" },
  content: { padding: 16, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: "800", color: "#1f1f39", marginBottom: 4 },
  subtitle: { fontSize: 12, color: "#4b4a5f", marginBottom: 16 },
  banner: {
    backgroundColor: "#1f1f39",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  bannerTitle: { color: "#fff", fontSize: 20, fontWeight: "800", marginBottom: 6 },
  bannerSubtitle: { color: "#f5f5ff", fontSize: 12, marginBottom: 10 },
  bannerCta: {
    backgroundColor: "#f7a93f",
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  bannerCtaText: { color: "#1f1f39", fontWeight: "800" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  planName: { fontSize: 16, fontWeight: "800", color: "#1f1f39" },
  planPrice: { fontSize: 18, fontWeight: "800", color: "#1f1f39" },
  planPriceStrike: { fontSize: 12, color: "#777", textDecorationLine: "line-through" },
  perMonth: { fontSize: 12, color: "#4b4a5f" },
  planDuration: { fontSize: 12, color: "#4b4a5f", marginBottom: 6 },
  feature: { fontSize: 12, color: "#4b4a5f", marginTop: 2 },
  cta: {
    marginTop: 12,
    backgroundColor: "#1f1f39",
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  ctaText: { color: "#fff", fontWeight: "800" },
  loaderWrap: { flex: 1, alignItems: "center", justifyContent: "center", padding: 20 },
  loaderText: { marginTop: 10, color: "#1f1f39", fontWeight: "700" },
  discount: { fontSize: 12, color: "#e91e63", fontWeight: "700", marginBottom: 4 },
  badge: {
    marginTop: 4,
    backgroundColor: "#f0e8ff",
    color: "#6c3cff",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    fontSize: 11,
    fontWeight: "800",
    alignSelf: "flex-start",
  },
  section: { marginTop: 16, marginBottom: 6 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1f1f39", marginBottom: 8 },
  sectionItem: { fontSize: 12, color: "#4b4a5f", marginTop: 2 },
  faqCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#eee",
  },
  faqQ: { fontSize: 13, fontWeight: "800", color: "#1f1f39", marginBottom: 4 },
  faqA: { fontSize: 12, color: "#4b4a5f" },
  helpBtn: {
    backgroundColor: "#1f1f39",
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  helpBtnText: { color: "#fff", fontWeight: "800" },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 4 },
  countdown: { fontSize: 12, color: "#e91e63", marginTop: 4, fontWeight: "700" },
  emptyCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#eee",
    marginBottom: 12,
  },
  emptyText: { color: "#4b4a5f", fontSize: 13 },
  debugText: { color: "#e91e63", fontSize: 12, marginTop: 4 },
});

export default PremiumSubscription;

