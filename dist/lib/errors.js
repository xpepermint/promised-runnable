"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RunnableTimeoutError extends Error {
    constructor(message = "Action timeout.") {
        super(message);
    }
}
exports.RunnableTimeoutError = RunnableTimeoutError;
class RunnableCancelError extends Error {
    constructor(message = "Action canceled.") {
        super(message);
    }
}
exports.RunnableCancelError = RunnableCancelError;
//# sourceMappingURL=errors.js.map