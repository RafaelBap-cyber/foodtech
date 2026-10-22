const ongController = require("../controllers/ongController");

// O cadastro de ONG acontece junto com a criação da conta (/api/auth/register).
module.exports = {
  basePath: "/api/ongs",
  routes: [
    { method: "GET", path: "/", handler: ongController.listar, description: "Listagem de ONGs" },
    { method: "GET", path: "/:id", handler: ongController.buscar, description: "Detalhe de uma ONG" },
  ],
};
