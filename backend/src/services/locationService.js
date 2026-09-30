async function listLocations() {
  const error = new Error("Consulta de localizações ainda não implementada.");
  error.status = 501;
  throw error;
}

module.exports = { listLocations };
