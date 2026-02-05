import React, { useEffect, useState } from "react";
import { SafeAreaView, View, Text, FlatList, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { getSession } from "../api/authSession";
import { useRoute } from "@react-navigation/native";
import { fetchChatConversationApi, sendChatMessageApi } from "../api/api";

// Note: This is a simple REST-based chat viewer. Sending is disabled because
// the backend chat send endpoint is not confirmed for REST. It shows messages
// from /chat/conversation/{me}/{other} for accepted contacts.

const ChatScreen = () => {
  const { userId } = getSession();
  const route = useRoute();
  const [contacts, setContacts] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [selected, setSelected] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [draft, setDraft] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      setLoading(true);
      try {
        const [recvAcc, sentAcc, allProfiles] = await Promise.all([
          axiosInstance.get(`/api/friends/accepted/received/${userId}`),
          axiosInstance.get(`/api/friends/accepted/sent/${userId}`),
          axiosInstance.get("/api/profiles/Allprofiles"),
        ]);
        const merged = [...(recvAcc.data || []), ...(sentAcc.data || [])];
        setContacts(merged);
        setProfiles(Array.isArray(allProfiles.data) ? allProfiles.data : []);
        if (merged.length) {
          const targetId = route?.params?.selectedId;
          if (targetId) {
            setSelected(targetId);
          } else {
            const first = merged[0];
            const otherId = Number(first.senderId) === Number(userId) ? first.receiverId : first.senderId;
            setSelected(otherId);
          }
        }
      } catch (e) {
        console.log("chat contacts load error:", e?.response?.data || e?.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [userId, route?.params?.selectedId]);

  useEffect(() => {
    const loadMessages = async () => {
      if (!userId || !selected) return;
      try {
        const res = await fetchChatConversationApi(userId, selected, 0, 200);
        const list = res.data?.content || res.data || [];
        setMessages(Array.isArray(list) ? list : []);
      } catch (e) {
        console.log("chat load error:", e?.response?.data || e?.message);
      }
    };
    loadMessages();
  }, [userId, selected]);

  const handleSend = async () => {
    if (!draft.trim() || !selected || !userId) return;
    try {
      setSending(true);
      await sendChatMessageApi(userId, selected, draft.trim());
      setDraft("");
      const res = await fetchChatConversationApi(userId, selected, 0, 200);
      const list = res.data?.content || res.data || [];
      setMessages(Array.isArray(list) ? list : []);
    } catch (e) {
      console.log("send chat error:", e?.response?.data || e?.message);
    } finally {
      setSending(false);
    }
  };

  const renderContact = ({ item }) => {
    const otherId = Number(item.senderId) === Number(userId) ? item.receiverId : item.senderId;
    const p = profiles.find((x) => x.id === otherId);
    const name = p ? `${p.firstName} ${p.lastName}` : item.senderId === userId ? item.receiverName : item.senderName || "User";
    const isActive = Number(selected) === Number(otherId);
    return (
      <TouchableOpacity style={[styles.contact, isActive && styles.contactActive]} onPress={() => setSelected(otherId)}>
        <Text style={styles.contactName}>{name}</Text>
      </TouchableOpacity>
    );
  };

  const renderMessage = ({ item }) => {
    const mine = Number(item.senderId) === Number(userId);
    return (
      <View style={[styles.msgBubble, mine ? styles.msgMine : styles.msgTheirs]}>
        <Text style={styles.msgText}>{item.message}</Text>
        <Text style={styles.msgTime}>{item.timestamp ? new Date(item.timestamp).toLocaleTimeString() : ""}</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.root}>
      <Text style={styles.title}>Chat</Text>
      {loading ? (
        <ActivityIndicator style={{ marginTop: 20 }} />
      ) : (
        <View style={styles.container}>
          <View style={styles.left}>
            <FlatList
              data={contacts}
              keyExtractor={(i) => `${i.requestId || i.senderId}-${i.receiverId}`}
              renderItem={renderContact}
              ListEmptyComponent={<Text style={styles.empty}>No contacts yet.</Text>}
            />
          </View>
          <View style={styles.right}>
            {selected ? (
              <>
                <FlatList
                  data={messages}
                  keyExtractor={(i, idx) => `${idx}`}
                  renderItem={renderMessage}
                  ListEmptyComponent={<Text style={styles.empty}>No messages.</Text>}
                />
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.input}
                    placeholder="Type a message"
                    value={draft}
                    onChangeText={setDraft}
                  />
                  <TouchableOpacity style={styles.sendBtn} onPress={handleSend} disabled={sending || !draft.trim()}>
                    <Text style={styles.sendText}>{sending ? "..." : "Send"}</Text>
                  </TouchableOpacity>
                </View>
              </>
            ) : (
              <Text style={styles.empty}>Select a contact to view chat.</Text>
            )}
          </View>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#D9F5E4" },
  title: { fontSize: 20, fontWeight: "800", color: "#1f1f39", margin: 16 },
  container: { flex: 1, flexDirection: "row" },
  left: { width: 140, borderRightWidth: 1, borderRightColor: "#e6e7f2" },
  right: { flex: 1, padding: 8 },
  contact: { padding: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#e6e7f2" },
  contactActive: { backgroundColor: "#f0f0f5" },
  contactName: { color: "#1f1f39", fontWeight: "700" },
  msgBubble: { padding: 10, borderRadius: 10, marginVertical: 4, maxWidth: "85%" },
  msgMine: { backgroundColor: "#d9f5e4", alignSelf: "flex-end" },
  msgTheirs: { backgroundColor: "#fff", alignSelf: "flex-start" },
  msgText: { color: "#1f1f39" },
  msgTime: { color: "#6b6a7a", fontSize: 10, marginTop: 4 },
  empty: { textAlign: "center", color: "#4b4a5f", marginTop: 20 },
  inputRow: { flexDirection: "row", alignItems: "center", padding: 6, borderTopWidth: 1, borderTopColor: "#e6e7f2" },
  input: { flex: 1, backgroundColor: "#fff", borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8, color: "#999" },
  sendBtn: { marginLeft: 8, backgroundColor: "#1f1f39", paddingHorizontal: 12, paddingVertical: 10, borderRadius: 10 },
  sendText: { color: "#fff", fontWeight: "800" },
});

export default ChatScreen;

