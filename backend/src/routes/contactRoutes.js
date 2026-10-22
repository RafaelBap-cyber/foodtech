const contactController = require("../controllers/contactController");

module.exports = {
  basePath: "/api/messages",
  routes: [
    { method: "GET", path: "/", handler: contactController.list, description: "Mensagens entre doador e ONG" },
  ],
};
