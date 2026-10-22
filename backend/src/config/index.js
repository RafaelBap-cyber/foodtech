const path = require("path");

const port = Number(process.env.PORT) || 3000;
const staticRoot = path.resolve(__dirname, "../../../frontend");

module.exports = { port, staticRoot };
