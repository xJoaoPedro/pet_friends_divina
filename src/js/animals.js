import { supabase, getSession, currentPage, PHOTO_BUCKET } from './supabase.js';

export const SPECIES = { cao: 'Cão', gato: 'Gato', outro: 'Outro' };
export const SEX = { femea: 'Fêmea', macho: 'Macho' };
export const SIZE = { pequeno: 'Pequeno', medio: 'Médio', grande: 'Grande' };

const lockIcon = `
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M17 10V8A5 5 0 0 0 7 8v2a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2Zm-8-2a3 3 0 0 1 6 0v2H9Zm4 8.7V18h-2v-1.3a2 2 0 1 1 2 0Z" />
    </svg>`;

export function escapeHtml(text = '') {
    return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

export function photoUrl(path) {
    return supabase.storage.from(PHOTO_BUCKET).getPublicUrl(path).data.publicUrl;
}

// concorda com o sexo do animal: "Vacinada", "Não castrado"...
function healthLabel(done, word, sex) {
    const ending = sex === 'femea' ? 'a' : 'o';
    return done ? `${word}${ending}` : `Não ${word.toLowerCase()}${ending}`;
}

export function animalTitle(animal) {
    return animal.name || `${SPECIES[animal.species]} ${SEX[animal.sex].toLowerCase()}`;
}

export async function fetchAnimals({ limit, species, sex, size } = {}) {
    let query = supabase
        .from('animals')
        .select('*')
        .eq('status', 'disponivel')
        .order('created_at', { ascending: false });

    if (species) query = query.eq('species', species);
    if (sex) query = query.eq('sex', sex);
    if (size) query = query.eq('size', size);
    if (limit) query = query.limit(limit);

    const { data, error } = await query;
    if (error) throw error;
    return data;
}

// o banco só devolve os contatos para quem está logado (RLS), então sem sessão nem pergunta
export async function fetchContacts(animalIds, session) {
    if (!session || animalIds.length === 0) return {};

    const { data, error } = await supabase
        .from('animal_contacts')
        .select('animal_id, whatsapp')
        .in('animal_id', animalIds);

    if (error) throw error;
    return Object.fromEntries(data.map((contact) => [contact.animal_id, contact.whatsapp]));
}

function contactButton(animal, whatsapp, session) {
    if (!session) {
        return `
            <a href="login.html?next=${encodeURIComponent(currentPage())}" class="btn btnWhatsapp btnSmall">
                ${lockIcon} Tenho interesse
            </a>
            <small class="loginHint">Faça login para entrar em contato</small>`;
    }

    if (!whatsapp) {
        return `<span class="btn btnSmall btnMuted">Contato indisponível</span>`;
    }

    const message = encodeURIComponent(
        `Olá! Vi no Pet Friends o anúncio de ${animalTitle(animal)} (${animal.age}) e tenho interesse em adotar.`
    );

    return `
        <a href="https://wa.me/${whatsapp}?text=${message}" target="_blank" rel="noopener noreferrer"
            class="btn btnWhatsapp btnSmall">
            <img src="./assets/icons/whatsapp.svg" alt=""> Tenho interesse
        </a>`;
}

// variant: 'row' (foto à esquerda, página de adoção) ou 'compact' (foto em cima, vitrine da home)
export function createCard(animal, { whatsapp, session, variant = 'row', actions = '' } = {}) {
    const title = escapeHtml(animalTitle(animal));

    const card = document.createElement('li');
    card.className = `animalCard ${variant === 'compact' ? 'animalCardCompact' : ''} reveal`;
    card.dataset.id = animal.id;

    card.innerHTML = `
        ${photoGallery(animal.photo_paths, title)}

        <div class="animalBody">
            <span class="tag">${SPECIES[animal.species]} · ${SEX[animal.sex]}</span>
            <h3>${title}</h3>
            <span class="animalCity">${escapeHtml(animal.city)}</span>

            <ul class="animalInfo">
                <li><span>Idade</span><strong>${escapeHtml(animal.age)}</strong></li>
                <li><span>Porte</span><strong>${SIZE[animal.size]}</strong></li>
                <li><span>Vacinação</span><strong>${healthLabel(animal.vaccinated, 'Vacinad', animal.sex)}</strong></li>
                <li><span>Castração</span><strong>${healthLabel(animal.neutered, 'Castrad', animal.sex)}</strong></li>
            </ul>

            ${variant === 'row' && animal.description
                ? `<p class="animalDescription">${escapeHtml(animal.description)}</p>`
                : ''}

            <div class="animalActions">
                ${actions || contactButton(animal, whatsapp, session)}
            </div>
        </div>
    `;

    setupCarousel(card);
    return card;
}

const arrowIcon = (direction) => `
    <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="${direction === 'prev' ? 'm14.5 5-7 7 7 7' : 'm9.5 5 7 7-7 7'}" />
    </svg>`;

// uma foto vira só a imagem; mais de uma vira um carrossel com setas e bolinhas
function photoGallery(paths, title) {
    const photos = paths.map((path, i) => `
        <img src="${photoUrl(path)}" alt="${title}, foto ${i + 1} de ${paths.length}" class="animalPhoto"
            loading="lazy">`).join('');

    if (paths.length === 1) return `<div class="animalMedia"><div class="mediaTrack">${photos}</div></div>`;

    return `
        <div class="animalMedia isCarousel">
            <div class="mediaTrack">${photos}</div>
            <button type="button" class="mediaArrow prev" aria-label="Foto anterior" disabled>${arrowIcon('prev')}</button>
            <button type="button" class="mediaArrow next" aria-label="Próxima foto">${arrowIcon('next')}</button>
            <div class="mediaDots">
                ${paths.map((_, i) => `<button type="button" aria-label="Ver foto ${i + 1}"${i === 0 ? ' class="active"' : ''}></button>`).join('')}
            </div>
        </div>`;
}

// o carrossel usa scroll-snap, então no celular dá para arrastar; setas e bolinhas só rolam a faixa
function setupCarousel(card) {
    const media = card.querySelector('.isCarousel');
    if (!media) return;

    const track = media.querySelector('.mediaTrack');
    const dots = [...media.querySelectorAll('.mediaDots button')];
    const [prev, next] = media.querySelectorAll('.mediaArrow');
    const goTo = (index) => track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
    const current = () => Math.round(track.scrollLeft / track.clientWidth);

    prev.addEventListener('click', () => goTo(current() - 1));
    next.addEventListener('click', () => goTo(current() + 1));
    dots.forEach((dot, i) => dot.addEventListener('click', () => goTo(i)));

    track.addEventListener('scroll', () => {
        const index = current();
        dots.forEach((dot, i) => dot.classList.toggle('active', i === index));
        prev.disabled = index === 0;
        next.disabled = index === dots.length - 1;
    }, { passive: true });
}

function emptyState(message) {
    return `
        <li class="listMessage">
            <p>${message}</p>
            <a href="anunciar.html" class="btn btnRed btnSmall">Quero anunciar</a>
        </li>`;
}

// carrega e desenha os anúncios num <ul>, cuidando dos estados de carregando, vazio e erro
export async function renderAnimals(list, { variant = 'row', emptyMessage, ...filters } = {}) {
    list.innerHTML = '<li class="listMessage"><p>Carregando os animais...</p></li>';

    if (!supabase) {
        list.innerHTML = emptyState('Os anúncios estarão disponíveis em breve.');
        return;
    }

    try {
        const session = await getSession();
        const animals = await fetchAnimals(filters);
        const contacts = await fetchContacts(animals.map((animal) => animal.id), session);

        if (animals.length === 0) {
            list.innerHTML = emptyState(emptyMessage || 'Ainda não há animais anunciados. Que tal ser o primeiro?');
            return;
        }

        const cards = animals.map((animal) => createCard(animal, { whatsapp: contacts[animal.id], session, variant }));
        list.replaceChildren(...cards);

        // revealOnScroll e canAnimate vêm do animations.js (script clássico carregado antes)
        revealOnScroll(cards);
        if (canAnimate) ScrollTrigger.refresh();
    } catch (error) {
        console.error(error);
        list.innerHTML = '<li class="listMessage"><p>Não foi possível carregar os animais agora. Tente novamente em instantes.</p></li>';
    }
}
