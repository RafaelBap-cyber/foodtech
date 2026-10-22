const FoodTechOngs = {
  async list(alimento) {
    const query = alimento ? `?alimento=${encodeURIComponent(alimento)}` : "";
    const data = await FoodTechApi.request(`/api/ongs${query}`);
    return data.ongs;
  },

  async get(id) {
    const data = await FoodTechApi.request(`/api/ongs/${encodeURIComponent(id)}`);
    return data.ong;
  },
};
