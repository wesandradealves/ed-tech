import './styles/main.scss';
import { ComponentRegistry } from './js/core/component-registry.js';
import { HeroBannerComponent } from './js/components/organisms/hero-banner.component.js';

const componentRegistry = new ComponentRegistry([HeroBannerComponent]);
componentRegistry.mountAll();
