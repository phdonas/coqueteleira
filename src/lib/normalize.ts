export function removeAcentos(s: string): string {
  return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}
export function norm(s: string): string {
  return removeAcentos(s).toLowerCase().trim().replace(/\s+/g, ' ');
}

export function parseQuantidade(q: string): number | undefined {
  if (!q) return undefined;
  const s = q.replace(',', '.').trim();
  const frac = s.match(/^(\d+)\s+(\d+)\/(\d+)$/);   // "2 1/4"
  if (frac) {
    const inteiro = parseFloat(frac[1]);
    const num = parseFloat(frac[2]);
    const den = parseFloat(frac[3]);
    return inteiro + (num / den);
  }
  const apenasFrac = s.match(/^(\d+)\/(\d+)$/);     // "1/2"
  if (apenasFrac) {
    const num = parseFloat(apenasFrac[1]);
    const den = parseFloat(apenasFrac[2]);
    return num / den;
  }
  const num = Number(s);
  return isNaN(num) ? undefined : num;
}

// Conversões (padrões, podem ser configuradas futuramente)
const CONV: Record<string, number> = {
  ml: 1,
  tsp: 5,
  tbsp: 15,
  oz: 29.57,
  cl: 10,
  barspoon: 5,
  dash: 1,
  gota: 0.05,
  unidade: 0, // não converte para ml
  g: 1        // simplificação
};

export function toMl(valor: number, unidade_padrao: string | undefined): number | undefined {
  if (!unidade_padrao) return undefined;
  const f = CONV[unidade_padrao];
  if (f === undefined || f === 0) return undefined;
  return valor * f;
}

// -------- NOVO: termos para busca por ingrediente --------
const STOP = new Set(['de','da','do','das','dos','e','em','com','a','o','as','os','um','uma','uns','umas']);
/**
 * Gera termos de busca a partir do nome do produto/ingrediente.
 * Inclui a frase inteira normalizada + tokens individuais (sem stopwords).
 * Ex.: "Suco de limão siciliano" -> ["suco de limao siciliano","suco","limao","siciliano"]
 */
export function productTerms(prod: string): string[] {
  const p = norm(prod);
  if (!p) return [];
  const tokens = p.split(' ').filter(t => t && !STOP.has(t) && t.length >= 2);
  return Array.from(new Set([p, ...tokens]));
}
