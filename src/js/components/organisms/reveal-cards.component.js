import { BaseComponent } from '../../core/base-component.js';
import { getSiteContentValue } from '../../config/site-content.config.js';
import { toText } from '../../core/value.utils.js';

const REVEAL_CARDS_SELECTORS = {
  list: '[data-role="reveal-cards-list"]',
};

const REVEAL_CARDS_LIMIT = 3;

export class RevealCardsComponent extends BaseComponent {
  static selector = '[data-component="reveal-cards"]';
  static lazyOnScroll = true;

  constructor(root) {
    super(root);
    this.list = null;
    this.cardText = '';
    this.symbol = '?';
    this.openLabel = 'Abrir';
    this.closeLabel = 'Fechar';
    this.activeIndex = null;

    this.handleListClick = this.handleListClick.bind(this);
  }

  onMount() {
    this.list = this.query(REVEAL_CARDS_SELECTORS.list);

    if (!this.list) {
      return;
    }

    this.cardText = toText(
      getSiteContentValue('revealCards.cardText'),
      ''
    );
    this.symbol = toText(getSiteContentValue('revealCards.symbol'), '?');
    this.openLabel = toText(
      getSiteContentValue('revealCards.openLabel'),
      'Abrir'
    );
    this.closeLabel = toText(
      getSiteContentValue('revealCards.closeLabel'),
      'Fechar'
    );

    const sectionAriaLabel = getSiteContentValue('revealCards.sectionAriaLabel');

    if (typeof sectionAriaLabel === 'string' && sectionAriaLabel.length > 0) {
      this.root.setAttribute('aria-label', sectionAriaLabel);
    }

    const defaultActiveIndex = Number.parseInt(
      String(getSiteContentValue('revealCards.defaultActiveIndex', 1)),
      10
    );

    this.activeIndex =
      Number.isInteger(defaultActiveIndex) &&
      defaultActiveIndex >= 0 &&
      defaultActiveIndex < REVEAL_CARDS_LIMIT
        ? defaultActiveIndex
        : null;

    this.list.addEventListener('click', this.handleListClick);
    this.render();
  }

  onUnmount() {
    if (!this.list) {
      return;
    }

    this.list.removeEventListener('click', this.handleListClick);
  }

  handleListClick(event) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const button = event.target.closest('button[data-action]');

    if (!button) {
      return;
    }

    const index = Number.parseInt(button.dataset.cardIndex ?? '', 10);

    if (!Number.isInteger(index) || index < 0 || index >= REVEAL_CARDS_LIMIT) {
      return;
    }

    const action = button.dataset.action;

    if (action === 'reveal-card-open') {
      this.activeIndex = index;
      this.render();
      return;
    }

    if (action === 'reveal-card-close') {
      this.activeIndex = null;
      this.render();
    }
  }

  createItemNode(index) {
    const isActive = this.activeIndex === index;
    const panelId = `reveal-card-panel-${index + 1}`;
    const item = document.createElement('li');
    item.className = isActive
      ? 'o-reveal-cards__item is-active'
      : 'o-reveal-cards__item';

    const content = document.createElement('div');
    content.className = 'o-reveal-cards__content';

    const symbol = document.createElement('span');
    symbol.className = 'o-reveal-cards__symbol';
    symbol.setAttribute('aria-hidden', 'true');
    symbol.textContent = this.symbol;

    const panel = document.createElement('p');
    panel.className = 'o-reveal-cards__text';
    panel.id = panelId;
    panel.hidden = !isActive;
    panel.textContent = this.cardText;

    content.append(symbol, panel);

    const actionWrap = document.createElement('div');
    actionWrap.className = 'o-reveal-cards__action-wrap';

    const button = document.createElement('button');
    button.className = 'a-button o-reveal-cards__action';
    button.type = 'button';
    button.dataset.cardIndex = String(index);
    button.dataset.action = isActive ? 'reveal-card-close' : 'reveal-card-open';
    button.setAttribute('aria-controls', panelId);
    button.setAttribute('aria-expanded', isActive ? 'true' : 'false');
    button.setAttribute(
      'aria-label',
      `${isActive ? this.closeLabel : this.openLabel} card ${index + 1}`
    );
    button.textContent = isActive ? this.closeLabel : this.openLabel;

    actionWrap.append(button);
    item.append(content, actionWrap);

    return item;
  }

  render() {
    if (!this.list) {
      return;
    }

    this.list.innerHTML = '';

    for (let index = 0; index < REVEAL_CARDS_LIMIT; index += 1) {
      this.list.append(this.createItemNode(index));
    }
  }
}
