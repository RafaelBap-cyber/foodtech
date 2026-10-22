const donationController = require("../controllers/donationController");

module.exports = {
  basePath: "/api/donations",
  routes: [
    { method: "GET", path: "/", handler: donationController.list, description: "Doações do usuário logado" },
    { method: "GET", path: "/:id", handler: donationController.get, description: "Detalhe de uma doação" },
    { method: "POST", path: "/", handler: donationController.create, description: "Registro de doação (doador)" },
    { method: "PATCH", path: "/:id/status", handler: donationController.updateStatus, description: "Resposta da ONG" },
  ],
};
