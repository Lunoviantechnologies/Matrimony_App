import React from "react";
import { View, Text, StyleSheet } from "react-native";
import AppNavigator from "./src/navigation/AppNavigator";

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error?: string }> {
  state = { hasError: false, error: undefined as string | undefined };

  static getDerivedStateFromError(error: unknown) {
    return { hasError: true, error: error instanceof Error ? error.message : String(error) };
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>{this.state.error || "Unknown error"}</Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const App = () => (
  <ErrorBoundary>
    <AppNavigator />
  </ErrorBoundary>
);

export default App;

const styles = StyleSheet.create({
  errorContainer: { flex: 1, justifyContent: "center", alignItems: "center", padding: 24, backgroundColor: "#fff" },
  errorTitle: { fontSize: 18, fontWeight: "700", marginBottom: 8 },
  errorText: { fontSize: 14, color: "#666", textAlign: "center" },
});
