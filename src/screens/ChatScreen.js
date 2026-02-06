import React, { useEffect, useMemo, useState } from "react";
import { SafeAreaView, View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator, Image } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { getSession, withPhotoVersion } from "../api/authSession";
import { useNavigation, useRoute } from "@react-navigation/native";
import { maskName } from "../utils/nameMask";

// Note: This is a simple REST-based chat viewer. Sending is disabled because
// the backend chat send endpoint is not confirmed for REST. It shows messages
// from /chat/conversation/{me}/{other} for accepted contacts.

const ChatScreen = () => {
  const { userId } = getSession();
  const route = useRoute();
  const navigation = useNavigation();
  const [contacts, setContacts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [me, setMe] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeFilter, setActiveFilter] = useState("all"); // "all" | "unread"
  const [unreadMap, setUnreadMap] = useState({});

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [recvAcc, sentAcc, allProfiles, mine] = await Promise.all([
          axiosInstance.get(`/api/friends/accepted/received/${userId}`),
          axiosInstance.get(`/api/friends/accepted/sent/${userId}`),
          axiosInstance.get("/api/profiles/Allprofiles"),
          axiosInstance.get(`/api/profiles/myprofiles/${userId}`),
        ]);
        const merged = [...(recvAcc.data || []), ...(sentAcc.data || [])];
        setContacts(merged);
        setProfiles(Array.isArray(allProfiles.data) ? allProfiles.data : []);
        setMe(mine.data);

        // Initialize unread map for any new contacts (local-only unread tracking)
        setUnreadMap((prev) => {
          const next = { ...prev };
          merged.forEach((item) => {
            const otherId =
              Number(item.senderId) === Number(userId) ? item.receiverId : item.senderId;
            if (otherId && next[otherId] === undefined) {
              next[otherId] = true;
            }
          });
          return next;
        });
      } catch (e) {
        console.log("chat contacts load error:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, route?.params?.selectedId]);

  const premiumActive = useMemo(() => {
    if (!me) return false;
    const end = me.premiumEnd ? new Date(me.premiumEnd) : null;
    const activeFlag = me.premium === true;
    const notExpired = end ? end > new Date() : true;
    return activeFlag && notExpired;
  }, [me]);

  const filteredContacts = useMemo(() => {
    if (activeFilter === "all") return contacts;
    // Unread filter
    return contacts.filter((item) => {
      const otherId =
        Number(item.senderId) === Number(userId) ? item.receiverId : item.senderId;
      return otherId && unreadMap[otherId];
    });
  }, [contacts, activeFilter, unreadMap, userId]);

  const renderChatItem = ({ item }) => {
    const otherId = Number(item.senderId) === Number(userId) ? item.receiverId : item.senderId;
    const p = profiles.find((x) => x.id === otherId);
    const name = p
      ? premiumActive
        ? `${(p.firstName || "").trim()} ${(p.lastName || "").trim()}`.trim() || "User"
        : maskName(p.firstName, p.lastName)
      : item.senderId === userId
      ? item.receiverName
      : item.senderName || "User";

    const avatarUrl = p
      ? withPhotoVersion(
          p.updatePhoto || p.photoUrl || p.image || p.avatar || null
        )
      : null;

    const initial =
      (name && name.trim().charAt(0).toUpperCase()) || "U";

    const isUnread = !!unreadMap[otherId];

    return (
      <TouchableOpacity
        style={styles.chatItem}
        activeOpacity={0.8}
        onPress={() => {
          // Mark as read locally, then open full chat window
          setUnreadMap((prev) => ({ ...prev, [otherId]: false }));
          navigation.navigate("ChatWindow", {
            otherId,
            name,
            avatarUrl,
          });
        }}
      >
        <View style={styles.chatAvatar}>
          {avatarUrl ? (
            <Image source={{ uri: avatarUrl }} style={styles.chatAvatarImage} />
          ) : (
            <View style={styles.chatAvatarPlaceholder}>
              <Text style={styles.chatAvatarInitial}>{initial}</Text>
            </View>
          )}
        </View>
        <View style={styles.chatContent}>
          <View style={styles.chatHeader}>
            <Text style={styles.chatName} numberOfLines={1}>
              {name}
            </Text>
            <Text style={styles.chatDate}>Today</Text>
          </View>
          <Text style={styles.chatPreview} numberOfLines={1}>
            Tap to view conversation
          </Text>
          {isUnread && (
            <View style={styles.chatMeta}>
              <View />
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadText}>1</Text>
              </View>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Chat</Text>
        </View>
      </View>

      {/* Filter tabs */}
      <View style={styles.filterTabs}>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveFilter("all")}
        >
          <Text
            style={[
              styles.filterTab,
              activeFilter === "all" && styles.filterTabActive,
            ]}
          >
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => setActiveFilter("unread")}
        >
          <Text
            style={[
              styles.filterTab,
              activeFilter === "unread" && styles.filterTabActive,
            ]}
          >
            Unread
          </Text>
        </TouchableOpacity>
      </View>

      {/* Stories row (accepted contacts as avatars) */}
      <View style={styles.storiesSection}>
        <FlatList
          horizontal
          data={contacts}
          keyExtractor={(i) => `${i.requestId || i.senderId}-${i.receiverId}-story`}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.storiesContainer}
          renderItem={({ item }) => {
            const otherId =
              Number(item.senderId) === Number(userId) ? item.receiverId : item.senderId;
            const p = profiles.find((x) => x.id === otherId);
            const name =
              p?.firstName || p?.lastName
                ? `${p.firstName || ""} ${p.lastName || ""}`.trim()
                : item.senderId === userId
                ? item.receiverName
                : item.senderName || "User";

            const avatarUrl = p
              ? withPhotoVersion(
                  p.updatePhoto || p.photoUrl || p.image || p.avatar || null
                )
              : null;
            const initial =
              (name && name.trim().charAt(0).toUpperCase()) || "U";

            return (
              <View style={styles.storyItem}>
                <View style={styles.storyAvatar}>
                  {avatarUrl ? (
                    <Image
                      source={{ uri: avatarUrl }}
                      style={styles.storyAvatarImage}
                    />
                  ) : (
                    <View style={styles.storyAvatarInner}>
                      <Text style={styles.storyAvatarInitial}>{initial}</Text>
                    </View>
                  )}
                  <View style={styles.storyStatus} />
                </View>
                <Text style={styles.storyName} numberOfLines={1}>
                  {name}
                </Text>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={styles.storiesEmpty}>No chats yet.</Text>}
        />
      </View>

      {/* Chat list only – actual conversation opens in ChatWindowScreen */}
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.mainArea}>
          <FlatList
            data={filteredContacts}
            keyExtractor={(i) => `${i.requestId || i.senderId}-${i.receiverId}`}
            renderItem={renderChatItem}
            style={styles.chatList}
            ListEmptyComponent={<Text style={styles.empty}>No chats yet.</Text>}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  headerLeft: { flexDirection: "row", alignItems: "center", columnGap: 8 },
  headerTitle: { fontSize: 22, fontWeight: "800", color: "#000" },
  filterTabs: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 10,
    flexDirection: "row",
    columnGap: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  filterTab: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#f0f0f0",
    color: "#666",
    fontSize: 13,
    fontWeight: "600",
  },
  filterTabActive: { backgroundColor: "#000", color: "#fff" },
  storiesSection: {
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  storiesContainer: {
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  storyItem: { alignItems: "center", marginRight: 16, minWidth: 60 },
  storyAvatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    padding: 3,
    backgroundColor: "#f97373",
    position: "relative",
  },
  storyAvatarInner: {
    flex: 1,
    borderRadius: 28,
    backgroundColor: "#f97373",
    alignItems: "center",
    justifyContent: "center",
  },
  storyAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 28,
    backgroundColor: "#e5e7eb",
  },
  storyAvatarInitial: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 20,
  },
  storyStatus: {
    position: "absolute",
    bottom: 2,
    right: 2,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: "#4cd964",
    borderWidth: 2,
    borderColor: "#fff",
  },
  storyName: { fontSize: 11, color: "#666", marginTop: 4, maxWidth: 70 },
  storiesEmpty: {
    fontSize: 12,
    color: "#9ca3af",
    paddingHorizontal: 16,
  },
  mainArea: { flex: 1, backgroundColor: "#fff" },
  chatList: { flex: 1 },
  chatItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#f0f0f0",
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f97373",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  chatAvatarImage: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    backgroundColor: "#e5e7eb",
  },
  chatAvatarPlaceholder: {
    width: "100%",
    height: "100%",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  chatAvatarInitial: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
  },
  chatContent: { flex: 1 },
  chatHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  chatName: { fontSize: 15, fontWeight: "700", color: "#000", flexShrink: 1, marginRight: 8 },
  chatDate: { fontSize: 11, color: "#9ca3af" },
  chatPreview: { fontSize: 13, color: "#6b7280", marginTop: 2 },
  chatMeta: { flexDirection: "row", justifyContent: "space-between", marginTop: 4 },
  unreadBadge: {
    backgroundColor: "#4cd964",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2,
    minWidth: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  unreadText: { color: "#fff", fontSize: 11, fontWeight: "700" },
  messagePanel: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    maxHeight: "55%",
  },
  msgBubble: { padding: 10, borderRadius: 16, marginVertical: 4, maxWidth: "80%" },
  msgMine: { backgroundColor: "#d9f5e4", alignSelf: "flex-end" },
  msgTheirs: { backgroundColor: "#e5e7eb", alignSelf: "flex-start" },
  msgText: { color: "#1f2933" },
  msgTime: { color: "#6b6a7a", fontSize: 10, marginTop: 4 },
  empty: { textAlign: "center", color: "#4b4a5f", marginTop: 20 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
  },
  input: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    color: "#111827",
    fontSize: 14,
  },
  sendBtn: {
    marginLeft: 8,
    backgroundColor: "#1f1f39",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  sendText: { color: "#fff", fontWeight: "800" },
});

export default ChatScreen;

