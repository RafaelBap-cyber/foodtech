const FoodTechContact = {
  maxLength: 1000,

  // Uma entrada por contato, com a última mensagem.
  async conversations() {
    const data = await FoodTechApi.request("/api/messages");
    return data.conversations;
  },

  // { with: { id, name, profile, ongId }, messages: [...] }
  async conversation(profileId) {
    return FoodTechApi.request(`/api/messages/${encodeURIComponent(profileId)}`);
  },

  async send(profileId, content, donationId) {
    const data = await FoodTechApi.request("/api/messages", {
      method: "POST",
      body: JSON.stringify({ receiver_id: profileId, content, donation_id: donationId || null }),
    });
    return data.message;
  },

  // Link para abrir (ou começar) a conversa com alguém no painel.
  link(profileId, base = "../painel/index.html") {
    return `${base}?conversa=${encodeURIComponent(profileId)}#mensagens`;
  },
};
