import { supabase, getSession, isConfigured } from './supabase.js';
import { escapeHtml } from './animals.js';

const params = new URLSearchParams(window.location.search);
// só aceita páginas do próprio site, para o ?next= não virar um redirecionamento para fora
const next = /^[a-z0-9-]+\.html([?#].*)?$/i.test(params.get('next') || '') ? params.get('next') : 'index.html';
const baseUrl = new URL('.', window.location.href).href;
// o link do email e o retorno do Google voltam para cá, que então segue para a página de origem
const returnUrl = `${baseUrl}login.html?next=${encodeURIComponent(next)}`;

const tabs = document.querySelectorAll('.authTab');
const loginForm = document.getElementById('loginForm');
const signupForm = document.getElementById('signupForm');
const googleButton = document.getElementById('googleButton');
const forgotButton = document.getElementById('forgotButton');
const message = document.getElementById('authMessage');

const errorMessages = {
    'Invalid login credentials': 'Email ou senha incorretos.',
    'Email not confirmed': 'Confirme seu email antes de entrar. O link está na sua caixa de entrada.',
    'User already registered': 'Já existe uma conta com esse email.',
    'Password should be at least 6 characters.': 'A senha precisa ter pelo menos 6 caracteres.',
    'Email rate limit exceeded': 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
    'email rate limit exceeded': 'Muitas tentativas seguidas. Aguarde alguns minutos e tente de novo.',
};

if (!isConfigured) {
    showMessage('O login ainda não está disponível. Tente novamente mais tarde.', 'error');
    document.querySelectorAll('.authCard button, .authCard input').forEach((field) => { field.disabled = true; });
} else {
    if (await getSession()) window.location.replace(next);

    // chegada pelo link de confirmação do email ou pelo retorno do Google
    supabase.auth.onAuthStateChange((event) => {
        if (event === 'SIGNED_IN') window.location.replace(next);
    });
}

tabs.forEach((tab) => tab.addEventListener('click', () => showTab(tab.dataset.tab)));

// o botão "Criar conta" da home abre direto na aba de cadastro
if (params.get('aba') === 'cadastro') showTab('signup');

function showTab(name) {
    tabs.forEach((tab) => tab.setAttribute('aria-selected', tab.dataset.tab === name));
    loginForm.hidden = name !== 'login';
    signupForm.hidden = name !== 'signup';
    hideMessage();
}

loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { email, password } = Object.fromEntries(new FormData(loginForm));

    await withLoading(loginForm, async () => {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) showError(error);
    });
});

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const { name, email, password, confirm } = Object.fromEntries(new FormData(signupForm));

    if (password !== confirm) {
        showMessage('As senhas não são iguais.', 'error');
        return;
    }

    await withLoading(signupForm, async () => {
        const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: { data: { full_name: name.trim() }, emailRedirectTo: returnUrl },
        });

        if (error) return showError(error);

        // com a confirmação por email ligada, o Supabase não acusa email repetido: devolve um usuário sem identidades
        if (data.user?.identities?.length === 0) {
            showMessage('Já existe uma conta com esse email. Entre com ela ou recupere a senha.', 'error');
            return;
        }

        showMessage(`Enviamos um link de confirmação para <strong>${escapeHtml(email)}</strong>. Abra o email para ativar sua conta.
            <button type="button" class="linkButton" id="resendButton">Reenviar email</button>`, 'success');

        document.getElementById('resendButton').addEventListener('click', async () => {
            const { error: resendError } = await supabase.auth.resend({
                type: 'signup', email, options: { emailRedirectTo: returnUrl },
            });
            resendError ? showError(resendError) : showMessage('Email reenviado. Confira também a caixa de spam.', 'success');
        });
    });
});

googleButton.addEventListener('click', async () => {
    const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: returnUrl },
    });
    if (error) showError(error);
});

forgotButton.addEventListener('click', async () => {
    const email = loginForm.email.value.trim();

    if (!email) {
        showMessage('Digite seu email no campo acima para receber o link de nova senha.', 'error');
        loginForm.email.focus();
        return;
    }

    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: `${baseUrl}nova-senha.html` });
    error
        ? showError(error)
        : showMessage(`Se existir uma conta com <strong>${escapeHtml(email)}</strong>, você vai receber um link para criar uma nova senha.`, 'success');
});

async function withLoading(form, action) {
    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    hideMessage();
    try {
        await action();
    } finally {
        button.disabled = false;
    }
}

function showError(error) {
    console.error(error);
    showMessage(errorMessages[error.message] || 'Algo deu errado. Tente novamente.', 'error');
}

function showMessage(html, type) {
    message.innerHTML = html;
    message.className = `formMessage ${type}`;
    message.hidden = false;
}

function hideMessage() {
    message.hidden = true;
}
