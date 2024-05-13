<h1 align="center">vitest-double</h1>
<p align="center">
  Typed doubles for <a href="https://vitest.dev/">Vitest</a>.
</p>
<p align="center">
  <a href="https://github.com/gcoguiec/vitest-double/actions/workflows/ci.yml">
    <img src="https://img.shields.io/github/actions/workflow/status/gcoguiec/vitest-double/ci.yml?branch=main&label=ci&style=flat-square" alt="CI Status"/>
  </a>
  <a href="https://github.com/gcoguiec/vitest-double/blob/main/LICENSE.md">
    <img src="https://img.shields.io/github/license/gcoguiec/vitest-double?style=flat-square&label=License" alt="License"/>
  </a>
</p>

<hr>

## Table of Contents

- [Overview](#overview)
- [Getting Started](#getting-started)
- [Usage](#usage)
- [License](#license)

## Overview

`vitest-double` is a tiny helper that allows you to create the full or partial "double" of a typed object while keeping its original type signature.

## Getting started

To add vitest-double to your project:

```bash
npm install -D vitest-double
```

```bash
yarn add -D vitest-double
```

```bash
pnpm add -D vitest-double
```

```bash
bun add -D vitest-double
```

## Usage

```ts
import { vi, expect } from 'vitest';
import { double } from 'vitest-double';

// In a nutshell:
const dbl = double<TypeToStub>({
  propertyA: 'string', // Any scalar value.
  methodB: vi.fn(), // A stub function.
  methodC: vi.fn(() => true) // A stub with default implementation.
});

// [propertyA is modified...]

expect(dbl).toHaveDirtyProperty('propertyA');
```

```ts
import { vi, expect } from 'vitest';
import { double } from 'vitest-double';

// Example with HTMLElement type:
const element = double<HTMLElement>({
  focus: vi.fn(),
  removeAttribute: vi.fn(),
  removeEventListener: vi.fn(),
  setAttribute: vi.fn(),
  addEventListener: vi.fn()
});

// [something calls focus() on HTML element...]

expect(element.focus).toHaveBeenCalled();
```

## License

This project is licensed under [BSD 2-Clause](https://spdx.org/licenses/BSD-2-Clause.html).
