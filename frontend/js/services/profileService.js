
const API_BASE_URL = 'http://localhost:3000/api';


const USE_MOCK = true;


const mockUser = {
  name: 'Maria Silva',
  email: 'maria@exemplo.com',
  phone: '(19) 99999-9999',
  role: 'doador', 
};

const mockDonations = [
  { item: 'Alimentos não perecíveis', ong: 'ONG Esperança', date: '12/05/2025', status: 'done' },
  { item: 'Frutas e verduras', ong: 'Instituto Vida Nova', date: '03/05/2025', status: 'progress' },
  { item: 'Leite e derivados', ong: 'Projeto Recomeço', date: '25/04/2025', status: 'done' },
];

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));


async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || 'Erro ao falar com o servidor.');
  }

  return data;
}


const profileService = {
  async getProfile() {
    if (USE_MOCK) {
      await wait(400); 
      return { ...mockUser };
    }
    return request('/users/me');
  },

  async updateProfile(changes) {
    if (USE_MOCK) {
      await wait(400);
      Object.assign(mockUser, changes);
      return { ...mockUser };
    }
    return request('/users/me', { method: 'PUT', body: JSON.stringify(changes) });
  },

  async getDonations() {
    if (USE_MOCK) {
      await wait(400);
      return [...mockDonations];
    }
    return request('/users/me/donations');
  },
};
