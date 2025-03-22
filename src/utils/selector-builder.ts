export class SelectorBuilder {
  private selector: string;

  constructor(baseSelector: string) {
    this.selector = baseSelector;
  }

  child(elementName: string): SelectorBuilder {
    this.selector += ` > ${elementName}`;
    return this;
  }

  class(className: string): SelectorBuilder {
    this.selector += `.${className}`;
    return this;
  }

  descendant(selector: string): SelectorBuilder {
    this.selector += ` ${selector}`;
    return this;
  }

  build(): string {
    return this.selector;
  }
}
