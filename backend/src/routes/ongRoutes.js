const ongController = require("../controllers/ongController");

module.exports = {
  basePath: "/api/ongs",
  routes: [
    { method: "GET", path: "/", handler: ongController.listar, description: "Listagem de ONGs" },
    { method: "GET", path: "/:id", handler: ongController.buscar, description: "Detalhe de uma ONG" },
    { method: "POST", path: "/", handler: ongController.cadastrar, description: "Cadastro de ONG" },
    { method: "PUT", path: "/:id", handler: ongController.atualizar, description: "Atualização de ONG" },
  ],
};
