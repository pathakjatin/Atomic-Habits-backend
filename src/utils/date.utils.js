export function toDateString(date = new Date()) {
  return new Date(date).toISOString().slice(0, 10);
}

export function isSameDay(a, b) {
  return toDateString(a) === toDateString(b);
}

export function getYesterday(date = new Date()) {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() - 1);
  return toDateString(d);
}