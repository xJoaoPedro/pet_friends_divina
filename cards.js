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

    let caminhoImg = "/imagensAnimais/animal"
    caminhoImg = caminhoImg + i
    caminhoImg = caminhoImg + ".jpg"
    //criando o caminho para a imagem

    novaFoto.src = caminhoImg
    // atribuindo o caminho na variavel da imagem



    let caminhoInfos = "/infosAnimais/animal"
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
            if (data[0] != "nome") {
                return
            } else {
                for (i = 0; i < data.length; i++) {
                    if (data[i] == "nome") {
                        novaInfo.innerHTML += "Nome: " + data[i + 1]
                    } else if (data[i] == "idade") {
                        novaInfo.innerHTML += '<br>'
                        novaInfo.innerHTML += "Idade: " + data[i + 1] + " anos"
                    } else if (data[i] == "raca") {
                        novaInfo.innerHTML += '<br>'
                        novaInfo.innerHTML += "Raça: " + data[i + 1]
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





