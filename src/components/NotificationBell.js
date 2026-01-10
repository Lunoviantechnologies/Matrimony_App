import React, { useEffect, useState, useCallback } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList, ActivityIndicator, Alert } from "react-native";
import axiosInstance from "../api/axiosInstance";
import { getSession } from "../api/authSession";

const NotificationBell = ({ onNavigate }) => {
  const { userId, token } = getSession();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const unreadCount = notifications?.filter((n) => !n.read).length || 0;

  const loadNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res = await axiosInstance.get(`/notifications/GetAll?userId=${userId}`);
      const data = Array.isArray(res.data) ? res.data : res.data?.content || [];
      const normalized = data.map((n) => ({ ...n, read: Boolean(n.read) }));
      setNotifications(normalized);
    } catch (err) {
      console.log("notifications load error:", err?.response?.data || err?.message);
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    loadNotifications();
  }, [loadNotifications]);

  const markAsRead = async (id) => {
    try {
      await axiosInstance.post(`/notifications/read/${id}`);
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch (err) {
      console.log("mark read error:", err?.response?.data || err?.message);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axiosInstance.post(`/notifications/mark-all-read?userId=${userId}`);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.log("mark all read error:", err?.response?.data || err?.message);
    }
  };

  const handlePressItem = (item) => {
    markAsRead(item.id);
    setOpen(false);
    if (onNavigate) {
      onNavigate(item.type, item.targetId);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={[styles.item, !item.read && styles.itemUnread]} onPress={() => handlePressItem(item)}>
      <Text style={styles.itemTitle}>{item.message || "Notification"}</Text>
      <Text style={styles.itemTime}>
        {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View>
      <TouchableOpacity style={styles.bell} onPress={() => setOpen(true)}>
        <Text style={styles.bellIcon}>🔔</Text>
        {unreadCount > 0 && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unreadCount}</Text>
          </View>
        )}
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Notifications</Text>
              <TouchableOpacity onPress={() => setOpen(false)}>
                <Text style={styles.close}>✖️</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={loadNotifications} disabled={loading}>
                <Text style={styles.actionText}>{loading ? "Loading..." : "Refresh"}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.actionBtn} onPress={markAllAsRead}>
                <Text style={styles.actionText}>Mark all read</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <ActivityIndicator style={{ marginTop: 12 }} />
            ) : notifications.length === 0 ? (
              <Text style={styles.empty}>No notifications</Text>
            ) : (
              <FlatList data={notifications} keyExtractor={(i) => `${i.id}`} renderItem={renderItem} />
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  bell: { padding: 8 },
  bellIcon: { fontSize: 20 },
  badge: {
    position: "absolute",
    top: 2,
    right: 2,
    backgroundColor: "#e91e63",
    borderRadius: 8,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  badgeText: { color: "#fff", fontSize: 10, fontWeight: "800" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 16,
    maxHeight: "70%",
  },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#1f1f39" },
  close: { fontSize: 16, color: "#1f1f39" },
  actions: { flexDirection: "row", justifyContent: "flex-end", gap: 10, marginVertical: 10 },
  actionBtn: { backgroundColor: "#f0f0f5", paddingHorizontal: 10, paddingVertical: 8, borderRadius: 10 },
  actionText: { color: "#1f1f39", fontWeight: "700" },
  item: { paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: "#eee" },
  itemUnread: { backgroundColor: "#f5f0ff" },
  itemTitle: { color: "#1f1f39", fontWeight: "700" },
  itemTime: { color: "#6b6a7a", fontSize: 12, marginTop: 4 },
  empty: { textAlign: "center", marginTop: 12, color: "#4b4a5f" },
});

export default NotificationBell;

