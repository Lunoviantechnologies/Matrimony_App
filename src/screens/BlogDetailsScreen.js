import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { fetchBlogBySlugApi } from "../api/api";
import { BASE_URL } from "@env";

const getImageUri = (blog) => {
  if (!blog?.imageUrl) return null;
  if (blog.imageUrl.startsWith("data:") || blog.imageUrl.startsWith("http")) return blog.imageUrl;
  const base = (typeof BASE_URL === "string" && BASE_URL.trim()) ? BASE_URL.trim().replace(/\/+$/, "") : "";
  return base ? `${base}${blog.imageUrl.startsWith("/") ? "" : "/"}${blog.imageUrl}` : null;
};

const BlogDetailsScreen = ({ route }) => {
  const slug = route?.params?.slug;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) {
      setError("Invalid blog.");
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchBlogBySlugApi(slug);
        if (!cancelled) setBlog(res?.data || null);
      } catch (err) {
        if (!cancelled) setError("Failed to load blog.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [slug]);

  if (loading) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#6c3cff" />
        </View>
      </SafeAreaView>
    );
  }
  if (error || !blog) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error || "Blog not found."}</Text>
        </View>
      </SafeAreaView>
    );
  }

  const uri = getImageUri(blog);
  return (
    <SafeAreaView style={styles.root}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {uri ? (
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>📄</Text>
          </View>
        )}
        <View style={styles.body}>
          <Text style={styles.author}>{blog.author || "Vivah Jeevan"}</Text>
          <Text style={styles.title}>{blog.title || "Untitled"}</Text>
          <Text style={styles.content}>{blog.content || "No content available."}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f8ff" },
  scroll: { paddingBottom: 40 },
  image: { width: "100%", height: 220 },
  imagePlaceholder: { backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
  placeholderText: { fontSize: 48 },
  body: { padding: 20 },
  author: { fontSize: 12, color: "#6b7280", marginBottom: 6 },
  title: { fontSize: 20, fontWeight: "800", color: "#1f2937", marginBottom: 12 },
  content: { fontSize: 15, color: "#4b5563", lineHeight: 24 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  errorText: { color: "#6b7280" },
});

export default BlogDetailsScreen;
