import { toText } from '../../core/value.utils.js';

const BUTTON_TONE_CLASS_MAP = {
  accent: 'a-button--tone-accent',
  dark: 'a-button--tone-dark',
  light: 'a-button--tone-light',
};

function normalizeTone(tone) {
  const normalizedTone = toText(tone, 'accent').toLowerCase();
  return BUTTON_TONE_CLASS_MAP[normalizedTone] ? normalizedTone : 'accent';
}

function createArrowIcon() {
  const svgNs = 'http://www.w3.org/2000/svg';
  const icon = document.createElementNS(svgNs, 'svg');

  icon.setAttribute('class', 'a-button__icon a-button__icon--arrow');
  icon.setAttribute('width', '14');
  icon.setAttribute('height', '14');
  icon.setAttribute('viewBox', '0 0 14 14');
  icon.setAttribute('fill', 'none');
  icon.setAttribute('aria-hidden', 'true');
  icon.setAttribute('focusable', 'false');

  const path = document.createElementNS(svgNs, 'path');
  path.setAttribute(
    'd',
    'M10.1458 7.5H0V5.83333H10.1458L5.47917 1.16667L6.66667 0L13.3333 6.66667L6.66667 13.3333L5.47917 12.1667L10.1458 7.5Z'
  );
  path.setAttribute('fill', 'currentColor');

  icon.append(path);
  return icon;
}

export function createCtaButton({
  text,
  ariaLabel,
  action,
  tone = 'accent',
  extraClassNames = [],
}) {
  const button = document.createElement('button');

  button.type = 'button';
  button.classList.add(
    'a-button',
    'a-button--cta',
    BUTTON_TONE_CLASS_MAP[normalizeTone(tone)]
  );

  extraClassNames.forEach((className) => {
    if (typeof className === 'string' && className.length > 0) {
      button.classList.add(className);
    }
  });

  if (typeof action === 'string' && action.length > 0) {
    button.dataset.action = action;
  }

  if (typeof ariaLabel === 'string' && ariaLabel.length > 0) {
    button.setAttribute('aria-label', ariaLabel);
  }

  const textNode = document.createElement('span');
  textNode.textContent = toText(text, '');
  button.append(textNode, createArrowIcon());

  return button;
}
