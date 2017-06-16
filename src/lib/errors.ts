/**
* Runnable timeout error.
*/
export class RunnableTimeoutError extends Error {
  /**
  * Class constructor.
  */
  public constructor(message = "Action timeout.") {
    super(message);
  }
}

/**
* Runnable cancel error.
*/
export class RunnableCancelError extends Error {
  /**
  * Class constructor.
  */
  public constructor(message = "Action canceled.") {
    super(message);
  }
}
