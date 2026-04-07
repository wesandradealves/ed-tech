import { BaseComponent } from '../../core/base-component.js';
import { toText } from '../../core/value.utils.js';
import { getComponentValue } from '../../core/component-props.utils.js';

export class DarkTextBoxComponent extends BaseComponent {
  static selector = '[data-component="dark-text-box"]';
  static lazyOnScroll = true;

  onMount() {
    this.render();
  }

  render() {
    this.root.setAttribute(
      'aria-label',
      toText(getComponentValue(this.root, 'darkTextBox', 'sectionAriaLabel', ''), '')
    );

    this.root.innerHTML = `
      <div class="l-wrapper">
        <article class="o-dark-text-box__card">
          <p class="o-dark-text-box__text">
            ${toText(
              getComponentValue(this.root, 'darkTextBox', 'text', ''),
              ''
            )}
          </p>
        </article>
      </div>
    `;
  }
}
