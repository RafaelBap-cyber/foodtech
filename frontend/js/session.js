const FoodTechSession = {
  key: "foodtech-session",

  // Recebe a resposta de /api/auth/login ou /api/auth/register.
  start({ token, user }) {
    const session = {
      token,
      userId: user.id,
      email: user.email,
      name: user.name,
      profile: user.profile,
      ongId: user.ongId || null,
    };
    sessionStorage.setItem(this.key, JSON.stringify(session));
    return session;
  },

  read() {
    const raw = sessionStorage.getItem(this.key);
    if (!raw) return null;

    try {
      const session = JSON.parse(raw);
      // Sessões antigas (do login de mentira) não têm token.
      return session && session.token ? session : null;
    } catch {
      return null;
    }
  },

  end() {
    sessionStorage.removeItem(this.key);
  },
};
