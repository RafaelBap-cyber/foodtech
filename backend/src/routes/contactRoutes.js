const contactController = require("../controllers/contactController");

module.exports = {
  basePath: "/api/messages",
  routes: [
    { method: "GET", path: "/", handler: contactController.list, description: "Conversas do usuário logado" },
    { method: "GET", path: "/:profileId", handler: contactController.conversation, description: "Mensagens com um contato" },
    { method: "POST", path: "/", handler: contactController.send, description: "Envio de mensagem entre doador e ONG" },
  ],
};
