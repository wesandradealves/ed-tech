import { BaseComponent } from '../../core/base-component.js';
import { isObject, toText } from '../../core/value.utils.js';
import { getComponentConfig, getComponentValue } from '../../core/component-props.utils.js';

const VIDEO_INTRO_SELECTORS = {
  frame: '[data-role="video-intro-frame"]',
  playButton: '[data-action="video-intro-play"]',
  pauseButton: '[data-action="video-intro-pause"]',
};

function getVideoConfig(root) {
  const videoConfig = getComponentConfig(root, 'video', {});
  return isObject(videoConfig) ? videoConfig : {};
}

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
    this.render();

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

  render() {
    const video = getVideoConfig(this.root);
    const thumbnail = isObject(video.thumbnail) ? video.thumbnail : {};
    const controls = isObject(video.controls) ? video.controls : {};

    this.root.setAttribute('aria-labelledby', 'video-intro-title');

    this.root.innerHTML = `
      <div class="l-wrapper">
        <header class="o-video-intro__header">
          <h2
            class="o-video-intro__title l-section-intro__title"
            id="video-intro-title"
          >
            ${toText(video.title, '')}
          </h2>

          <p class="o-video-intro__description l-section-intro__description">
            ${toText(video.description, '')}
          </p>
        </header>

        <div class="o-video-intro__media" data-role="video-intro-frame">
          <img
            class="o-video-intro__image"
            src="${toText(thumbnail.src, '')}"
            alt="${toText(thumbnail.alt, '')}"
            width="${String(thumbnail.width ?? 948)}"
            height="${String(thumbnail.height ?? 523)}"
            loading="lazy"
            decoding="async"
          />

          <button
            class="a-button a-button--icon o-video-intro__play-button"
            type="button"
            aria-label="${toText(controls.playAriaLabel, '')}"
            data-action="video-intro-play"
          >
            <svg
              class="o-video-intro__play-icon"
              width="26"
              height="30"
              viewBox="0 0 26 30"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M0 0L26 15L0 30V0Z" fill="currentColor" />
            </svg>
          </button>

          <button
            class="a-button a-button--icon o-video-intro__pause-button"
            type="button"
            aria-label="${toText(controls.pauseAriaLabel, '')}"
            data-action="video-intro-pause"
          >
            <svg
              class="o-video-intro__pause-icon"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="5" y="4" width="5" height="16" rx="1" fill="currentColor" />
              <rect x="14" y="4" width="5" height="16" rx="1" fill="currentColor" />
            </svg>
          </button>
        </div>
      </div>
    `;
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
    const iframeSrc = getComponentValue(this.root, 'video', 'introEmbedUrl', '');
    const iframeTitle = getComponentValue(this.root, 'video', 'iframeTitle', '');

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
