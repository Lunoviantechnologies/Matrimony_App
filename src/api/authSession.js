let AsyncStorage = null;
try {
  AsyncStorage = require("@react-native-async-storage/async-storage").default;
} catch (e) {
  // Fallback placeholder; methods below will no-op if module is missing.
  AsyncStorage = {
    getItem: async () => null,
    setItem: async () => {},
    removeItem: async () => {},
  };
}

const SESSION_KEY = "vivah_session";

let session = { token: null, userId: null, email: null, photoVersion: null };

export const setSession = async ({ token, userId, email, photoVersion }) => {
  session = {
    token: token || null,
    userId: userId || null,
    email: email || null,
    photoVersion: photoVersion || null,
  };
  if (AsyncStorage?.setItem) {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore persistence errors
    }
  }
};

export const getSession = () => session;

export const loadSessionFromStorage = async () => {
  if (AsyncStorage?.getItem) {
    try {
      const raw = await AsyncStorage.getItem(SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        session = {
          token: parsed?.token || null,
          userId: parsed?.userId || null,
          email: parsed?.email || null,
          photoVersion: parsed?.photoVersion || null,
        };
      }
    } catch {
      // ignore
    }
  }
  return session;
};

export const clearSession = async () => {
  session = { token: null, userId: null, email: null };
  if (AsyncStorage?.removeItem) {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch {
      // ignore
    }
  }
};

export const setPhotoVersion = async (version) => {
  session.photoVersion = version || Date.now();
  if (AsyncStorage?.setItem) {
    try {
      await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(session));
    } catch {
      // ignore
    }
  }
  return session.photoVersion;
};

export const withPhotoVersion = (url) => {
  if (!url) return url;
  const v = session.photoVersion;
  if (!v) return url;
  return `${url}${url.includes("?") ? "&" : "?"}pv=${v}`;
};

