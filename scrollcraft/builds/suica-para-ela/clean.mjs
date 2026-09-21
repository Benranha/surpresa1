// Converte o texto real do site antigo para o piso de gosto da skill:
// travessão vira parêntese, dois-pontos ou vírgula.
// O traço de intervalo numérico (10–22°C, 3 a 6) fica como está.

// Depois de uma conjunção, dois-pontos está errado em português: pede vírgula.
const CONJ = /^(mas|porém|contudo|todavia|entretanto|e|ou|nem|pois|porque|já que|embora|enquanto|então|logo|portanto)\b/i;

export function clean(t) {
  if (!t) return t;
  let s = t;

  // 1. Par de travessões no meio da frase vira parêntese, MAS só se o trecho
  //    encerrado não tiver parêntese dentro: senão produz aninhamento feio
  //    ("o Eiger (com a Nordwand (parede norte) de 1.800 m)"). Nesse caso,
  //    vírgulas.
  s = s.replace(/\s+—\s+([^—]{3,160}?)\s+—\s+/g, (m, inner) =>
    /[()]/.test(inner) ? `, ${inner}, ` : ` (${inner}) `
  );

  // 2. Travessão que abre uma explicação até o fim da frase vira dois-pontos,
  //    a não ser que o que venha depois comece por conjunção.
  s = s.replace(/\s+—\s+([^—]*?)([.!?])(\s|$)/g, (m, tail, stop, sp) =>
    CONJ.test(tail.trim()) ? `, ${tail}${stop}${sp}` : `: ${tail}${stop}${sp}`
  );

  // 3. Qualquer travessão restante vira vírgula.
  s = s.replace(/\s+—\s+/g, ", ").replace(/—/g, ", ");

  // 4. Limpeza da pontuação que as regras acima podem encavalar.
  s = s
    .replace(/:\s*:/g, ":")
    .replace(/,\s*,/g, ",")
    .replace(/\s+,/g, ",")
    .replace(/,\s*([.!?])/g, "$1")
    .replace(/\(\s+/g, "(")
    .replace(/\s+\)/g, ")")
    .replace(/\s{2,}/g, " ");

  return s.trim();
}
