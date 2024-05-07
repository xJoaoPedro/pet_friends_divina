









for (i = 0; i <= 3; i++) {
    let novoFlip = document.createElement("div")
    let novoFlipDentro = document.createElement("div")
    let novoFlipFrente = document.createElement("div")
    let novoFlipTras = document.createElement("div")
    let novaFoto = document.createElement("img")
    // criação de todas variaveis usadas

    novoFlip.className = "flip_card"
    novoFlipDentro.className = "flip_card_dentro"
    novoFlipFrente.className = "flip_card_frente"
    novoFlipTras.className = "flip_card_tras"
    // nomeando as classes

    let caminhoImg = "/imagens/animal"
    caminhoImg = caminhoImg + i
    caminhoImg = caminhoImg + ".jpg"
    //criando o caminho para a imagem

    novaFoto.src = caminhoImg
    // atribuindo o caminho na variavel da imagem



    let caminhoInfos = "/infos/animal"
    caminhoInfos = caminhoInfos + i
    caminhoInfos = caminhoInfos + ".txt"
    // criando o caminho para as informacoes

    let novaInfo = document.createElement("p")
    // criando o paragrafo onde vai ser inserida a informação


    fetch(caminhoInfos)
        .then(response => response.text())
        .then(data => {
            data = data.split(/[\s\r\n]+/)

            for (i = 0; i < data.length; i++) {
                if (data[i] == "nome") {
                    novaInfo.textContent += data[i + 1]
                } else if (data[i] == "idade") {
                    novaInfo.textContent += data[i + 1]
                } else if (data[i] == "raca") {
                    novaInfo.textContent += data[i + 1]
                }
            }

            // var img = document.createElement('img');
            // img.src = caminhoImg;



        })
        .catch((error) => {

        });

    novoFlipFrente.appendChild(novaFoto)
    novoFlipTras.appendChild(novaInfo)
    novoFlipDentro.appendChild(novoFlipFrente)
    novoFlipDentro.appendChild(novoFlipTras)
    novoFlip.appendChild(novoFlipDentro)
    document.body.appendChild(novoFlip)

}
