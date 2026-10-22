const FoodTechApi = {
  async request(path, options = {}) {
    const response = await fetch(path, {
      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {}),
      },
      ...options,
    });

    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
      const error = new Error(data.message || "Não foi possível concluir a solicitação.");
      error.status = response.status;
      throw error;
    }

    return data;
  },
};
