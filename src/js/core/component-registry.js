export class ComponentRegistry {
  /**
   * @param {Array<new (root: HTMLElement) => any> } componentClasses
   */
  constructor(componentClasses = []) {
    this.componentClasses = componentClasses;
    this.instances = [];
    this.lazyObserver = null;
    this.lazyTargets = new Map();
  }

  mountAll() {
    this.setupLazyObserver();

    this.componentClasses.forEach((ComponentClass) => {
      const selector = ComponentClass.selector;

      if (!selector) {
        return;
      }

      document.querySelectorAll(selector).forEach((root) => {
        if (!(root instanceof HTMLElement)) {
          return;
        }

        if (ComponentClass.lazyOnScroll && this.lazyObserver) {
          root.dataset.lazyState = 'pending';
          this.lazyTargets.set(root, ComponentClass);
          this.lazyObserver.observe(root);
          return;
        }

        this.mountInstance(ComponentClass, root);
      });
    });
  }

  setupLazyObserver() {
    const hasIntersectionObserver =
      typeof window !== 'undefined' && 'IntersectionObserver' in window;

    if (!hasIntersectionObserver || this.lazyObserver) {
      return;
    }

    this.lazyObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) {
            return;
          }

          const root = entry.target;

          if (!(root instanceof HTMLElement)) {
            return;
          }

          const ComponentClass = this.lazyTargets.get(root);

          if (!ComponentClass) {
            return;
          }

          this.mountInstance(ComponentClass, root);
          root.dataset.lazyState = 'loaded';
          this.lazyTargets.delete(root);
          this.lazyObserver?.unobserve(root);
        });
      },
      {
        root: null,
        rootMargin: '0px 0px -8% 0px',
        threshold: 0.1,
      }
    );
  }

  mountInstance(ComponentClass, root) {
    const componentInstance = new ComponentClass(root);
    componentInstance.mount();
    this.instances.push(componentInstance);
  }

  unmountAll() {
    if (this.lazyObserver) {
      this.lazyObserver.disconnect();
      this.lazyObserver = null;
    }

    this.lazyTargets.clear();

    this.instances.forEach((instance) => {
      instance.unmount();
    });
    this.instances = [];
  }
}
