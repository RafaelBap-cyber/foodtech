function criarElemento(tag, className, texto) {
  const elemento = document.createElement(tag);
  if (className) elemento.className = className;
  if (texto) elemento.textContent = texto;
  return elemento;
}

function renderizarLista(ongs) {
  const lista = document.querySelector("#ong-list");

  ongs.forEach((ong) => {
    const card = criarElemento("a", "map-ong-card");
    card.href = `../ong/profile.html?id=${encodeURIComponent(ong.id)}`;

    const informacoes = criarElemento("div", "map-ong-info");
    informacoes.append(
      criarElemento("h3", "", ong.nome),
      criarElemento("p", "", ong.endereco || "Endereço não informado")
    );
    (ong.alimentosAceitos || []).forEach((alimento) => {
      informacoes.appendChild(criarElemento("span", "map-tag", alimento));
    });

    card.append(criarElemento("div", "map-ong-icon", "📍"), informacoes);
    lista.appendChild(card);
  });

  document.querySelector("#ong-count").textContent = `${ongs.length} instituições`;
}

async function carregarMapa() {
  const status = document.querySelector("#status-msg");
  status.textContent = "Carregando...";
  status.hidden = false;

  try {
    const ongs = await FoodTechOngs.list();
    FoodTechOngMap.criar("mapa", ongs);
    renderizarLista(ongs);
    status.hidden = true;
  } catch (erro) {
    status.textContent = "Não foi possível carregar as ONGs.";
  }
}

carregarMapa();
