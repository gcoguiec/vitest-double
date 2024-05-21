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

## About the name

Double as in doppelgänger and 'vitesse double' also means 'double speed' in French, It's a _double_ pun.

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

Calling `double<MyType>()` will create a double instance with correct type signature:

```ts
import { double } from 'vitest-double';

// Mocking the Navigator browser object:
const navigator = double<Navigator>();
```

You can use Vitest's usual bells and whistles to mock a double partially:

```ts
import { vi, expect } from 'vitest';
import { double } from 'vitest-double';

// Example with HTMLElement type:
const element = double<HTMLElement>({
  hidden: false,
  focus: vi.fn(),
  removeAttribute: vi.fn(),
  removeEventListener: vi.fn(),
  setAttribute: vi.fn(),
  addEventListener: vi.fn()
});

// [something calls focus() on HTML element...]

expect(element.focus).toHaveBeenCalled();
expect(element).not.toHaveDirtyProperty('hidden');
```

Doubles can be used to mock fairly complex structures; here is an example of VSCode's API:

```ts
// vscode-shim.ts
import type * as vscode from 'vscode';

import { double } from 'vitest-double';

export const workspace = double<typeof vscode.workspace>({
  getConfiguration: vi.fn(() =>
    double<vscode.WorkspaceConfiguration>({
      get: vi.fn(() => {})
    })
  )
});

export const window = double<typeof vscode.window>({
  createOutputChannel: double<typeof vscode.window.createOutputChannel>(() =>
    double<vscode.LogOutputChannel>({
      clear: vi.fn(),
      onDidChangeLogLevel: vi.fn()
    })
  )
});
```

Register your shim in your Vite or Vitest configuration file and use it in your specs:

```ts
resolve: {
  alias: {
    vscode: resolve(process.cwd(), 'vscode-shim.ts');
  }
}
```

You can use doubles to mock pretty much every third-party API.

## License

This project is licensed under [BSD 2-Clause](https://spdx.org/licenses/BSD-2-Clause.html).
