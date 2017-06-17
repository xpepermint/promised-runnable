![Build Status](https://travis-ci.org/xpepermint/promised-runnable.svg?branch=master)&nbsp;[![NPM Version](https://badge.fury.io/js/promised-runnable.svg)](https://badge.fury.io/js/promised-runnable)&nbsp;[![Dependency Status](https://gemnasium.com/xpepermint/promised-runnable.svg)](https://gemnasium.com/xpepermint/promised-runnable)

# promised-runnable

> Configurable object for performing operation.

The source code is available on [GitHub](https://github.com/xpepermint/promised-runnable) where you can also find our [issue tracker](https://github.com/xpepermint/promised-runnable/issues).

## Installation

Run the command below to install the package.

```
$ npm install --save promised-runnable
```

## Getting Started

To make the code clean, the examples are written in [TypeScript](https://www.typescriptlang.org/).

Let's start with the simplest Runnable example.

```ts
import { Runnable } from "promised-runnable";

const runnable = new Runnable({
  action: () => "Done!", // Executable code block.
});

runnable.perform().then(() => {
  console.log(err); // -> "Done!"
}).catch((err) => {
  console.log(err);
});
```

Runnable can **delay** the execution.

```js
const runnable = new Runnable({
  action: () => "Done!",
  delay: 1000, // delay execution for 1s
});
```

Runnable can **retry** the execution if it fails.

```js
const runnable = new Runnable({
  action: () => "Done!",
  retries: 5, // retry 5x before failing
  retryDelay: 1000, // delay the execution between retries
});
```

Runnable can handle **timeouts**.

```js
const runnable = new Runnable({
  action: () => "Done!",
  timeout: 5000, // throws the RunnableTimeoutError if the execution takes more then 5s
});
```
Runnable can **schedule** the execution at a different time in the future. To give this feature more sence, let's define a new runnable object which can execute up to 1 command per second.

```js
/** Schedule */
const Redis = require("ioredis");
const { Quota } = require("ioredis-quota");
const redis = new Redis();
const quota = new Quota({ redis });
const schedule = () => quota.schedule({
  key: 'test-done',
  unit: 'second',
  limit: 1
});

/** Runnable */
const { Runnable } = require(".");
(async function() {
  const runnable = new Runnable({
    action: () => "Done!",
    schedule, // limit execution to 1 per second
  });
  for (let i = 0; i < 10; i++) {
    runnable.perform().then((d) => {
      console.log(d); // -> "Done!"
    }).catch((e) => {
      console.log(e);
    });
  }
})();
```

Runnable execution can be **canceled**.

```js
runnable.cancel();
```

## License (MIT)

```
Copyright (c) 2016+ Kristijan Sedlak <xpepermint@gmail.com>

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated modelation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
```
