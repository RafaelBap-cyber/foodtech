
function criarElemento(tag, className, texto) {
  const elemento = document.createElement(tag);
  if (className) elemento.className = className;
  if (texto) elemento.textContent = texto;
  return elemento;
}

let todasAsOngs = [];
let mapaAtual = null;

function renderizarLista(ongs) {
  const lista = document.querySelector("#ong-list");
  lista.replaceChildren();

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

  document.querySelector("#ong-count").textContent =
    `${ongs.length} ${ongs.length === 1 ? "instituição" : "instituições"}`;
}

function renderizarMapa(ongs) {
  if (mapaAtual) {
    mapaAtual.remove();
  }

  mapaAtual = FoodTechOngMap.criar("mapa", ongs);
}

function exibirOngs(ongs) {
  renderizarMapa(ongs);
  renderizarLista(ongs);
}

function filtrarPorAlimento() {
  const campo = document.querySelector("#filtro-alimento");
  const alimento = campo.value.trim().toLocaleLowerCase("pt-BR");

  if (!alimento) {
    exibirOngs(todasAsOngs);
    return;
  }

  const resultado = todasAsOngs.filter((ong) =>
    (ong.alimentosAceitos || []).some((item) =>
      String(item).toLocaleLowerCase("pt-BR").includes(alimento)
    )
  );

  exibirOngs(resultado);
}

function limparFiltro() {
  document.querySelector("#filtro-alimento").value = "";
  exibirOngs(todasAsOngs);
}

async function carregarMapa() {
  const status = document.querySelector("#status-msg");
  status.textContent = "Carregando...";
  status.hidden = false;

  try {
    todasAsOngs = await FoodTechOngs.list();

    if (!Array.isArray(todasAsOngs)) {
      throw new Error("A API não retornou uma lista de ONGs.");
    }

    exibirOngs(todasAsOngs);
    status.hidden = true;
  } catch (erro) {
    console.error("Erro ao carregar as ONGs:", erro);
    status.textContent = "Não foi possível carregar as ONGs.";
    status.hidden = false;
  }
}

document
  .querySelector("#btn-filtrar-alimento")
  .addEventListener("click", filtrarPorAlimento);

document
  .querySelector("#btn-limpar-filtro")
  .addEventListener("click", limparFiltro);

document
  .querySelector("#filtro-alimento")
  .addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") {
      filtrarPorAlimento();
    }
  });

carregarMapa();

