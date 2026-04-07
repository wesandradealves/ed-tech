import { BaseComponent } from '../../core/base-component.js';
import { getSiteContentValue } from '../../config/site-content.config.js';

const ACTIVITY_SELECTORS = {
  root: '[data-role="activity-panel-root"]',
  submit: '[data-action="activity-submit"]',
  edit: '[data-action="activity-edit"]',
  toast: '[data-role="activity-toast"]',
  toastClose: '[data-action="activity-toast-close"]',
  optionInput: '[data-role="activity-option-input"]',
  textarea: '[data-role="activity-textarea"]',
};

function isObject(value) {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function toText(value, fallback = '') {
  return typeof value === 'string' && value.trim().length > 0 ? value : fallback;
}

function normalizeActivityType(type) {
  const value = toText(type, 'objective').toLowerCase();
  return value === 'discursive' ? 'discursive' : 'objective';
}

function parseDefaultSelected(config) {
  const parsed = Number.parseInt(String(config.defaultSelectedIndex), 10);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

function getActivityConfigByType(type) {
  const normalizedType = normalizeActivityType(type);
  const config = getSiteContentValue(`activities.${normalizedType}`, {});

  return isObject(config) ? config : {};
}

function createIconNode(config, type) {
  const iconConfig = isObject(config.icon) ? config.icon : {};
  const iconSrc = toText(
    iconConfig.src,
    type === 'discursive' ? '/assets/atividade-discursiva.svg' : '/assets/atividade-objetiva.svg'
  );

  const iconImage = document.createElement('img');
  iconImage.className = 'o-activity-panel__icon-image';
  iconImage.src = iconSrc;
  iconImage.alt = '';
  iconImage.setAttribute('aria-hidden', 'true');
  iconImage.width = 22;
  iconImage.height = 22;
  iconImage.loading = 'lazy';
  iconImage.decoding = 'async';

  return iconImage;
}

function createHeader(config, type) {
  const header = document.createElement('header');
  header.className = 'o-activity-panel__header';

  const iconWrap = document.createElement('span');
  iconWrap.className = 'o-activity-panel__icon';
  iconWrap.append(createIconNode(config, type));

  const copy = document.createElement('div');
  copy.className = 'o-activity-panel__header-copy';

  const title = document.createElement('h2');
  title.className = 'o-activity-panel__title';
  title.textContent = toText(config.title, 'Atividade');

  const description = document.createElement('p');
  description.className = 'o-activity-panel__description';
  description.textContent = toText(
    config.description,
    'It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.'
  );

  copy.append(title, description);
  header.append(iconWrap, copy);
  return header;
}

function createObjectiveBody(config, selectedIndex) {
  const body = document.createElement('div');
  body.className = 'o-activity-panel__body';

  const optionsWrap = document.createElement('fieldset');
  optionsWrap.className = 'o-activity-panel__options';

  const legend = document.createElement('legend');
  legend.className = 'a-visually-hidden';
  legend.textContent = toText(config.legend, 'Selecione uma alternativa');
  optionsWrap.append(legend);

  const options = Array.isArray(config.options) ? config.options.slice(0, 4) : [];
  const sectionLabel = toText(config.title, 'atividade')
    .toLowerCase()
    .replace(/\s+/g, '-');

  options.forEach((option, index) => {
    const optionConfig = isObject(option) ? option : {};
    const label = document.createElement('label');
    label.className = 'o-activity-panel__option';

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = `activity-objective-${sectionLabel}`;
    input.value = String(index);
    input.className = 'o-activity-panel__option-input';
    input.checked = selectedIndex === index;
    input.setAttribute('data-role', 'activity-option-input');

    const control = document.createElement('span');
    control.className = 'o-activity-panel__option-control';
    control.setAttribute('aria-hidden', 'true');

    const text = document.createElement('span');
    text.className = 'o-activity-panel__option-text';

    const prefix = toText(optionConfig.prefix, `${String.fromCharCode(65 + index)})`);
    const content = toText(
      optionConfig.text,
      'Lorem Ipsum is simply dummy text of the printing and typesetting industry.'
    );

    text.textContent = `${prefix} ${content}`;

    label.append(input, control, text);
    optionsWrap.append(label);
  });

  body.append(optionsWrap);
  return body;
}

function createDiscursiveBody(config, value) {
  const body = document.createElement('div');
  body.className = 'o-activity-panel__body';

  const textarea = document.createElement('textarea');
  textarea.className = 'o-activity-panel__textarea';
  textarea.rows = 7;
  textarea.value = value;
  textarea.setAttribute('data-role', 'activity-textarea');
  textarea.setAttribute('placeholder', toText(config.placeholder, 'Digite sua resposta aqui...'));

  body.append(textarea);
  return body;
}

function createActions(config) {
  const actions = document.createElement('div');
  actions.className = 'o-activity-panel__actions';

  const submit = document.createElement('button');
  submit.className =
    'a-button o-activity-panel__action o-activity-panel__action--submit o-activity-panel__action--disabled';
  submit.type = 'button';
  submit.disabled = true;
  submit.setAttribute('data-action', 'activity-submit');
  submit.textContent = toText(config.submitLabel, 'Responder');

  const edit = document.createElement('button');
  edit.className = 'a-button o-activity-panel__action o-activity-panel__action--dark';
  edit.type = 'button';
  edit.setAttribute('data-action', 'activity-edit');
  edit.textContent = toText(config.editLabel, 'Alterar');

  actions.append(submit, edit);
  return actions;
}

function createToast(config) {
  const toastConfig = isObject(config.toast) ? config.toast : {};
  const tone = toText(toastConfig.tone, 'warning').toLowerCase();
  const toast = document.createElement('div');
  toast.className =
    tone === 'success' ? 'a-toast a-toast--success' : 'a-toast a-toast--warning';
  toast.setAttribute('data-role', 'activity-toast');
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.hidden = true;

  const content = document.createElement('div');
  content.className = 'a-toast__content';

  const title = document.createElement('p');
  title.className = 'a-toast__title';
  title.textContent = toText(
    toastConfig.title,
    tone === 'success' ? 'É isso aí!' : 'Tente novamente!'
  );

  const text = document.createElement('p');
  text.className = 'a-toast__text';
  text.textContent = toText(
    toastConfig.text,
    'Lorem ipsum dolor sit, amet consectetur adipisicing elit.'
  );

  content.append(title, text);

  const close = document.createElement('button');
  close.className = 'a-toast__close';
  close.type = 'button';
  close.setAttribute('aria-label', toText(toastConfig.closeAriaLabel, 'Fechar notificação'));
  close.setAttribute('data-action', 'activity-toast-close');
  close.textContent = '✕';

  toast.append(content, close);
  return toast;
}

function cloneState(state) {
  return {
    selectedOption: state.selectedOption,
    text: state.text,
    dirty: state.dirty,
  };
}

export class ActivityPanelComponent extends BaseComponent {
  static selector = '[data-component="activity-panel"]';
  static lazyOnScroll = true;

  constructor(root) {
    super(root);
    this.panelRoot = null;
    this.activityType = normalizeActivityType(root.dataset.activityType);
    this.config = {};
    this.initialState = {
      selectedOption: null,
      text: '',
      dirty: false,
    };
    this.state = cloneState(this.initialState);
    this.submitButton = null;
    this.toast = null;
    this.optionInputs = [];
    this.textarea = null;
    this.handleClick = this.handleClick.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  onMount() {
    this.panelRoot = this.query(ACTIVITY_SELECTORS.root);

    if (!this.panelRoot) {
      return;
    }

    this.config = getActivityConfigByType(this.activityType);
    this.initialState = this.createInitialState();
    this.state = cloneState(this.initialState);

    this.render();

    this.root.addEventListener('click', this.handleClick);
    this.root.addEventListener('change', this.handleChange);
    this.root.addEventListener('input', this.handleInput);
  }

  onUnmount() {
    this.root.removeEventListener('click', this.handleClick);
    this.root.removeEventListener('change', this.handleChange);
    this.root.removeEventListener('input', this.handleInput);
  }

  createInitialState() {
    if (this.activityType === 'discursive') {
      return {
        selectedOption: null,
        text: '',
        dirty: false,
      };
    }

    return {
      selectedOption: parseDefaultSelected(this.config),
      text: '',
      dirty: false,
    };
  }

  hasValidPayload() {
    if (this.activityType === 'discursive') {
      return this.state.text.trim().length > 0;
    }

    return Number.isInteger(this.state.selectedOption) && this.state.selectedOption >= 0;
  }

  canSubmit() {
    return this.state.dirty && this.hasValidPayload();
  }

  syncSubmitState() {
    if (!this.submitButton) {
      return;
    }

    const isDisabled = !this.canSubmit();
    this.submitButton.disabled = isDisabled;
    this.submitButton.classList.toggle('o-activity-panel__action--disabled', isDisabled);
  }

  showToast() {
    if (this.toast) {
      this.toast.hidden = false;
    }
  }

  hideToast() {
    if (this.toast) {
      this.toast.hidden = true;
    }
  }

  applyFormState() {
    if (this.activityType === 'discursive') {
      if (this.textarea) {
        this.textarea.value = this.state.text;
      }
      return;
    }

    this.optionInputs.forEach((input) => {
      if (!(input instanceof HTMLInputElement)) {
        return;
      }
      const inputValue = Number.parseInt(input.value, 10);
      input.checked = inputValue === this.state.selectedOption;
    });
  }

  resetState() {
    this.state = cloneState(this.initialState);
    this.applyFormState();
    this.hideToast();
    this.syncSubmitState();
  }

  handleClick(event) {
    if (!(event.target instanceof HTMLElement)) {
      return;
    }

    const closeButton = event.target.closest(ACTIVITY_SELECTORS.toastClose);
    if (closeButton) {
      this.hideToast();
      return;
    }

    const submitButton = event.target.closest(ACTIVITY_SELECTORS.submit);
    if (submitButton) {
      if (!this.canSubmit()) {
        return;
      }

      this.state.dirty = false;
      this.showToast();
      this.syncSubmitState();
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

    this.state.selectedOption = Number.parseInt(event.target.value, 10);
    this.state.dirty = true;
    this.hideToast();
    this.syncSubmitState();
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
    this.hideToast();
    this.syncSubmitState();
  }

  render() {
    if (!this.panelRoot) {
      return;
    }

    this.panelRoot.innerHTML = '';
    this.panelRoot.append(createHeader(this.config, this.activityType));

    if (this.activityType === 'discursive') {
      this.panelRoot.append(createDiscursiveBody(this.config, this.state.text));
    } else {
      this.panelRoot.append(createObjectiveBody(this.config, this.state.selectedOption));
    }

    this.panelRoot.append(createActions(this.config), createToast(this.config));

    this.submitButton = this.panelRoot.querySelector(ACTIVITY_SELECTORS.submit);
    this.toast = this.panelRoot.querySelector(ACTIVITY_SELECTORS.toast);
    this.optionInputs = Array.from(this.panelRoot.querySelectorAll(ACTIVITY_SELECTORS.optionInput));
    this.textarea = this.panelRoot.querySelector(ACTIVITY_SELECTORS.textarea);

    this.applyFormState();
    this.hideToast();
    this.syncSubmitState();
  }
}
