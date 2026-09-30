const donationService = require("../services/donationService");
const { sendJson } = require("../middleware");

async function list(req, res) {
  try {
    const donations = await donationService.listDonations();
    sendJson(res, 200, { ok: true, donations });
  } catch (error) {
    sendJson(res, error.status || 500, { ok: false, message: error.message });
  }
}

module.exports = { list };
