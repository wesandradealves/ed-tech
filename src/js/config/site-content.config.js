import { getValueByPath, isObject } from '../core/value.utils.js';

const SITE_CONTENT_URL = '/config/site-content.json';

let siteContentConfig = null;

function setMetaByName(name, value) {
  if (typeof value !== 'string') {
    return;
  }

  let meta = document.querySelector(`meta[name="${name}"]`);

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('name', name);
    document.head.append(meta);
  }

  meta.setAttribute('content', value);
}

function setMetaByProperty(property, value) {
  if (typeof value !== 'string') {
    return;
  }

  let meta = document.querySelector(`meta[property="${property}"]`);

  if (!meta) {
    meta = document.createElement('meta');
    meta.setAttribute('property', property);
    document.head.append(meta);
  }

  meta.setAttribute('content', value);
}

function setCanonical(value) {
  if (typeof value !== 'string') {
    return;
  }

  let canonical = document.querySelector('link[rel="canonical"]');

  if (!canonical) {
    canonical = document.createElement('link');
    canonical.setAttribute('rel', 'canonical');
    document.head.append(canonical);
  }

  canonical.setAttribute('href', value);
}

function applyMeta(metaConfig = {}) {
  if (typeof metaConfig.lang === 'string') {
    document.documentElement.lang = metaConfig.lang;
  }

  if (typeof metaConfig.title === 'string') {
    document.title = metaConfig.title;
  }

  setMetaByName('description', metaConfig.description);
  setMetaByName('robots', metaConfig.robots);
  setMetaByName('theme-color', metaConfig.themeColor);
  setCanonical(metaConfig.canonicalUrl);

  const og = isObject(metaConfig.og) ? metaConfig.og : {};
  setMetaByProperty('og:type', og.type);
  setMetaByProperty('og:locale', og.locale);
  setMetaByProperty('og:site_name', og.siteName);
  setMetaByProperty('og:title', og.title);
  setMetaByProperty('og:description', og.description);
  setMetaByProperty('og:url', og.url);
  setMetaByProperty('og:image', og.image);
  setMetaByProperty('og:image:width', og.imageWidth);
  setMetaByProperty('og:image:height', og.imageHeight);
  setMetaByProperty('og:image:alt', og.imageAlt);

  const twitter = isObject(metaConfig.twitter) ? metaConfig.twitter : {};
  setMetaByName('twitter:card', twitter.card);
  setMetaByName('twitter:title', twitter.title);
  setMetaByName('twitter:description', twitter.description);
  setMetaByName('twitter:image', twitter.image);
  setMetaByName('twitter:image:alt', twitter.imageAlt);
}

function applyA11y(a11yConfig = {}) {
  if (typeof a11yConfig.skipToContentText !== 'string') {
    return;
  }

  const skipLink = document.querySelector('[data-role="skip-link"]');

  if (skipLink) {
    skipLink.textContent = a11yConfig.skipToContentText;
  }
}

export async function initializeSiteContent() {
  try {
    const response = await fetch(SITE_CONTENT_URL);

    if (!response.ok) {
      throw new Error(`Falha ao carregar ${SITE_CONTENT_URL}: ${response.status}`);
    }

    const parsed = await response.json();

    if (!isObject(parsed)) {
      throw new Error('Configuração inválida: JSON deve ser um objeto.');
    }

    siteContentConfig = parsed;
    applyMeta(siteContentConfig.meta);
    applyA11y(siteContentConfig.a11y);
  } catch (error) {
    console.error('[site-content] Erro ao carregar configuração:', error);
  }
}

export function getSiteContentConfig() {
  return siteContentConfig;
}

export function getSiteContentValue(path, fallbackValue) {
  const value = getValueByPath(siteContentConfig, path);

  return value === undefined ? fallbackValue : value;
}
