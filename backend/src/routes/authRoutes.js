const authController = require("../controllers/authController");

module.exports = {
  basePath: "/api/auth",
  routes: [
    { method: "POST", path: "/login", profile: "donor", handler: authController.login, description: "Login de usuário" },
  ],
};
