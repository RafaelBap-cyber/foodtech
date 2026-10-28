
function criarElemento(tag, className, texto) {
  const elemento = document.createElement(tag);
  if (className) elemento.className = className;
  if (texto) elemento.textContent = texto;
  return elemento;
}

let todasAsOngs = [];
let mapaAtual = null;
let localizacaoUsuario = null;
let distanciaMaxima = null;
let alimentoSelecionado = "";


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

    // Mostra a distância quando a localização do usuário está disponível.
    if (localizacaoUsuario && FoodTechOngMap.temCoordenadas(ong)) {
      const distancia = calcularDistanciaKm(
        localizacaoUsuario.latitude,
        localizacaoUsuario.longitude,
        Number(ong.latitude),
        Number(ong.longitude)
      );

      informacoes.appendChild(
        criarElemento(
          "p",
          "map-ong-distance",
          `📍 Distância: ${distancia.toLocaleString("pt-BR", {
            maximumFractionDigits: 1,
          })} km`
        )
      );
    }

    (ong.alimentosAceitos || []).forEach((alimento) => {
      informacoes.appendChild(
        criarElemento("span", "map-tag", alimento)
      );
    });

    card.append(
      criarElemento("div", "map-ong-icon", "📍"),
      informacoes
    );

    lista.appendChild(card);
  });

  const contador = document.querySelector("#ong-count");

  if (contador) {
    contador.textContent =
      `${ongs.length} ${ongs.length === 1 ? "instituição" : "instituições"}`;
  }
}



function renderizarMapa(ongs) {
  if (mapaAtual) {
    mapaAtual.remove();
  }

  mapaAtual = FoodTechOngMap.criar("mapa", ongs);
}

function calcularDistanciaKm(lat1, lon1, lat2, lon2) {
  const raioTerraKm = 6371;
  const radianos = (graus) => (graus * Math.PI) / 180;

  const diferencaLat = radianos(lat2 - lat1);
  const diferencaLon = radianos(lon2 - lon1);

  const a =
    Math.sin(diferencaLat / 2) ** 2 +
    Math.cos(radianos(lat1)) *
      Math.cos(radianos(lat2)) *
      Math.sin(diferencaLon / 2) ** 2;

  return 2 * raioTerraKm * Math.asin(Math.sqrt(a));
}

function obterOngsFiltradas() {
  let resultado = todasAsOngs;

  if (alimentoSelecionado) {
    resultado = resultado.filter((ong) =>
      (ong.alimentosAceitos || []).some((item) =>
        String(item)
          .toLocaleLowerCase("pt-BR")
          .includes(alimentoSelecionado)
      )
    );
  }

  if (distanciaMaxima !== null && localizacaoUsuario) {
    resultado = resultado.filter((ong) => {
      if (!FoodTechOngMap.temCoordenadas(ong)) {
        return false;
      }

      const distancia = calcularDistanciaKm(
        localizacaoUsuario.latitude,
        localizacaoUsuario.longitude,
        Number(ong.latitude),
        Number(ong.longitude)
      );

      console.log("ONG:", ong.nome);
      console.log("Coordenadas da ONG:", ong.latitude, ong.longitude);
      console.log("Sua localização:", localizacaoUsuario);
      console.log("Distância calculada:", distancia, "km");







      return distancia <= distanciaMaxima;
    });
  }

  return resultado;
}


function atualizarExibicao() {
  const resultado = obterOngsFiltradas();

  renderizarMapa(resultado);
  renderizarLista(resultado);

  const lista = document.querySelector("#ong-list");

  if (resultado.length === 0) {
    const mensagem = criarElemento(
      "p",
      "map-empty-message",
      distanciaMaxima !== null
        ? `Nenhuma ONG encontrada em até ${distanciaMaxima} km. Tente aumentar a distância ou limpar o filtro.`
        : "Nenhuma ONG encontrada para esse filtro."
    );

    lista.appendChild(mensagem);
  }
}



function filtrarPorAlimento() {
  alimentoSelecionado = document
    .querySelector("#filtro-alimento")
    .value.trim()
    .toLocaleLowerCase("pt-BR");

  atualizarExibicao();
}

function limparFiltro() {
  document.querySelector("#filtro-alimento").value = "";
  alimentoSelecionado = "";
  atualizarExibicao();
}

function mostrarStatusDistancia(mensagem, erro = false) {
  const status = document.querySelector("#status-distancia");
  status.textContent = mensagem;
  status.hidden = false;
  status.style.color = erro ? "#b42318" : "";
}

function filtrarPorDistancia() {
  const campo = document.querySelector("#filtro-distancia");
  const status = document.querySelector("#status-distancia");
  const valor = Number(campo.value);

  if (!campo.value || !Number.isFinite(valor) || valor <= 0) {
    mostrarStatusDistancia("Selecione uma distância para continuar.", true);
    return;
  }

  if (!navigator.geolocation) {
    mostrarStatusDistancia(
      "Seu navegador não oferece suporte à localização.",
      true
    );
    return;
  }
  mostrarStatusDistancia("Obtendo sua localização...");
  console.log("Iniciando solicitação de localização...");
  navigator.geolocation.getCurrentPosition(
    (posicao) => {
      console.log("Localização obtida:", posicao.coords.latitude, posicao.coords.longitude);
      localizacaoUsuario = {
        latitude: posicao.coords.latitude,
        longitude: posicao.coords.longitude,
      };
      distanciaMaxima = valor;
      atualizarExibicao();
      mostrarStatusDistancia(
        `Exibindo ONGs em até ${valor} km da sua localização.`
      );
    },
    (erro) => {
      console.log("Erro de localização recebido:", erro.code, erro.message);
      console.error("Erro ao obter localização:", erro);
      const mensagens = {
        1: "Permita o acesso à localização no navegador para usar este filtro.",
        2: "Não foi possível determinar sua localização. Tente novamente.",
        3: "A solicitação de localização demorou demais. Tente novamente.",
      };
      mostrarStatusDistancia(
        mensagens[erro.code] || "Não foi possível obter sua localização.",
        true
      );
    },
    {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 60000,
    }
  );
}

function limparFiltroDistancia() {
  document.querySelector("#filtro-distancia").value = "";
  localizacaoUsuario = null;
  distanciaMaxima = null;

  const status = document.querySelector("#status-distancia");
  status.textContent = "";
  status.hidden = true;
  atualizarExibicao();
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

    atualizarExibicao();
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

document
  .querySelector("#btn-filtrar-distancia")
  .addEventListener("click", filtrarPorDistancia);

document
  .querySelector("#btn-limpar-distancia")
  .addEventListener("click", limparFiltroDistancia);

carregarMapa();
