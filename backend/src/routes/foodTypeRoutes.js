const foodTypeController = require("../controllers/foodTypeController");

module.exports = {
  basePath: "/api/food-types",
  routes: [
    { method: "GET", path: "/", handler: foodTypeController.listar, description: "Tipos de alimento" },
  ],
};
