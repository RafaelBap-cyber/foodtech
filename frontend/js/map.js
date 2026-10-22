const ongs = [
  {
    id: 1,
    nome: "ONG Exemplo",
    latitude: -22.9056,
    longitude: -47.0608,
    endereco: "Campinas, SP",
    alimentos: "Frutas e verduras",
  },
  {
    id: 2,
    nome: "ONG Esperança",
    latitude: -22.9005,
    longitude: -47.055,
    endereco: "Campinas, SP",
    alimentos: "Pães e alimentos não perecíveis",
  },
  {
    id: 3,
    nome: "ONG Solidária",
    latitude: -22.915,
    longitude: -47.065,
    endereco: "Campinas, SP",
    alimentos: "Leite e produtos básicos",
  },
];

const centro = [-22.9056, -47.0608];

function temCoordenadas(ong) {
  return (
    ong.latitude !== null &&
    ong.longitude !== null &&
    Number.isFinite(Number(ong.latitude)) &&
    Number.isFinite(Number(ong.longitude))
  );
}

function criarMapa() {
  const mapa = L.map("mapa").setView(centro, 13);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap",
  }).addTo(mapa);

  ongs.filter(temCoordenadas).forEach((ong) => {
    L.marker([Number(ong.latitude), Number(ong.longitude)])
      .addTo(mapa)
      .bindPopup(ong.nome);
  });
}

function criarElemento(tag, className, texto) {
  const elemento = document.createElement(tag);
  if (className) elemento.className = className;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function renderizarLista() {
  const lista = document.querySelector("#ong-list");

  ongs.forEach((ong) => {
    const card = criarElemento("article", "map-ong-card");
    const informacoes = criarElemento("div", "map-ong-info");

    informacoes.append(
      criarElemento("h3", "", ong.nome),
      criarElemento("p", "", ong.endereco),
      criarElemento("span", "map-tag", ong.alimentos)
    );
    card.append(criarElemento("div", "map-ong-icon", "📍"), informacoes);
    lista.appendChild(card);
  });

  document.querySelector("#ong-count").textContent = `${ongs.length} instituições`;
}

criarMapa();
renderizarLista();
