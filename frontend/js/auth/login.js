const form = document.getElementById('login-form');
const errorMessage = document.getElementById('login-error');
const submitButton = form.querySelector('button[type="submit"]');


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function showError(message) {
  errorMessage.textContent = message;
  errorMessage.hidden = false;
}

function hideError() {
  errorMessage.textContent = '';
  errorMessage.hidden = true;
}

function validate(email, password) {
  if (!email.trim()) {
    return 'Informe seu e-mail.';
  }

  if (!EMAIL_REGEX.test(email)) {
    return 'Informe um e-mail válido.';
  }

  if (!password) {
    return 'Informe sua senha.';
  }

  if (password.length < 6) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }

  return null;
}

form.addEventListener('submit', async function (event) {
  event.preventDefault();
  hideError();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const validationError = validate(email, password);

  if (validationError) {
    showError(validationError);
    return;
  }

  submitButton.disabled = true;
  submitButton.textContent = 'Entrando...';

  try {
    await FoodTechAuth.login({ email: email.trim(), password });
    window.location.href = '../painel/index.html';
  } catch (error) {
    showError(error.message || 'Não foi possível entrar. Tente novamente.');
    submitButton.disabled = false;
    submitButton.textContent = 'Entrar';
  }
});
