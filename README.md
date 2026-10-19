# Sistema de Esteganografia LSB em Node.js

Este projeto implementa uma técnica de **Esteganografia** utilizando o método **LSB (Least Significant Bit - Menos Bit Significativo)** em Node.js. A esteganografia permite ocultar mensagens secretas dentro de imagens PNG sem que haja alterações visíveis a olho nu.

O sistema é composto por dois scripts principais:
1. **`esconder.js`**: Oculta uma mensagem de texto dentro de uma imagem PNG (`fotoesteganografia.png`) e gera uma nova imagem contendo a mensagem (`fotoesteganografia_saida.png`).
2. **`extrair.js`**: Lê a imagem gerada (`fotoesteganografia_saida.png`) e recupera a mensagem secreta escondida nela.

---

## Pré-requisitos

Certifique-se de ter o **Node.js** instalado em sua máquina. Você pode verificar executando no terminal:
```bash
node -v
```

---

## Instalação

1. Clone o repositório ou baixe os arquivos do projeto para o seu computador.
2. Abra o terminal na pasta raiz do projeto.
3. Instale as dependências necessárias (neste caso, a biblioteca `pngjs`):
   ```bash
   npm install
   ```

---

## Como Executar (Passo a Passo)

### 1. Preparação da Imagem de Entrada
Certifique-se de que existe uma imagem chamada **`fotoesteganografia.png`** na raiz do projeto. Esta será a imagem base utilizada para esconder a mensagem.

---

### 2. Ocultar uma Mensagem (`esconder.js`)

Para esconder uma mensagem secreta na imagem, execute o script `esconder.js` passando a mensagem desejada entre aspas como argumento no terminal:

```bash
node esconder.js "Minha mensagem secreta!"
```

**O que acontece durante a execução:**
- O script lê a imagem `fotoesteganografia.png`.
- Converte a mensagem para bytes (UTF-8) e armazena o tamanho dela nos primeiros 32 bits (4 bytes).
- Substitui o último bit (LSB) dos canais de cor RGB (Vermelho, Verde e Azul) de cada pixel pelos bits correspondentes da mensagem e do seu tamanho.
- Salva o resultado em um novo arquivo chamado **`fotoesteganografia_saida.png`**.

Se executado com sucesso, você verá logs no terminal confirmando a interpretação da imagem, o tamanho da mensagem em bytes e a quantidade de bits utilizados.

---

### 3. Extrair a Mensagem (`extrair.js`)

Para recuperar e ler a mensagem secreta que foi escondida na imagem de saída, execute o script `extrair.js`:

```bash
node extrair.js
```

**O que acontece durante a execução:**
- O script abre a imagem **`fotoesteganografia_saida.png`**.
- Varre os canais RGB de cada pixel para extrair o último bit (LSB).
- Lê os primeiros 32 bits para descobrir qual é o tamanho exato da mensagem.
- Lê a quantidade correta de bits seguintes, reconstrói os bytes da mensagem e os converte de volta para texto UTF-8.
- Exibe a mensagem secreta no terminal.

---

## Estrutura de Arquivos

- `esconder.js`: Script responsável por inserir a mensagem na imagem.
- `extrair.js`: Script responsável por extrair e decodificar a mensagem da imagem.
- `fotoesteganografia.png`: Imagem original (entrada).
- `fotoesteganografia_saida.png`: Imagem gerada contendo a mensagem oculta (saída).
- `package.json`: Configurações e dependências do projeto (`pngjs`).
