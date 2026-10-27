const FoodTechOngs = {
  async list(alimento) {
    const query = alimento ? `?alimento=${encodeURIComponent(alimento)}` : "";
    const data = await FoodTechApi.request(`/api/ongs${query}`);
console.log("Resposta completa da API:", data);
return data.ongs;

  },

  async get(id) {
    const data = await FoodTechApi.request(`/api/ongs/${id}`);
    return data.ong;
  },

  async create(dados) {
    const data = await FoodTechApi.request("/api/ongs", {
      method: "POST",
      body: JSON.stringify(dados),
    });
    return data.ong;
  },

  async update(id, dados) {
    const data = await FoodTechApi.request(`/api/ongs/${id}`, {
      method: "PUT",
      body: JSON.stringify(dados),
    });
    return data.ong;
  },
};
