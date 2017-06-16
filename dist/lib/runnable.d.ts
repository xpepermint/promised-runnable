export declare class Runnable {
    readonly action: () => any;
    delay: number;
    schedule: (() => Date) | Promise<Date>;
    retries: number;
    retryDelay: number;
    timeout: number;
    protected timer: any;
    constructor({action, delay, schedule, retries, retryDelay, timeout}: {
        action: () => any;
        delay?: number;
        schedule?: (() => Date) | Promise<Date>;
        retries?: number;
        retryDelay?: number;
        timeout?: number;
    });
    perform(): Promise<any>;
    protected performDelay(delay: any, next: any): any;
    protected performRetries(retries: any, next: any): any;
    protected performSchedule(schedule: any, next: any): any;
    protected performTimeout(timeout: any, next: any): Promise<any>;
    protected performAction(): Promise<any>;
    cancel(): Promise<boolean>;
}
