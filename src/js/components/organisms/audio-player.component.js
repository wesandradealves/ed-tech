import { BaseComponent } from '../../core/base-component.js';
import { isObject, toText } from '../../core/value.utils.js';
import { getComponentConfig } from '../../core/component-props.utils.js';

const AUDIO_PLAYER_SELECTORS = {
  controls: '[data-role="audio-player-controls"]',
  audio: '[data-role="audio-player-element"]',
  toggleButton: '[data-action="audio-player-toggle"]',
  progress: '[data-role="audio-player-progress"]',
  time: '[data-role="audio-player-time"]',
  muteButton: '[data-action="audio-player-mute"]',
  volume: '[data-role="audio-player-volume"]',
  settingsButton: '[data-action="audio-player-settings"]',
};

function formatTime(totalSeconds) {
  if (!Number.isFinite(totalSeconds) || totalSeconds < 0) {
    return '00:00';
  }

  const rounded = Math.floor(totalSeconds);
  const minutes = Math.floor(rounded / 60);
  const seconds = rounded % 60;

  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function parseDurationLabelToSeconds(durationLabel) {
  if (typeof durationLabel !== 'string') {
    return null;
  }

  const parts = durationLabel.split(':').map((part) => Number.parseInt(part, 10));

  if (parts.length !== 2 || Number.isNaN(parts[0]) || Number.isNaN(parts[1])) {
    return null;
  }

  return (parts[0] * 60) + parts[1];
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function getAudioConfig(root) {
  const audioConfig = getComponentConfig(root, 'audioPlayer', {});
  return isObject(audioConfig) ? audioConfig : {};
}

export class AudioPlayerComponent extends BaseComponent {
  static selector = '[data-component="audio-player"]';
  static lazyOnScroll = true;

  constructor(root) {
    super(root);
    this.controls = null;
    this.audio = null;
    this.toggleButton = null;
    this.progress = null;
    this.time = null;
    this.muteButton = null;
    this.volume = null;
    this.settingsButton = null;
    this.playLabel = '';
    this.pauseLabel = '';
    this.settingsLabel = '';
    this.playbackRates = [1, 1.25, 1.5, 2];
    this.durationSeconds = null;
    this.config = {};

    this.handleToggle = this.handleToggle.bind(this);
    this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
    this.handleLoadedMetadata = this.handleLoadedMetadata.bind(this);
    this.handleEnded = this.handleEnded.bind(this);
    this.handleProgressInput = this.handleProgressInput.bind(this);
    this.handleMute = this.handleMute.bind(this);
    this.handleVolumeInput = this.handleVolumeInput.bind(this);
    this.handleSettingsClick = this.handleSettingsClick.bind(this);
  }

  onMount() {
    this.render();

    this.controls = this.query(AUDIO_PLAYER_SELECTORS.controls);
    this.audio = this.query(AUDIO_PLAYER_SELECTORS.audio);
    this.toggleButton = this.query(AUDIO_PLAYER_SELECTORS.toggleButton);
    this.progress = this.query(AUDIO_PLAYER_SELECTORS.progress);
    this.time = this.query(AUDIO_PLAYER_SELECTORS.time);
    this.muteButton = this.query(AUDIO_PLAYER_SELECTORS.muteButton);
    this.volume = this.query(AUDIO_PLAYER_SELECTORS.volume);
    this.settingsButton = this.query(AUDIO_PLAYER_SELECTORS.settingsButton);

    if (
      !this.controls ||
      !this.audio ||
      !this.toggleButton ||
      !this.progress ||
      !this.time ||
      !this.muteButton ||
      !this.volume ||
      !this.settingsButton
    ) {
      return;
    }

    const controls = isObject(this.config.controls) ? this.config.controls : {};
    this.playLabel = toText(controls.playAriaLabel, '');
    this.pauseLabel = toText(controls.pauseAriaLabel, '');
    this.settingsLabel = toText(controls.settingsAriaLabel, '');

    this.toggleButton.addEventListener('click', this.handleToggle);
    this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.addEventListener('loadedmetadata', this.handleLoadedMetadata);
    this.audio.addEventListener('ended', this.handleEnded);
    this.progress.addEventListener('input', this.handleProgressInput);
    this.muteButton.addEventListener('click', this.handleMute);
    this.volume.addEventListener('input', this.handleVolumeInput);
    this.settingsButton.addEventListener('click', this.handleSettingsClick);

    const initialDuration = toText(this.config.durationLabel, '');
    this.durationSeconds = parseDurationLabelToSeconds(initialDuration);
    this.updateDisplayedTime(0);

    this.audio.volume = clamp(Number.parseFloat(this.volume.value), 0, 1);
    this.updateProgress(0);
    this.updateVolumeVisual(this.audio.volume);
    this.updatePlayState(false);
    this.updateMuteState();
    this.updateSettingsState(this.audio.playbackRate);
  }

  onUnmount() {
    if (
      !this.audio ||
      !this.toggleButton ||
      !this.progress ||
      !this.muteButton ||
      !this.volume ||
      !this.settingsButton
    ) {
      return;
    }

    this.toggleButton.removeEventListener('click', this.handleToggle);
    this.audio.removeEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.removeEventListener('loadedmetadata', this.handleLoadedMetadata);
    this.audio.removeEventListener('ended', this.handleEnded);
    this.progress.removeEventListener('input', this.handleProgressInput);
    this.muteButton.removeEventListener('click', this.handleMute);
    this.volume.removeEventListener('input', this.handleVolumeInput);
    this.settingsButton.removeEventListener('click', this.handleSettingsClick);
    this.audio.pause();
  }

  render() {
    const config = getAudioConfig(this.root);
    this.config = config;
    const controls = isObject(config.controls) ? config.controls : {};
    const audio = isObject(config.audio) ? config.audio : {};

    this.root.setAttribute(
      'aria-labelledby',
      'audio-player-title'
    );

    this.root.innerHTML = `
      <div class="l-wrapper">
        <header class="o-audio-player__header">
          <h2
            class="o-audio-player__title l-section-intro__title"
            id="audio-player-title"
          >
            ${toText(config.title, '')}
          </h2>

          <p class="o-audio-player__description l-section-intro__description">
            ${toText(config.description, '')}
          </p>
        </header>

        <div class="o-audio-player__controls" data-role="audio-player-controls">
          <button
            class="a-button o-audio-player__toggle"
            type="button"
            data-action="audio-player-toggle"
            aria-label="${toText(controls.playAriaLabel, '')}"
            aria-pressed="false"
          >
            <svg
              class="o-audio-player__toggle-icon o-audio-player__toggle-icon--play"
              width="12"
              height="14"
              viewBox="0 0 12 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M0 0L12 7L0 14V0Z" fill="currentColor" />
            </svg>
            <svg
              class="o-audio-player__toggle-icon o-audio-player__toggle-icon--pause"
              width="12"
              height="14"
              viewBox="0 0 12 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <rect x="0" y="0" width="4" height="14" rx="1" fill="currentColor" />
              <rect x="8" y="0" width="4" height="14" rx="1" fill="currentColor" />
            </svg>
          </button>

          <div class="o-audio-player__progress-wrap">
            <input
              class="o-audio-player__progress"
              type="range"
              min="0"
              max="100"
              value="0"
              step="0.1"
              data-role="audio-player-progress"
              aria-label="${toText(controls.progressAriaLabel, '')}"
            />
          </div>

          <time class="o-audio-player__time" data-role="audio-player-time" datetime="PT3M3S">${toText(config.durationLabel, '')}</time>

          <button
            class="a-button o-audio-player__mute"
            type="button"
            data-action="audio-player-mute"
            aria-label="${toText(controls.muteAriaLabel, '')}"
            aria-pressed="false"
          >
            <svg
              class="o-audio-player__icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M7 2.5L3.9 5.6H2C1.45 5.6 1 6.05 1 6.6V9.4C1 9.95 1.45 10.4 2 10.4H3.9L7 13.5V2.5Z" fill="currentColor" />
              <path d="M10.6 5.1C11.4 5.9 11.4 10.1 10.6 10.9" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
              <path d="M12.8 3C14.6 4.8 14.6 11.2 12.8 13" stroke="currentColor" stroke-width="1.4" stroke-linecap="round" />
            </svg>
          </button>

          <input
            class="o-audio-player__volume"
            type="range"
            min="0"
            max="1"
            value="1"
            step="0.01"
            data-role="audio-player-volume"
            aria-label="${toText(controls.volumeAriaLabel, '')}"
          />

          <button
            class="a-button o-audio-player__settings"
            type="button"
            data-action="audio-player-settings"
            aria-label="${toText(controls.settingsAriaLabel, '')}"
          >
            <svg
              class="o-audio-player__icon"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M6.6 1.3L7.1 2.4C7.5 2.3 7.9 2.3 8.3 2.4L8.8 1.3L10.3 1.9L10.1 3.1C10.4 3.3 10.7 3.6 10.9 3.9L12.1 3.7L12.7 5.2L11.6 5.7C11.7 6.1 11.7 6.5 11.6 6.9L12.7 7.4L12.1 8.9L10.9 8.7C10.7 9 10.4 9.3 10.1 9.5L10.3 10.7L8.8 11.3L8.3 10.2C7.9 10.3 7.5 10.3 7.1 10.2L6.6 11.3L5.1 10.7L5.3 9.5C5 9.3 4.7 9 4.5 8.7L3.3 8.9L2.7 7.4L3.8 6.9C3.7 6.5 3.7 6.1 3.8 5.7L2.7 5.2L3.3 3.7L4.5 3.9C4.7 3.6 5 3.3 5.3 3.1L5.1 1.9L6.6 1.3Z" stroke="currentColor" stroke-width="1.1" />
              <circle cx="7.7" cy="6.3" r="1.8" stroke="currentColor" stroke-width="1.1" />
            </svg>
          </button>

          <audio data-role="audio-player-element" preload="metadata" src="${toText(audio.src, '')}"></audio>
        </div>
      </div>
    `;
  }

  async handleToggle() {
    if (!this.audio) {
      return;
    }

    if (this.audio.paused) {
      try {
        await this.audio.play();
        this.updatePlayState(true);
      } catch {
        this.updatePlayState(false);
      }

      return;
    }

    this.audio.pause();
    this.updatePlayState(false);
  }

  handleTimeUpdate() {
    if (!this.audio || !this.progress) {
      return;
    }

    const duration = this.audio.duration;

    if (!Number.isFinite(duration) || duration <= 0) {
      return;
    }

    const percent = (this.audio.currentTime / duration) * 100;
    this.updateProgress(percent);
    this.updateDisplayedTime(this.audio.currentTime);
  }

  handleLoadedMetadata() {
    if (!this.audio || !this.time) {
      return;
    }

    const configDurationLabel = toText(this.config.durationLabel, '');
    const configDurationSeconds = parseDurationLabelToSeconds(configDurationLabel);

    this.durationSeconds =
      Number.isFinite(this.audio.duration) && this.audio.duration > 0
        ? this.audio.duration
        : configDurationSeconds;

    this.updateDisplayedTime(this.audio.currentTime);
  }

  handleEnded() {
    this.updatePlayState(false);
    this.updateProgress(100);
    this.updateDisplayedTime(this.durationSeconds ?? 0);
  }

  handleProgressInput() {
    if (!this.audio || !this.progress) {
      return;
    }

    const duration = this.audio.duration;

    if (!Number.isFinite(duration) || duration <= 0) {
      this.updateProgress(0);
      return;
    }

    const percent = clamp(Number.parseFloat(this.progress.value), 0, 100);
    this.audio.currentTime = (percent / 100) * duration;
    this.updateProgress(percent);
    this.updateDisplayedTime(this.audio.currentTime);
  }

  handleMute() {
    if (!this.audio) {
      return;
    }

    this.audio.muted = !this.audio.muted;
    this.updateMuteState();
  }

  handleVolumeInput() {
    if (!this.audio || !this.volume) {
      return;
    }

    const volumeValue = clamp(Number.parseFloat(this.volume.value), 0, 1);
    this.audio.volume = volumeValue;

    if (volumeValue > 0 && this.audio.muted) {
      this.audio.muted = false;
    }

    this.updateVolumeVisual(volumeValue);
    this.updateMuteState();
  }

  handleSettingsClick() {
    if (!this.audio || !this.settingsButton) {
      return;
    }

    const currentRateIndex = this.playbackRates.findIndex(
      (rate) => Math.abs(rate - this.audio.playbackRate) < 0.001
    );

    const nextRateIndex =
      currentRateIndex < 0 || currentRateIndex >= this.playbackRates.length - 1
        ? 0
        : currentRateIndex + 1;
    const nextRate = this.playbackRates[nextRateIndex];

    this.audio.playbackRate = nextRate;
    this.updateSettingsState(nextRate);
  }

  updatePlayState(isPlaying) {
    if (!this.controls || !this.toggleButton) {
      return;
    }

    this.controls.classList.toggle('is-playing', isPlaying);
    this.toggleButton.setAttribute('aria-pressed', isPlaying ? 'true' : 'false');
    this.toggleButton.setAttribute('aria-label', isPlaying ? this.pauseLabel : this.playLabel);
  }

  updateMuteState() {
    if (!this.audio || !this.muteButton) {
      return;
    }

    this.muteButton.setAttribute('aria-pressed', this.audio.muted ? 'true' : 'false');
  }

  updateSettingsState(playbackRate) {
    if (!this.settingsButton) {
      return;
    }

    const label = `${this.settingsLabel}: ${playbackRate.toFixed(2).replace(/\.00$/, '')}x`;
    this.settingsButton.setAttribute('aria-label', label);
    this.settingsButton.setAttribute('title', label);
  }

  updateProgress(percent) {
    if (!this.progress) {
      return;
    }

    const normalized = clamp(percent, 0, 100);
    this.progress.value = String(normalized);
    this.progress.style.setProperty('--progress-percent', `${normalized}%`);
  }

  updateVolumeVisual(volumeValue) {
    if (!this.volume) {
      return;
    }

    const normalized = clamp(volumeValue, 0, 1);
    this.volume.value = String(normalized);
    this.volume.style.setProperty('--volume-percent', `${normalized * 100}%`);
  }

  updateDisplayedTime(currentTime) {
    if (!this.time) {
      return;
    }

    const fallbackLabel = toText(this.config.durationLabel, '');
    const fallbackSeconds = parseDurationLabelToSeconds(fallbackLabel);
    const totalSeconds = this.durationSeconds ?? fallbackSeconds;

    if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
      this.time.textContent = fallbackLabel;
      return;
    }

    const remainingSeconds = Math.max(totalSeconds - currentTime, 0);
    const remainingLabel = formatTime(remainingSeconds);
    this.time.textContent = remainingLabel;

    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = Math.floor(remainingSeconds % 60);
    this.time.dateTime = `PT${minutes}M${seconds}S`;
  }
}
