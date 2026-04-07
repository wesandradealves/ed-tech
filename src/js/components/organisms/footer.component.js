import { BaseComponent } from '../../core/base-component.js';
import { isObject, toText } from '../../core/value.utils.js';
import { getComponentConfig } from '../../core/component-props.utils.js';

function getFooterConfig(root) {
  const config = getComponentConfig(root, 'footer', {});
  return isObject(config) ? config : {};
}

export class FooterComponent extends BaseComponent {
  static selector = '[data-component="site-footer"]';
  static lazyOnScroll = false;

  onMount() {
    this.render();
  }

  render() {
    const footer = getFooterConfig(this.root);
    const logo = isObject(footer.logo) ? footer.logo : {};
    const link = isObject(footer.link) ? footer.link : {};

    this.root.setAttribute('aria-label', toText(footer.ariaLabel, ''));

    this.root.innerHTML = `
      <div class="l-wrapper l-wrapper--footer">
        <div class="o-footer__content">
          <a
            class="o-footer__brand"
            href="${toText(link.href, '')}"
            aria-label="${toText(link.ariaLabel, '')}"
          >
            <img
              class="o-footer__logo"
              src="${toText(logo.src, '')}"
              alt="${toText(logo.alt, '')}"
              width="${String(logo.width ?? 138)}"
              height="${String(logo.height ?? 42)}"
              loading="lazy"
              decoding="async"
            />
          </a>

          <p class="o-footer__copyright">
            ${toText(footer.copyright, '')}
          </p>
        </div>
      </div>
    `;
  }
}
