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
const errors_1 = require("./errors");
class Runnable {
    constructor({ action, delay = 0, schedule = null, retries = 0, retryDelay = 0, timeout = 0, }) {
        this.timer = null;
        this.rejector = null;
        this.action = action;
        this.delay = delay;
        this.schedule = schedule;
        this.retries = retries;
        this.retryDelay = retryDelay;
        this.timeout = timeout;
    }
    perform() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.performDelay(this.delay, () => {
                return this.performSchedule(this.schedule, () => {
                    return this.performRetries(this.retries, () => {
                        return this.performTimeout(this.timeout, () => {
                            return this.performAction();
                        });
                    });
                });
            });
        });
    }
    performDelay(delay, next) {
        if (delay > 0) {
            return new Promise((resolve, reject) => {
                this.rejector = reject;
                this.timer = setTimeout(() => {
                    this.rejector = null;
                    next().then(resolve).catch(reject);
                }, delay);
            });
        }
        else {
            return next();
        }
    }
    performSchedule(schedule, next) {
        if (schedule) {
            return Promise.resolve().then(() => {
                return schedule();
            }).then((future) => {
                return !future ? 0 : future.getTime() - Date.now();
            }).then((delay) => {
                if (delay > 0) {
                    return new Promise((resolve, reject) => {
                        this.rejector = reject;
                        this.timer = setTimeout(() => {
                            this.rejector = null;
                            this.perform().then(resolve).catch(reject);
                        }, delay);
                    });
                }
                else {
                    return next();
                }
            });
        }
        else {
            return next();
        }
    }
    performRetries(retries, next) {
        if (retries > 0) {
            return next().catch((err) => {
                return new Promise((resolve, reject) => {
                    this.rejector = reject;
                    this.timer = setTimeout(() => {
                        this.rejector = null;
                        this.performRetries(retries - 1, next).then(resolve).catch(reject);
                    }, this.retryDelay);
                });
            });
        }
        else {
            return next();
        }
    }
    performTimeout(timeout, next) {
        if (timeout > 0) {
            return new Promise((resolve, reject) => {
                this.rejector = reject;
                this.timer = setTimeout(() => {
                    reject(new errors_1.RunnableTimeoutError());
                }, timeout);
                next().then((d) => {
                    this.rejector = null;
                    clearTimeout(this.timer);
                    return resolve(d);
                }).catch((e) => {
                    this.rejector = null;
                    clearTimeout(this.timer);
                    return reject(e);
                });
            });
        }
        else {
            return next();
        }
    }
    performAction() {
        return Promise.resolve().then(() => {
            return this.action.call ? this.action() : this.action;
        });
    }
    cancel() {
        if (this.rejector) {
            this.rejector(new errors_1.RunnableCancelError());
            this.rejector = null;
        }
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
            return true;
        }
        else {
            return false;
        }
    }
}
exports.Runnable = Runnable;
//# sourceMappingURL=runnable.js.map