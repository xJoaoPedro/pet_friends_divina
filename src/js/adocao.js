import { renderAnimals } from './animals.js';

const list = document.getElementById('adoptList');
const filters = document.getElementById('filters');

filters.addEventListener('change', loadAnimals);
filters.addEventListener('reset', () => setTimeout(loadAnimals));

loadAnimals();

function loadAnimals() {
    const values = Object.fromEntries(new FormData(filters));
    const filtered = Object.values(values).some(Boolean);

    renderAnimals(list, {
        ...values,
        emptyMessage: filtered
            ? 'Nenhum animal encontrado com esses filtros.'
            : 'Ainda não há animais anunciados. Que tal ser o primeiro?',
    });
}
