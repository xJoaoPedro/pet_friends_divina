import { supabase, getSession } from './supabase.js';

const form = document.getElementById('passwordForm');
const message = document.getElementById('authMessage');

// o link do email abre esta página já com uma sessão de recuperação
if (!supabase || !(await getSession())) {
    form.hidden = true;
    showMessage('Este link é inválido ou expirou. Peça um novo na <a href="login.html">página de login</a>.', 'error');
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { password, confirm } = Object.fromEntries(new FormData(form));

    if (password !== confirm) {
        showMessage('As senhas não são iguais.', 'error');
        return;
    }

    const button = form.querySelector('[type="submit"]');
    button.disabled = true;

    const { error } = await supabase.auth.updateUser({ password });
    button.disabled = false;

    if (error) {
        console.error(error);
        showMessage('Não foi possível trocar a senha. Use pelo menos 6 caracteres e tente de novo.', 'error');
        return;
    }

    form.hidden = true;
    showMessage('Senha alterada! <a href="index.html">Voltar para o início</a>.', 'success');
});

function showMessage(html, type) {
    message.innerHTML = html;
    message.className = `formMessage ${type}`;
    message.hidden = false;
}
