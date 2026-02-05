import React, { useMemo, useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, SafeAreaView, Alert, KeyboardAvoidingView, Platform, ImageBackground } from "react-native";
import { registerApi, sendRegistrationOtpApi, verifyRegistrationOtpApi } from "../api/api";

const steps = [
  "Profile",
  "Personal",
  "Community",
  "Location",
  "Basics",
  "Education & Career",
  "Work Details",
  "Account",
  "Verify Email",
];

const profileForOptions = ["Myself", "My Son", "My Daughter", "My Brother", "My Sister", "My Friend", "My Relative"];
const genderOptions = ["Male", "Female"];
const religionOptions = ["Hindu", "Muslim", "Christian", "Sikh", "Jain", "Buddhist", "Jewish"];
const motherTongueOptions = ["Hindi", "Bengali", "Telugu", "Marathi", "Tamil", "Urdu", "Gujarati", "Kannada", "Odia", "Malayalam", "Punjabi", "Assamese", "Konkani", "Sindhi", "Nepali", "Kashmiri", "Manipuri", "English"];
const casteOptions = ["BC", "OC", "SC & ST", "OBC"];
const countryOptions = ["India", "USA", "UK", "Canada", "Australia"];
const maritalStatusOptions = ["Single", "Divorced", "Separated", "Widowed"];
const educationOptions = ["10th", "12th / Intermediate", "Diploma", "B.A", "B.Sc", "B.Com", "B.E / B.Tech", "MBBS", "LLB", "M.A", "M.Sc", "M.Com", "M.E / M.Tech", "MBA", "MCA", "CA", "CS", "ICWA", "PhD"];
const sectorOptions = ["Government / PSU", "Private", "Business", "Self-Employed / Freelancer", "Defense / Armed Forces", "Not Working"];
const annualIncomeOptions = [
  "Below ₹ 1 Lakh yearly",
  "₹ 1 to 3 Lakh yearly",
  "₹ 3 to 5 Lakh yearly",
  "₹ 5 to 7 Lakh yearly",
  "₹ 7 to 10 Lakh yearly",
  "₹ 10 to 15 Lakh yearly",
  "Above ₹ 15 Lakh yearly",
];

// Precompute height options 122-213 cm (4'0" to 7'0")
const heightOptions = Array.from({ length: 92 }, (_, i) => 122 + i).map((cm) => {
  const feet = Math.floor(cm / 30.48);
  const inches = Math.round((cm / 2.54) % 12);
  return { label: `${feet} ft ${inches} in (${cm} cm)`, value: `${cm}` };
});

const RegisterScreen = ({ navigation }) => {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [otpSending, setOtpSending] = useState(false);
  const [otpVerifying, setOtpVerifying] = useState(false);
  const [showOtpField, setShowOtpField] = useState(false);

  const [form, setForm] = useState({
    profileFor: "",
    gender: "",
    firstName: "",
    lastName: "",
    age: "",
    dobDay: "",
    dobMonth: "",
    dobYear: "",
    religion: "",
    caste: "",
    subCaste: "",
    motherTongue: "",
    country: "",
    city: "",
    maritalStatus: "",
    noOfChildren: "",
    height: "",
    heightLabel: "",
    highestEducation: "",
    collegeName: "",
    sector: "",
    occupation: "",
    companyName: "",
    annualIncome: "",
    workLocation: "",
    emailId: "",
    mobileNumber: "",
    createPassword: "",
    role: "USER",
    emailOtp: "",
    emailVerified: false,
  });

  const onChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

  const currentErrors = useMemo(() => {
    const e = {};
    if (step === 0) {
      if (!form.profileFor) e.profileFor = "Required";
      if (!form.gender) e.gender = "Required";
    } else if (step === 1) {
      if (!form.firstName) e.firstName = "Required";
      if (!form.lastName) e.lastName = "Required";
      if (!form.age) e.age = "Required";
      if (!form.dobDay || !form.dobMonth || !form.dobYear) e.dob = "DOB required";
    } else if (step === 2) {
      if (!form.religion) e.religion = "Required";
      if (!form.motherTongue) e.motherTongue = "Required";
      if (!form.caste) e.caste = "Required";
      if (!form.subCaste) e.subCaste = "Required";
    } else if (step === 3) {
      if (!form.country) e.country = "Required";
      if (!form.city) e.city = "Required";
      if (!form.maritalStatus) e.maritalStatus = "Required";
    } else if (step === 4) {
      if (!form.height) e.height = "Required";
    } else if (step === 5) {
      if (!form.highestEducation) e.highestEducation = "Required";
      if (!form.collegeName) e.collegeName = "Required";
      if (!form.sector) e.sector = "Required";
      if (!form.occupation) e.occupation = "Required";
      if (!form.companyName) e.companyName = "Required";
    } else if (step === 7) {
      if (!form.emailId) e.emailId = "Required";
      if (!form.mobileNumber) e.mobileNumber = "Required";
      if (!form.createPassword) e.createPassword = "Required";
    } else if (step === 8) {
      if (!form.emailId) e.emailId = "Email required";
      if (!form.emailVerified) e.emailOtp = "Verify email with OTP";
    }
    return e;
  }, [form, step]);

  const goNext = () => {
    if (Object.keys(currentErrors).length) {
      Alert.alert("Missing info", "Please fill required fields for this step.");
      return;
    }
    if (step < steps.length - 1) setStep(step + 1);
  };

  const goBack = () => {
    if (step > 0) setStep(step - 1);
  };

  const sendEmailOtp = async () => {
    if (!form.emailId) {
      Alert.alert("Email required", "Please enter an email to verify.");
      return;
    }
    setOtpSending(true);
    try {
      await sendRegistrationOtpApi(form.emailId);
      Alert.alert("OTP sent", "Check your email for the verification code.");
      setShowOtpField(true);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.message || err?.message || "Please try again.";
      console.log("SEND OTP ERROR", status, data || err);
      Alert.alert("Failed to send OTP", status ? `${status}: ${message}` : message);
    } finally {
      setOtpSending(false);
    }
  };

  const verifyEmailOtp = async () => {
    if (!form.emailId || !form.emailOtp) {
      Alert.alert("Missing info", "Enter your email and OTP to verify.");
      return;
    }
    setOtpVerifying(true);
    try {
      await verifyRegistrationOtpApi(form.emailId, form.emailOtp);
      onChange("emailVerified", true);
      Alert.alert("Verified", "Email verified successfully. Please submit to finish.", [
        { text: "OK", onPress: () => setStep(steps.length - 1) },
      ]);
    } catch (err) {
      onChange("emailVerified", false);
      Alert.alert("Verification failed", err?.response?.data || "Invalid OTP.");
    } finally {
      setOtpVerifying(false);
    }
  };

  const handleRegister = async () => {
    if (Object.keys(currentErrors).length) {
      Alert.alert("Missing info", "Please fill required fields.");
      return;
    }

    // Validate DOB range to avoid backend parse errors
    if (form.dobYear || form.dobMonth || form.dobDay) {
      const y = Number(form.dobYear);
      const m = Number(form.dobMonth);
      const d = Number(form.dobDay);
      const valid =
        Number.isInteger(y) &&
        Number.isInteger(m) &&
        Number.isInteger(d) &&
        y >= 1900 &&
        m >= 1 &&
        m <= 12 &&
        d >= 1 &&
        d <= 31;
      if (!valid) {
        Alert.alert("Invalid date", "Please enter a valid date of birth.");
        return;
      }
    }

    const dateOfBirth =
      form.dobYear && form.dobMonth && form.dobDay
        ? `${form.dobYear}-${`${form.dobMonth}`.padStart(2, "0")}-${`${form.dobDay}`.padStart(2, "0")}`
        : null;

    const payload = {
      profileFor: form.profileFor || null,
      gender: form.gender || null,
      firstName: form.firstName || null,
      lastName: form.lastName || null,
      age: form.age ? Number(form.age) : null,
      dateOfBirth,
      religion: form.religion || null,
      caste: form.caste || null,
      subCaste: form.subCaste || null,
      motherTongue: form.motherTongue || null,
      country: form.country || null,
      city: form.city || null,
      maritalStatus: form.maritalStatus || null,
      noOfChildren: form.noOfChildren ? Number(form.noOfChildren) : null,
      height: form.height || null,
      highestEducation: form.highestEducation || null,
      collegeName: form.collegeName || null,
      sector: form.sector || null,
      occupation: form.occupation || null,
      companyName: form.companyName || null,
      annualIncome: form.annualIncome || null,
      workLocation: form.workLocation || null,
      emailId: form.emailId || null,
      mobileNumber: form.mobileNumber || null,
      createPassword: form.createPassword || null,
      role: form.role || "USER",
    };

    setLoading(true);
    try {
      await registerApi(payload);
      Alert.alert("Success", "Registration successful. Please log in.", [
        { text: "OK", onPress: () => navigation.replace("Login") },
      ]);
    } catch (err) {
      const status = err?.response?.status;
      const data = err?.response?.data;
      const message =
        typeof data === "string"
          ? data
          : data?.message || err?.message || "Please try again.";
      console.log("REGISTER ERROR:", status, data || err?.message);
      Alert.alert("Registration failed", status ? `${status}: ${message}` : message);
    } finally {
      setLoading(false);
    }
  };

  const wallUri = require("../assets/loginwall.jpg");

  const renderStep = () => {
    switch (step) {
      case 0:
        return (
          <>
            <SectionTitle title="Profile is for" />
            <SelectChips
              options={profileForOptions}
              value={form.profileFor}
              onSelect={(v) => {
                onChange("profileFor", v);
                // auto-set gender like web
                if (v === "My Son" || v === "My Brother") onChange("gender", "Male");
                else if (v === "My Daughter" || v === "My Sister") onChange("gender", "Female");
                else onChange("gender", "");
              }}
            />
            <SectionTitle title="Gender" />
            <SelectChips options={genderOptions} value={form.gender} onSelect={(v) => onChange("gender", v)} />
          </>
        );
      case 1:
        return (
          <>
            <SectionTitle title="Personal details" />
            <RowInput label="First name" value={form.firstName} onChange={(v) => onChange("firstName", v)} />
            <RowInput label="Last name" value={form.lastName} onChange={(v) => onChange("lastName", v)} />
            <RowInput label="Age" value={form.age} onChange={(v) => onChange("age", v)} keyboardType="number-pad" />
            <SectionTitle title="Date of birth" />
            <View style={styles.row}>
              <SmallInput placeholder="DD" value={form.dobDay} onChange={(v) => onChange("dobDay", v)} keyboardType="number-pad" />
              <SmallInput placeholder="MM" value={form.dobMonth} onChange={(v) => onChange("dobMonth", v)} keyboardType="number-pad" />
              <SmallInput placeholder="YYYY" value={form.dobYear} onChange={(v) => onChange("dobYear", v)} keyboardType="number-pad" />
            </View>
          </>
        );
      case 2:
        return (
          <>
            <SectionTitle title="Community" />
            <DropdownSelect label="Religion" options={religionOptions} value={form.religion} onSelect={(v) => onChange("religion", v)} />
            <DropdownSelect label="Mother tongue" options={motherTongueOptions} value={form.motherTongue} onSelect={(v) => onChange("motherTongue", v)} />
            <DropdownSelect label="Caste" options={casteOptions} value={form.caste} onSelect={(v) => onChange("caste", v)} />
            <RowInput label="Sub caste" value={form.subCaste} onChange={(v) => onChange("subCaste", v)} />
          </>
        );
      case 3:
        return (
          <>
            <SectionTitle title="Location" />
            <DropdownSelect label="Country" options={countryOptions} value={form.country} onSelect={(v) => onChange("country", v)} />
            <RowInput label="City" value={form.city} onChange={(v) => onChange("city", v)} />
            <DropdownSelect
              label="Marital status"
              options={maritalStatusOptions}
              value={form.maritalStatus}
              onSelect={(v) => {
                onChange("maritalStatus", v);
                if (v === "Single") onChange("noOfChildren", "");
              }}
            />
            <RowInput
              label="No. of children"
              value={form.noOfChildren}
              onChange={(v) => onChange("noOfChildren", v)}
              keyboardType="number-pad"
              disabled={form.maritalStatus === "Single"}
              placeholder={form.maritalStatus === "Single" ? "Disabled for Single" : undefined}
            />
          </>
        );
      case 4:
        return (
          <>
            <SectionTitle title="Basics" />
            <RowInput
              label="Height (ft/in or cm)"
              value={form.height}
              onChange={(v) => onChange("height", v)}
              placeholder="e.g. 5'8 or 173"
              keyboardType="number-pad"
            />
          </>
        );
      case 5:
        return (
          <>
            <SectionTitle title="Education & Career" />
            <DropdownSelect label="Highest education" options={educationOptions} value={form.highestEducation} onSelect={(v) => onChange("highestEducation", v)} />
            <RowInput label="College" value={form.collegeName} onChange={(v) => onChange("collegeName", v)} />
            <DropdownSelect label="Sector" options={sectorOptions} value={form.sector} onSelect={(v) => onChange("sector", v)} />
            <RowInput label="Occupation" value={form.occupation} onChange={(v) => onChange("occupation", v)} />
            <RowInput label="Company" value={form.companyName} onChange={(v) => onChange("companyName", v)} />
          </>
        );
      case 6:
        return (
          <>
            <SectionTitle title="Income" />
            <DropdownSelect label="Annual income" options={annualIncomeOptions} value={form.annualIncome} onSelect={(v) => onChange("annualIncome", v)} />
            <RowInput label="Work location" value={form.workLocation} onChange={(v) => onChange("workLocation", v)} />
          </>
        );
      case 7:
        return (
          <>
            <SectionTitle title="Account" />
            <RowInput
              label="Email"
              value={form.emailId}
              onChange={(v) => {
                onChange("emailId", v);
                onChange("emailVerified", false);
                onChange("emailOtp", "");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <RowInput
              label="Mobile"
              value={form.mobileNumber}
              onChange={(v) => onChange("mobileNumber", v)}
              keyboardType="phone-pad"
            />
            <RowInput label="Password" value={form.createPassword} onChange={(v) => onChange("createPassword", v)} secureTextEntry />
          </>
        );
      case 8:
        return (
          <>
            <SectionTitle title="Verify Email" />
            <RowInput
              label="Email"
              value={form.emailId}
              onChange={(v) => {
                onChange("emailId", v);
                onChange("emailVerified", false);
                onChange("emailOtp", "");
              }}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholder="Enter email to verify"
            />
            <Text style={styles.helperText}>OTP will be sent to: {form.emailId || "Enter email above"}</Text>
            <View style={styles.otpRow}>
              <TouchableOpacity style={[styles.smallButton, styles.primary]} onPress={sendEmailOtp} disabled={otpSending || !form.emailId}>
                <Text style={styles.navText}>{otpSending ? "Sending..." : "Verify Email"}</Text>
              </TouchableOpacity>
            </View>
            {showOtpField && (
              <>
                <RowInput
                  label="Enter OTP"
                  value={form.emailOtp}
                  onChange={(v) => onChange("emailOtp", v)}
                  keyboardType="number-pad"
                  placeholder="6-digit code"
                />
                <TouchableOpacity
                  style={[styles.navButton, styles.primary]}
                  onPress={verifyEmailOtp}
                  disabled={otpVerifying || !form.emailOtp}
                >
                  <Text style={styles.navText}>{otpVerifying ? "Verifying..." : form.emailVerified ? "Verified" : "Verify OTP"}</Text>
                </TouchableOpacity>
                {form.emailVerified && <Text style={styles.successText}>Email verified</Text>}
              </>
            )}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <ImageBackground source={wallUri} style={styles.background} resizeMode="cover">
        <View style={styles.backdrop} />
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 32}
        >
          <View style={styles.centerWrapper}>
            <View style={styles.card}>
              <Text style={styles.header}>Create Your Profile</Text>
              <Text style={styles.subheader}>Complete the steps to get started</Text>

              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: `${((step + 1) / steps.length) * 100}%` }]} />
              </View>
              <View style={styles.stepRow}>
                <Text style={styles.stepBadge}>{`Step ${step + 1} of ${steps.length}`}</Text>
                <Text style={styles.stepTitle}>{steps[step]}</Text>
              </View>

              <ScrollView
                style={{ flexGrow: 1 }}
                contentContainerStyle={[
                  styles.formArea,
                  { paddingBottom: 30 },
                ]}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
                contentInsetAdjustmentBehavior="always"
              >
                {renderStep()}

              </ScrollView>
              <View style={styles.footerBar}>
                <View style={styles.footerButtons}>
                  {step > 0 && (
                    <TouchableOpacity style={[styles.navButton, styles.secondary]} onPress={goBack}>
                      <Text style={styles.navTextSecondary}>Back</Text>
                    </TouchableOpacity>
                  )}
                  {step < steps.length - 1 && (
                    <TouchableOpacity style={[styles.navButton, styles.primary]} onPress={goNext}>
                      <Text style={styles.navText}>Next</Text>
                    </TouchableOpacity>
                  )}
                  {step === steps.length - 1 && (
                    <TouchableOpacity style={[styles.navButton, styles.primary]} onPress={handleRegister} disabled={loading}>
                      <Text style={styles.navText}>{loading ? "Please wait..." : "Submit"}</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TouchableOpacity onPress={() => navigation.navigate("Login")} style={styles.footerLink}>
                  <Text style={styles.footerLinkText}>Already have an account? Login</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </ImageBackground>
    </SafeAreaView>
  );
};

const SectionTitle = ({ title }) => (
  <Text style={styles.sectionTitle}>{title}</Text>
);

const RowInput = ({ label, disabled, onChange, ...props }) => (
  <View style={{ marginBottom: 12 }}>
    <Text style={styles.label}>{label}</Text>
    <TextInput
      style={[styles.input, disabled && styles.inputDisabled]}
      editable={!disabled}
      selectTextOnFocus={!disabled}
      onChangeText={onChange}
      {...props}
    />
  </View>
);

const SmallInput = ({ onChange, ...props }) => (
  <TextInput style={[styles.input, styles.smallInput]} onChangeText={onChange} {...props} />
);

const SelectChips = ({ options, value, onSelect }) => (
  <View style={styles.chipWrap}>
    {options.map((opt) => {
      const selected = opt === value;
      return (
        <TouchableOpacity
          key={opt}
          onPress={() => onSelect(opt)}
          style={[styles.chip, selected && styles.chipSelected]}
        >
          <Text style={[styles.chipText, selected && styles.chipTextSelected]}>{opt}</Text>
        </TouchableOpacity>
      );
    })}
  </View>
);

const DropdownSelect = ({ label, options, value, onSelect }) => {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ marginBottom: 12 }}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, styles.selectInput]}
        onPress={() => setOpen((p) => !p)}
      >
        <Text style={{ color: value ? "#000" : "#999" }}>
          {value || `Select ${label}`}
        </Text>
      </TouchableOpacity>
      {open && (
        <View style={styles.dropdownList}>
          <ScrollView style={{ maxHeight: 200 }}>
            {options.map((opt) => (
              <TouchableOpacity
                key={opt}
                style={styles.dropdownItem}
                onPress={() => {
                  onSelect(opt);
                  setOpen(false);
                }}
              >
                <Text>{opt}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
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
    paddingTop: 0,
  },
  card: {
    width: "94%",
    maxWidth: 380,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  header: { fontSize: 20, fontWeight: "700", textAlign: "center" },
  subheader: { fontSize: 12, color: "#666", textAlign: "center", marginTop: 4 },
  progressBar: {
    height: 8,
    backgroundColor: "#eee",
    borderRadius: 10,
    marginTop: 16,
    overflow: "hidden",
  },
  progressFill: {
    height: 8,
    backgroundColor: "#6c3cff",
    borderRadius: 10,
  },
  stepRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 10,
  },
  stepBadge: {
    backgroundColor: "#f0ebff",
    color: "#6c3cff",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    fontSize: 12,
    fontWeight: "700",
  },
  stepTitle: { fontSize: 14, color: "#555", fontWeight: "700" },
  formArea: {
    paddingTop: 14,
    paddingBottom: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 8,
    color: "#222",
  },
  label: {
    fontSize: 13,
    marginBottom: 4,
    color: "#444",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    backgroundColor: "#fafafa",
  },
  inputDisabled: {
    backgroundColor: "#f0f0f0",
    color: "#999",
  },
  smallInput: {
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  navRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14,
    gap: 8,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
  },
  primary: {
    backgroundColor: "#6c3cff",
  },
  secondary: {
    backgroundColor: "#f1f1f1",
    borderWidth: 1,
    borderColor: "#e1e1e1",
  },
  navText: {
    color: "#fff",
    fontWeight: "700",
  },
  navTextSecondary: {
    color: "#333",
    fontWeight: "700",
  },
  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 12,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#ddd",
    backgroundColor: "#fafafa",
  },
  chipSelected: {
    borderColor: "#6c3cff",
    backgroundColor: "#f0ebff",
  },
  chipText: { color: "#333" },
  chipTextSelected: { color: "#6c3cff", fontWeight: "700" },
  selectInput: {
    justifyContent: "center",
  },
  helperText: {
    color: "#666",
    marginBottom: 8,
  },
  otpRow: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginBottom: 12,
    gap: 8,
  },
  smallButton: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  successText: {
    color: "#28a745",
    marginTop: 8,
    fontWeight: "700",
  },
  dropdownList: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    backgroundColor: "#fff",
    marginTop: 6,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#eee",
  },
  footerBar: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e9e9e9",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: -3 },
    elevation: 12,
  },
  footerButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 10,
  },
  footerLink: {
    marginTop: 12,
    alignItems: "center",
  },
  footerLinkText: {
    color: "#6c3cff",
    fontWeight: "700",
  },
});

export default RegisterScreen;

