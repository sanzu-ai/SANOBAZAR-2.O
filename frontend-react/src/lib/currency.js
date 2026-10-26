export function toPaisa(value) {
  const normalized = String(value ?? 0).replace(/,/g, '').trim();
  const match = normalized.match(/^(-?)(\d+)(?:\.(\d*))?$/);
  if (!match) return 0;

  const [, sign, wholePart, fractionPart = ''] = match;
  let paisa = Number(wholePart) * 100 + Number(fractionPart.slice(0, 2).padEnd(2, '0'));
  if (fractionPart[2] && Number(fractionPart[2]) >= 5) paisa += 1;
  return sign ? -paisa : paisa;
}

export function formatNPR(value) {
  const amount = Number(value);
  const safeAmount = Number.isFinite(amount) ? amount : 0;
  return `NPR ${safeAmount.toLocaleString('en-NP', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}`;
}
