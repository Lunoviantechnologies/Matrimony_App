import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, SafeAreaView, Image, ImageBackground } from "react-native";
import { loginApi } from "../api/api";
import { setSession } from "../api/authSession";

const LoginScreen = ({ navigation }) => {
  const [emailId, setEmailId] = useState("");
  const [createPassword, setCreatePassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!emailId || !createPassword) {
      Alert.alert("Missing details", "Please enter email and password");
      return;
    }
    setLoading(true);
    try {
      const res = await loginApi({ emailId, createPassword });
      const payload = res?.data || {};
      setSession({ token: payload.token, userId: payload.id, email: payload.email });
      navigation.replace("Dashboard", { userId: payload.id });
    } catch (err) {
      console.log("LOGIN ERROR:", err?.response?.data || err.message);
      Alert.alert("Login failed", err?.response?.data || "Please try again");
    } finally {
      setLoading(false);
    }
  };

  const logoUri = require("../assets/vivahjeevan_logo.png");
  const wallUri = require("../assets/loginwall.jpg");

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={wallUri} style={styles.background} resizeMode="cover">
        <View style={styles.backdrop} />
      <View style={styles.centerWrapper}>
        <View style={styles.card}>
          <View style={styles.logoWrap}>
            <Image source={logoUri} style={styles.logo} resizeMode="contain" />
          </View>
          <Text style={styles.title}>Welcome to VivahJeevan</Text>
          <Text style={styles.subtitle}>Create your story. Find your forever.</Text>

          <View style={{ width: "100%", marginTop: 16 }}>
            <Text style={styles.label}>Email Address</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                autoCapitalize="none"
                keyboardType="email-address"
                value={emailId}
                onChangeText={setEmailId}
              />
            </View>

            <Text style={[styles.label, { marginTop: 12 }]}>Password</Text>
            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                value={createPassword}
                onChangeText={setCreatePassword}
              />
              <TouchableOpacity onPress={() => setShowPassword((p) => !p)}>
                <Text style={styles.eye}>{showPassword ? "🙈" : "👁️"}</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actionsRow}>
              <View style={styles.rememberRow}>
                <View style={styles.checkbox} />
                <Text style={styles.rememberText}>Remember me</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate("ForgotPassword")}>
                <Text style={styles.linkText}>Forgot password?</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.primaryBtn} onPress={handleLogin} disabled={loading}>
              <Text style={styles.primaryText}>{loading ? "Please wait..." : "Sign In"}</Text>
            </TouchableOpacity>

            <View style={styles.dividerRow}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>or continue with</Text>
              <View style={styles.divider} />
            </View>

            {/* <View style={styles.socialRow}>
              <TouchableOpacity style={styles.socialBtn}>
                <Text>🟦 Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.socialBtn}>
                <Text>🐙 GitHub</Text>
              </TouchableOpacity>
            </View> */}

            <View style={styles.footerRow}>
              <Text style={styles.footerText}>Don't have an account?</Text>
              <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                <Text style={[styles.linkText, { marginLeft: 6 }]}>Sign up</Text>
              </TouchableOpacity>
            </View>

          <View style={styles.legalRow}>
            <TouchableOpacity onPress={() => navigation.navigate("Terms")} style={styles.legalLink}>
              <Text style={styles.legalText}>Terms & Conditions</Text>
            </TouchableOpacity>
            <View style={styles.legalDot} />
            <TouchableOpacity onPress={() => navigation.navigate("PrivacyPolicy")} style={styles.legalLink}>
              <Text style={styles.legalText}>Privacy Policy</Text>
            </TouchableOpacity>
          </View>
          </View>
        </View>
      </View>
      </ImageBackground>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#D9F5E4" },
  background: { flex: 1 },
  backdrop: { ...StyleSheet.absoluteFillObject, backgroundColor: "rgba(217,245,228,0.25)" },
  centerWrapper: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  card: {
    width: "92%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  logoWrap: { marginBottom: 8 },
  logo: { width: 64, height: 64 },
  title: { fontSize: 20, fontWeight: "800", marginTop: 4, color: "#0f172a" },
  subtitle: { fontSize: 12, color: "#666", marginTop: 4, textAlign: "center" },
  label: { fontSize: 12, color: "#555", marginBottom: 6 },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fafafa",
  },
  input: { flex: 1, fontSize: 14, padding: 0 },
  eye: { fontSize: 16, marginLeft: 8 },
  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  rememberRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  rememberText: { fontSize: 12, color: "#555" },
  primaryBtn: {
    marginTop: 14,
    backgroundColor: "#6c3cff",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
  },
  primaryText: { color: "#fff", fontWeight: "700" },
  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 16,
    width: "100%",
  },
  divider: { flex: 1, height: 1, backgroundColor: "#eee" },
  dividerText: { marginHorizontal: 8, color: "#777", fontSize: 12 },
  socialRow: { flexDirection: "row", gap: 10, width: "100%" },
  socialBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: "center",
    backgroundColor: "#fafafa",
  },
  footerRow: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  footerText: { color: "#555", fontSize: 13 },
  linkText: { color: "#6c3cff", fontWeight: "700" },
  legalRow: {
    marginTop: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  legalLink: { paddingVertical: 4 },
  legalText: { color: "#6c3cff", fontWeight: "700", fontSize: 12 },
  legalDot: { width: 4, height: 4, borderRadius: 2, backgroundColor: "#cbd5e1" },
});

export default LoginScreen;
