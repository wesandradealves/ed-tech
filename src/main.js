import { ComponentRegistry } from './js/core/component-registry.js';
import { initializeSiteContent } from './js/config/site-content.config.js';
import { HeroBannerComponent } from './js/components/organisms/hero-banner.component.js';
import { VideoIntroComponent } from './js/components/organisms/video-intro.component.js';
import { WaveTextComponent } from './js/components/organisms/wave-text.component.js';
import { ForestSliderComponent } from './js/components/organisms/forest-slider.component.js';
import { DarkTextBoxComponent } from './js/components/organisms/dark-text-box.component.js';
import { RevealCardsComponent } from './js/components/organisms/reveal-cards.component.js';
import { AudioPlayerComponent } from './js/components/organisms/audio-player.component.js';
import { ActivityPanelComponent } from './js/components/organisms/activity-panel.component.js';

async function bootstrapApp() {
  await initializeSiteContent();

  const componentRegistry = new ComponentRegistry([
    HeroBannerComponent,
    VideoIntroComponent,
    WaveTextComponent,
    ForestSliderComponent,
    DarkTextBoxComponent,
    RevealCardsComponent,
    AudioPlayerComponent,
    ActivityPanelComponent,
  ]);

  componentRegistry.mountAll();
}

bootstrapApp();
