import { BaseComponent } from '../../core/base-component.js';
import { getSiteContentValue } from '../../config/site-content.config.js';

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
    this.playLabel = 'Reproduzir áudio';
    this.pauseLabel = 'Pausar áudio';
    this.settingsLabel = 'Configurações de áudio';
    this.playbackRates = [1, 1.25, 1.5, 2];
    this.durationSeconds = null;

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

    this.playLabel = getSiteContentValue(
      'audioPlayer.controls.playAriaLabel',
      this.playLabel
    );
    this.pauseLabel = getSiteContentValue(
      'audioPlayer.controls.pauseAriaLabel',
      this.pauseLabel
    );
    this.settingsLabel = getSiteContentValue(
      'audioPlayer.controls.settingsAriaLabel',
      this.settingsLabel
    );

    this.toggleButton.addEventListener('click', this.handleToggle);
    this.audio.addEventListener('timeupdate', this.handleTimeUpdate);
    this.audio.addEventListener('loadedmetadata', this.handleLoadedMetadata);
    this.audio.addEventListener('ended', this.handleEnded);
    this.progress.addEventListener('input', this.handleProgressInput);
    this.muteButton.addEventListener('click', this.handleMute);
    this.volume.addEventListener('input', this.handleVolumeInput);
    this.settingsButton.addEventListener('click', this.handleSettingsClick);

    const initialDuration = getSiteContentValue('audioPlayer.durationLabel', '03:03');
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

    const configDurationLabel = getSiteContentValue('audioPlayer.durationLabel', '');
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

    const fallbackLabel = getSiteContentValue('audioPlayer.durationLabel', '00:00');
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
