const form = document.getElementById('login-form');
const errorMessage = document.getElementById('login-error');


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

form.addEventListener('submit', function (event) {
  event.preventDefault();
  hideError();

  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;

  const validationError = validate(email, password);

  if (validationError) {
    showError(validationError);
    return;
  }

  // A chamada para o back-end (authService.js) será adicionada
  // em uma próxima etapa.
  console.log('Formulário válido, pronto para enviar:', { email, password });
});
