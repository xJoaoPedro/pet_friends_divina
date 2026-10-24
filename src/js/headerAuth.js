import { supabase, getSession, displayName, currentPage } from './supabase.js';
import { escapeHtml } from './animals.js';

const authSlot = document.getElementById('authSlot');

renderAuthSlot(await getSession());

supabase?.auth.onAuthStateChange((_event, session) => renderAuthSlot(session));

// fecha o menu do usuário ao clicar fora dele
document.addEventListener('click', (event) => {
    const menu = authSlot.querySelector('.userMenu');
    if (!menu || menu.contains(event.target)) return;
    menu.classList.remove('open');
    menu.querySelector('.userButton').setAttribute('aria-expanded', false);
});

function renderAuthSlot(session) {
    if (!session) {
        // na própria página de login o botão "Entrar" não faz sentido
        if (currentPage().startsWith('login.html')) return authSlot.replaceChildren();
        authSlot.innerHTML = `
            <a href="login.html?next=${encodeURIComponent(currentPage())}" class="btn btnRed btnSmall">Entrar</a>`;
        return;
    }

    const name = escapeHtml(displayName(session.user));

    authSlot.innerHTML = `
        <div class="userMenu">
            <button type="button" class="userButton" aria-expanded="false" aria-haspopup="true">
                <span class="userAvatar" aria-hidden="true">${name.charAt(0).toUpperCase()}</span>
                <span class="userName">${name}</span>
            </button>
            <div class="userDropdown">
                <a href="anunciar.html">Anunciar um animal</a>
                <a href="meus-anuncios.html">Meus anúncios</a>
                <button type="button" class="signOut">Sair</button>
            </div>
        </div>
    `;

    const menu = authSlot.querySelector('.userMenu');
    const button = menu.querySelector('.userButton');

    button.addEventListener('click', () => {
        const open = menu.classList.toggle('open');
        button.setAttribute('aria-expanded', open);
    });

    menu.querySelector('.signOut').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'index.html';
    });
}
