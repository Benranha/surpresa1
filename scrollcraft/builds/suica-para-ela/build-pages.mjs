/* Gera as páginas de detalhe a partir do conteúdo real do site antigo.
   Nada é redigitado: tudo vem de content.json, passando pelo filtro que
   converte travessão em pontuação permitida pelo piso de gosto. */

import fs from "node:fs";
import path from "node:path";
import { clean } from "./clean.mjs";

const ROOT = path.resolve("../../..");
const P = JSON.parse(fs.readFileSync("content.json", "utf8"));
const QG = JSON.parse(fs.readFileSync("quiz-geral.json", "utf8"));

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const t = (s) => esc(clean(s));

/* tag: "St. Moritz · Desde 1896" -> partes, para virar etiqueta de museu */
const tagParts = (tag) => clean(tag).split("·").map((s) => s.trim()).filter(Boolean);

const PAGES = [
  {
    file: "lugares.html", num: "II", name: "As vilas",
    title: "Onde você acorda",
    lede: "Quatro lugares, e nenhum deles é uma cidade grande.",
    keys: ["grindelwald", "interlaken", "lucerna", "montreux"],
    /* Uma fotografia por entrada. Duas iguais em faixas vizinhas é a
       repetição que a folha de contato denuncia na hora. */
    beds: ["assets/02-vilas-a.webp", "assets/02-vilas-b.webp",
           "assets/02-vilas-c.webp", "assets/03-mesa-d.webp"],
    bedAlt: "Vila alpina na sombra azul da manhã, com a primeira luz tocando a parede de rocha acima.",
    hour: 0.08,
  },
  {
    file: "restaurantes.html", num: "III", name: "As mesas",
    title: "Onde você senta",
    lede: "De uma cozinha de duas estrelas a um fondue que existe desde 1849.",
    keys: ["memories", "chesery", "pizgloria", "cafedusoleil"],
    beds: ["assets/03-mesa-b.webp", "assets/03-mesa.webp",
           "assets/03-mesa-c.webp", "assets/03-mesa-d.webp"],
    bedAlt: "Mesa posta com toalha branca, queijo alpino, pão de centeio e uma panela de cobre fumegando.",
    hour: 0.38,
  },
  {
    file: "hoteis.html", num: "IV", name: "Os quartos",
    title: "Onde você dorme",
    lede: "Cinco casas, e a melhor delas não tem televisão de propósito.",
    keys: ["omnia", "badrutts", "alpina", "schweizerhof", "cambrian"],
    beds: ["assets/04-camas.webp", "assets/04-camas-b.webp",
           "assets/03-mesa-c.webp", "assets/03-mesa-d.webp",
           "assets/02-vilas-a.webp"],
    bedAlt: "Quarto alpino vazio com cama de linho na sombra e uma janela grande com um pico nevado.",
    hour: 0.62,
  },
  {
    file: "montanhas.html", num: "V", name: "As montanhas",
    title: "Onde você sobe",
    lede: "Quatro miradouros, do mais alto da Europa ao que mostra dois lagos de uma vez.",
    keys: ["jungfraujoch", "titlis", "gornergrat", "harderkulm"],
    beds: ["assets/05-monte-a.webp", "assets/05-monte-b.webp",
           "assets/03-mesa-c.webp", "assets/07-peak-clear.webp"],
    bedAlt: "Vale alpino visto de um ombro de rocha na luz do fim da tarde, com um pico nevado ao fundo.",
    hour: 0.88,
  },
];

const head = (title, desc) => `<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(title)}</title>
<meta name="description" content="${esc(desc)}">
<link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%23EDEFEE'/><path d='M4 24 L13 11 L19 19 L23 14 L28 24 Z' fill='%231B4C72'/></svg>">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600&family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="scrollcraft.css">
<link rel="stylesheet" href="site.css">
<link rel="stylesheet" href="detail.css">
</head>
<body>
<span data-sc-progress></span>
<a class="sc-skip" href="#conteudo">Ir para o conteúdo</a>`;

const folio = (num, name) => `
<aside class="folio" aria-hidden="true">
  <span class="folio__mark">Suíça, Para Ela</span>
  <div class="dial">
    <span class="dial__shadow"></span>
    <span class="dial__gnomon"></span>
    <span class="dial__hour" data-hour>06:40</span>
  </div>
  <p class="folio__chapter"><span>${esc(num)}</span><b>${esc(name)}</b></p>
</aside>`;

const tail = (dayBase) => `
<script src="scrollcraft.js"></script>
<script>
  ScrollCraft.mount(document.body);
  (function () {
    /* Mesmo instrumento da capa. Cada capítulo começa na hora que lhe cabe
       e avança dentro da própria página, para o dia continuar contínuo
       quando ela navega entre as páginas. */
    var root = document.documentElement, hourEl = document.querySelector('[data-hour]');
    var BASE = ${dayBase}, SPAN = 0.1;
    var START = 6 * 60 + 40, END = 18 * 60 + 20, ticking = false;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function paint() {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var local = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      var day = Math.min(1, BASE + local * SPAN);
      root.style.setProperty('--day', day.toFixed(4));
      var mins = Math.round(START + (END - START) * day);
      var txt = pad(Math.floor(mins / 60)) + ':' + pad(mins % 60);
      if (hourEl && hourEl.textContent !== txt) hourEl.textContent = txt;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();
  })();
</script>
</body>
</html>`;

/* ── uma entrada: cabeçalho de etiqueta, prosa real, e uma faixa
      em parallax entre uma entrada e a seguinte ───────────────── */
function entry(key, e, i, page) {
  const parts = tagParts(e.tag);
  const bed = page.beds[i % page.beds.length];
  /* recorte diferente por entrada: a mesma fotografia lida de outro ângulo
     em vez da mesma imagem repetida */
  const posY = [28, 62, 44, 76, 36][i % 5];
  const rate = [-0.9, -1.3, -0.6, -1.5, -1.05][i % 5];

  const prose = e.sections
    .map((s) => `        <div class="block">
          <h3 class="block__h">${t(s.heading)}</h3>
          <p>${t(s.text)}</p>
        </div>`)
    .join("\n");

  return `
  <article class="entry" id="${esc(key)}" data-sc-act="flow">
    <div class="wrap">
      <header class="entry__head">
        <div class="entry__id">
          <span class="label">${esc(String(i + 1).padStart(2, "0"))}</span>
          <h2 class="display--sm">${t(e.title)}</h2>
          <p class="entry__sub">${t(e.subtitle)}</p>
        </div>
        <ul class="facts">
${parts.map((p) => `          <li>${esc(p)}</li>`).join("\n")}
        </ul>
      </header>
      <div class="entry__body">
${prose}
      </div>
    </div>

    <div class="band" aria-hidden="true">
      <img src="${bed}" alt="" data-sc-parallax="${rate}"
           style="object-position: 50% ${posY}%">
    </div>
  </article>`;
}

for (const page of PAGES) {
  const entries = page.keys.map((k, i) => entry(k, P[k], i, page)).join("\n");

  const html = `${head(`${page.title}, Suíça`, `${page.lede} ${page.title} no roteiro da Suíça.`)}
${folio(page.num, page.name)}
<main class="page" id="conteudo">

  <header class="detail-hero" data-sc-act="flow">
    <div class="detail-hero__bed">
      <img src="${page.beds[0]}" alt="${esc(page.bedAlt)}" data-sc-parallax="-1.5">
    </div>
    <div class="wrap detail-hero__type" data-sc-in data-sc-stagger="70">
      <a class="back" href="index.html">Voltar ao convite</a>
      <span class="intertitle__num">Capítulo ${esc(page.num)}</span>
      <h1 class="display">${esc(page.title)}</h1>
      <p class="lede">${esc(page.lede)}</p>
    </div>
  </header>

${entries}

  <footer class="detail-foot">
    <div class="wrap">
      <p class="caption">Suíça, Para Ela. Capítulo ${esc(page.num)}: ${esc(page.name.toLowerCase())}.</p>
      <div class="detail-foot__links">
${PAGES.filter((o) => o.file !== page.file)
  .map((o) => `        <a class="link" href="${o.file}">${esc(o.name)}</a>`)
  .join("\n")}
        <a class="link" href="quiz.html">O quiz</a>
        <a class="link" href="index.html">O convite</a>
      </div>
    </div>
  </footer>

</main>
${tail(page.hour)}`;

  fs.writeFileSync(path.join(ROOT, page.file), html);
  console.log("escrito", page.file, "com", page.keys.length, "entradas");
}

/* ── a página do quiz ───────────────────────────────────────── */
const quizGroups = [
  ...PAGES.map((pg) => ({
    title: pg.name,
    items: pg.keys.flatMap((k) =>
      (P[k].quiz || []).map((q) => ({ ...q, from: P[k].title }))
    ),
  })),
  { title: "Geral", items: QG.map((q) => ({ ...q, from: "Suíça" })) },
];

const total = quizGroups.reduce((n, g) => n + g.items.length, 0);

const quizHtml = `${head("O quiz, Suíça", `${total} perguntas sobre os lugares, as mesas, os quartos e as montanhas da viagem.`)}
${folio("VIII", "O quiz")}
<main class="page" id="conteudo">

  <header class="detail-hero detail-hero--plain" data-sc-act="flow">
    <div class="wrap detail-hero__type" data-sc-in data-sc-stagger="70">
      <a class="back" href="index.html">Voltar ao convite</a>
      <span class="intertitle__num">Capítulo VIII</span>
      <h1 class="display">O quiz</h1>
      <p class="lede">${total} perguntas. Nenhuma delas é pegadinha: tudo está escrito nas outras páginas.</p>
    </div>
  </header>

  <div class="wrap quiz-score" data-sc-act="flow">
    <p class="label">Acertos</p>
    <p class="quiz-score__n"><span data-score>0</span> <span class="quiz-score__of">de ${total}</span></p>
  </div>

${quizGroups
  .map(
    (g) => `  <section class="quiz-group" data-sc-act="flow">
    <div class="wrap">
      <div class="intertitle"><h2 class="display--sm">${esc(g.title)}</h2></div>
${g.items
  .map(
    (q, i) => `      <div class="q" data-correct="${q.correct}">
        <p class="q__from label">${t(q.from)}</p>
        <p class="q__text">${t(q.q)}</p>
        <div class="q__opts" role="group" aria-label="${t(q.q)}">
${q.opts
  .map(
    (o, j) =>
      `          <button type="button" class="opt" data-i="${j}">${t(o)}</button>`
  )
  .join("\n")}
        </div>
        <p class="q__feedback" hidden>${t(q.feedback)}</p>
      </div>`
  )
  .join("\n")}
    </div>
  </section>`
  )
  .join("\n")}

  <footer class="detail-foot">
    <div class="wrap">
      <p class="caption">Suíça, Para Ela. Capítulo VIII: o quiz.</p>
      <div class="detail-foot__links">
${PAGES.map((o) => `        <a class="link" href="${o.file}">${esc(o.name)}</a>`).join("\n")}
        <a class="link" href="index.html">O convite</a>
      </div>
    </div>
  </footer>

</main>

<script src="scrollcraft.js"></script>
<script>
  ScrollCraft.mount(document.body);
  (function () {
    var root = document.documentElement, hourEl = document.querySelector('[data-hour]');
    var START = 6 * 60 + 40, END = 18 * 60 + 20, ticking = false;
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function paint() {
      ticking = false;
      var max = document.documentElement.scrollHeight - window.innerHeight;
      var day = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      root.style.setProperty('--day', day.toFixed(4));
      var mins = Math.round(START + (END - START) * day);
      var txt = pad(Math.floor(mins / 60)) + ':' + pad(mins % 60);
      if (hourEl && hourEl.textContent !== txt) hourEl.textContent = txt;
    }
    function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(paint); } }
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
    paint();

    /* O quiz responde no lugar, sem recarregar e sem alerta do navegador. */
    var score = 0, scoreEl = document.querySelector('[data-score]');
    document.querySelectorAll('.q').forEach(function (q) {
      var right = parseInt(q.getAttribute('data-correct'), 10);
      var fb = q.querySelector('.q__feedback');
      q.querySelectorAll('.opt').forEach(function (btn) {
        btn.addEventListener('click', function () {
          if (q.dataset.done) return;
          q.dataset.done = '1';
          var picked = parseInt(btn.getAttribute('data-i'), 10);
          q.querySelectorAll('.opt').forEach(function (b, j) {
            b.disabled = true;
            if (j === right) b.classList.add('is-right');
          });
          if (picked === right) { score++; scoreEl.textContent = score; }
          else { btn.classList.add('is-wrong'); }
          fb.hidden = false;
        });
      });
    });
  })();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(ROOT, "quiz.html"), quizHtml);
console.log("escrito quiz.html com", total, "perguntas");
