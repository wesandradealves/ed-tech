import { ComponentRegistry } from './js/core/component-registry.js';
import { HeroBannerComponent } from './js/components/organisms/hero-banner.component.js';
import { VideoIntroComponent } from './js/components/organisms/video-intro.component.js';

const componentRegistry = new ComponentRegistry([HeroBannerComponent, VideoIntroComponent]);
componentRegistry.mountAll();
