const authService = require("../services/authService");
const { sendJson } = require("../middleware");

async function login(req, res) {
  try {
    await authService.loginDonor();
  } catch (error) {
    sendJson(res, error.status || 500, { ok: false, message: error.message });
  }
}

module.exports = { login };
