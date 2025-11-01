export function uuid() {
  return crypto.randomUUID();
}
export function genCodigo(prefix = 'DRK') {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth()+1).padStart(2,'0');
  const day = String(d.getDate()).padStart(2,'0');
  const seq = Math.floor(Math.random()*1000).toString().padStart(3,'0');
  return `${prefix}-${y}${m}${day}-${seq}`;
}

