import { BaseComponent } from '../../core/base-component.js';
import { getSiteContentValue } from '../../config/site-content.config.js';
import { isObject, toText } from '../../core/value.utils.js';

const FAQ_SELECTORS = {
  list: '[data-role="faq-list"]',
  toggle: '[data-action="faq-toggle"]',
  item: '.o-faq-accordion__item',
  panel: '.o-faq-accordion__panel',
};

function normalizeItems(rawItems) {
  if (!Array.isArray(rawItems)) {
    return [];
  }

  return rawItems
    .map((item) => (isObject(item) ? item : {}))
    .map((item, index) => ({
      title: toText(
        item.title,
        `Lorem Ipsum is simply dummy text of the printing and typesetting industry. (${index + 1})`
      ),
      text: toText(
        item.text,
        "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout. The point of using Lorem Ipsum is that it has a more-or-less normal distribution of letters, as opposed to using 'Content here, content here', making it look like readable English."
      ),
    }));
}

function parseDefaultOpenIndex(indexValue, max) {
  const parsed = Number.parseInt(String(indexValue), 10);

  if (!Number.isInteger(parsed) || parsed < 0 || parsed >= max) {
    return null;
  }

  return parsed;
}

function createChevronIcon() {
  const svgNs = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(svgNs, 'svg');
  icon.setAttribute('class', 'o-faq-accordion__icon');
  icon.setAttribute('width', '16');
  icon.setAttribute('height', '16');
  icon.setAttribute('viewBox', '0 0 16 16');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');

  const path = document.createElementNS(svgNs, 'path');
  path.setAttribute('d', 'M4.66675 9.33366L8.00008 6.00033L11.3334 9.33366');
  path.setAttribute('stroke', 'currentColor');
  path.setAttribute('stroke-width', '1.5');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');

  icon.append(path);
  return icon;
}

function createItemNode(item, index, isOpen) {
  const itemNode = document.createElement('article');
  itemNode.className = isOpen ? 'o-faq-accordion__item is-open' : 'o-faq-accordion__item';
  itemNode.setAttribute('data-index', String(index));

  const heading = document.createElement('h3');
  heading.className = 'o-faq-accordion__heading';

  const button = document.createElement('button');
  button.className = 'o-faq-accordion__trigger';
  button.type = 'button';
  button.setAttribute('data-action', 'faq-toggle');
  button.setAttribute('data-index', String(index));
  button.setAttribute('id', `faq-trigger-${index}`);
  button.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
  button.setAttribute('aria-controls', `faq-panel-${index}`);

  const title = document.createElement('span');
  title.className = 'o-faq-accordion__trigger-text';
  title.textContent = item.title;

  button.append(title, createChevronIcon());
  heading.append(button);

  const panel = document.createElement('div');
  panel.className = 'o-faq-accordion__panel';
  panel.id = `faq-panel-${index}`;
  panel.setAttribute('role', 'region');
  panel.setAttribute('aria-labelledby', `faq-trigger-${index}`);
  panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');

  const panelInner = document.createElement('div');
  panelInner.className = 'o-faq-accordion__panel-inner';

  const panelText = document.createElement('p');
  panelText.className = 'o-faq-accordion__panel-text';
  panelText.textContent = item.text;
  panelInner.append(panelText);
  panel.append(panelInner);

  itemNode.append(heading, panel);
  return itemNode;
}

export class FaqAccordionComponent extends BaseComponent {
  static selector = '[data-component="faq-accordion"]';
  static lazyOnScroll = true;

  constructor(root) {
    super(root);
    this.list = null;
    this.items = [];
    this.activeIndex = null;
    this.handleClick = this.handleClick.bind(this);
  }

  onMount() {
    this.list = this.query(FAQ_SELECTORS.list);

    if (!this.list) {
      return;
    }

    this.items = normalizeItems(getSiteContentValue('faq.items', []));
    this.activeIndex = parseDefaultOpenIndex(
      getSiteContentValue('faq.defaultOpenIndex', 0),
      this.items.length
    );

    this.render();
    this.root.addEventListener('click', this.handleClick);
  }

  onUnmount() {
    this.root.removeEventListener('click', this.handleClick);
  }

  handleClick(event) {
    if (!(event.target instanceof Element)) {
      return;
    }

    const toggleButton = event.target.closest(FAQ_SELECTORS.toggle);

    if (!toggleButton) {
      return;
    }

    const index = Number.parseInt(toggleButton.getAttribute('data-index') ?? '', 10);

    if (!Number.isInteger(index) || index < 0 || index >= this.items.length) {
      return;
    }

    this.activeIndex = this.activeIndex === index ? null : index;
    this.syncState();
    toggleButton.focus();
  }

  render() {
    if (!this.list) {
      return;
    }

    this.list.innerHTML = '';

    this.items.forEach((item, index) => {
      const isOpen = this.activeIndex === index;
      this.list.append(createItemNode(item, index, isOpen));
    });

    this.syncState();
  }

  syncState() {
    if (!this.list) {
      return;
    }

    const items = Array.from(this.list.querySelectorAll(FAQ_SELECTORS.item));

    items.forEach((itemNode) => {
      const index = Number.parseInt(itemNode.getAttribute('data-index') ?? '', 10);

      if (!Number.isInteger(index)) {
        return;
      }

      const isOpen = index === this.activeIndex;
      itemNode.classList.toggle('is-open', isOpen);

      const toggleButton = itemNode.querySelector(FAQ_SELECTORS.toggle);
      const panel = itemNode.querySelector(FAQ_SELECTORS.panel);

      if (toggleButton instanceof HTMLButtonElement) {
        toggleButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      }

      if (panel instanceof HTMLElement) {
        panel.setAttribute('aria-hidden', isOpen ? 'false' : 'true');
      }
    });
  }
}
