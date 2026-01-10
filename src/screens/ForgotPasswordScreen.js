import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { forgotPasswordApi, verifyOtpApi, resetPasswordApi } from "../api/api";

const ForgotPasswordScreen = ({ navigation }) => {
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [showPasswords, setShowPasswords] = useState(false);

  const resetMessages = () => {
    setMessage("");
    setError("");
  };

  const sendOtp = async () => {
    if (!email) {
      setError("Please enter your email.");
      return;
    }
    resetMessages();
    setLoading(true);
    try {
      await forgotPasswordApi(email);
      setMessage("OTP sent to your email.");
      setStep(2);
    } catch (e) {
      setError(e?.response?.data || "Failed to send OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    if (!otp) {
      setError("Please enter the OTP.");
      return;
    }
    resetMessages();
    setLoading(true);
    try {
      await verifyOtpApi(email, otp);
      setMessage("OTP verified. Set your new password.");
      setStep(3);
    } catch (e) {
      setError(e?.response?.data || "Invalid OTP. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!newPassword || !confirmPassword) {
      setError("Please enter and confirm your new password.");
      return;
    }
    resetMessages();
    setLoading(true);
    try {
      await resetPasswordApi(email, newPassword, confirmPassword);
      setMessage("Password reset successful. You can login now.");
      setStep(1);
      setOtp("");
      setNewPassword("");
      setConfirmPassword("");
      // Redirect to login after a short delay so the user sees the success
      setTimeout(() => {
        navigation.replace("Login");
      }, 600);
    } catch (e) {
      setError(e?.response?.data || "Password reset failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const renderStep = () => {
    if (step === 1) {
      return (
        <>
          <Text style={styles.heading}>Forgot Password</Text>
          <Text style={styles.subheading}>Enter your email to receive an OTP.</Text>
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={sendOtp} disabled={loading}>
            <Text style={styles.primaryText}>{loading ? "Sending..." : "Send OTP"}</Text>
          </TouchableOpacity>
        </>
      );
    }
    if (step === 2) {
      return (
        <>
          <Text style={styles.heading}>Verify OTP</Text>
          <Text style={styles.subheading}>Enter the OTP sent to your email.</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter OTP"
            keyboardType="number-pad"
            value={otp}
            onChangeText={setOtp}
          />
          <TouchableOpacity style={styles.primaryBtn} onPress={verifyOtp} disabled={loading}>
            <Text style={styles.primaryText}>{loading ? "Verifying..." : "Verify OTP"}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.linkBtn} onPress={sendOtp} disabled={loading}>
            <Text style={styles.linkText}>Resend OTP</Text>
          </TouchableOpacity>
        </>
      );
    }
    return (
      <>
        <Text style={styles.heading}>Reset Password</Text>
        <Text style={styles.subheading}>Create a new password for your account.</Text>
        <TextInput
          style={styles.input}
          placeholder="New password"
          secureTextEntry={!showPasswords}
          value={newPassword}
          onChangeText={setNewPassword}
        />
        <TextInput
          style={styles.input}
          placeholder="Confirm password"
          secureTextEntry={!showPasswords}
          value={confirmPassword}
          onChangeText={setConfirmPassword}
        />
        <TouchableOpacity style={styles.linkBtn} onPress={() => setShowPasswords((p) => !p)}>
          <Text style={styles.linkText}>{showPasswords ? "Hide passwords" : "Show passwords"}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.primaryBtn} onPress={handleReset} disabled={loading}>
          <Text style={styles.primaryText}>{loading ? "Resetting..." : "Reset Password"}</Text>
        </TouchableOpacity>
      </>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {message ? <Text style={styles.success}>{message}</Text> : null}
          {error ? <Text style={styles.error}>{error}</Text> : null}
          {renderStep()}
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backText}>Back to Login</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4" },
  content: { padding: 16, paddingBottom: 40, flexGrow: 1, justifyContent: "center" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
    gap: 10,
  },
  heading: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  subheading: { fontSize: 13, color: "#4b5565" },
  input: {
    backgroundColor: "#fafafa",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#ddd",
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
  },
  primaryBtn: {
    backgroundColor: "#6c3cff",
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: "center",
    marginTop: 4,
  },
  primaryText: { color: "#fff", fontWeight: "700" },
  linkBtn: { alignItems: "flex-start", marginTop: 6 },
  linkText: { color: "#6c3cff", fontWeight: "700" },
  success: { color: "#16a34a", fontWeight: "700" },
  error: { color: "#b91c1c", fontWeight: "700" },
  backBtn: { alignItems: "center", marginTop: 8 },
  backText: { color: "#6c3cff", fontWeight: "700" },
});

export default ForgotPasswordScreen;

