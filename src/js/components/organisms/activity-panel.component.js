import { BaseComponent } from '../../core/base-component.js';
import { isObject, toText } from '../../core/value.utils.js';
import { getComponentConfig, getComponentProps } from '../../core/component-props.utils.js';

const ACTIVITY_SELECTORS = {
  root: '[data-role="activity-panel-root"]',
  iconImage: '[data-role="activity-icon-image"]',
  title: '[data-role="activity-title"]',
  description: '[data-role="activity-description"]',
  optionsLegend: '[data-role="activity-options-legend"]',
  optionRow: '[data-role="activity-option"]',
  optionInput: '[data-role="activity-option-input"]',
  optionPrefix: '[data-role="activity-option-prefix"]',
  optionLabel: '[data-role="activity-option-label"]',
  textareaLabel: '[data-role="activity-textarea-label"]',
  textarea: '[data-role="activity-textarea"]',
  submit: '[data-action="activity-submit"]',
  edit: '[data-action="activity-edit"]',
  toast: '[data-role="activity-toast"]',
  toastTitle: '[data-role="activity-toast-title"]',
  toastText: '[data-role="activity-toast-text"]',
  toastClose: '[data-action="activity-toast-close"]',
};

const ACTIVITY_STORAGE_PREFIX = 'edtech:activity-panel';

function normalizeActivityType(type) {
  const value = toText(type, 'objective').toLowerCase();
  return value === 'discursive' ? 'discursive' : 'objective';
}

function normalizeToastTone(tone) {
  const value = toText(tone, 'warning').toLowerCase();
  return value === 'success' ? 'success' : 'warning';
}

function parseDefaultSelected(config) {
  const parsed = Number.parseInt(String(config.defaultSelectedIndex), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function getActivityConfigByType(root, type) {
  const normalizedType = normalizeActivityType(type);
  const config = getComponentConfig(root, `activities.${normalizedType}`, {});
  return isObject(config) ? config : {};
}

function cloneState(state) {
  return {
    selectedOptions: Array.isArray(state.selectedOptions) ? [...state.selectedOptions] : [],
    text: state.text,
    dirty: state.dirty,
    submitted: state.submitted,
    toastVisible: state.toastVisible,
  };
}

function createOptionsMarkup(options = []) {
  return options
    .map((rawOption, index) => {
      const option = isObject(rawOption) ? rawOption : {};
      const prefix = toText(option.prefix, '');
      const text = toText(option.text, '');

      return `
        <label class="o-activity-panel__option" data-role="activity-option">
          <input
            class="o-activity-panel__option-input"
            type="checkbox"
            value="${index}"
            data-role="activity-option-input"
            aria-label="${prefix} ${text}"
          />
          <span class="o-activity-panel__option-control" aria-hidden="true"></span>
          <span class="o-activity-panel__option-text">
            <span data-role="activity-option-prefix">${prefix}</span>
            <span data-role="activity-option-label">${text}</span>
          </span>
        </label>
      `;
    })
    .join('');
}

export class ActivityPanelComponent extends BaseComponent {
  static selector = '[data-component="activity-panel"]';
  static lazyOnScroll = true;

  constructor(root) {
    super(root);
    this.panelRoot = null;
    const props = getComponentProps(root);
    const propValues = isObject(props.values) ? props.values : {};
    this.activityType = normalizeActivityType(
      toText(propValues.activityType, root.dataset.activityType)
    );
    this.activityId = toText(propValues.activityId, root.dataset.activityId || this.activityType);
    this.config = {};
    this.storageKey = '';
    this.storageEnabled = this.isStorageEnabled();

    this.initialState = {
      selectedOptions: [],
      text: '',
      dirty: false,
      submitted: false,
      toastVisible: false,
    };

    this.state = cloneState(this.initialState);

    this.iconImageNode = null;
    this.titleNode = null;
    this.descriptionNode = null;
    this.optionsLegendNode = null;
    this.optionRows = [];
    this.optionInputs = [];
    this.optionPrefixNodes = [];
    this.optionLabelNodes = [];
    this.textareaLabelNode = null;
    this.textareaNode = null;
    this.submitButton = null;
    this.editButton = null;
    this.toastNode = null;
    this.toastTitleNode = null;
    this.toastTextNode = null;
    this.toastCloseButton = null;

    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  onMount() {
    this.config = getActivityConfigByType(this.root, this.activityType);
    this.renderShell();

    this.panelRoot = this.query(ACTIVITY_SELECTORS.root);

    if (!this.panelRoot) {
      return;
    }

    this.cacheNodes();

    if (!this.hasRequiredNodes()) {
      return;
    }

    this.applyProps();
    this.initialState = this.createInitialState();
    this.storageKey = this.createStorageKey();
    this.state = this.loadStoredState() ?? cloneState(this.initialState);

    this.root.addEventListener('click', this.handleClick);
    this.root.addEventListener('change', this.handleChange);
    this.root.addEventListener('input', this.handleInput);

    this.applyStateToUI();
  }

  onUnmount() {
    this.root.removeEventListener('click', this.handleClick);
    this.root.removeEventListener('change', this.handleChange);
    this.root.removeEventListener('input', this.handleInput);
  }

  renderShell() {
    const iconConfig = isObject(this.config.icon) ? this.config.icon : {};
    const toastConfig = isObject(this.config.toast) ? this.config.toast : {};
    const toastTone = normalizeToastTone(toastConfig.tone);

    const bodyMarkup =
      this.activityType === 'discursive'
        ? `
          <label class="a-visually-hidden" for="${this.activityId}-textarea" data-role="activity-textarea-label"></label>
          <textarea
            id="${this.activityId}-textarea"
            class="o-activity-panel__textarea"
            data-role="activity-textarea"
          ></textarea>
        `
        : `
          <fieldset class="o-activity-panel__options">
            <legend class="a-visually-hidden" data-role="activity-options-legend"></legend>
            ${createOptionsMarkup(Array.isArray(this.config.options) ? this.config.options : [])}
          </fieldset>
        `;

    this.root.innerHTML = `
      <div class="l-wrapper">
        <div class="o-activity-panel__card" data-role="activity-panel-root">
          <header class="o-activity-panel__header">
            <span class="o-activity-panel__icon" aria-hidden="true">
              <img
                class="o-activity-panel__icon-image"
                src="${toText(iconConfig.src, '')}"
                alt=""
                data-role="activity-icon-image"
                loading="lazy"
                decoding="async"
              />
            </span>

            <div class="o-activity-panel__header-copy">
              <h2 class="o-activity-panel__title" data-role="activity-title"></h2>
              <p class="o-activity-panel__description" data-role="activity-description"></p>
            </div>
          </header>

          <div class="o-activity-panel__body">
            ${bodyMarkup}

            <div class="o-activity-panel__actions">
              <button
                class="a-button o-activity-panel__action o-activity-panel__action--submit"
                type="button"
                data-action="activity-submit"
              ></button>
              <button
                class="a-button o-activity-panel__action o-activity-panel__action--dark"
                type="button"
                data-action="activity-edit"
              ></button>
            </div>

            <div class="a-toast a-toast--${toastTone}" data-role="activity-toast" hidden>
              <div class="a-toast__content">
                <h3 class="a-toast__title" data-role="activity-toast-title"></h3>
                <p class="a-toast__text" data-role="activity-toast-text"></p>
              </div>
              <button class="a-toast__close" type="button" data-action="activity-toast-close">×</button>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  cacheNodes() {
    this.iconImageNode = this.panelRoot.querySelector(ACTIVITY_SELECTORS.iconImage);
    this.titleNode = this.panelRoot.querySelector(ACTIVITY_SELECTORS.title);
    this.descriptionNode = this.panelRoot.querySelector(ACTIVITY_SELECTORS.description);
    this.optionsLegendNode = this.panelRoot.querySelector(ACTIVITY_SELECTORS.optionsLegend);
    this.optionRows = Array.from(this.panelRoot.querySelectorAll(ACTIVITY_SELECTORS.optionRow));
    this.optionInputs = Array.from(this.panelRoot.querySelectorAll(ACTIVITY_SELECTORS.optionInput));
    this.optionPrefixNodes = Array.from(this.panelRoot.querySelectorAll(ACTIVITY_SELECTORS.optionPrefix));
    this.optionLabelNodes = Array.from(this.panelRoot.querySelectorAll(ACTIVITY_SELECTORS.optionLabel));
    this.textareaLabelNode = this.panelRoot.querySelector(ACTIVITY_SELECTORS.textareaLabel);
    this.textareaNode = this.panelRoot.querySelector(ACTIVITY_SELECTORS.textarea);
    this.submitButton = this.panelRoot.querySelector(ACTIVITY_SELECTORS.submit);
    this.editButton = this.panelRoot.querySelector(ACTIVITY_SELECTORS.edit);
    this.toastNode = this.panelRoot.querySelector(ACTIVITY_SELECTORS.toast);
    this.toastTitleNode = this.panelRoot.querySelector(ACTIVITY_SELECTORS.toastTitle);
    this.toastTextNode = this.panelRoot.querySelector(ACTIVITY_SELECTORS.toastText);
    this.toastCloseButton = this.panelRoot.querySelector(ACTIVITY_SELECTORS.toastClose);
  }

  hasRequiredNodes() {
    const hasCommonNodes =
      this.iconImageNode instanceof HTMLImageElement &&
      this.titleNode instanceof HTMLElement &&
      this.descriptionNode instanceof HTMLElement &&
      this.submitButton instanceof HTMLButtonElement &&
      this.editButton instanceof HTMLButtonElement &&
      this.toastNode instanceof HTMLElement &&
      this.toastTitleNode instanceof HTMLElement &&
      this.toastTextNode instanceof HTMLElement &&
      this.toastCloseButton instanceof HTMLButtonElement;

    if (!hasCommonNodes) {
      return false;
    }

    if (this.activityType === 'discursive') {
      return this.textareaNode instanceof HTMLTextAreaElement;
    }

    return this.optionInputs.length > 0;
  }

  applyProps() {
    if (!(this.titleNode && this.descriptionNode && this.iconImageNode)) {
      return;
    }

    this.titleNode.textContent = toText(this.config.title, '');
    this.descriptionNode.textContent = toText(this.config.description, '');

    const iconConfig = isObject(this.config.icon) ? this.config.icon : {};
    this.iconImageNode.src = toText(iconConfig.src, '');
    this.iconImageNode.alt = '';
    this.iconImageNode.setAttribute('aria-hidden', 'true');

    if (this.submitButton) {
      this.submitButton.textContent = toText(this.config.submitLabel, '');
    }

    if (this.editButton) {
      this.editButton.textContent = toText(this.config.editLabel, '');
    }

    this.applyToastProps();

    if (this.activityType === 'discursive') {
      this.applyDiscursiveProps();
      return;
    }

    this.applyObjectiveProps();
  }

  applyDiscursiveProps() {
    if (!(this.textareaNode instanceof HTMLTextAreaElement)) {
      return;
    }

    const label = toText(
      this.config.textareaAriaLabel,
      ''
    );

    this.textareaNode.setAttribute('aria-label', label);
    this.textareaNode.setAttribute(
      'placeholder',
      toText(this.config.placeholder, '')
    );

    if (this.textareaLabelNode instanceof HTMLElement) {
      this.textareaLabelNode.textContent = label;
    }
  }

  applyObjectiveProps() {
    if (this.optionsLegendNode instanceof HTMLElement) {
      this.optionsLegendNode.textContent = toText(this.config.legend, '');
    }

    const options = Array.isArray(this.config.options) ? this.config.options : [];

    this.optionRows.forEach((row, index) => {
      const input = this.optionInputs[index];
      const prefixNode = this.optionPrefixNodes[index];
      const labelNode = this.optionLabelNodes[index];
      const option = isObject(options[index]) ? options[index] : null;

      if (!(input instanceof HTMLInputElement) || !option) {
        row.hidden = true;
        return;
      }

      row.hidden = false;
      input.type = 'checkbox';
      input.value = String(index);

      const prefix = toText(option.prefix, '');
      const text = toText(option.text, '');

      if (prefixNode instanceof HTMLElement) {
        prefixNode.textContent = `${prefix} `;
      }

      if (labelNode instanceof HTMLElement) {
        labelNode.textContent = text;
      }

      input.setAttribute('aria-label', `${prefix} ${text}`);
    });
  }

  applyToastProps() {
    if (
      !(this.toastNode instanceof HTMLElement) ||
      !(this.toastTitleNode instanceof HTMLElement) ||
      !(this.toastTextNode instanceof HTMLElement) ||
      !(this.toastCloseButton instanceof HTMLButtonElement)
    ) {
      return;
    }

    const toastConfig = isObject(this.config.toast) ? this.config.toast : {};
    const tone = normalizeToastTone(toastConfig.tone);

    this.toastNode.classList.remove('a-toast--success', 'a-toast--warning');
    this.toastNode.classList.add(tone === 'success' ? 'a-toast--success' : 'a-toast--warning');

    this.toastTitleNode.textContent = toText(
      toastConfig.title,
      ''
    );
    this.toastTextNode.textContent = toText(
      toastConfig.text,
      ''
    );
    this.toastCloseButton.setAttribute(
      'aria-label',
      toText(toastConfig.closeAriaLabel, '')
    );
  }

  createInitialState() {
    let selectedOptions = [];

    if (this.activityType === 'objective') {
      const defaultIndexes = Array.isArray(this.config.defaultSelectedIndexes)
        ? this.config.defaultSelectedIndexes
        : [];

      selectedOptions = defaultIndexes
        .map((value) => Number.parseInt(String(value), 10))
        .filter((index, position, array) => (
          Number.isInteger(index) &&
          this.isValidOptionIndex(index) &&
          array.indexOf(index) === position
        ));

      if (selectedOptions.length === 0) {
        const defaultSelectedIndex = parseDefaultSelected(this.config);

        if (this.isValidOptionIndex(defaultSelectedIndex)) {
          selectedOptions = [defaultSelectedIndex];
        }
      }
    }

    return {
      selectedOptions,
      text: '',
      dirty: false,
      submitted: false,
      toastVisible: false,
    };
  }

  isStorageEnabled() {
    try {
      const key = `${ACTIVITY_STORAGE_PREFIX}:probe`;
      sessionStorage.setItem(key, '1');
      sessionStorage.removeItem(key);
      return true;
    } catch {
      return false;
    }
  }

  createStorageKey() {
    return `${ACTIVITY_STORAGE_PREFIX}:${this.activityId}`;
  }

  loadStoredState() {
    if (!this.storageEnabled || !this.storageKey) {
      return null;
    }

    try {
      const rawValue = sessionStorage.getItem(this.storageKey);

      if (!rawValue) {
        return null;
      }

      const parsed = JSON.parse(rawValue);

      if (!isObject(parsed)) {
        return null;
      }

      const selectedOptions = Array.isArray(parsed.selectedOptions)
        ? parsed.selectedOptions
          .map((value) => Number.parseInt(String(value), 10))
          .filter((index, position, array) => (
            this.isValidOptionIndex(index) && array.indexOf(index) === position
          ))
        : [];

      const legacySelectedOption = this.isValidOptionIndex(parsed.selectedOption)
        ? parsed.selectedOption
        : null;

      if (selectedOptions.length === 0 && legacySelectedOption !== null) {
        selectedOptions.push(legacySelectedOption);
      }

      const text = toText(parsed.text, '');
      const submitted = parsed.submitted === true;
      const hasPayload = this.activityType === 'discursive'
        ? text.trim().length > 0
        : selectedOptions.length > 0;
      const dirty = submitted ? false : parsed.dirty === true || hasPayload;
      const toastVisible =
        typeof parsed.toastVisible === 'boolean'
          ? parsed.toastVisible
          : submitted;

      return {
        selectedOptions,
        text,
        dirty,
        submitted,
        toastVisible,
      };
    } catch {
      return null;
    }
  }

  persistState() {
    if (!this.storageEnabled || !this.storageKey) {
      return;
    }

    try {
      sessionStorage.setItem(this.storageKey, JSON.stringify(this.state));
    } catch {
      // no-op
    }
  }

  clearStoredState() {
    if (!this.storageEnabled || !this.storageKey) {
      return;
    }

    try {
      sessionStorage.removeItem(this.storageKey);
    } catch {
      // no-op
    }
  }

  isValidOptionIndex(value) {
    const index = Number.parseInt(String(value), 10);

    if (!Number.isInteger(index) || index < 0 || index >= this.optionInputs.length) {
      return false;
    }

    const row = this.optionRows[index];
    return !(row instanceof HTMLElement && row.hidden);
  }

  hasValidPayload() {
    if (this.activityType === 'discursive') {
      return this.state.text.trim().length > 0;
    }

    return Array.isArray(this.state.selectedOptions) && this.state.selectedOptions.length > 0;
  }

  canSubmit() {
    return !this.state.submitted && this.state.dirty && this.hasValidPayload();
  }

  applyFormState() {
    if (this.activityType === 'discursive') {
      if (this.textareaNode instanceof HTMLTextAreaElement) {
        this.textareaNode.value = this.state.text;
      }
      return;
    }

    this.optionInputs.forEach((input, index) => {
      if (!(input instanceof HTMLInputElement)) {
        return;
      }

      const row = this.optionRows[index];
      input.checked = Array.isArray(this.state.selectedOptions)
        ? this.state.selectedOptions.includes(index)
        : false;
      input.disabled = this.state.submitted || (row instanceof HTMLElement && row.hidden);
    });
  }

  syncSubmitState() {
    if (!(this.submitButton instanceof HTMLButtonElement)) {
      return;
    }

    const isDisabled = !this.canSubmit();
    this.submitButton.disabled = isDisabled;
    this.submitButton.classList.toggle('o-activity-panel__action--disabled', isDisabled);
  }

  syncEditState() {
    if (!(this.editButton instanceof HTMLButtonElement)) {
      return;
    }

    const isDisabled = !this.state.submitted;
    this.editButton.disabled = isDisabled;
    this.editButton.classList.toggle('o-activity-panel__action--disabled', isDisabled);
  }

  syncFormDisabledState() {
    if (this.textareaNode instanceof HTMLTextAreaElement) {
      this.textareaNode.disabled = this.state.submitted;
    }
  }

  syncToastState() {
    if (this.toastNode instanceof HTMLElement) {
      this.toastNode.hidden = !this.state.toastVisible;
    }
  }

  applyStateToUI() {
    this.applyFormState();
    this.syncSubmitState();
    this.syncEditState();
    this.syncFormDisabledState();
    this.syncToastState();
  }

  resetState() {
    this.state = cloneState(this.initialState);
    this.applyStateToUI();
    this.clearStoredState();
  }

  handleClick(event) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const closeButton = event.target.closest(ACTIVITY_SELECTORS.toastClose);
    if (closeButton) {
      this.state.toastVisible = false;
      this.syncToastState();
      this.persistState();
      return;
    }

    const submitButton = event.target.closest(ACTIVITY_SELECTORS.submit);
    if (submitButton) {
      if (!this.canSubmit()) {
        return;
      }

      this.state.submitted = true;
      this.state.dirty = false;
      this.state.toastVisible = true;
      this.applyStateToUI();
      this.persistState();
      return;
    }

    const editButton = event.target.closest(ACTIVITY_SELECTORS.edit);
    if (editButton) {
      this.resetState();
    }
  }

  handleChange(event) {
    if (!(event.target instanceof HTMLInputElement)) {
      return;
    }

    if (!event.target.matches(ACTIVITY_SELECTORS.optionInput)) {
      return;
    }

    const optionIndex = Number.parseInt(event.target.value, 10);

    if (!this.isValidOptionIndex(optionIndex)) {
      return;
    }

    const currentSelected = Array.isArray(this.state.selectedOptions)
      ? [...this.state.selectedOptions]
      : [];

    const hasOption = currentSelected.includes(optionIndex);

    if (event.target.checked && !hasOption) {
      currentSelected.push(optionIndex);
    }

    if (!event.target.checked && hasOption) {
      const position = currentSelected.indexOf(optionIndex);
      currentSelected.splice(position, 1);
    }

    this.state.selectedOptions = currentSelected;
    this.state.dirty = currentSelected.length > 0;
    this.state.toastVisible = false;
    this.applyStateToUI();
    this.persistState();
  }

  handleInput(event) {
    if (!(event.target instanceof HTMLTextAreaElement)) {
      return;
    }

    if (!event.target.matches(ACTIVITY_SELECTORS.textarea)) {
      return;
    }

    this.state.text = event.target.value;
    this.state.dirty = event.target.value.trim().length > 0;
    this.state.toastVisible = false;
    this.applyStateToUI();
    this.persistState();
  }
}
