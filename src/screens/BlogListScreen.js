import React, { useCallback, useEffect, useState } from "react";
import {
  SafeAreaView,
  FlatList,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Image,
} from "react-native";
import { fetchPublicBlogsApi } from "../api/api";
import { BASE_URL } from "@env";

const getImageUri = (blog) => {
  if (!blog?.imageUrl) return null;
  if (blog.imageUrl.startsWith("data:") || blog.imageUrl.startsWith("http")) return blog.imageUrl;
  const base = (typeof BASE_URL === "string" && BASE_URL.trim()) ? BASE_URL.trim().replace(/\/+$/, "") : "";
  return base ? `${base}${blog.imageUrl.startsWith("/") ? "" : "/"}${blog.imageUrl}` : null;
};

const BlogListScreen = ({ navigation }) => {
  const [blogs, setBlogs] = useState([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const loadBlogs = useCallback(async () => {
    if (loading || !hasMore) return;
    try {
      setLoading(true);
      setError(null);
      const res = await fetchPublicBlogsApi(page);
      const data = res?.data || {};
      const content = Array.isArray(data.content) ? data.content : [];
      setBlogs((prev) => (page === 0 ? content : [...prev, ...content]));
      setHasMore(data.last === false);
      setPage((p) => p + 1);
    } catch (err) {
      if (__DEV__) console.log("Blog list error:", err?.response?.data || err.message);
      setError("Failed to load blogs.");
    } finally {
      setLoading(false);
    }
  }, [page, hasMore, loading]);

  useEffect(() => {
    loadBlogs();
  }, []);

  const renderItem = ({ item }) => {
    const uri = getImageUri(item);
    return (
      <TouchableOpacity
        style={styles.card}
        onPress={() => navigation.navigate("BlogDetails", { slug: item.slug })}
        activeOpacity={0.8}
      >
        {uri ? (
          <Image source={{ uri }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={[styles.image, styles.imagePlaceholder]}>
            <Text style={styles.placeholderText}>📄</Text>
          </View>
        )}
        <View style={styles.body}>
          <Text style={styles.author}>{item.author || "Vivah Jeevan"}</Text>
          <Text style={styles.title} numberOfLines={2}>{item.title || "Untitled"}</Text>
          <Text style={styles.desc} numberOfLines={2}>
            {item.content?.slice(0, 90) || "No content"}…
          </Text>
          <Text style={styles.readMore}>READ MORE →</Text>
        </View>
      </TouchableOpacity>
    );
  };

  if (error && blogs.length === 0) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.centered}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={() => { setPage(0); setHasMore(true); setError(null); loadBlogs(); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Blogs</Text>
        <Text style={styles.headerSubtitle}>Tips & guides for your journey</Text>
      </View>
      <FlatList
        data={blogs}
        renderItem={renderItem}
        keyExtractor={(item) => String(item.id)}
        contentContainerStyle={styles.list}
        onEndReached={() => { if (hasMore && !loading) loadBlogs(); }}
        onEndReachedThreshold={0.3}
        ListFooterComponent={loading ? <ActivityIndicator style={styles.footer} color="#6c3cff" /> : null}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8f8ff" },
  header: { padding: 20, paddingBottom: 12 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#1f2937" },
  headerSubtitle: { fontSize: 14, color: "#6b7280", marginTop: 4 },
  list: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: "#fff", borderRadius: 12, marginBottom: 16, overflow: "hidden", borderWidth: 1, borderColor: "#e5e7eb" },
  image: { width: "100%", height: 160 },
  imagePlaceholder: { backgroundColor: "#f3f4f6", justifyContent: "center", alignItems: "center" },
  placeholderText: { fontSize: 48 },
  body: { padding: 14 },
  author: { fontSize: 12, color: "#6b7280", marginBottom: 4 },
  title: { fontSize: 16, fontWeight: "700", color: "#1f2937", marginBottom: 6 },
  desc: { fontSize: 13, color: "#6b7280", lineHeight: 20 },
  readMore: { fontSize: 12, color: "#6c3cff", fontWeight: "700", marginTop: 8 },
  footer: { padding: 16 },
  centered: { flex: 1, justifyContent: "center", alignItems: "center", padding: 20 },
  errorText: { color: "#6b7280", marginBottom: 12 },
  retryBtn: { backgroundColor: "#6c3cff", paddingVertical: 10, paddingHorizontal: 20, borderRadius: 8 },
  retryText: { color: "#fff", fontWeight: "600" },
});

export default BlogListScreen;
