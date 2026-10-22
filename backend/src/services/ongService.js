const ongs = [
  {
    id: 1,
    nome: "ONG Mão Amiga",
    email: "contato@maoamiga.org",
    telefone: "(15) 99999-0001",
    endereco: "Rua das Flores, 100, Sorocaba - SP",
    latitude: -23.5015,
    longitude: -47.4526,
    descricao: "Distribui cestas básicas para famílias da região.",
    alimentosAceitos: ["arroz", "feijão", "macarrão"],
  },
  {
    id: 2,
    nome: "Banco de Alimentos Esperança",
    email: "contato@esperanca.org",
    telefone: "(15) 99999-0002",
    endereco: "Av. Central, 250, Sorocaba - SP",
    latitude: -23.4969,
    longitude: -47.4451,
    descricao: "Recebe alimentos perecíveis e não perecíveis.",
    alimentosAceitos: ["frutas", "verduras", "leite"],
  },
];

function listarOngs(alimento) {
  if (!alimento) return ongs.slice();

  const termo = alimento.toLowerCase();
  return ongs.filter((ong) =>
    ong.alimentosAceitos.some((item) => item.toLowerCase() === termo)
  );
}

function buscarOngPorId(id) {
  return ongs.find((ong) => ong.id === Number(id));
}

function cadastrarOng(dados) {
  const semSenha = { ...dados };
  delete semSenha.senha;
  const nova = { id: ongs.length + 1, ...semSenha };
  ongs.push(nova);
  return nova;
}

function atualizarOng(id, dados) {
  const ong = buscarOngPorId(id);
  if (!ong) return undefined;
  Object.assign(ong, dados);
  return ong;
}

module.exports = { listarOngs, buscarOngPorId, cadastrarOng, atualizarOng };
