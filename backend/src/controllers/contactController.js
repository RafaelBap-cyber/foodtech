const contactService = require("../services/contactService");
const { sendJson } = require("../middleware");

async function list(req, res) {
  try {
    const messages = await contactService.listMessages();
    sendJson(res, 200, { ok: true, messages });
  } catch (error) {
    sendJson(res, error.status || 500, { ok: false, message: error.message });
  }
}

module.exports = { list };
