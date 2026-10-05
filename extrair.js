import fs from "fs";
import { PNG } from "pngjs";

const imagem = fs.createReadStream("fotoesteganografia_saida.png");

function indiceDoCanal(i) {
    const pixel = Math.floor(i / 3);
    const canal = i % 3;

    return pixel * 4 + canal;
}

function lerBit(valor) {
    return valor & 1;
}

imagem
    .pipe(new PNG())
    .on("parsed", function () {

        console.log("Imagem interpretada!");

        const bits = [];
        const quantidadeDeCanais = this.width * this.height * 3;

        for (let i = 0; i < quantidadeDeCanais; i++) {

            const indice = indiceDoCanal(i);

            const bit = lerBit(this.data[indice]);

            bits.push(bit);
        }
        
        const bitsDoTamanho = bits.slice(0, 32);

        const bytesDoTamanho = [];

        for (let i = 0; i < 32; i += 8) {

            const oitoBits = bitsDoTamanho.slice(i, i + 8);

            const binario = oitoBits.join("");

            const byte = parseInt(binario, 2);

            bytesDoTamanho.push(byte);
        }

        const tamanho = Buffer.from(bytesDoTamanho).readUInt32BE();

        console.log("Tamanho da mensagem:", tamanho, "bytes");

        const bitsDaMensagem = bits.slice(32, 32 + tamanho * 8);

        const bytesDaMensagem = [];

        for (let i = 0; i < bitsDaMensagem.length; i += 8) {

            const oitoBits = bitsDaMensagem.slice(i, i + 8);

            const binario = oitoBits.join("");

            const byte = parseInt(binario, 2);

            bytesDaMensagem.push(byte);
        }

        const mensagem = Buffer
            .from(bytesDaMensagem)
            .toString("utf8");

        console.log("Mensagem encontrada:");
        console.log(mensagem);
    });