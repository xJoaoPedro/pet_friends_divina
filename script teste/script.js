
for (i = 0; i <= 3; i++) {
    let caminhoInfos = "/infos/animal"
    caminhoInfos = caminhoInfos + i
    caminhoInfos = caminhoInfos + ".txt"
    
    let caminhoImg = "/imagens/animal"
    caminhoImg = caminhoImg + i
    caminhoImg = caminhoImg + ".jpg"

    fetch(caminhoInfos)
        .then(response => response.text())
        .then(data => {
            // Aqui você pode trabalhar com os dados do arquivo
            data = data.split(/[\s\r\n]+/)

            for (i = 0; i < data.length; i++) {
                if (data[i] == "nome") {
                    document.write(data[i + 1])
                } else if (data[i] == "idade") {
                    document.write(data[i + 1])
                } else if (data[i] == "raca") {
                    document.write(data[i + 1])
                }
            }

            var img = document.createElement('img');
            img.src = caminhoImg;

            document.body.appendChild(img);

        })
        .catch((error) => {

        });
}
