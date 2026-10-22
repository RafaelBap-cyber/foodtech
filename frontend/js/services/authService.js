const FoodTechAuth = {
  validate({ email, password }) {
    const errors = {};

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "Informe um e-mail válido.";
    }

    if (!password || password.length < 6) {
      errors.password = "A senha precisa ter pelo menos 6 caracteres.";
    }

    return errors;
  },

  validateRegister({ name, email, phone, password }) {
    const errors = this.validate({ email, password });

    if (!name || name.trim().length < 3) {
      errors.name = "Informe seu nome completo.";
    }

    const digits = (phone || "").replace(/\D/g, "");
    if (digits.length < 10 || digits.length > 11) {
      errors.phone = "Informe um telefone com DDD.";
    }

    return errors;
  },

  // Entra e já guarda a sessão. Devolve a sessão criada.
  async login({ email, password }) {
    const data = await FoodTechApi.request("/api/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    return FoodTechSession.start(data);
  },

  // dados: { userType: "donor" | "ong", name, email, phone, password, ong? }
  async register(dados) {
    const data = await FoodTechApi.request("/api/auth/register", {
      method: "POST",
      body: JSON.stringify(dados),
    });
    return FoodTechSession.start(data);
  },
};
