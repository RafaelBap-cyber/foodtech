const donationController = require("../controllers/donationController");

module.exports = {
  basePath: "/api/donations",
  routes: [
    { method: "GET", path: "/", handler: donationController.list, description: "Listagem de doações" },
  ],
};
