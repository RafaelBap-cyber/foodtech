const FoodTechMap = {
  async list() {
    return FoodTechApi.request("/api/locations");
  },
};
