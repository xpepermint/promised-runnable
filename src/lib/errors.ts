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