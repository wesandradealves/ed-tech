const SITE_CONTENT_URL = '/config/site-content.json';

let siteContentConfig = null;

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getValueByPath(source, path) {
  if (!isObject(source) || !path) {
    return undefined;
  }

  return path.split('.').reduce((accumulator, key) => {
    if (accumulator === undefined || accumulator === null) {
      return undefined;
    }

    return accumulator[key];
  }, source);
}

function queryByRole(role) {
  return document.querySelector(`[data-role="${role}"]`);
}

function setNodeTextByRole(role, value) {
  if (typeof value !== 'string') {
    return;
  }

  const node = queryByRole(role);

  if (node) {
    node.textContent = value;
  }
}

function setNodeAttrByRole(role, attribute, value) {
  if (value === undefined || value === null) {
    return;
  }

  const node = queryByRole(role);

  if (node) {
    node.setAttribute(attribute, String(value));
  }
}

function setNodeAttrByAction(action, attribute, value) {
  if (value === undefined || value === null) {
    return;
  }

  const node = document.querySelector(`[data-action="${action}"]`);

  if (node) {
    node.setAttribute(attribute, String(value));
  }
}

function setMetaByName(name, value) {
  if (typeof value !== 'string') {
    return;
  }

  const meta = document.querySelector(`meta[name="${name}"]`);

  if (meta) {
    meta.setAttribute('content', value);
  }
}

function setMetaByProperty(property, value) {
  if (typeof value !== 'string') {
    return;
  }

  const meta = document.querySelector(`meta[property="${property}"]`);

  if (meta) {
    meta.setAttribute('content', value);
  }
}

function setCanonical(value) {
  if (typeof value !== 'string') {
    return;
  }

  const canonical = document.querySelector('link[rel="canonical"]');

  if (canonical) {
    canonical.setAttribute('href', value);
  }
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
  setNodeTextByRole('skip-link', a11yConfig.skipToContentText);
}

function applyHero(heroConfig = {}) {
  const title = isObject(heroConfig.title) ? heroConfig.title : {};
  const button = isObject(heroConfig.button) ? heroConfig.button : {};
  const image = isObject(heroConfig.image) ? heroConfig.image : {};

  setNodeTextByRole('hero-title-line1', title.line1);
  setNodeTextByRole('hero-title-line2-prefix', title.line2Prefix);
  setNodeTextByRole('hero-title-line2-highlight', title.line2Highlight);
  setNodeTextByRole('hero-description', heroConfig.description);
  setNodeTextByRole('hero-button-text', button.text);
  setNodeAttrByAction('hero-play-video', 'aria-label', button.ariaLabel);
  setNodeAttrByRole('hero-image', 'src', image.src);
  setNodeAttrByRole('hero-image', 'alt', image.alt);
  setNodeAttrByRole('hero-image', 'width', image.width);
  setNodeAttrByRole('hero-image', 'height', image.height);
}

function applyVideo(videoConfig = {}) {
  const thumbnail = isObject(videoConfig.thumbnail) ? videoConfig.thumbnail : {};
  const controls = isObject(videoConfig.controls) ? videoConfig.controls : {};

  setNodeTextByRole('video-intro-title', videoConfig.title);
  setNodeTextByRole('video-intro-description', videoConfig.description);
  setNodeAttrByRole('video-intro-image', 'src', thumbnail.src);
  setNodeAttrByRole('video-intro-image', 'alt', thumbnail.alt);
  setNodeAttrByRole('video-intro-image', 'width', thumbnail.width);
  setNodeAttrByRole('video-intro-image', 'height', thumbnail.height);
  setNodeAttrByAction('video-intro-play', 'aria-label', controls.playAriaLabel);
  setNodeAttrByAction('video-intro-pause', 'aria-label', controls.pauseAriaLabel);
}

function syncParagraphs(container, values = []) {
  if (!container || !Array.isArray(values)) {
    return;
  }

  const normalized = values.filter((value) => typeof value === 'string');

  container.innerHTML = '';

  normalized.forEach((paragraphText) => {
    const paragraph = document.createElement('p');
    paragraph.textContent = paragraphText;
    container.append(paragraph);
  });
}

function applyWaveText(waveTextConfig = {}) {
  const section = queryByRole('wave-text-section');
  const image = isObject(waveTextConfig.image) ? waveTextConfig.image : {};

  if (section && typeof waveTextConfig.sectionAriaLabel === 'string') {
    section.setAttribute('aria-label', waveTextConfig.sectionAriaLabel);
  }

  setNodeAttrByRole('wave-text-image', 'src', image.src);
  setNodeAttrByRole('wave-text-image', 'alt', image.alt);
  setNodeAttrByRole('wave-text-image', 'width', image.width);
  setNodeAttrByRole('wave-text-image', 'height', image.height);

  const copyContainer = queryByRole('wave-text-copy');
  syncParagraphs(copyContainer, waveTextConfig.paragraphs);
}

function createSlideNode(slideConfig = {}, isActive) {
  const slide = document.createElement('li');
  slide.className = 'o-forest-slider__slide';
  slide.setAttribute('data-role', 'forest-slide');
  slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');

  if (!isActive) {
    slide.hidden = true;
  }

  const image = document.createElement('img');
  image.className = 'o-forest-slider__image';
  image.setAttribute('loading', 'lazy');
  image.setAttribute('decoding', 'async');

  if (typeof slideConfig.src === 'string') {
    image.setAttribute('src', slideConfig.src);
  }

  if (typeof slideConfig.alt === 'string') {
    image.setAttribute('alt', slideConfig.alt);
  }

  if (slideConfig.width !== undefined) {
    image.setAttribute('width', String(slideConfig.width));
  }

  if (slideConfig.height !== undefined) {
    image.setAttribute('height', String(slideConfig.height));
  }

  slide.append(image);
  return slide;
}

function createDotNode(index, isActive, prefix) {
  const dot = document.createElement('button');
  dot.className = isActive ? 'o-forest-slider__dot is-active' : 'o-forest-slider__dot';
  dot.type = 'button';
  dot.setAttribute('data-action', 'forest-slider-dot');
  dot.setAttribute('data-slide-index', String(index));
  dot.setAttribute('aria-label', `${prefix} ${index + 1}`);
  dot.setAttribute('aria-pressed', isActive ? 'true' : 'false');

  return dot;
}

function applyForestSlider(forestSliderConfig = {}) {
  const section = queryByRole('forest-slider-section');

  if (!section) {
    return;
  }

  if (typeof forestSliderConfig.sectionAriaLabel === 'string') {
    section.setAttribute('aria-label', forestSliderConfig.sectionAriaLabel);
  }

  setNodeAttrByAction('forest-slider-prev', 'aria-label', forestSliderConfig.previousAriaLabel);
  setNodeAttrByAction('forest-slider-next', 'aria-label', forestSliderConfig.nextAriaLabel);

  const statusNode = queryByRole('forest-slider-status');

  if (statusNode && typeof forestSliderConfig.statusTemplate === 'string') {
    statusNode.setAttribute('data-status-template', forestSliderConfig.statusTemplate);
  }

  const track = queryByRole('forest-slider-track');
  const dotsContainer = queryByRole('forest-slider-dots');
  const slides = Array.isArray(forestSliderConfig.slides) ? forestSliderConfig.slides : [];

  if (!track || !dotsContainer || slides.length === 0) {
    return;
  }

  const dotPrefix =
    typeof forestSliderConfig.dotAriaLabelPrefix === 'string'
      ? forestSliderConfig.dotAriaLabelPrefix
      : '';

  if (typeof forestSliderConfig.dotsGroupAriaLabel === 'string') {
    dotsContainer.setAttribute('aria-label', forestSliderConfig.dotsGroupAriaLabel);
  }

  track.innerHTML = '';
  dotsContainer.innerHTML = '';

  slides.forEach((slideConfig, index) => {
    const isActive = index === 0;
    track.append(createSlideNode(slideConfig, isActive));
    dotsContainer.append(createDotNode(index, isActive, dotPrefix));
  });
}

function applySiteContent(contentConfig = siteContentConfig) {
  if (!isObject(contentConfig)) {
    return;
  }

  applyMeta(contentConfig.meta);
  applyA11y(contentConfig.a11y);
  applyHero(contentConfig.hero);
  applyVideo(contentConfig.video);
  applyWaveText(contentConfig.waveText);
  applyForestSlider(contentConfig.forestSlider);
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
    applySiteContent(siteContentConfig);
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
