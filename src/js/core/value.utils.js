export function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function toText(value, fallback = '') {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

export function getValueByPath(source, path) {
  if (!isObject(source) || typeof path !== 'string' || path.length === 0) {
    return undefined;
  }

  return path.split('.').reduce((accumulator, key) => {
    if (accumulator === undefined || accumulator === null) {
      return undefined;
    }

    return accumulator[key];
  }, source);
}
