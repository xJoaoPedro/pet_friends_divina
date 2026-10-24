const adoptList = document.getElementById('adoptList');
const whatsappNumber = '5551997175372';

fetch('./src/js/animals.json')
    .then((response) => response.json())
    .then((animalsJson) => animalsJson.animals)
    .then((animalsList) => {
        const cards = animalsList.map(createCard);
        adoptList.append(...cards);
        revealOnScroll(cards);

        // os cards mudam a altura da página, então as outras animações recalculam a posição
        if (canAnimate) ScrollTrigger.refresh();
    });

function createCard(animal) {
    const porte = animal.porte.replace(/^porte\s+/i, '');
    const description = `${animal.sexo}, ${animal.idade}, porte ${porte}`;
    const message = encodeURIComponent(`Olá, vim pelo site e tenho interesse em adotar: ${description}.`);

    const card = document.createElement('li');
    card.className = 'animalCard reveal';

    card.innerHTML = `
        <img src="${animal.foto}" alt="${description}, disponível para adoção" class="animalPhoto" loading="lazy">

        <div class="animalBody">
            <span class="tag">${animal.sexo}</span>
            <h3>${animal.idade}</h3>

            <ul class="animalInfo">
                <li><span>Porte</span><strong>${capitalize(porte)}</strong></li>
                <li><span>Vacinação</span><strong>${animal.vacina}</strong></li>
                <li><span>Castração</span><strong>${animal.castracao}</strong></li>
            </ul>

            <a href="https://api.whatsapp.com/send?phone=${whatsappNumber}&text=${message}" target="_blank"
                rel="noopener noreferrer" class="btn btnWhatsapp btnSmall">
                <img src="./assets/icons/whatsapp.svg" alt=""> Tenho interesse
            </a>
        </div>
    `;

    return card;
}

function capitalize(text) {
    return text.charAt(0).toUpperCase() + text.slice(1);
}
