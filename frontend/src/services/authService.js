const authService = (() => {

  const API_BASE_URL = 'http://localhost:3000/api';

 
  const USE_MOCK = true;


  const MOCK_LOGIN = { email: 'maria@exemplo.com', password: '123456' };

  const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  async function request(path, options = {}) {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: { 'Content-Type': 'application/json' },
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || 'Erro ao falar com o servidor.');
    }

    return data;
  }

  return {
    async login(email, password) {
      if (USE_MOCK) {
        await wait(400);
        if (email !== MOCK_LOGIN.email || password !== MOCK_LOGIN.password) {
          throw new Error('E-mail ou senha inválidos.');
        }
        localStorage.setItem('token', 'token-de-exemplo');
        return { token: 'token-de-exemplo' };
      }

      const data = await request('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      localStorage.setItem('token', data.token);
      return data;
    },

    
    async register(dados) {
      if (USE_MOCK) {
        await wait(400);
        
        return { message: 'Cadastro realizado com sucesso.' };
      }

      return request('/auth/register', {
        method: 'POST',
        body: JSON.stringify(dados),
      });
    },

    logout() {
      localStorage.removeItem('token');
    },

    getToken() {
      return localStorage.getItem('token');
    },

    isAuthenticated() {
      return !!localStorage.getItem('token');
    },

    
    requireAuth(loginUrl = '../auth/login.html') {
      if (!this.isAuthenticated()) {
        window.location.href = loginUrl;
      }
    },
  };
})();
