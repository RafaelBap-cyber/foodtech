const FoodTechDonations = {
  async list() {
    return FoodTechApi.request("/api/donations");
  },
};
