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

  login({ email, profile }) {
    const profileLabel = profile === "ong" ? "ONG" : "doador";

    return {
      ok: true,
      email,
      profile,
      profileLabel,
    };
  },

  validateRegister({ name, email, phone, password }) {
    const errors = this.validate({ email, password });

    if (!name || name.trim().length < 3) {
      errors.name = "Informe seu nome completo.";
    }

    const digits = (phone || "").replace(/\D/g, "");
    if (digits.length < 10) {
      errors.phone = "Informe um telefone com DDD.";
    }

    return errors;
  },

  register({ name, profile }) {
    const profileLabel = profile === "ong" ? "ONG" : "doador";

    return {
      ok: false,
      name,
      profile,
      message: `Dados conferidos para o cadastro de ${profileLabel}. A criação da conta será ligada ao serviço de autenticação.`,
    };
  },
};
