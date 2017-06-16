"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const ava_1 = require("ava");
const moment = require("moment");
const __1 = require("..");
ava_1.default("should resolve the action", (t) => __awaiter(this, void 0, void 0, function* () {
    let runnable0 = new __1.Runnable({
        action: () => true,
    });
    let runnable1 = new __1.Runnable({
        action: () => new Promise((resolve, reject) => setTimeout(resolve, 1000, true)),
    });
    t.is(yield runnable0.perform(), true);
    t.is(yield runnable1.perform(), true);
}));
ava_1.default("option `delay` should delay the execution", (t) => __awaiter(this, void 0, void 0, function* () {
    let runnable = new __1.Runnable({
        action: () => true,
        delay: 2000,
    });
    let start = Date.now();
    try {
        yield runnable.perform();
        t.is(Date.now() - start >= 2000, true);
    }
    catch (e) {
        t.fail();
    }
}));
ava_1.default("option `retries` should retry the execution", (t) => __awaiter(this, void 0, void 0, function* () {
    let times = 0;
    let raise = () => {
        if (times !== 2) {
            throw new Error("foo");
        }
    };
    let runnable = new __1.Runnable({
        action: () => {
            times++;
            raise();
        },
        retries: 3,
    });
    try {
        yield runnable.perform();
        t.pass();
    }
    catch (e) {
        t.fail();
    }
}));
ava_1.default("option `retryDelay` should slow-down the retry execution", (t) => __awaiter(this, void 0, void 0, function* () {
    let times = 0;
    let raise = () => {
        if (times !== 3) {
            throw new Error("foo");
        }
    };
    let runnable = new __1.Runnable({
        action: () => {
            times++;
            raise();
        },
        retries: 3,
        retryDelay: 1000,
    });
    let start = Date.now();
    try {
        yield runnable.perform();
        t.is(Date.now() - start >= 2000, true);
    }
    catch (e) {
        t.fail();
    }
}));
ava_1.default("option `schedule` should reschedule the execution at returned date", (t) => __awaiter(this, void 0, void 0, function* () {
    let times = 0;
    let runnable = new __1.Runnable({
        action: () => true,
        schedule: () => {
            times++;
            if (times < 3) {
                return moment().add(2, "seconds").toDate();
            }
            else {
                return new Date();
            }
        },
    });
    let start = Date.now();
    yield runnable.perform();
    t.is(Date.now() - start >= 4000, true);
}));
ava_1.default("option `timeout` should reject if it takes too long", (t) => __awaiter(this, void 0, void 0, function* () {
    let runnable = new __1.Runnable({
        action: () => new Promise((resolve, reject) => setTimeout(resolve, 3000, true)),
        timeout: 1000,
    });
    try {
        yield runnable.perform();
        t.fail();
    }
    catch (e) {
        t.is(e instanceof __1.RunnableTimeoutError, true);
    }
}));
ava_1.default("option `timeout` should resolve when completed fast enough", (t) => __awaiter(this, void 0, void 0, function* () {
    let runnable = new __1.Runnable({
        action: () => new Promise((resolve, reject) => setTimeout(resolve, 3000, true)),
        timeout: 5000,
    });
    try {
        let res = yield runnable.perform();
        t.is(res, true);
    }
    catch (e) {
        t.fail();
    }
}));
ava_1.default("method `cancel` should aboart delayed execution", (t) => __awaiter(this, void 0, void 0, function* () {
    let runnable = new __1.Runnable({
        action: () => true,
        delay: 2000,
    });
    try {
        setTimeout(() => runnable.cancel(), 100);
        yield runnable.perform();
        t.fail();
    }
    catch (e) {
        t.is(e instanceof __1.RunnableCancelError, true);
    }
}));
ava_1.default("method `cancel` should aboart scheduled execution", (t) => __awaiter(this, void 0, void 0, function* () {
    let times = 0;
    let runnable = new __1.Runnable({
        action: () => true,
        schedule: () => {
            times++;
            if (times < 3) {
                return moment().add(2, "seconds").toDate();
            }
            else {
                return new Date();
            }
        },
    });
    try {
        setTimeout(() => runnable.cancel(), 100);
        yield runnable.perform();
        t.fail();
    }
    catch (e) {
        t.is(e instanceof __1.RunnableCancelError, true);
    }
}));
ava_1.default("method `cancel` should aboart retried execution", (t) => __awaiter(this, void 0, void 0, function* () {
    let times = 0;
    let raise = () => {
        if (times !== 2) {
            throw new Error("foo");
        }
    };
    let runnable = new __1.Runnable({
        action: () => {
            times++;
            raise();
        },
        retries: 3,
        retryDelay: 10000,
    });
    try {
        setTimeout(() => runnable.cancel(), 100);
        yield runnable.perform();
        t.fail();
    }
    catch (e) {
        t.is(e instanceof __1.RunnableCancelError, true);
    }
}));
ava_1.default("method `cancel` should aboart timeouted execution", (t) => __awaiter(this, void 0, void 0, function* () {
    let runnable = new __1.Runnable({
        action: () => new Promise((resolve, reject) => setTimeout(resolve, 5000, true)),
        timeout: 10000,
    });
    let started = Date.now();
    try {
        setTimeout(() => runnable.cancel(), 100);
        yield runnable.perform();
        t.fail();
    }
    catch (e) {
        t.is(e instanceof __1.RunnableCancelError, true);
    }
}));
//# sourceMappingURL=runnable.js.map