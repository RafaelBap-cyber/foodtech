const locationService = require("../services/locationService");
const { sendJson } = require("../middleware");

async function list(req, res) {
  try {
    const locations = await locationService.listLocations();
    sendJson(res, 200, { ok: true, locations });
  } catch (error) {
    sendJson(res, error.status || 500, { ok: false, message: error.message });
  }
}

module.exports = { list };
