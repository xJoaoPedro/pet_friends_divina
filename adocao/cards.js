let cards_bloco = document.getElementById("cards_bloco")
let br = document.createElement('br')
let continua = true
let i = 0





while (i < 20) {

    let novoFlip = document.createElement("div")
    let novoFlipDentro = document.createElement("div")
    let novoFlipFrente = document.createElement("div")
    let novoFlipTras = document.createElement("div")
    let novaFoto = document.createElement("img")
    // criação de todas variaveis usadas

    novoFlip.className = "flip-card"
    novoFlipDentro.className = "flip-card-inner"
    novoFlipFrente.className = "flip-card-front"
    novoFlipTras.className = "flip-card-back"
    // nomeando as classes

    let caminhoImg = "../imagens/imagensAnimais/animal"
    caminhoImg = caminhoImg + i
    caminhoImg = caminhoImg + ".jpeg"
    //criando o caminho para a imagem

    novaFoto.src = caminhoImg
    // atribuindo o caminho na variavel da imagem



    let caminhoInfos = "../imagens/infosAnimais/animal"
    caminhoInfos = caminhoInfos + i
    caminhoInfos = caminhoInfos + ".txt"
    // criando o caminho para as informacoes

    let novaInfo = document.createElement("p")
    // criando o paragrafo onde vai ser inserida a informação



    fetch(caminhoInfos)
        .then(response => response.text())
        .then(data => {
            data = data.split(/[\s\r\n]+/)
            console.log(data)
            if (data[0] != "sexo") {
                return
            } else {
                for (i = 0; i < data.length; i++) {
                    if (data[i] == "sexo") {
                        novaInfo.innerHTML += data[i + 1]
                    } else if (data[i] == "idade") {
                        novaInfo.innerHTML += '<br>'
                        novaInfo.innerHTML += data[i + 1] + " " + data[i + 2]
                    } else if (data[i] == "porte") {
                        novaInfo.innerHTML += '<br>'
                        novaInfo.innerHTML += "Porte " + data[i + 1]
                    } else if (data[i] == "vacina") {
                        novaInfo.innerHTML += '<br>'
                        novaInfo.innerHTML += data[i + 1]
                    } else if (data[i] == "castracao") {
                        novaInfo.innerHTML += '<br>'
                        novaInfo.innerHTML += data[i + 1]
                    }
                }

                novoFlipFrente.appendChild(novaFoto)
                novoFlipTras.appendChild(novaInfo)
                novoFlipDentro.appendChild(novoFlipFrente)
                novoFlipDentro.appendChild(novoFlipTras)
                novoFlip.appendChild(novoFlipDentro)
                cards_bloco.appendChild(novoFlip)
            }

        })

    i++
}


function ativaHover(element) {
    if (window.innerWidth < 600) { // verificar esse valor, mas ta funcionando
        element.classList.toggle('active');
    }
}