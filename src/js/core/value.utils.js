export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function toText(value, fallback = '') {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}
