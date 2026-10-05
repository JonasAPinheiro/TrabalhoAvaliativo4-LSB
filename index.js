import fs from "fs";
import { PNG } from "pngjs";

const imagem = fs.createReadStream("fotoesteganografia.png");

const mensagem = "Olá, essa é uma mensagem escondida!";
const bytes = Buffer.from(mensagem, "utf8");
const tamanho = Buffer.alloc(4);
tamanho.writeUInt32BE(bytes.length);


imagem.pipe(new PNG()).on("parsed", function() {
    console.log("Imagem interpretada!");   
})

function indiceDoCanal(i) {
    const pixel = Math.floor(i / 3);
    const canal = i % 3;

    return pixel * 4 + canal;
}

function colocarBit(valor, bit) {
    return (valor & 254) | bit;
}

function byteParaBits(byte) {
    return byte.toString(2).padStart(8, "0").split("").map(Number);
    
}

imagem
    .pipe(new PNG())
    .on("parsed", function () {

        console.log("Imagem interpretada!");

        const bits = byteParaBits(byte);

        console.log("Byte:", byte);
        console.log("Bits:", bits);

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
