const adoptList = document.getElementById('adoptList');
let animals = [];

fetch('./src/js/animals.json')
    .then((response) => response.json())
    .then((animalsJson) => animalsJson.animals)
    .then((animalsList) => {
        for (let i = 0; i < animalsList.length; i++) {
            const animal = animalsList[i];
            const animalListItem = `
            <li>
                <img src="${animal.foto}" alt="dog to adopt image">
                <p>
                    ${animal.sexo} | ${animal.idade} | ${animal.porte}<br>
                    ${animal.vacina} | ${animal.castracao}
                </p>
            </li>
            `
            adoptList.innerHTML += animalListItem;
        }
    })
    
