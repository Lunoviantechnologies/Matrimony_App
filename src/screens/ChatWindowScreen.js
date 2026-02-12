import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import { getSession } from "../api/authSession";
import {
  fetchChatConversationApi,
  sendChatMessageApi,
  blockUserApi,
  reportUserApi,
  clearChatApi,
  getBlockStatusApi,
  unblockUserApi,
  fetchOnlineUsersApi,
  markChatSeenApi,
} from "../api/api";

const ChatWindowScreen = () => {
  const { userId } = getSession();
  const navigation = useNavigation();
  const route = useRoute();
  const otherId = route?.params?.otherId;
  const otherName = route?.params?.name || "Chat";
  const otherAvatar = route?.params?.avatarUrl || null;

  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [isBlocked, setIsBlocked] = useState(false);
  const [iBlocked, setIBlocked] = useState(false);
  const [isReported, setIsReported] = useState(false);
  const [isOnline, setIsOnline] = useState(false);

  // Initial load + periodic auto-refresh (messages + online status)
  useEffect(() => {
    let isCancelled = false;

    const loadOnce = async () => {
      if (!userId || !otherId) {
        if (!isCancelled) setLoading(false);
        return;
      }
      try {
        const [convRes, statusRes, onlineRes] = await Promise.all([
          fetchChatConversationApi(userId, otherId, 0, 200),
          getBlockStatusApi(userId, otherId),
          fetchOnlineUsersApi(),
        ]);

        const list = convRes.data?.content || convRes.data || [];
        if (!isCancelled) {
          setMessages(Array.isArray(list) ? list : []);

          const status = statusRes.data || {};
          setIsBlocked(!!status.blocked);
          setIBlocked(!!status.iBlocked);

          const onlineIds = Array.isArray(onlineRes?.data)
            ? onlineRes.data.map((id) => Number(id))
            : [];
          setIsOnline(onlineIds.includes(Number(otherId)));
        }
      } catch (e) {
        if (!isCancelled) {
          console.log("chat window load error:", e?.response?.data || e?.message);
          setIsOnline(false);
        }
      } finally {
        if (!isCancelled) setLoading(false);
      }
    };

    loadOnce();

    // Auto-refresh every 5 seconds while on this screen
    const intervalId = setInterval(loadOnce, 5000);

    return () => {
      isCancelled = true;
      clearInterval(intervalId);
    };
  }, [userId, otherId]);

  // When we see messages from the other user that are not marked seen,
  // notify backend so ticks update for them (and for us on next refresh).
  useEffect(() => {
    if (!userId || !otherId || !Array.isArray(messages) || messages.length === 0) return;

    const hasUnseenFromOther = messages.some(
      (m) =>
        Number(m.senderId) === Number(otherId) &&
        Number(m.receiverId) === Number(userId) &&
        !m.seen
    );

    if (!hasUnseenFromOther) return;

    markChatSeenApi(otherId, userId).catch(() => {
      // Ignore seen errors on mobile
    });
  }, [messages, userId, otherId]);

  const handleSend = async () => {
    if (!draft.trim() || !userId || !otherId || iBlocked) return;
    try {
      setSending(true);
      await sendChatMessageApi(userId, otherId, draft.trim());
      setDraft("");
      // Optimistic refresh – fetch latest conversation
      const res = await fetchChatConversationApi(userId, otherId, 0, 200);
      const list = res.data?.content || res.data || [];
      setMessages(Array.isArray(list) ? list : []);
    } catch (e) {
      console.log("chat window send error:", e?.response?.data || e?.message);
    } finally {
      setSending(false);
    }
  };

  const renderMessage = ({ item }) => {
    const mine = Number(item.senderId) === Number(userId);
    const time = item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : "";
    return (
      <View style={[styles.msgBubble, mine ? styles.msgMine : styles.msgTheirs]}>
        <Text style={styles.msgText}>{item.message}</Text>
        <Text style={styles.msgTime}>
          {time}
          {mine && (
            <Text style={item.seen ? styles.seenTick : styles.sentTick}>
              {item.seen ? " ✔✔" : " ✔"}
            </Text>
          )}
        </Text>
      </View>
    );
  };

  const handleViewContact = () => {
    // For now this is the same as View Profile – go to ProfileView screen.
    if (!otherId) return;
    navigation.navigate("ProfileView", { profileId: otherId });
  };

  const handleViewProfile = () => {
    if (!otherId) return;
    navigation.navigate("ProfileView", { profileId: otherId });
  };

  const handleBlock = async () => {
    if (!userId || !otherId || busy) return;
    try {
      setBusy(true);
      await blockUserApi(userId, otherId);
      setIBlocked(true);
    } catch (e) {
      console.log("block user error:", e?.response?.data || e?.message);
    } finally {
      setBusy(false);
      setMenuOpen(false);
    }
  };

  const handleReport = async () => {
    if (!userId || !otherId || busy) return;
    try {
      setBusy(true);
      await reportUserApi(otherId, {
        reporterId: userId,
        reason: "OTHER",
        description: "Reported from chat window",
      });
      setIsReported(true);
    } catch (e) {
      console.log("report user error:", e?.response?.data || e?.message);
    } finally {
      setBusy(false);
      setMenuOpen(false);
    }
  };

  const handleUnblock = async () => {
    if (!userId || !otherId || busy) return;
    try {
      setBusy(true);
      await unblockUserApi(userId, otherId);
      setIBlocked(false);
    } catch (e) {
      console.log("unblock user error:", e?.response?.data || e?.message);
    } finally {
      setBusy(false);
      setMenuOpen(false);
    }
  };

  const handleClearChat = async () => {
    if (!userId || !otherId || busy) return;
    try {
      setBusy(true);
      await clearChatApi(userId, otherId);
      setMessages([]);
    } catch (e) {
      console.log("clear chat error:", e?.response?.data || e?.message);
    } finally {
      setBusy(false);
      setMenuOpen(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 80 : 0}
      >
        {/* Header with back and actions */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
          <View style={styles.headerInfo}>
            {otherAvatar ? (
              <Image source={{ uri: otherAvatar }} style={styles.headerAvatarImage} />
            ) : (
              <View style={styles.headerAvatarPlaceholder}>
                <Text style={{ fontSize: 18 }}>👤</Text>
              </View>
            )}
            <View style={styles.headerTextBlock}>
              <Text style={styles.title}>{otherName}</Text>
              <Text style={styles.subtitle}>
                {isOnline ? "Online" : "Offline"}
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.menuBtn}
            onPress={() => setMenuOpen((open) => !open)}
          >
            <Text style={styles.menuIcon}>⋮</Text>
          </TouchableOpacity>
        </View>

        {menuOpen && (
          <View style={styles.menuCard}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleViewContact}
              disabled={busy}
            >
              <Text style={styles.menuItemText}>View Contact</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleViewProfile}
              disabled={busy}
            >
              <Text style={styles.menuItemText}>View Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={iBlocked ? handleUnblock : handleBlock}
              disabled={busy}
            >
              <Text style={[styles.menuItemText, { color: "#b91c1c" }]}>
                {iBlocked ? "Unblock User" : "Block Member"}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleReport}
              disabled={busy}
            >
              <Text style={[styles.menuItemText, { color: "#ea580c" }]}>
                Report this Profile
              </Text>
            </TouchableOpacity>
            <View style={styles.menuDivider} />
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleClearChat}
              disabled={busy}
            >
              <Text style={styles.menuItemText}>Clear Chat</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Messages list */}
        {loading ? (
          <ActivityIndicator style={{ marginTop: 20 }} />
        ) : (
          <FlatList
            style={styles.messagesList}
            contentContainerStyle={{ paddingVertical: 12, paddingHorizontal: 12 }}
            data={messages}
            keyExtractor={(_, idx) => `${idx}`}
            renderItem={renderMessage}
            ListEmptyComponent={<Text style={styles.empty}>No messages yet.</Text>}
            inverted
          />
        )}

        {/* Input bar */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Type a message"
            value={draft}
            onChangeText={setDraft}
          />
          <TouchableOpacity
            style={styles.sendBtn}
            onPress={handleSend}
            disabled={sending || !draft.trim()}
          >
            <Text style={styles.sendText}>{sending ? "..." : "Send"}</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f5f7fb" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    backgroundColor: "#fff",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#e5e7eb",
  },
  backBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  backIcon: { fontSize: 18, color: "#111827" },
  headerInfo: { flex: 1, flexDirection: "row", alignItems: "center" },
  menuBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  menuIcon: { fontSize: 18, color: "#111827" },
  menuCard: {
    position: "absolute",
    top: 56,
    right: 12,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
    minWidth: 190,
    zIndex: 10,
  },
  menuDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "#e5e7eb",
    marginHorizontal: 8,
    marginVertical: 4,
  },
  menuItem: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  menuItemText: {
    fontSize: 14,
    color: "#111827",
    fontWeight: "600",
  },
  headerAvatarImage: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: "#e5e7eb",
  },
  headerAvatarPlaceholder: {
    width: 38,
    height: 38,
    borderRadius: 19,
    marginRight: 10,
    backgroundColor: "#e5e7eb",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTextBlock: { flex: 1 },
  title: { fontSize: 18, fontWeight: "800", color: "#0f172a" },
  subtitle: { fontSize: 11, color: "#6b7280", marginTop: 2 },
  messagesList: { flex: 1 },
  msgBubble: { padding: 10, borderRadius: 16, marginVertical: 4, maxWidth: "80%" },
  msgMine: { backgroundColor: "#d9f5e4", alignSelf: "flex-end" },
  msgTheirs: { backgroundColor: "#e5e7eb", alignSelf: "flex-start" },
  msgText: { color: "#1f2933" },
  msgTime: { color: "#6b6a7a", fontSize: 10, marginTop: 4 },
  sentTick: { fontSize: 10, color: "#6b7280" },
  seenTick: { fontSize: 10, color: "#16a34a" },
  empty: { textAlign: "center", color: "#4b4a5f", marginTop: 20 },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#e5e7eb",
    backgroundColor: "#fff",
  },
  input: {
    flex: 1,
    backgroundColor: "#f9fafb",
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

export default ChatWindowScreen;

