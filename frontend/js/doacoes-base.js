const FoodTechDoacoesPagina = {
  // Devolve a sessão do doador, ou null se a página não deve continuar.
  iniciar() {
    const session = FoodTechSession.read();

    if (!session) {
      window.location.replace("../auth/login.html");
      return null;
    }

    document.querySelector("#user-name").textContent = session.name;
    document.querySelector("#user-role").textContent = session.profile === "ong" ? "ONG" : "Doador";

    document.querySelector("#sair").addEventListener("click", () => {
      FoodTechSession.end();
      window.location.href = "../../index.html";
    });

    // Por enquanto estas telas atendem só o fluxo do doador.
    if (session.profile !== "donor") {
      document.querySelector("#conteudo-doacoes").hidden = true;
      document.querySelector("#aviso-perfil").hidden = false;
      return null;
    }

    return session;
  },
};
