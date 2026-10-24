import { supabase, requireSession, PHOTO_BUCKET } from './supabase.js';
import { createCard } from './animals.js';

const list = document.getElementById('myList');
const message = document.getElementById('pageMessage');

const session = await requireSession();

if (new URLSearchParams(window.location.search).has('publicado')) {
    message.textContent = 'Anúncio publicado! Ele já aparece na página de adoção.';
    message.hidden = false;
}

if (session) loadMyAnimals();

async function loadMyAnimals() {
    const { data: animals, error } = await supabase
        .from('animals')
        .select('*')
        .eq('owner_id', session.user.id)
        .order('created_at', { ascending: false });

    if (error) {
        console.error(error);
        list.innerHTML = '<li class="listMessage"><p>Não foi possível carregar seus anúncios agora.</p></li>';
        return;
    }

    if (animals.length === 0) {
        list.innerHTML = `
            <li class="listMessage">
                <p>Você ainda não anunciou nenhum animal.</p>
                <a href="anunciar.html" class="btn btnRed btnSmall">Quero anunciar</a>
            </li>`;
        return;
    }

    const cards = animals.map((animal) => {
        const adopted = animal.status === 'adotado';
        const card = createCard(animal, {
            actions: `
                <span class="statusBadge ${adopted ? 'adopted' : ''}">${adopted ? 'Adotado' : 'Disponível'}</span>
                <button type="button" class="btn btnWhatsapp btnSmall" data-action="status">
                    ${adopted ? 'Voltar para disponível' : 'Marcar como adotado'}
                </button>
                <button type="button" class="linkButton danger" data-action="delete">Excluir anúncio</button>`,
        });
        card.classList.toggle('isAdopted', adopted);
        card.animal = animal;
        return card;
    });

    list.replaceChildren(...cards);
    revealOnScroll(cards);
}

list.addEventListener('click', async (event) => {
    const button = event.target.closest('[data-action]');
    if (!button) return;

    const { animal } = button.closest('.animalCard');
    button.disabled = true;

    if (button.dataset.action === 'status') {
        const status = animal.status === 'adotado' ? 'disponivel' : 'adotado';
        const { error } = await supabase.from('animals').update({ status }).eq('id', animal.id);
        if (error) console.error(error);
    }

    if (button.dataset.action === 'delete') {
        if (!window.confirm('Excluir este anúncio? Essa ação não pode ser desfeita.')) {
            button.disabled = false;
            return;
        }
        const { error } = await supabase.from('animals').delete().eq('id', animal.id);
        if (error) console.error(error);
        else await supabase.storage.from(PHOTO_BUCKET).remove(animal.photo_paths);
    }

    loadMyAnimals();
});
