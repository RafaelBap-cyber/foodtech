const db = require("../config/supabase");

// Mesmos tipos do seed do supabase/schema.sql; usados sem Supabase configurado.
const mockFoodTypes = [
  "Arroz", "Feijão", "Macarrão", "Leite", "Óleo", "Farinha", "Açúcar",
  "Frutas", "Verduras", "Legumes", "Carnes", "Enlatados", "Outros",
].map((name, index) => ({ id: `ft-${index + 1}`, name }));

async function listarTipos() {
  if (!db.isConfigured()) return mockFoodTypes.slice();
  return db.rest("food_types?select=id,name&order=name");
}

module.exports = { listarTipos };
