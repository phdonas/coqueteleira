// src/lib/utils.ts
// (Item 2 & 1 â€” util: normalizaÃ§Ã£o de ingredientes para `ingredientes_norm_set`)

const STOP_WORDS = new Set([
  "de","do","da","dos","das","e","ou","com","sem","ao","aos","as","Ã ","Ã s"
]);

/** "50 ml vermute tinto" -> ["vermute","tinto"]; "casca de limÃ£o" -> ["casca","limao"] */
export function normalizeIngredientLine(line: string): string[] {
  const low = line
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, ""); // tira acentos

  // tira nÃºmeros e medidas comuns
  const noQty = low.replace(/\b(\d+[\/\d\.]*|ml|gr?amas?|g|kg|oz|oncas?|colheres?|colh\.?|col\.?|xicaras?|tsp|tbsp|dash(?:es)?|pitadas?)\b/g, " ");

  return noQty
    .replace(/[^a-z0-9\s\-]/g, " ")
    .split(/\s+/)
    .filter(Boolean)
    .filter((t) => !STOP_WORDS.has(t))
    .map((t) => t.replace(/^-+|-+$/g, ""))
    .filter(Boolean);
}

/** texto multi-linha -> conjunto Ãºnico para gravar no array `ingredientes_norm_set` */
export function buildIngredientNormSet(textoMultilinha: string): string[] {
  const set = new Set<string>();
  textoMultilinha
    .split(/\r?\n/)
    .map((s) => s.trim())
    .filter(Boolean)
    .forEach((line) => {
      normalizeIngredientLine(line).forEach((tok) => set.add(tok));
    });
  return Array.from(set);
}

