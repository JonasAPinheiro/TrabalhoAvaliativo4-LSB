import fs from "fs";
import { PNG } from "pngjs";

// Abre a imagem original que será usada para esconder a mensagem.
const imagem = fs.createReadStream("fotoesteganografia.png");

// Recebe a mensagem digitada no terminal.
const mensagem = process.argv[2];

// Verifica se o usuário informou uma mensagem.
if (!mensagem) {
    console.log("Digite uma mensagem.");
    console.log('Exemplo: node esconder.js "Olá mundo!"');
    process.exit(1);
}

// Converte o texto em bytes usando a codificação UTF-8.
// Isso permite trabalhar com letras, acentos e outros caracteres.
const bytes = Buffer.from(mensagem, "utf8");

// Reserva 4 bytes para armazenar o tamanho da mensagem.
// O extrator usará essa informação para saber onde parar.
const tamanho = Buffer.alloc(4);

// Grava o tamanho da mensagem nesses 4 bytes.
// Usamos bytes.length porque precisamos contar os bytes,
// e não simplesmente a quantidade de caracteres do texto.
tamanho.writeUInt32BE(bytes.length);

// Converte um índice sequencial de canal RGB
// para o índice correspondente no array RGBA da imagem.
function indiceDoCanal(i) {

    // Cada pixel possui 3 canais de cor que vamos utilizar:
    // vermelho (R), verde (G) e azul (B).
    const pixel = Math.floor(i / 3);

    // Identifica o canal: 0 = R, 1 = G e 2 = B.
    const canal = i % 3;

    // Cada pixel ocupa 4 posições no array: R, G, B e A.
    // Por isso multiplicamos o pixel por 4.
    // Assim, pulamos o canal alfa (transparência).
    return pixel * 4 + canal;
}

// Substitui o último bit do valor de um canal de cor
// pelo bit que queremos esconder.
function colocarBit(valor, bit) {

    // 254 em binário é 11111110.
    // O AND (&) zera o último bit e preserva os outros.
    // O OR (|) coloca no último bit o valor desejado: 0 ou 1.
    return (valor & 254) | bit;
}

// Converte um byte em uma sequência de 8 bits.
function byteParaBits(byte) {

    // Converte o número para binário, completa com zeros
    // à esquerda até chegar a 8 dígitos e transforma
    // cada dígito em um número separado dentro de um array.
    return byte
        .toString(2)
        .padStart(8, "0")
        .split("")
        .map(Number);
}

// Lê e interpreta a imagem PNG.
imagem
    .pipe(new PNG())
    .on("parsed", function () {
        console.log("Imagem interpretada!");

        // Junta os 4 bytes do tamanho com os bytes da mensagem.
        // A ordem é importante: primeiro o tamanho, depois o texto.
        const dados = Buffer.concat([tamanho, bytes]);

        // Cria um array que armazenará todos os bits a esconder.
        const bits = [];

        // Percorre cada byte dos dados.
        for (const byte of dados) {

            // Converte cada byte em 8 bits e adiciona
            // esses bits ao array principal.
            bits.push(...byteParaBits(byte));
        }

        console.log("Mensagem:", mensagem);
        console.log("Tamanho:", bytes.length, "bytes");
        console.log("Quantidade de bits:", bits.length);

        // Cada pixel tem 3 canais utilizáveis: R, G e B.
        // Multiplicamos largura x altura x 3 para calcular
        // quantos bits podem ser escondidos na imagem.
        const capacidade = this.width * this.height * 3;

        // Impede que tentemos esconder mais bits do que a imagem suporta.
        if (bits.length > capacidade) {
            console.log("A mensagem é grande demais para essa imagem.");
            return;
        }

        // Percorre todos os bits que queremos esconder.
        for (let i = 0; i < bits.length; i++) {

            // Descobre em qual posição do array RGBA escrever.
            const indice = indiceDoCanal(i);

            // Obtém o bit atual da mensagem.
            const bit = bits[i];

            // Modifica apenas o último bit do canal de cor escolhido.
            // Os outros 7 bits desse canal permanecem iguais.
            this.data[indice] =
                colocarBit(
                    this.data[indice],
                    bit
                );
        }

        // Converte os dados modificados novamente para PNG
        // e grava a imagem em um novo arquivo.
        this.pack()
            .pipe(
                fs.createWriteStream(
                    "fotoesteganografia_saida.png"
                )
            );
    });