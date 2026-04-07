import { BaseComponent } from '../../core/base-component.js';
import { isObject, toText } from '../../core/value.utils.js';
import { getComponentConfig } from '../../core/component-props.utils.js';

const FOREST_SLIDER_SELECTORS = {
  track: '[data-role="forest-slider-track"]',
  slide: '[data-role="forest-slide"]',
  prevButton: '[data-action="forest-slider-prev"]',
  nextButton: '[data-action="forest-slider-next"]',
  dotButton: '[data-action="forest-slider-dot"]',
  status: '[data-role="forest-slider-status"]',
};

const DEFAULT_SLIDE = {
  src: '',
  alt: '',
  width: 920,
  height: 472,
};

function normalizeSlides(rawSlides) {
  if (!Array.isArray(rawSlides) || rawSlides.length === 0) {
    return [];
  }

  return rawSlides
    .filter((slide) => isObject(slide))
    .map((slide) => ({
      src: toText(slide.src, DEFAULT_SLIDE.src),
      alt: toText(slide.alt, DEFAULT_SLIDE.alt),
      width: slide.width ?? DEFAULT_SLIDE.width,
      height: slide.height ?? DEFAULT_SLIDE.height,
    }));
}

export class ForestSliderComponent extends BaseComponent {
  static selector = '[data-component="forest-slider"]';
  static lazyOnScroll = true;

  constructor(root) {
    super(root);
    this.track = null;
    this.slides = [];
    this.prevButton = null;
    this.nextButton = null;
    this.dotButtons = [];
    this.status = null;
    this.currentIndex = 0;

    this.handlePrevClick = this.handlePrevClick.bind(this);
    this.handleNextClick = this.handleNextClick.bind(this);
    this.handleKeyDown = this.handleKeyDown.bind(this);
    this.handleDotClick = this.handleDotClick.bind(this);
  }

  onMount() {
    this.render();

    this.track = this.query(FOREST_SLIDER_SELECTORS.track);
    this.slides = Array.from(this.root.querySelectorAll(FOREST_SLIDER_SELECTORS.slide));
    this.prevButton = this.query(FOREST_SLIDER_SELECTORS.prevButton);
    this.nextButton = this.query(FOREST_SLIDER_SELECTORS.nextButton);
    this.dotButtons = Array.from(this.root.querySelectorAll(FOREST_SLIDER_SELECTORS.dotButton));
    this.status = this.query(FOREST_SLIDER_SELECTORS.status);

    if (
      !this.track ||
      this.slides.length === 0 ||
      !this.prevButton ||
      !this.nextButton ||
      this.dotButtons.length === 0
    ) {
      return;
    }

    this.prevButton.addEventListener('click', this.handlePrevClick);
    this.nextButton.addEventListener('click', this.handleNextClick);
    this.root.addEventListener('keydown', this.handleKeyDown);
    this.dotButtons.forEach((button) => {
      button.addEventListener('click', this.handleDotClick);
    });

    this.renderState();
  }

  onUnmount() {
    if (!this.prevButton || !this.nextButton) {
      return;
    }

    this.prevButton.removeEventListener('click', this.handlePrevClick);
    this.nextButton.removeEventListener('click', this.handleNextClick);
    this.root.removeEventListener('keydown', this.handleKeyDown);

    this.dotButtons.forEach((button) => {
      button.removeEventListener('click', this.handleDotClick);
    });
  }

  render() {
    const config = getComponentConfig(this.root, 'forestSlider', {});
    const sectionAriaLabel = toText(config.sectionAriaLabel, '');
    const previousAriaLabel = toText(config.previousAriaLabel, '');
    const nextAriaLabel = toText(config.nextAriaLabel, '');
    const dotsGroupAriaLabel = toText(config.dotsGroupAriaLabel, '');
    const dotAriaLabelPrefix = toText(config.dotAriaLabelPrefix, '');
    const statusTemplate = toText(config.statusTemplate, '');
    const slides = normalizeSlides(config.slides);

    const slidesMarkup = slides
      .map((slide, index) => {
        const isActive = index === 0;

        return `
          <li class="o-forest-slider__slide${isActive ? ' is-active' : ''}" data-role="forest-slide" aria-hidden="${
            isActive ? 'false' : 'true'
          }"${isActive ? '' : ' hidden'}>
            <img
              class="o-forest-slider__image"
              src="${slide.src}"
              alt="${slide.alt}"
              width="${String(slide.width)}"
              height="${String(slide.height)}"
              loading="lazy"
              decoding="async"
            />
          </li>
        `;
      })
      .join('');

    const dotsMarkup = slides
      .map((_, index) => {
        const isActive = index === 0;

        return `
          <button
            class="o-forest-slider__dot${isActive ? ' is-active' : ''}"
            type="button"
            aria-label="${dotAriaLabelPrefix} ${index + 1}"
            aria-pressed="${isActive ? 'true' : 'false'}"
            data-action="forest-slider-dot"
            data-slide-index="${String(index)}"
          ></button>
        `;
      })
      .join('');

    this.root.setAttribute('aria-label', sectionAriaLabel);

    this.root.innerHTML = `
      <div class="l-wrapper">
        <div class="o-forest-slider__card">
          <div class="o-forest-slider__viewport">
            <ul class="o-forest-slider__track" data-role="forest-slider-track">
              ${slidesMarkup}
            </ul>
          </div>

          <div class="o-forest-slider__controls">
            <button
              class="a-button o-forest-slider__nav o-forest-slider__nav--prev"
              type="button"
              aria-label="${previousAriaLabel}"
              data-action="forest-slider-prev"
            >
              <svg
                class="o-forest-slider__nav-icon"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M7.06112 2.3335L3.39445 6.00016L7.06112 9.66683L8.00028 8.72766L5.27278 6.00016L8.00028 3.27266L7.06112 2.3335Z" fill="currentColor" />
              </svg>
            </button>

            <div class="o-forest-slider__dots" role="group" aria-label="${dotsGroupAriaLabel}">
              ${dotsMarkup}
            </div>

            <button
              class="a-button o-forest-slider__nav o-forest-slider__nav--next"
              type="button"
              aria-label="${nextAriaLabel}"
              data-action="forest-slider-next"
            >
              <svg
                class="o-forest-slider__nav-icon"
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
                focusable="false"
              >
                <path d="M4.93916 2.3335L8.60583 6.00016L4.93916 9.66683L4 8.72766L6.7275 6.00016L4 3.27266L4.93916 2.3335Z" fill="currentColor" />
              </svg>
            </button>
          </div>

          <p
            class="a-visually-hidden"
            aria-live="polite"
            data-role="forest-slider-status"
            data-status-template="${statusTemplate}"
          ></p>
        </div>
      </div>
    `;
  }

  handlePrevClick() {
    this.goTo(this.currentIndex - 1);
  }

  handleNextClick() {
    this.goTo(this.currentIndex + 1);
  }

  handleDotClick(event) {
    const target = event.currentTarget;

    if (!(target instanceof HTMLElement)) {
      return;
    }

    const index = Number.parseInt(target.dataset.slideIndex ?? '', 10);

    if (Number.isNaN(index)) {
      return;
    }

    this.goTo(index);
  }

  handleKeyDown(event) {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      this.goTo(this.currentIndex - 1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      this.goTo(this.currentIndex + 1);
    }
  }

  goTo(index) {
    const total = this.slides.length;

    if (total === 0) {
      return;
    }

    const maxIndex = total - 1;
    this.currentIndex = Math.min(Math.max(index, 0), maxIndex);

    this.renderState();
  }

  renderState() {
    const total = this.slides.length;

    this.slides.forEach((slide, index) => {
      const isActive = index === this.currentIndex;
      slide.classList.toggle('is-active', isActive);
      slide.hidden = !isActive;
      slide.setAttribute('aria-hidden', isActive ? 'false' : 'true');
    });

    this.dotButtons.forEach((button, index) => {
      const isActive = index === this.currentIndex;
      button.classList.toggle('is-active', isActive);
      button.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });

    if (this.prevButton) {
      const isDisabled = this.currentIndex === 0;
      this.prevButton.disabled = isDisabled;
      this.prevButton.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
    }

    if (this.nextButton) {
      const isDisabled = this.currentIndex === total - 1;
      this.nextButton.disabled = isDisabled;
      this.nextButton.setAttribute('aria-disabled', isDisabled ? 'true' : 'false');
    }

    if (this.status) {
      const template = toText(this.status.dataset.statusTemplate, '');

      this.status.textContent = template
        .replace('{current}', String(this.currentIndex + 1))
        .replace('{total}', String(total));
    }
  }
}
