# BRIEF — Suíça, Para Ela

Entrevistado por seleção (o humano escolheu cada resposta em input clicável).
Não auto-escrito. Respostas abaixo nas palavras das opções que ele escolheu.

## As oito respostas

**1. Vibe (3 a 5 palavras) + referência**
"Editorial, elegante, calmo."
Referência que veio junto: revista de viagem cara — serifa grande, muito branco,
fotografia impecável, ritmo de página impressa. O foco é o bom gosto e a curadoria.

**2. A jornada do scroll**
"Revelação primeiro." Abre com a notícia (vamos para a Suíça), e todo o resto da
página é a prova de que é real: lugares, hotéis, montanhas, o prático.

**3. A curva de energia**
"Começa contida e só cresce." Mesmo a revelação entra em voz baixa, e a página
ganha volume sem parar até a montanha. Termina no ponto mais alto, sem descida.

**4. O ÚNICO momento que ela deve lembrar (o pico)**
"A montanha abrindo." A neblina limpa e o vale aparece inteiro, em silêncio, sem
texto. Puro espanto visual, sem informação nenhuma.

**5. O movimento-assinatura**
"A página esquenta conforme desce." A luz da página vai do azul frio da manhã
alpina ao dourado do fim de tarde ao longo do scroll, como um único dia passando
sob a mão dela.

**6. Distância do premium-minimal**
Família editorial. (Derivado da resposta 1, não perguntado duas vezes.)

**7. Mundo contínuo ou cenas distintas**
"Cenas distintas." Capítulos separados com corte entre eles. Cada ato se comporta
de um jeito diferente. Mais variedade, mais barato, mais robusto no celular.

**8. Material disponível**
"Tudo gerado." Mundo fotográfico inteiro pela kie.ai. Nenhuma foto do casal na
página. O humano fornece a chave de API.

## Contexto do repositório

Decisão dele: "Substituir o index.html." O site atual (Lugares, Restaurantes,
Hotéis, Montanhas, Curiosidades, Guia Prático, Quiz) é reconstruído como página
de scroll. Ele aceitou explicitamente que o conteúdo que não couber na narrativa
se perde. O arquivo antigo está commitado em git (f940c50) e recuperável.

## Tensões registradas na entrevista

- "Revelação primeiro" + "começa contida": a notícia é dada em voz baixa, não em
  festa. A página não grita o que é; ela informa com calma e depois cresce.
- "Termina no ponto mais alto, sem descida" + a regra de que o fim tem que
  resolver e sustentar: o fecho não é uma queda depois da montanha, é a montanha
  sustentada. O ato final É o pico, e a única ação vive dentro dele.

## Gramática: editorial em capítulos (uniqueness.md 2.2)

Por que as outras sete perderam:

- **Filmic one-shot**: carrega ônus da prova e é o oposto declarado da resposta 7.
  "Cenas distintas" contra "sem costuras" decide sozinho.
- **Mundo contínuo**: recusado na pergunta 7, que era exatamente essa bifurcação.
- **Pôster tipográfico**: proíbe fundo fotográfico, e o pico DESTA página é uma
  fotografia. Fatal.
- **Superfície viva**: não há produto para operar. Uma viagem não é ferramenta.
- **Galeria/catálogo**: chega perto (17 objetos reais), mas proíbe a afirmação
  única de herói, e a página inteira existe para entregar uma afirmação única.
- **Palco dividido**: não há argumento de dois lados.
- **Cutlist rítmica**: proíbe pin e dwell e pede pulso. O oposto de "elegante,
  calmo" e de um pico sustentado em silêncio.

Editorial em capítulos ganha nos quatro eixos da entrevista ao mesmo tempo:
vibe de revista, substância longa (17 entradas reais), cortes duros entre cenas,
fundo de papel e fólio na margem.

## O movimento-assinatura: o fólio é um relógio de sol

O fólio na margem (a chrome desta gramática) carrega um gnômon: um fio fino que
projeta sombra sobre a margem. A sombra gira e se alonga conforme ela desce, o
horário na margem avança, e a MESMA variável de scroll grada todas as fotografias
da página, o ponto branco do papel e a cor dos filetes. Um instrumento só,
governando margem, tipografia e fotografia ao mesmo tempo.

Reconciliação com a gramática, que proíbe drift como gradiente contínuo: os
FUNDOS dos capítulos continuam em corte duro, um por capítulo, pintados por
seção (devices.md 10). O que se move continuamente é a LUZ, e ela vive na camada
de chrome fixa, não na pilha de atos. É a forma geral de uniqueness.md 2.8: quando
a gramática proíbe o dispositivo que o pico quer, tira-se o pico da pilha de atos
em vez de quebrar a gramática.

## A curva de sentimento

Escrita antes dos atos existirem. Emoção primeiro, causa depois.

```
1  Descrença      a notícia em voz baixa, tipografia sobre papel, nenhuma foto
2  Curiosidade    as vilas onde ela vai acordar, na luz fria da manhã
3  Prazer         quatro mesas reais viajando de lado, etiquetas de museu
4  Intimidade     os quartos, revelados em wipe, luz do meio da tarde
5  Certeza        trens, datas e altitudes reais: a viagem tem horário
6  Expectativa    uma página quase vazia, só papel e uma linha
7  Espanto        a neblina limpa e o vale abre inteiro, sem uma palavra
8  Resolução      uma linha de texto corrido no canto, e a montanha não sai
```

Nenhum par adjacente repete emoção. O pico (7) tem o maior span por margem
visível: 3.4 contra 2.2 do segundo maior.

## O pico

Frase que ela diria para alguém:

> eu parei de ler, a neblina foi embora e o vale inteiro abriu no sol de fim de
> tarde, sem uma palavra escrita em cima.

Vive no capítulo 7. Recebe o orçamento de assets (o único clipe de vídeo da
página, mais o único still em qualidade máxima), o silêncio do capítulo 6 e o
maior span.

## A frase do "é o site onde ___"

> é o site onde o dia inteiro passa enquanto você desce, e quando chega o fim da
> tarde a montanha abre em silêncio.

Experiência, não dispositivo. O movimento-assinatura e o pico apontam para o
mesmo instante, como feel.md 3 exige: o aquecimento da luz É a aproximação do
pico, não um enfeite paralelo.

## Silêncio autoral (declarado para a verificação)

**Capítulo 6** é silêncio deliberado: papel, o fólio, uma única linha, nenhuma
mídia, cerca de 0.9vh. Não é scroll morto. A passagem de verificação precisa
saber disso para não reportar como defeito.

## Orçamento de comprimento

8 capítulos, cerca de 12.6vh no total. Fora da faixa 13.6–13.8vh em 6–7 atos que
a skill registra como impressão digital dos builds anteriores.

## A checagem de sentimento (feita fria, depois do harness)

Rolei a página do topo ao fim uma vez, em ritmo de leitura, anotando uma palavra
por ato ANTES de reabrir este arquivo.

| Ato | Pretendido | Sentido | Veredito |
|---|---|---|---|
| I Folha de rosto | Descrença | **Calma** | Divergiu |
| II As vilas | Curiosidade | Curiosidade | Bate |
| III As mesas | Prazer | Prazer | Bate |
| IV Os quartos | Intimidade | Intimidade | Bate |
| V O terreno | Certeza | Certeza | Bate |
| VI O silêncio | Expectativa | Expectativa | Bate |
| VII A montanha | Espanto | Espanto | Bate |
| VIII Colofão | Resolução | Resolução | Bate |

**A divergência e o que foi feito.** O ato I entregava calma no lugar de
descrença: "Suíça" sozinho é nome de lugar, não notícia, e a frase que carrega a
notícia estava pequena embaixo do título. Pela regra de feel.md, quem está errada
é a página, não o brief. O standfirst subiu para 1.45–2.35rem e a segunda frase
("É para onde nós vamos.") entrou em itálico da mesma família, que é como uma
revista dá ênfase sem levantar a voz. A resposta 3 da entrevista ("começa contida")
foi respeitada: não virou manchete.

Três checagens específicas:

- **O pico lê como pico?** Sim. Na folha de contato é a maior mudança visual da
  página (papel para fotografia sangrada) e ocupa o maior espaço de scroll,
  3.4 contra 2.2 do segundo maior.
- **Há silêncio antes dele?** Sim, o capítulo VI, e ele é mais quieto que o pico
  por construção: papel, uma linha em itálico, nenhuma mídia.
- **O fim resolve?** Sim. A última tela tem a montanha sustentada com o colofão
  em cima, cue de rampa de saída zero. Não desvanece nem vira rodapé.

## Defeitos encontrados na verificação e corrigidos

1. **A página terminava em papel vazio.** `.peak-stage { position: relative }`
   dividia elemento com `[data-sc-stage]` e sobrescrevia o `position: sticky`
   do motor, desgrudando o palco. O fim virava uma folha em branco, que é o
   fracasso que feel.md chama de "a página pedindo desculpa por existir".
   Removido; a padding do capítulo também zerada, porque comia 1.3vh do curso.
2. **Colofão ilegível sobre a montanha.** Os links de fim usavam o acento do
   papel (azul escuro) sobre fotografia escura: 1.79:1 e 1.91:1 medidos. Passou
   a usar o segundo passo do mesmo acento. Agora 8.06:1 e 8.67:1.
3. **Colofão chegava só no último pixel.** Cue de um valor só levava a opacidade
   a 1 no fim absoluto do scroll. Trocada por `0.68 1 0.28 0`: cheia em p≈0.85 e
   sustentando, com a montanha em silêncio de p=0 a p=0.73.
4. **Trilho repetia fotografia.** Duas mesas com a mesma imagem lado a lado. Três
   stills novos, um por restaurante.
5. **Link de pular conteúdo sempre visível.** `.sc-skip` não existe no motor (eu
   supus que existisse); estava em fluxo normal, empurrando o herói para baixo.
   Estilizado aqui, fora da tela até receber foco.
6. **Folha de rosto transbordava a dobra.** Padding do capítulo somava com a
   altura mínima. Capítulo I sem padding, altura mínima contada pelo border-box.
7. **Travessão e pontuação.** O conteúdo real usava travessão em 85 blocos de
   texto. O conversor virou parênteses, dois-pontos ou vírgula conforme o caso,
   evitando parênteses aninhados e dois-pontos antes de conjunção.
