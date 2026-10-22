const authController = require("../controllers/authController");

module.exports = {
  basePath: "/api/auth",
  routes: [
    { method: "POST", path: "/register", handler: authController.register, description: "Cadastro de doador ou ONG" },
    { method: "POST", path: "/login", handler: authController.login, description: "Login" },
    { method: "GET", path: "/me", handler: authController.me, description: "Dados do usuário logado" },
    { method: "PUT", path: "/me", handler: authController.updateMe, description: "Atualiza nome e telefone" },
    { method: "PUT", path: "/password", handler: authController.changePassword, description: "Troca de senha" },
  ],
};
