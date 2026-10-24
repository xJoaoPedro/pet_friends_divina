import { supabase, requireSession, PHOTO_BUCKET } from './supabase.js';

const MAX_PHOTOS = 5;

const form = document.getElementById('announceForm');
const photoInput = document.getElementById('photo');
const photoPicker = document.getElementById('photoPicker');
const photoList = document.getElementById('photoList');
const message = document.getElementById('formMessage');

const session = await requireSession();

// as fotos ficam guardadas aqui, assim dá para escolher em várias levas e remover uma por uma
let photos = [];

photoInput.addEventListener('change', () => {
    const room = MAX_PHOTOS - photos.length;
    const added = [...photoInput.files].slice(0, room);

    if (photoInput.files.length > room) {
        showMessage(`Você pode enviar até ${MAX_PHOTOS} fotos por anúncio.`, 'error');
    }

    photos.push(...added.map((file) => ({ file, url: URL.createObjectURL(file) })));
    // limpa o input para a mesma foto poder ser escolhida de novo depois de removida
    photoInput.value = '';
    renderPhotos();
});

photoList.addEventListener('click', (event) => {
    const button = event.target.closest('button');
    if (!button) return;

    const [removed] = photos.splice(Number(button.dataset.index), 1);
    URL.revokeObjectURL(removed.url);
    renderPhotos();
});

function renderPhotos() {
    photoList.innerHTML = photos.map((photo, i) => `
        <li>
            <img src="${photo.url}" alt="Foto ${i + 1}">
            ${i === 0 ? '<span class="coverTag">Capa</span>' : ''}
            <button type="button" data-index="${i}" aria-label="Remover foto ${i + 1}">×</button>
        </li>`).join('');

    photoPicker.hidden = photos.length >= MAX_PHOTOS;
    photoPicker.classList.toggle('hasPhotos', photos.length > 0);
}

form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!session) return;

    if (photos.length === 0) {
        showMessage('Adicione pelo menos uma foto do animal.', 'error');
        photoPicker.scrollIntoView({ behavior: 'smooth', block: 'center' });
        return;
    }

    const fields = Object.fromEntries(new FormData(form));
    const whatsapp = normalizeWhatsapp(fields.whatsapp);

    if (!whatsapp) {
        showMessage('Digite um WhatsApp válido com DDD, ex.: (51) 99999-9999.', 'error');
        form.whatsapp.focus();
        return;
    }

    const button = form.querySelector('[type="submit"]');
    button.disabled = true;
    showMessage('Publicando o anúncio...', 'info');

    // a pasta com o id do usuário é o que as regras do storage exigem
    const photoPaths = photos.map(() => `${session.user.id}/${crypto.randomUUID()}.jpg`);
    let animalId;

    try {
        await Promise.all(photos.map(async (photo, i) => {
            const upload = await supabase.storage
                .from(PHOTO_BUCKET)
                .upload(photoPaths[i], await resizePhoto(photo.file), { contentType: 'image/jpeg' });
            if (upload.error) throw upload.error;
        }));

        const { data: animal, error } = await supabase
            .from('animals')
            .insert({
                name: fields.name.trim() || null,
                species: fields.species,
                sex: fields.sex,
                age: fields.age.trim(),
                size: fields.size,
                vaccinated: fields.vaccinated === 'sim',
                neutered: fields.neutered === 'sim',
                city: fields.city.trim(),
                description: fields.description.trim() || null,
                photo_paths: photoPaths,
            })
            .select('id')
            .single();
        if (error) throw error;
        animalId = animal.id;

        const contact = await supabase.from('animal_contacts').insert({ animal_id: animalId, whatsapp });
        if (contact.error) throw contact.error;

        window.location.href = 'meus-anuncios.html?publicado=1';
    } catch (error) {
        console.error(error);
        // desfaz o que já foi salvo para não ficar anúncio sem contato ou foto órfã
        if (animalId) await supabase.from('animals').delete().eq('id', animalId);
        await supabase.storage.from(PHOTO_BUCKET).remove(photoPaths);

        showMessage('Não foi possível publicar o anúncio. Confira os campos e tente de novo.', 'error');
        button.disabled = false;
    }
});

// aceita (51) 99999-9999, 51999999999 ou +55 51 99999-9999 e devolve só números com o 55
function normalizeWhatsapp(value) {
    let digits = value.replace(/\D/g, '');
    if (digits.length === 10 || digits.length === 11) digits = `55${digits}`;
    return /^55[0-9]{10,11}$/.test(digits) ? digits : null;
}

// diminui a foto antes de enviar, para carregar rápido e caber no plano grátis do storage
async function resizePhoto(file, maxSize = 1200) {
    const image = await createImageBitmap(file);
    const scale = Math.min(1, maxSize / Math.max(image.width, image.height));

    const canvas = document.createElement('canvas');
    canvas.width = Math.round(image.width * scale);
    canvas.height = Math.round(image.height * scale);
    canvas.getContext('2d').drawImage(image, 0, 0, canvas.width, canvas.height);

    return new Promise((resolve) => canvas.toBlob(resolve, 'image/jpeg', 0.85));
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = `formMessage ${type}`;
    message.hidden = false;
}
