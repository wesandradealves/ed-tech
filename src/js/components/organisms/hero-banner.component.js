import { BaseComponent } from '../../core/base-component.js';
import { getSiteContentValue } from '../../config/site-content.config.js';
import { isObject, toText } from '../../core/value.utils.js';
import { createCtaButton } from '../atoms/button.atom.js';
import { getComponentConfig, getComponentProps, getComponentValue } from '../../core/component-props.utils.js';

const HERO_SELECTORS = {
  buttonSlot: '[data-role="hero-button-slot"]',
  playButton: '[data-action="hero-play-video"]',
};

function getHeroConfig(root) {
  const heroConfig = getComponentConfig(root, 'hero', {});
  return isObject(heroConfig) ? heroConfig : {};
}

export class HeroBannerComponent extends BaseComponent {
  static selector = '[data-component="hero-banner"]';
  static lazyOnScroll = true;

  constructor(root) {
    super(root);
    this.playButton = null;
    this.handlePlayButtonClick = this.handlePlayButtonClick.bind(this);
  }

  onMount() {
    this.render();

    this.playButton = this.query(HERO_SELECTORS.playButton);

    if (!this.playButton) {
      return;
    }

    this.playButton.addEventListener('click', this.handlePlayButtonClick);
  }

  onUnmount() {
    if (!this.playButton) {
      return;
    }

    this.playButton.removeEventListener('click', this.handlePlayButtonClick);
  }

  render() {
    const hero = getHeroConfig(this.root);
    const title = isObject(hero.title) ? hero.title : {};
    const button = isObject(hero.button) ? hero.button : {};
    const image = isObject(hero.image) ? hero.image : {};

    this.root.setAttribute('aria-labelledby', 'hero-title');

    this.root.innerHTML = `
      <div class="l-wrapper l-wrapper--hero">
        <div class="o-hero-banner__content">
          <div class="o-hero-banner__text-block">
            <h1 class="o-hero-banner__title" id="hero-title">
              <span>${toText(title.line1, '')}</span>
              <span>
                <span>${toText(title.line2Prefix, '')}</span>
                <em>${toText(title.line2Highlight, '')}</em>
              </span>
            </h1>
            <p class="o-hero-banner__description">
              ${toText(hero.description, '')}
            </p>
            <div data-role="hero-button-slot"></div>
          </div>

          <div class="o-hero-banner__visual-wrap">
            <img
              class="o-hero-banner__visual"
              src="${toText(image.src, '')}"
              alt="${toText(image.alt, '')}"
              width="${String(image.width ?? 560)}"
              height="${String(image.height ?? 436)}"
              loading="lazy"
              decoding="async"
            />
          </div>
        </div>
      </div>
    `;

    const buttonSlot = this.query(HERO_SELECTORS.buttonSlot);

    if (!buttonSlot) {
      return;
    }

    const ctaButton = createCtaButton({
      text: toText(button.text, ''),
      ariaLabel: toText(button.ariaLabel, ''),
      action: 'hero-play-video',
      tone: toText(button.colorScheme, 'accent'),
      extraClassNames: ['o-hero-banner__button'],
    });

    buttonSlot.append(ctaButton);
  }

  handlePlayButtonClick() {
    const props = getComponentProps(this.root);
    const videoUrlPath = isObject(props.values) ? toText(props.values.videoUrlPath, '') : '';
    const targetUrl = videoUrlPath.length > 0
      ? getSiteContentValue(videoUrlPath, '')
      : getComponentValue(this.root, 'hero', 'externalUrl', '');

    if (typeof targetUrl !== 'string' || targetUrl.length === 0) {
      return;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
}
