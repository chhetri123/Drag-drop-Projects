namespace App {
  // Decorator
  export function AutoBind(
    _: any,
    _2: string | Symbol,
    descriptor: PropertyDescriptor
  ) {
    const objDescripter: PropertyDescriptor = {
      configurable: true,
      enumerable: false,
      get() {
        return descriptor.value.bind(this);
      },
    };
    return objDescripter;
  }
}
