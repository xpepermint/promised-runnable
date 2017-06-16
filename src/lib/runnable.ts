import { RunnableTimeoutError } from "./errors";

/**
 * Main runnable class.
 */
export class Runnable {
  /**
   * Command to be performed.
   */
  readonly action: () => any;
  /**
   * A time in milliseconds to delay the execution.
   */
  public delay: number;
  /**
   * A method which returns a date for rescheduling the action execution. This method
   * is called each time the action is rescheduled. If the returned date is in the past
   * then the action is performed.
   */
  public schedule: (() => Date) | Promise<Date>;
  /**
   * Maximum number of retries.
   */
  public retries: number;
  /**
   * A time in milliseconds for delay between each retry.
   */
  public retryDelay: number;
  /**
   * A time in milliseconds before the execution is aborted.
   */
  public timeout: number;
  /**
   * Timeout timer.
   */
  protected timer: any = null;

  /**
   * Class constructor.
   */
  public constructor({
    action,
    delay = 0,
    schedule = null,
    retries = 0,
    retryDelay = 0,
    timeout = 0,
  }: {
    action: () => any;
    delay?: number;
    schedule?: (() => Date) | Promise<Date>;
    retries?: number;
    retryDelay?: number;
    timeout?: number;
  }) {
    this.action = action;
    this.delay = delay;
    this.schedule = schedule;
    this.retries = retries;
    this.retryDelay = retryDelay;
    this.timeout = timeout;
  }

  /**
   * Performs the command.
   */
  public async perform() {
    return this.performDelay(this.delay, () => {
      return this.performSchedule(this.schedule, () => {
        return this.performRetries(this.retries, () => {
          return this.performTimeout(this.timeout, () => {
            return this.performAction();
          });
        });
      });
    });
  }

  /**
   * Runs the provided action with delay.
   */
  protected performDelay(delay, next) {
    if (delay > 0) {
      return new Promise((resolve, reject) => {
        this.timer = setTimeout(() => next().then(resolve).catch(reject), delay);
      });
    } else {
      return next();
    }
  }

  /**
   * Performs the provided action with retry.
   */
  protected performRetries(retries, next) {
    if (retries > 0) {
      return next().catch((err) => {
        return new Promise((resolve, reject) => {
          this.timer = setTimeout(() => {
            this.performRetries(retries - 1, next).then(resolve).catch(reject);
          }, this.retryDelay);
        });
      });
    } else {
      return next();
    }
  }

  /**
   * Performs the provided action with scheduler.
   */
  protected performSchedule(schedule, next) {
    if (schedule) {
      return Promise.resolve().then(() => {
        return schedule();
      }).then((future: Date) => {
        return !future ? 0 : future.getTime() - Date.now();
      }).then((delay: number) => {
        if (delay > 0) {
          return new Promise((resolve) => {
            this.timer = setTimeout(resolve, delay, this.perform.bind(this));
          });
        } else {
          return next.bind(this);
        }
      }).then((callback: any) => {
        return callback ? callback() : callback();
      });
    } else {
      return next();
    }
  }

  /**
   * Executes the provided action but throws an error if the operation
   * takes too long.
   */
  protected performTimeout(timeout, next) {
    const error = new RunnableTimeoutError();

    const sleep = timeout > 0
      ? new Promise((resolve, reject) => (this.timer = setTimeout(reject, timeout, error)))
      : null;

    const run = Promise.resolve().then(() => {
      return next();
    }).then((value) => {
      clearTimeout(this.timer);
      return value;
    });

    return Promise.race(
      [run, sleep].filter(p => !!p)
    ).then((res) => {
      if (res === error) {
        throw error;
      } else {
        return res;
      }
    });
  }

  /**
   * Performs the provided action.
   */
  protected performAction() {
    return Promise.resolve().then(() => {
      return this.action.call ? this.action() : this.action;
    });
  }


  /**
   * Cancels the command.
   */
  public async cancel() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
      return true;
    } else {
      return false;
    }
  }

}
