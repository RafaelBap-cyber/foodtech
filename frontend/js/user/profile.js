
let user = null;
let donations = [];
let photo = null; 

const $ = (id) => document.getElementById(id);
const avatar = $('profile-avatar');
const nameInput = $('name');
const phoneInput = $('phone');
const editButton = $('edit-button');
const saveButton = $('save-button');
const cancelButton = $('cancel-button');
const photoInput = $('photo-input');
const photoRemove = $('photo-remove');
const photoMsg = $('photo-msg');
const profileMsg = $('profile-msg');
let msgTimer;


function showMsg(text, type) {
  clearTimeout(msgTimer);
  profileMsg.className = `form-msg ${type}`;
  profileMsg.textContent = text;
  profileMsg.hidden = false;
  
  if (type === 'ok') msgTimer = setTimeout(hideMsg, 4000);
}

function hideMsg() {
  clearTimeout(msgTimer);
  profileMsg.hidden = true;
}


const tabs = [...document.querySelectorAll('.profile-tab')];

function selectTab(tab) {
  tabs.forEach((t) => {
    const active = t === tab;
    t.classList.toggle('active', active);
    t.setAttribute('aria-selected', active);
    $(t.getAttribute('aria-controls')).hidden = !active;
  });
}

tabs.forEach((tab, i) => {
  tab.addEventListener('click', () => selectTab(tab));
  
  tab.addEventListener('keydown', (e) => {
    const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
    if (!step) return;
    e.preventDefault();
    const next = tabs[(i + step + tabs.length) % tabs.length];
    next.focus();
    selectTab(next);
  });
});


function getInitials(name) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : '')).toUpperCase();
}

function renderAvatar() {
  avatar.style.backgroundImage = photo ? `url(${photo})` : '';
  avatar.textContent = photo ? '' : getInitials(user.name);
  photoRemove.hidden = !photo;
}

function render() {
  renderAvatar();
  $('profile-display-name').textContent = user.name;
  $('profile-role').textContent = user.role === 'ong' ? 'ONG' : 'Doador';
  nameInput.value = user.name;
  $('email').value = user.email;
  phoneInput.value = user.phone;
}

function setEditing(editing) {
  
  nameInput.readOnly = !editing;
  phoneInput.readOnly = !editing;
  editButton.hidden = editing;
  saveButton.hidden = !editing;
  cancelButton.hidden = !editing;
  if (editing) nameInput.focus();
}

function validateProfile(name, phone) {
  const errors = [];
  if (name.trim().length < 3) errors.push('Nome: digite pelo menos 3 caracteres.');

  const digits = phone.replace(/\D/g, '');
  if (digits.length < 10 || digits.length > 11) {
    errors.push('Telefone: digite um telefone válido com DDD, como (19) 99999-9999.');
  }
  return errors;
}

photoInput.addEventListener('change', () => {
  const file = photoInput.files[0];
  if (!file || !user) return;
  photoMsg.hidden = true;

  if (!file.type.startsWith('image/') || file.size > 2 * 1024 * 1024) {
    photoMsg.textContent = 'Escolha uma imagem de até 2 MB.';
    photoMsg.hidden = false;
    return;
  }

  const reader = new FileReader();
  reader.onload = () => { photo = reader.result; renderAvatar(); };
  reader.readAsDataURL(file);
  photoInput.value = '';
});

photoRemove.addEventListener('click', () => { photo = null; renderAvatar(); });
editButton.addEventListener('click', () => { hideMsg(); setEditing(true); });
cancelButton.addEventListener('click', () => { render(); setEditing(false); hideMsg(); });

$('profile-form').addEventListener('submit', async (event) => {
  event.preventDefault();
  hideMsg();

  const errors = validateProfile(nameInput.value, phoneInput.value);
  if (errors.length) {
    showMsg(errors.join(' '), 'error');
    return;
  }

  saveButton.disabled = true;
  saveButton.textContent = 'Salvando...';

  try {
    user = await profileService.updateProfile({
      name: nameInput.value.trim(),
      phone: phoneInput.value.trim(),
    });
    render();
    setEditing(false);
    showMsg('Perfil atualizado com sucesso!', 'ok');
  } catch (error) {
    showMsg(error.message || 'Não foi possível salvar as alterações.', 'error');
  } finally {
    saveButton.disabled = false;
    saveButton.textContent = 'Salvar alterações';
  }
});


function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text) node.textContent = text;
  return node;
}

function renderDonations() {
  const list = $('donation-list');
  list.innerHTML = '';

  if (!donations.length) {
    list.appendChild(el('li', 'empty', 'Você ainda não fez nenhuma doação.'));
    return;
  }

  // Mesmas doações de pages/doacoes/ (FoodTechDonations).
  const chipClass = { completed: 'done', cancelled: 'cancelled' };

  donations.forEach((d) => {
    const li = el('li', 'donation');
    const info = el('div');
    const link = el('a', '', FoodTechDonations.summarizeItems(d.items));
    link.href = `../doacoes/detalhe.html?id=${encodeURIComponent(d.id)}`;
    info.append(link, el('small', '', `${d.ong_name} · ${FoodTechDonations.formatDate(d.created_at)}`));
    li.append(info, el('span', `chip ${chipClass[d.status] || 'progress'}`, FoodTechDonations.statusLabel[d.status] || d.status));
    list.appendChild(li);
  });
}


$('password-form').addEventListener('submit', (event) => {
  event.preventDefault();
  const current = $('current-password').value;
  const next = $('new-password').value;
  const confirm = $('confirm-password').value;
  const msg = $('password-msg');

  let error = '';
  if (!current) error = 'Informe sua senha atual.';
  else if (next.length < 6) error = 'A nova senha deve ter pelo menos 6 caracteres.';
  else if (next !== confirm) error = 'A confirmação não é igual à nova senha.';

  msg.className = `form-msg ${error ? 'error' : 'ok'}`;
  msg.textContent = error || 'Senha válida. A troca real será feita quando o back-end entrar.';
  msg.hidden = false;
  if (!error) event.target.reset();
});

$('logout-button').addEventListener('click', () => {
  localStorage.removeItem('token');
  FoodTechSession.end();
  window.location.href = '../auth/login.html';
});


async function loadProfile() {
  $('profile-display-name').textContent = 'Carregando perfil...';
  editButton.disabled = true;

  try {
    [user, donations] = await Promise.all([
      profileService.getProfile(),
      FoodTechDonations.list(),
    ]);
    render();
    renderDonations();
    editButton.disabled = false;
  } catch (error) {
    $('profile-display-name').textContent = 'Perfil indisponível';
    showMsg(error.message || 'Não foi possível carregar seu perfil.', 'error');
  }
}

setEditing(false);
loadProfile();
