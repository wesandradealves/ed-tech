import { BaseComponent } from '../../core/base-component.js';
import { getSiteContentValue } from '../../config/site-content.config.js';

const VIDEO_INTRO_SELECTORS = {
  frame: '[data-role="video-intro-frame"]',
  playButton: '[data-action="video-intro-play"]',
  pauseButton: '[data-action="video-intro-pause"]',
};

export class VideoIntroComponent extends BaseComponent {
  static selector = '[data-component="video-intro"]';
  static lazyOnScroll = true;

  constructor(root) {
    super(root);
    this.frame = null;
    this.playButton = null;
    this.pauseButton = null;
    this.activeIframe = null;
    this.isPlaying = false;
    this.handlePlayButtonClick = this.handlePlayButtonClick.bind(this);
    this.handlePauseButtonClick = this.handlePauseButtonClick.bind(this);
    this.handleDocumentPointerDown = this.handleDocumentPointerDown.bind(this);
    this.handleDocumentKeyDown = this.handleDocumentKeyDown.bind(this);
  }

  onMount() {
    this.frame = this.query(VIDEO_INTRO_SELECTORS.frame);
    this.playButton = this.query(VIDEO_INTRO_SELECTORS.playButton);
    this.pauseButton = this.query(VIDEO_INTRO_SELECTORS.pauseButton);

    if (!this.frame || !this.playButton || !this.pauseButton) {
      return;
    }

    this.playButton.addEventListener('click', this.handlePlayButtonClick);
    this.pauseButton.addEventListener('click', this.handlePauseButtonClick);
    document.addEventListener('pointerdown', this.handleDocumentPointerDown);
    document.addEventListener('keydown', this.handleDocumentKeyDown);
    this.updateControlState();
  }

  onUnmount() {
    if (!this.playButton || !this.pauseButton) {
      return;
    }

    this.playButton.removeEventListener('click', this.handlePlayButtonClick);
    this.pauseButton.removeEventListener('click', this.handlePauseButtonClick);
    document.removeEventListener('pointerdown', this.handleDocumentPointerDown);
    document.removeEventListener('keydown', this.handleDocumentKeyDown);
    this.stopPlayback();
  }

  handlePlayButtonClick() {
    this.startPlayback();
  }

  handlePauseButtonClick() {
    this.stopPlayback({ restoreFocus: true });
  }

  handleDocumentPointerDown(event) {
    if (!this.isPlaying || !this.frame) {
      return;
    }

    if (!(event.target instanceof Node)) {
      return;
    }

    if (this.frame.contains(event.target)) {
      return;
    }

    this.stopPlayback();
  }

  handleDocumentKeyDown(event) {
    if (!this.isPlaying) {
      return;
    }

    if (event.key === 'Escape') {
      this.stopPlayback({ restoreFocus: true });
    }
  }

  startPlayback() {
    if (!this.frame || this.isPlaying) {
      return;
    }

    const iframe = document.createElement('iframe');
    const iframeSrc = getSiteContentValue('video.introEmbedUrl');
    const iframeTitle = getSiteContentValue('video.iframeTitle');

    if (typeof iframeSrc !== 'string' || iframeSrc.length === 0) {
      return;
    }

    if (typeof iframeTitle !== 'string' || iframeTitle.length === 0) {
      return;
    }

    iframe.className = 'o-video-intro__iframe';
    iframe.src = iframeSrc;
    iframe.title = iframeTitle;
    iframe.loading = 'eager';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;

    this.frame.append(iframe);
    this.activeIframe = iframe;
    this.frame.classList.add('is-playing');
    this.isPlaying = true;
    this.updateControlState();
  }

  stopPlayback({ restoreFocus = false } = {}) {
    if (!this.frame || !this.isPlaying) {
      return;
    }

    if (this.activeIframe) {
      this.activeIframe.remove();
      this.activeIframe = null;
    }

    this.frame.classList.remove('is-playing');
    this.isPlaying = false;
    this.updateControlState();

    if (restoreFocus && this.playButton) {
      this.playButton.focus();
    }
  }

  updateControlState() {
    if (!this.playButton || !this.pauseButton) {
      return;
    }

    const isPlaying = this.isPlaying;

    this.playButton.setAttribute('aria-hidden', isPlaying ? 'true' : 'false');
    this.playButton.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    this.playButton.tabIndex = isPlaying ? -1 : 0;

    this.pauseButton.setAttribute('aria-hidden', isPlaying ? 'false' : 'true');
    this.pauseButton.tabIndex = isPlaying ? 0 : -1;
  }
}
