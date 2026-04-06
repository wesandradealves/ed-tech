export class BaseComponent {
  /**
   * @param {HTMLElement} root
   */
  constructor(root) {
    if (!(root instanceof HTMLElement)) {
      throw new Error('Componente inválido: root precisa ser um HTMLElement.');
    }

    this.root = root;
    this.isMounted = false;
  }

  mount() {
    if (this.isMounted) {
      return;
    }

    this.isMounted = true;
    this.onMount();
  }

  unmount() {
    if (!this.isMounted) {
      return;
    }

    this.onUnmount();
    this.isMounted = false;
  }

  onMount() {}

  onUnmount() {}

  /**
   * @param {string} selector
   * @returns {HTMLElement | null}
   */
  query(selector) {
    return this.root.querySelector(selector);
  }
}
