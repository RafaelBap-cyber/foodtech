const foodTypeService = require("../services/foodTypeService");
const { sendJson, handle } = require("../middleware");

const listar = handle(async (req, res) => {
  const foodTypes = await foodTypeService.listarTipos();
  sendJson(res, 200, { ok: true, foodTypes });
});

module.exports = { listar };
