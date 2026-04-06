export class ComponentRegistry {
  /**
   * @param {Array<new (root: HTMLElement) => any> } componentClasses
   */
  constructor(componentClasses = []) {
    this.componentClasses = componentClasses;
    this.instances = [];
  }

  mountAll() {
    this.componentClasses.forEach((ComponentClass) => {
      const selector = ComponentClass.selector;

      if (!selector) {
        return;
      }

      document.querySelectorAll(selector).forEach((root) => {
        if (!(root instanceof HTMLElement)) {
          return;
        }

        const componentInstance = new ComponentClass(root);
        componentInstance.mount();
        this.instances.push(componentInstance);
      });
    });
  }

  unmountAll() {
    this.instances.forEach((instance) => {
      instance.unmount();
    });
    this.instances = [];
  }
}
