const FoodTechOngMap = {
  centroPadrao: [-23.5015, -47.4526],

  temCoordenadas(ong) {
  if (
    ong.latitude === null ||
    ong.latitude === undefined ||
    ong.longitude === null ||
    ong.longitude === undefined ||
    String(ong.latitude).trim() === "" ||
    String(ong.longitude).trim() === ""
  ) {
    return false;
  }

  const latitude = Number(ong.latitude);
  const longitude = Number(ong.longitude);

  return (
    Number.isFinite(latitude) &&
    Number.isFinite(longitude) &&
    latitude >= -90 &&
    latitude <= 90 &&
    longitude >= -180 &&
    longitude <= 180
  );
},

  // Cria o mapa no elemento indicado e enquadra todas as ONGs com coordenadas.
  criar(elementId, ongs) {
    const mapa = L.map(elementId);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(mapa);

    const pontos = ongs.filter((ong) => this.temCoordenadas(ong)).map((ong) => {
      const posicao = [Number(ong.latitude), Number(ong.longitude)];
      const popup = document.createElement("strong");
      popup.textContent = ong.nome;
      L.marker(posicao).addTo(mapa).bindPopup(popup);
      return posicao;
    });

    if (pontos.length) {
      mapa.fitBounds(pontos, { padding: [40, 40], maxZoom: 14 });
    } else {
      mapa.setView(this.centroPadrao, 12);
    }

    return mapa;
  },
};
