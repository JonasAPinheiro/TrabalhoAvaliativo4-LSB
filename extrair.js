import fs from "fs";
import { PNG } from "pngjs";

// Abre a imagem que contém a mensagem escondida.
const imagem = fs.createReadStream("fotoesteganografia_saida.png");

// Converte um índice sequencial de canal RGB
// para a posição correspondente no array RGBA.
function indiceDoCanal(i) {

    // Descobre a posição do pixel considerando 3 canais por pixel.
    const pixel = Math.floor(i / 3);

    // Descobre qual canal será utilizado: R, G ou B.
    const canal = i % 3;

    // Calcula o índice real no array, pulando o canal alfa.
    return pixel * 4 + canal;
}

// Extrai o último bit de um valor de cor.
function lerBit(valor) {

    // O AND (&) com 1 elimina todos os bits,
    // exceto o último, que é justamente o bit escondido.
    return valor & 1;
}

// Lê e interpreta a imagem PNG.
imagem
    .pipe(new PNG())
    .on("parsed", function () {

        console.log("Imagem interpretada!");

        // Array que armazenará os bits extraídos da imagem.
        const bits = [];

        // Calcula a quantidade total de canais RGB disponíveis.
        const quantidadeDeCanais = this.width * this.height * 3;

        // Percorre todos os canais RGB da imagem.
        for (let i = 0; i < quantidadeDeCanais; i++) {

            // Encontra a posição do canal no array RGBA.
            const indice = indiceDoCanal(i);

            // Lê o último bit desse canal.
            const bit = lerBit(this.data[indice]);

            // Guarda o bit encontrado na sequência.
            bits.push(bit);
        }

        // Os primeiros 32 bits representam o tamanho da mensagem.
        // São 32 bits porque reservamos 4 bytes no esconder.js.
        const bitsDoTamanho = bits.slice(0, 32);

        // Array que receberá os 4 bytes do tamanho.
        const bytesDoTamanho = [];

        // Percorre os 32 bits em grupos de 8.
        // Cada grupo de 8 bits forma um byte.
        for (let i = 0; i < 32; i += 8) {

            // Separa 8 bits do tamanho.
            const oitoBits = bitsDoTamanho.slice(i, i + 8);

            // Junta os 8 bits em uma string binária.
            // Exemplo: [0, 0, 0, 0, 0, 0, 1, 1] vira "00000011".
            const binario = oitoBits.join("");

            // Converte o número binário para um número decimal.
            // Exemplo: "00000011" vira 3.
            const byte = parseInt(binario, 2);

            // Guarda o byte reconstruído.
            bytesDoTamanho.push(byte);
        }

        // Transforma os 4 bytes no número original do tamanho.
        // readUInt32BE lê um inteiro sem sinal de 32 bits,
        // na mesma ordem usada para gravá-lo no esconder.js.
        const tamanho = Buffer.from(bytesDoTamanho).readUInt32BE();

        console.log("Tamanho da mensagem:", tamanho, "bytes");

        // Pula os 32 bits do tamanho e seleciona
        // exatamente os bits correspondentes à mensagem.
        // Cada byte possui 8 bits, por isso multiplicamos por 8.
        const bitsDaMensagem = bits.slice(32, 32 + tamanho * 8);

        // Array que receberá os bytes da mensagem.
        const bytesDaMensagem = [];

        // Percorre os bits da mensagem em grupos de 8.
        for (let i = 0; i < bitsDaMensagem.length; i += 8) {

            // Separa o próximo grupo de 8 bits.
            const oitoBits = bitsDaMensagem.slice(i, i + 8);

            // Junta os bits em uma string binária.
            const binario = oitoBits.join("");

            // Converte a string binária em um número decimal.
            const byte = parseInt(binario, 2);

            // Guarda o byte reconstruído.
            bytesDaMensagem.push(byte);
        }

        // Converte os bytes recuperados de volta para texto UTF-8.
        const mensagem = Buffer
            .from(bytesDaMensagem)
            .toString("utf8");

        // Exibe a mensagem que estava escondida na imagem.
        console.log("Mensagem encontrada:");
        console.log(mensagem);
    });