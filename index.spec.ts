import { beforeEach, describe, expect, it } from 'vitest';

import {
  Doubles,
  buildProxyHandler,
  double,
  makeDouble,
  toHaveDirtyProperty
} from './index.js';

describe('buildProxyHandler()', () => {
  let subject: ProxyHandler<Record<string, unknown>>;

  beforeEach(() => {
    subject = buildProxyHandler();
  });

  describe('get()', () => {
    let target: Record<string, unknown>;
    const value = '<value>';

    describe('when property is a string', () => {
      const property = 'prop';

      beforeEach(() => {
        target = { [property]: value };
      });

      it('returns the value', () => {
        expect(subject.get!(target, property, {})).toBe(value);
      });
    });

    describe('when property is a symbol', () => {
      const property = Symbol('prop');

      beforeEach(() => {
        target = { [property.toString()]: value };
      });

      it('returns the value', () => {
        expect(subject.get!(target, property, {})).toBe(value);
      });
    });
  });

  describe('set()', () => {
    let target: Record<string, unknown>;
    const value = '<value>';

    describe('when property is a string', () => {
      const property = 'prop';

      beforeEach(() => {
        target = { [property]: value };
        Doubles.set(target, {
          dirty: new Set()
        });
      });

      it('returns true', () => {
        expect(subject.set!(target, property, value, target)).toBe(true);
      });

      it('assigns the value for the property', () => {
        subject.set!(target, property, value, target);

        expect(target[property]).toBe(value);
      });

      it('register the property into the proxy state', () => {
        subject.set!(target, property, value, target);

        expect(Doubles.get(target)?.dirty.has(property)).toBe(true);
      });
    });

    describe('when property is a symbol', () => {
      const property = Symbol('prop');

      beforeEach(() => {
        target = { [property.toString()]: value };
      });

      it('assigns the value for the property', () => {
        expect(subject.set!(target, property, value, target)).toBe(true);
        expect(target[property.toString()]).toBe(value);
      });
    });
  });

  describe('onKeys()', () => {
    const target = { prop: 'value' };

    it('returns the target keys', () => {
      expect(subject.ownKeys!(target)).toStrictEqual(['prop']);
    });
  });
});

describe('makeDouble()', () => {
  it('creates a double from a stub', () => {
    const stub = {
      fn0: () => {
        // empty
      },
      obj0: {
        fn1: () => {
          // empty
        },
        scalar1: 'string'
      },
      scalar0: 1024
    };
    const dbl = makeDouble(stub);

    expect(dbl.scalar0).toBe(stub.scalar0);
    expect(dbl.fn0).toBe(stub.fn0);
    expect(dbl.obj0).toBe(stub.obj0);
    expect(Doubles.has(dbl)).toBe(true);
  });
});

describe('double()', () => {
  it('creates a double with the provided object signature', () => {
    class Test {
      prop!: boolean;
    }

    const dbl: Test = double<Test>({
      prop: true
    });

    expect(dbl.prop).toBe(true);
  });
});

describe('toHaveDirtyProperty()', () => {
  class Test {
    prop!: string;
  }

  let dbl: Test;

  describe('when double was never initialized in the first place', () => {
    it('fails', () => {
      const { pass } = toHaveDirtyProperty(new Test(), 'prop');

      expect(pass).toBe(false);
    });
  });

  describe(`when property isn't dirty`, () => {
    beforeEach(() => {
      dbl = double<Test>();
    });

    it('fails', () => {
      const { message, pass } = toHaveDirtyProperty(dbl, 'prop');

      expect(pass).toBe(false);
      expect(message()).toBe(
        `expected double to have the dirty property "prop"`
      );
    });
  });

  describe('when property is dirty', () => {
    beforeEach(() => {
      dbl = double<Test>({
        prop: 'string'
      });
    });

    it('passes', () => {
      const { message, pass } = toHaveDirtyProperty(dbl, 'prop');

      expect(pass).toBe(true);
      expect(message()).toBe(
        `expected double not to have the dirty property "prop"`
      );
    });
  });
});
