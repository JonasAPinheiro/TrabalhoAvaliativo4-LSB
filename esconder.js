import fs from "fs";
import { PNG } from "pngjs";

const imagem = fs.createReadStream("fotoesteganografia.png");

const mensagem = "Olá, essa é uma mensagem escondida!";
const bytes = Buffer.from(mensagem, "utf8");

const tamanho = Buffer.alloc(4);
tamanho.writeUInt32BE(bytes.length);

function indiceDoCanal(i) {
    const pixel = Math.floor(i / 3);
    const canal = i % 3;

    return pixel * 4 + canal;
}

function colocarBit(valor, bit) {
    return (valor & 254) | bit;
}

function byteParaBits(byte) {
    return byte
        .toString(2)
        .padStart(8, "0")
        .split("")
        .map(Number);
}

imagem
    .pipe(new PNG())
    .on("parsed", function () {

        console.log("Imagem interpretada!");
        const dados = Buffer.concat([tamanho, bytes]);
        const bits = [];
        for (const byte of dados) {
            bits.push(...byteParaBits(byte));
        }

        console.log("Mensagem:", mensagem);
        console.log("Tamanho:", bytes.length, "bytes");
        console.log("Quantidade de bits:", bits.length);

        const capacidade = this.width * this.height * 3;

        if (bits.length > capacidade) {
            console.log("A mensagem é grande demais para essa imagem.");
            return;
        }

        for (let i = 0; i < bits.length; i++) {

            const indice = indiceDoCanal(i);
            const bit = bits[i];

            this.data[indice] =
                colocarBit(
                    this.data[indice],
                    bit
                );
        }

        this.pack()
            .pipe(
                fs.createWriteStream(
                    "fotoesteganografia_saida.png"
                )
            );
    });