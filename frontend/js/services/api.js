const FoodTechApi = {
  async request(path, options = {}) {
    const session = typeof FoodTechSession !== "undefined" ? FoodTechSession.read() : null;

    const response = await fetch(path, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
        ...(options.headers || {}),
      },
    });

    const data = await response.json().catch(() => ({}));

    // Token vencido ou inválido: encerra a sessão e volta para o login.
    if (response.status === 401 && session) {
      FoodTechSession.end();
      window.location.href = "/pages/auth/login.html";
    }

    if (!response.ok) {
      const error = new Error(data.message || "Não foi possível concluir a solicitação.");
      error.status = response.status;
      throw error;
    }

    return data;
  },
};
