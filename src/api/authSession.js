let session = { token: null, userId: null, email: null };

export const setSession = ({ token, userId, email }) => {
  session = { token: token || null, userId: userId || null, email: email || null };
};

export const getSession = () => session;

export const clearSession = () => {
  session = { token: null, userId: null, email: null };
};

