// Dados da conta logada (/api/auth/me), no formato usado por js/user/profile.js.
function toProfile(user) {
  return {
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.profile === 'ong' ? 'ong' : 'doador',
  };
}

const profileService = {
  async getProfile() {
    const data = await FoodTechApi.request('/api/auth/me');
    return toProfile(data.user);
  },

  async updateProfile(changes) {
    const data = await FoodTechApi.request('/api/auth/me', {
      method: 'PUT',
      body: JSON.stringify(changes),
    });
    return toProfile(data.user);
  },

  async changePassword(currentPassword, newPassword) {
    return FoodTechApi.request('/api/auth/password', {
      method: 'PUT',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  },
};
