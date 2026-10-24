import { renderAnimals } from './animals.js';
import { getSession } from './supabase.js';
import { CONTACT } from './config.js';

renderAnimals(document.getElementById('adoptList'), { variant: 'compact', limit: 5 });
renderContact();

// quem já está logado não precisa dos botões de entrar e criar conta da hero
if (await getSession()) document.getElementById('heroAuth').remove();

// os canais de contato vêm do config.js; enquanto não existirem, mostra "em breve"
function renderContact() {
    const grid = document.getElementById('contactGrid');
    const cards = [];

    if (CONTACT.whatsapp) {
        cards.push(`
            <a href="https://wa.me/${CONTACT.whatsapp}" target="_blank" rel="noopener noreferrer" class="contactCard">
                <span class="contactIcon"><img src="./assets/icons/whatsappalt.svg" alt=""></span>
                <h3>WhatsApp</h3>
                <p>Fale com a equipe da Pet Friends</p>
            </a>`);
    }

    if (CONTACT.email) {
        cards.push(`
            <a href="mailto:${CONTACT.email}" class="contactCard">
                <span class="contactIcon"><img src="./assets/icons/email.svg" alt=""></span>
                <h3>Email</h3>
                <p>${CONTACT.email}</p>
            </a>`);
    }

    grid.innerHTML = cards.length
        ? cards.join('')
        : '<p class="contactSoon">Em breve teremos novos canais de contato por aqui.</p>';
}
