import type { IConnection, THandlers, TMessage } from './connection.interface';

/**
 * WebSocket-based connection with simple reconnection and heartbeat.
 */
class WebSocketConnection implements IConnection {
    private url: string;
    private ws: WebSocket | null = null;
    private handlers: THandlers = {};
    private reconnectDelay = 20000;
    private forcedClose = false;
    private heartbeatTimer: number | null = null;

    constructor(url: string) {
        this.url = url;
    }

    public connect() {
        this.forcedClose = false;
        this._connect();
    }

    private _connect() {
        try {
            this.ws = new WebSocket(this.url);
        } catch (err) {
            this.handlers.error?.(err as Error);
            this.scheduleReconnect();
            return;
        }

        this.ws.onopen = () => {
            this.reconnectDelay = 20000;
            this.handlers.open?.();
            this.startHeartbeat();
        };

        this.ws.onmessage = (ev) => {
            try {
                const data = JSON.parse(ev.data);
                this.handlers.message?.(data as TMessage);
            } catch {
                console.error('Error');
            }
        };

        this.ws.onerror = (e) => {
            this.handlers.error?.(e);
        };

        this.ws.onclose = () => {
            this.stopHeartbeat();
            if (!this.forcedClose) this.scheduleReconnect();
        };
    }

    private scheduleReconnect() {
        setTimeout(() => this._connect(), this.reconnectDelay);
        this.reconnectDelay = Math.min(30000, this.reconnectDelay * 1.5);
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = window.setInterval(() => {
            if (this.ws && this.ws.readyState === WebSocket.OPEN) {
                try {
                    this.ws.send(JSON.stringify({ type: 'ping', ts: Date.now() }));
                } catch {
                    console.error('Error');
                }
            }
        }, 1000);
    }

    private stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    public send(text: string, type: string = 'message') {
        const payload = JSON.stringify({
            type,
            text,
            ts: Date.now(),
        });
        if (this.ws && this.ws.readyState === WebSocket.OPEN) {
            this.ws.send(payload);
        }
    }

    public close() {
        this.forcedClose = true;
        this.stopHeartbeat();
        this.ws?.close();
        this.ws = null;
    }

    public onMessage(cb: (msg: TMessage) => void) {
        this.handlers.message = cb;
    }

    public onOpen(cb: () => void) {
        this.handlers.open = cb;
    }

    public onError(cb: (e: Event | Error) => void) {
        this.handlers.error = cb;
    }
}

/**
 * Minimal REST-based stub so API can be swapped.
 */
// class RestConnection implements IConnection {
//     private baseUrl: string;
//     private handlers: THandlers = {};
//     private polling: number | null = null;
//     private lastPoll = 0;

//     constructor(baseUrl: string) {
//         this.baseUrl = baseUrl;
//     }

//     public connect() {
//         this.startPolling();
//         this.handlers.open?.();
//     }

//     public send(text: string, type: string = '') {
//         fetch(`${this.baseUrl}/messages`, {
//             method: 'POST',
//             headers: { 'Content-Type': 'application/json' },
//             body: JSON.stringify({ text, type }),
//         }).catch((e) => this.handlers.error?.(e));
//     }

//     public close() {
//         if (this.polling) {
//             clearInterval(this.polling);
//             this.polling = null;
//         }
//     }

//     public onMessage(cb: (msg: TMessage) => void) {
//         this.handlers.message = cb;
//     }

//     public onOpen(cb: () => void) {
//         this.handlers.open = cb;
//     }

//     public onError(cb: (e: Event | Error) => void) {
//         this.handlers.error = cb;
//     }

//     private startPolling() {
//         this.polling = window.setInterval(async () => {
//             try {
//                 const res = await fetch(`${this.baseUrl}/messages?since=${this.lastPoll}`);
//                 if (!res.ok) return;
//                 const data: TMessage[] = await res.json();
//                 data.forEach((m) => this.handlers.message?.(m));
//                 if (data.length) this.lastPoll = Date.now();
//             } catch (e) {
//                 this.handlers.error?.(e as Error);
//             }
//         }, 2500);
//     }
// }

export function createConnection(url: string): IConnection {
    return new WebSocketConnection(url);
    // return new RestConnection(url);
}
