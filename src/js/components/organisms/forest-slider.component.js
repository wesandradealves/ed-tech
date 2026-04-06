import { BaseComponent } from '../../core/base-component.js';
import { getSiteContentValue } from '../../config/site-content.config.js';

const FOREST_SLIDER_SELECTORS = {
  track: '[data-role="forest-slider-track"]',
  slide: '[data-role="forest-slide"]',
  prevButton: '[data-action="forest-slider-prev"]',
  nextButton: '[data-action="forest-slider-next"]',
  dotButton: '[data-action="forest-slider-dot"]',
  status: '[data-role="forest-slider-status"]',
};

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

    this.render();
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

    if (index < 0) {
      this.currentIndex = total - 1;
    } else if (index >= total) {
      this.currentIndex = 0;
    } else {
      this.currentIndex = index;
    }

    this.render();
  }

  render() {
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

    if (this.status) {
      const templateFromNode = this.status.dataset.statusTemplate;
      const templateFromConfig = getSiteContentValue(
        'forestSlider.statusTemplate',
        ''
      );
      const template =
        typeof templateFromNode === 'string' && templateFromNode.length > 0
          ? templateFromNode
          : templateFromConfig;

      this.status.textContent = template
        .replace('{current}', String(this.currentIndex + 1))
        .replace('{total}', String(total));
    }
  }
}
