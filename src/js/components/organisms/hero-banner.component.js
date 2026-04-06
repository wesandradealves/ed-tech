import { BaseComponent } from '../../core/base-component.js';
import { getSiteContentValue } from '../../config/site-content.config.js';

const HERO_SELECTORS = {
  playButton: '[data-action="hero-play-video"]',
};

export class HeroBannerComponent extends BaseComponent {
  static selector = '[data-component="hero-banner"]';
  static lazyOnScroll = true;

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
    const targetUrl = getSiteContentValue('video.heroExternalUrl');

    if (typeof targetUrl !== 'string' || targetUrl.length === 0) {
      return;
    }

    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  }
}
