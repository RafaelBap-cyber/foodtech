const FoodTechOngMap = {
  centroPadrao: [-23.5015, -47.4526],

  temCoordenadas(ong) {
    return (
      ong.latitude !== null &&
      ong.longitude !== null &&
      Number.isFinite(Number(ong.latitude)) &&
      Number.isFinite(Number(ong.longitude))
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
