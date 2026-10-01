const FoodTechSession = {
  key: "foodtech-session",

  start({ email, profile }) {
    const name = email.split("@")[0];
    const session = { email, profile, name };
    sessionStorage.setItem(this.key, JSON.stringify(session));
    return session;
  },

  read() {
    const raw = sessionStorage.getItem(this.key);
    if (!raw) return null;

    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  end() {
    sessionStorage.removeItem(this.key);
  },
};
