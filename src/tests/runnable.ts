import test from "ava";
import * as moment from "moment";
import { Runnable, RunnableTimeoutError } from "..";

test("should resolve the action", async t => {
  let runnable0 = new Runnable({
    action: () => true,
  });
  let runnable1 = new Runnable({
    action: () => new Promise((resolve, reject) => setTimeout(resolve, 1000, true)),
  });

  t.is( await runnable0.perform(), true);
  t.is( await runnable1.perform(), true);
});

test("option `delay` should delay the execution", async t => {
  let runnable = new Runnable({
    action: () => true,
    delay: 2000,
  });
  let start = Date.now();

  try {
    await runnable.perform();
    t.is(Date.now() - start >= 2000, true);
  } catch (e) {
    t.fail();
  }
});

test("option `retries` should retry the execution", async t => {
  let times = 0;
  let raise = () => {
    if (times !== 2) { throw new Error("foo"); }
  };
  let runnable = new Runnable({
    action: () => {
      times++;
      raise();
    },
    retries: 3,
  });

  try {
    await runnable.perform();
    t.pass();
  } catch (e) {
    t.fail();
  }
});

test("option `retryDelay` should slow-down the retry execution", async t => {
  let times = 0;
  let raise = () => {
    if (times !== 3) { throw new Error("foo"); }
  };
  let runnable = new Runnable({
    action: () => {
      times++;
      raise();
    },
    retries: 3,
    retryDelay: 1000,
  });
  let start = Date.now();

  try {
    await runnable.perform();
    t.is(Date.now() - start >= 2000, true);
  } catch (e) {
    t.fail();
  }
});

test("option `schedule` should reschedule the execution at returned date", async t => {
  let times = 0;
  let runnable = new Runnable({
    action: () => true,
    schedule: () => {
      times++;
      if (times < 3) { // pospone 2x
        return moment().add(2, "seconds").toDate(); // pospone for 2 seconds
      } else {
        return new Date(); // or null
      }
    },
  });
  let start = Date.now();

  await runnable.perform();
  t.is(Date.now() - start >= 4000, true);
});

test("option `timeout` should reject if it takes too long", async t => {
  let r = new Runnable({
    action: () => new Promise((resolve, reject) => setTimeout(resolve, 1000, true)),
    timeout: 1000,
  });

  try {
    await r.perform();
    t.fail();
  } catch (e) {
    t.pass();
  }
});

test("option `timeout` should resolve when completed fast enough", async t => {
  let r = new Runnable({
    action: () => new Promise((resolve, reject) => setTimeout(resolve, 10, true)),
    timeout: 10000,
  });
  let started = Date.now();

  try {
    await r.perform();
    if (Date.now() - started > 20) {
      t.fail();
    } else {
      t.pass();
    }
  } catch (e) {
    t.fail();
  }
});

test("option `timeout` should reject with timeout error if it takes too long", async t => {
  let r = new Runnable({
    action: () => new Promise((resolve, reject) => setTimeout(resolve, 1000, true)),
    timeout: 1,
  });

  let error = await r.perform().catch((e) => (e instanceof RunnableTimeoutError));
  t.is(error, true);
});

