import fs from "fs";
import { PNG } from "pngjs";

const imagem = fs.createReadStream("fotoesteganografia.png");

const caractere = "A";
const byte = caractere.charCodeAt(0);



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

