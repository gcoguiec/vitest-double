import type { DeepPartial } from 'ts-essentials';

import { expect } from 'vitest';

export type Double<T> = {
  [k in keyof T]: T[k];
};

export interface DoubleState {
  dirty: Set<string | symbol>;
}

interface DoubleMatcherResult {
  message: () => string;
  pass: boolean;
}

// Used to store all the double states.
export const Doubles = new WeakMap<object, DoubleState>();

export const buildProxyHandler = <T extends object>(): ProxyHandler<T> => ({
  get(target: Double<T>, property: string | symbol): unknown {
    return (target as Record<string, unknown>)[
      typeof property === 'symbol' ? property.toString() : property
    ];
  },
  ownKeys(target: Double<T>) {
    return Reflect.ownKeys(target);
  },
  set(
    target: Double<T>,
    property: string | symbol,
    value: unknown,
    receiver: object
  ): boolean {
    (target as Record<string, unknown>)[
      typeof property === 'symbol' ? property.toString() : property
    ] = value;
    // Tracks if a specific property on a double has been touched / modified.
    Doubles.get(receiver)?.dirty.add(property);
    return true;
  }
});

/**
 * Creates a specific typed object "perfect double" (type-wise).
 *
 * @param stub The stub definition used to initialize the double.
 * @returns A perfect double.
 */
export function makeDouble<T>(stub: DeepPartial<T>): Double<T> {
  const rstub = stub as Record<string, unknown>;
  const proxy = new Proxy<Double<T>>(
    stub as Double<T>,
    buildProxyHandler<Double<T>>()
  );
  const rproxy = proxy as Record<string, unknown>;

  Doubles.set(proxy, {
    dirty: new Set()
  });

  Object.keys(rstub).forEach(name => {
    if (
      rstub[name] != null &&
      (typeof rstub[name] === 'object' || typeof rstub[name] === 'function') &&
      !Array.isArray(rstub[name])
    ) {
      rproxy[name] = makeDouble(rstub[name]);
      return;
    }
    rproxy[name] = rstub[name];
  });

  return proxy;
}

/**
 * Creates a double with same type signature.
 *
 * @param stub The stub definition used to initialize the double.
 * @returns A double instance with same type signature as the real thing.
 */
export const double = <T>(stub?: DeepPartial<T>): T & Double<T> =>
  makeDouble<T>(stub ?? ({} as DeepPartial<T>));

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Vi {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface Assertion<T = any> {
      toHaveDirtyProperty(property: string): T;
    }
  }
}

/**
 * Expects a double property to have been modified / touched.
 *
 * @param value The double instance.
 * @param property The double property to check.
 */
export function toHaveDirtyProperty(
  value: object,
  property: string
): DoubleMatcherResult {
  const pass = Doubles.get(value)?.dirty.has(property) ?? false;
  const message = pass
    ? () => `expected double not to have the dirty property "${property}"`
    : () => `expected double to have the dirty property "${property}"`;

  return {
    message,
    pass
  };
}

expect.extend({ toHaveDirtyProperty });
