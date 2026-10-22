const tabs = document.querySelectorAll('.register-tab');
const roleInput = document.getElementById('role');
const form = document.getElementById('register-form');
const errorsBox = document.getElementById('register-errors');
const errorsList = document.getElementById('register-errors-list');


const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


function showErrors(errors) {
  errorsList.innerHTML = '';

  errors.forEach(({ field, message }) => {
    const item = document.createElement('li');
    item.textContent = message;
    errorsList.appendChild(item);

    const wrapper = document.getElementById(field).closest('.register-input-wrapper');
    wrapper.classList.add('invalid');
  });

  errorsBox.hidden = false;
}

function hideErrors() {
  errorsList.innerHTML = '';
  errorsBox.hidden = true;

  document.querySelectorAll('.register-input-wrapper.invalid').forEach((wrapper) => {
    wrapper.classList.remove('invalid');
  });
}


function validate({ name, email, phone, password }) {
  const errors = [];

  if (name.trim().length < 3) {
    errors.push({ field: 'name', message: 'Nome: digite pelo menos 3 caracteres.' });
  }

  if (!EMAIL_REGEX.test(email.trim())) {
    errors.push({
      field: 'email',
      message: 'E-mail: digite um e-mail válido, como nome@dominio.com.',
    });
  }

  
  const phoneDigits = phone.replace(/\D/g, '');

  
  if (phoneDigits.length < 10 || phoneDigits.length > 11) {
    errors.push({
      field: 'phone',
      message: 'Telefone: digite um telefone válido com DDD, como (19) 99999-9999.',
    });
  }

  if (password.length < 8) {
    errors.push({
      field: 'password',
      message: 'Senha: a senha precisa ter pelo menos 8 caracteres.',
    });
  }

  return errors;
}

tabs.forEach((tab) => {
  tab.addEventListener('click', function () {
    
    tabs.forEach((t) => {
      t.classList.remove('active');
      t.setAttribute('aria-selected', 'false');
    });

    
    tab.classList.add('active');
    tab.setAttribute('aria-selected', 'true');

   
    roleInput.value = tab.dataset.role;
  });
});

form.addEventListener('submit', function (event) {
  event.preventDefault();
  hideErrors();

  const data = {
    role: roleInput.value,
    name: document.getElementById('name').value,
    email: document.getElementById('email').value,
    phone: document.getElementById('phone').value,
    password: document.getElementById('password').value,
  };

  const errors = validate(data);

  if (errors.length > 0) {
    showErrors(errors);
    return;
  }

  console.log('Cadastro válido, pronto para enviar:', data);
});
