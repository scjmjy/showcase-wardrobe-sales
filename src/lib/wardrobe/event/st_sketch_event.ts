/**
 * @file    st_event.ts
 * @author 	Guilin
 *
 * ------------------ Logs -----------------------------------------------------
 * [Guilin 2021-07-20] Created.
 *
 */

export type StCallbackOnRecvEvent = (evt: StEvent) => void;

export class StEvtHandler {
    static readonly _inst = new StEvtHandler();
    static getInstance(): StEvtHandler {
        return StEvtHandler._inst;
    }

    readonly listeners: Array<StCallbackOnRecvEvent> = [];

    // private constructor() {}

    pushEvent(evt: StEvent): StEvtHandler {
        for (const lis of this.listeners) {
            lis(evt);
        }
        return this;
    }

    addListener(cb: StCallbackOnRecvEvent): void {
        this.listeners.push(cb);
    }

    removeListener(cb: StCallbackOnRecvEvent): void {
        for (let idx = 0; idx < this.listeners.length; idx++) {
            const lis = this.listeners[idx];
            if (lis == cb) {
                this.listeners.splice(idx, 1);
                break;
            }
        } //for
    }
}

export abstract class StEvent {
    // [guilin: 2021-7-20] TODO: Use 'Promise' to handle event async.
    // notify(): Promise<any> {
    notify(): void {
        StEvtHandler.getInstance().pushEvent(this);
    }
}

export class StBunchEvent extends StEvent {
    readonly list: Array<StEvent> = [];
}
