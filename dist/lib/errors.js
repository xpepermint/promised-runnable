"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class RunnableTimeoutError extends Error {
    constructor(message = "Action timeout.") {
        super(message);
    }
}
exports.RunnableTimeoutError = RunnableTimeoutError;
//# sourceMappingURL=errors.js.map