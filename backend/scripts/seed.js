// Cria dados de exemplo no Supabase: uma doadora e algumas ONGs com conta.
// Uso: node backend/scripts/seed.js
// Pode rodar mais de uma vez: o que já existe é reaproveitado, não duplicado.
const db = require("../src/config/supabase");

const SENHA = process.env.SEED_PASSWORD || "foodtech123";

const doadora = {
  email: "maria@example.com",
  name: "Maria Silva",
  phone: "(15) 98888-0000",
};

const ongs = [
  {
    email: "maoamiga@example.org",
    name: "ONG Mão Amiga",
    phone: "(15) 99999-0001",
    description: "Distribui cestas básicas para famílias da região.",
    street: "Rua das Flores", number: "100", neighborhood: "Centro",
    city: "Sorocaba", state: "SP", zip_code: "18010-000",
    latitude: -23.5015, longitude: -47.4526,
    alimentos: ["Arroz", "Feijão", "Macarrão"],
  },
  {
    email: "esperanca@example.org",
    name: "Banco de Alimentos Esperança",
    phone: "(15) 99999-0002",
    description: "Recebe alimentos perecíveis e não perecíveis.",
    street: "Av. Central", number: "250", neighborhood: "Vila Hortência",
    city: "Sorocaba", state: "SP", zip_code: "18020-000",
    latitude: -23.4969, longitude: -47.4451,
    alimentos: ["Frutas", "Verduras", "Leite"],
  },
  {
    email: "recomeco@example.org",
    name: "Projeto Recomeço",
    phone: "(15) 99999-0003",
    description: "Prepara refeições para pessoas em situação de rua.",
    street: "Rua XV de Novembro", number: "45", neighborhood: "Centro",
    city: "Sorocaba", state: "SP", zip_code: "18010-100",
    latitude: -23.5089, longitude: -47.4581,
    alimentos: ["Enlatados", "Óleo", "Açúcar", "Legumes"],
  },
];

async function buscarUsuario(email) {
  const data = await db.auth("admin/users?per_page=1000", { admin: true });
  return (data.users || []).find((user) => user.email === email);
}

async function garantirUsuario({ email, name, phone }, userType) {
  let user = await buscarUsuario(email);
  if (!user) {
    user = await db.auth("admin/users", {
      method: "POST",
      admin: true,
      body: { email, password: SENHA, email_confirm: true, user_metadata: { name } },
    });
    console.log(`  conta criada: ${email}`);
  } else {
    console.log(`  conta já existia: ${email}`);
  }

  await db.rest("profiles?on_conflict=id", {
    method: "POST",
    prefer: "resolution=merge-duplicates",
    body: { id: user.id, name, phone, user_type: userType },
  });

  return user.id;
}

async function garantirOng(ong, profileId, tiposPorNome) {
  const { email, alimentos, ...colunas } = ong;
  let [registro] = await db.rest(`ongs?select=id&profile_id=eq.${profileId}`);

  if (!registro) {
    [registro] = await db.rest("ongs", {
      method: "POST",
      prefer: "return=representation",
      body: { ...colunas, profile_id: profileId },
    });
  }

  const vinculos = alimentos.map((nome) => ({ ong_id: registro.id, food_type_id: tiposPorNome[nome] }));
  await db.rest("ong_food_types?on_conflict=ong_id,food_type_id", {
    method: "POST",
    prefer: "resolution=ignore-duplicates",
    body: vinculos,
  });
}

async function main() {
  if (!db.isConfigured()) {
    throw new Error("Preencha backend/.env com as chaves do Supabase (veja backend/.env.example).");
  }

  const tipos = await db.rest("food_types?select=id,name");
  const tiposPorNome = Object.fromEntries(tipos.map((tipo) => [tipo.name, tipo.id]));

  console.log("Doadora:");
  await garantirUsuario(doadora, "donor");

  console.log("ONGs:");
  for (const ong of ongs) {
    const profileId = await garantirUsuario(ong, "ong");
    await garantirOng(ong, profileId, tiposPorNome);
  }

  console.log(`\nPronto. Todas as contas de exemplo usam a senha "${SENHA}".`);
}

main().catch((error) => {
  console.error("Erro no seed:", error.message);
  process.exit(1);
});
