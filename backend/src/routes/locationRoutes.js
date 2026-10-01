const locationController = require("../controllers/locationController");

module.exports = {
  basePath: "/api/locations",
  routes: [
    { method: "GET", path: "/", handler: locationController.list, description: "Localização das ONGs para o mapa" },
  ],
};
