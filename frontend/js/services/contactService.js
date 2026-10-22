const FoodTechContact = {
  async list() {
    return FoodTechApi.request("/api/messages");
  },
};
