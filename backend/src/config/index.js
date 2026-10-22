const path = require("path");

// Localmente as chaves ficam em backend/.env; na Vercel, nas variáveis de ambiente do projeto.
try {
  process.loadEnvFile(path.resolve(__dirname, "../../.env"));
} catch {
  // Sem .env: segue com as variáveis que já estiverem no ambiente.
}

const port = Number(process.env.PORT) || 3000;
const staticRoot = path.resolve(__dirname, "../../../frontend");

const supabase = {
  url: (process.env.SUPABASE_URL || "").replace(/\/$/, ""),
  anonKey: process.env.SUPABASE_ANON_KEY || "",
  serviceKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
};

module.exports = { port, staticRoot, supabase };
