import { BaseComponent } from '../../core/base-component.js';
import { toText } from '../../core/value.utils.js';
import { getComponentConfig, getComponentValue } from '../../core/component-props.utils.js';

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
    this.config = {};
    this.cardText = '';
    this.symbol = '?';
    this.openLabel = 'Abrir';
    this.closeLabel = 'Fechar';
    this.activeIndex = null;

    this.handleListClick = this.handleListClick.bind(this);
  }

  onMount() {
    this.renderShell();

    this.list = this.query(REVEAL_CARDS_SELECTORS.list);

    if (!this.list) {
      return;
    }

    this.config = getComponentConfig(this.root, 'revealCards', {});
    this.cardText = toText(this.config.cardText, '');
    this.symbol = toText(this.config.symbol, '');
    this.openLabel = toText(this.config.openLabel, '');
    this.closeLabel = toText(this.config.closeLabel, '');

    const defaultActiveIndex = Number.parseInt(
      String(this.config.defaultActiveIndex),
      10
    );

    this.activeIndex =
      Number.isInteger(defaultActiveIndex) &&
      defaultActiveIndex >= 0 &&
      defaultActiveIndex < REVEAL_CARDS_LIMIT
        ? defaultActiveIndex
        : null;

    this.list.addEventListener('click', this.handleListClick);
    this.renderCards();
  }

  onUnmount() {
    if (!this.list) {
      return;
    }

    this.list.removeEventListener('click', this.handleListClick);
  }

  renderShell() {
    const sectionAriaLabel = toText(
      getComponentValue(this.root, 'revealCards', 'sectionAriaLabel', ''),
      ''
    );

    this.root.setAttribute('aria-label', sectionAriaLabel);

    this.root.innerHTML = `
      <div class="l-wrapper">
        <ul class="o-reveal-cards__list" data-role="reveal-cards-list"></ul>
      </div>
    `;
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
      this.renderCards();
      return;
    }

    if (action === 'reveal-card-close') {
      this.activeIndex = null;
      this.renderCards();
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

  renderCards() {
    if (!this.list) {
      return;
    }

    this.list.innerHTML = '';

    for (let index = 0; index < REVEAL_CARDS_LIMIT; index += 1) {
      this.list.append(this.createItemNode(index));
    }
  }
}
