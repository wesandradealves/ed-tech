import { BaseComponent } from '../../core/base-component.js';
import { isObject, toText } from '../../core/value.utils.js';
import { getComponentConfig } from '../../core/component-props.utils.js';

function getWaveTextConfig(root) {
  const config = getComponentConfig(root, 'waveText', {});
  return isObject(config) ? config : {};
}

export class WaveTextComponent extends BaseComponent {
  static selector = '[data-component="wave-text"]';
  static lazyOnScroll = true;

  onMount() {
    this.render();
  }

  render() {
    const config = getWaveTextConfig(this.root);
    const image = isObject(config.image) ? config.image : {};
    const paragraphs = Array.isArray(config.paragraphs)
      ? config.paragraphs.filter((value) => typeof value === 'string' && value.trim().length > 0)
      : [];

    this.root.setAttribute(
      'aria-label',
      toText(config.sectionAriaLabel, '')
    );

    const paragraphsMarkup = paragraphs
      .map((paragraph) => `<p>${paragraph}</p>`)
      .join('');

    this.root.innerHTML = `
      <div class="l-wrapper">
        <article class="o-wave-text__card">
          <figure class="o-wave-text__media">
            <img
              class="o-wave-text__image"
              src="${toText(image.src, '')}"
              alt="${toText(image.alt, '')}"
              width="${String(image.width ?? 431)}"
              height="${String(image.height ?? 258)}"
              loading="lazy"
              decoding="async"
            />
          </figure>

          <div class="o-wave-text__copy">
            ${paragraphsMarkup}
          </div>
        </article>
      </div>
    `;
  }
}
