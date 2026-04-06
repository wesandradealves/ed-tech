import { BaseComponent } from '../../core/base-component.js';

const HERO_SELECTORS = {
  playButton: '[data-action="hero-play-video"]',
};

const HERO_VIDEO_URL = 'https://www.youtube.com/watch?v=1PnVor36_40';

export class HeroBannerComponent extends BaseComponent {
  static selector = '[data-component="hero-banner"]';

  constructor(root) {
    super(root);
    this.playButton = null;
    this.handlePlayButtonClick = this.handlePlayButtonClick.bind(this);
  }

  onMount() {
    this.playButton = this.query(HERO_SELECTORS.playButton);

    if (!this.playButton) {
      return;
    }

    this.playButton.addEventListener('click', this.handlePlayButtonClick);
  }

  onUnmount() {
    if (!this.playButton) {
      return;
    }

    this.playButton.removeEventListener('click', this.handlePlayButtonClick);
  }

  handlePlayButtonClick() {
    window.open(HERO_VIDEO_URL, '_blank', 'noopener,noreferrer');
  }
}
