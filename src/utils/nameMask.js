export const maskName = (firstName, lastName) => {
  const f = (firstName || "").trim();
  const l = (lastName || "").trim();

  const mask = (s) => (s ? `${s[0].toUpperCase()}.....` : "");

  const parts = [];
  const mf = mask(f);
  const ml = mask(l);
  if (mf) parts.push(mf);
  if (ml) parts.push(ml);

  if (!parts.length) {
    return "User";
  }
  return parts.join(" ");
};

