import type { IConnection, THandlers, TMessage } from './connection.interface';

export class WebSocketConnection implements IConnection {
    private url: string;
    private ws: WebSocket | null = null;
    private handlers: THandlers = {};
    private reconnectDelay = 5000;
    private heartbeatTimer: number | null = null;
    private reconnectTimer: number | null = null;

    constructor(url: string) {
        this.url = url;
    }

    public connect() {
        this._connect();
    }

    private _connect() {
        this.clearReconnect();

        try {
            if (this.ws?.readyState === WebSocket.CONNECTING || this.ws?.readyState === WebSocket.OPEN) return;

            this.ws = new WebSocket(this.url);
        } catch (e) {
            console.error(e);
            this.scheduleReconnect();
            return;
        }

        this.ws.onopen = () => {
            console.log('WS Connected');
            this.reconnectDelay = 5000;
            this.handlers.open?.();
            this.startHeartbeat();
        };

        this.ws.onmessage = (ev) => {
            try {
                const data = JSON.parse(ev.data);
                this.handlers.message?.(data as TMessage);
            } catch (e) {
                console.error('Parse error', e);
            }
        };

        this.ws.onerror = (e) => {
            console.error('WS Error:', e);
        };

        this.ws.onclose = () => {
            console.warn('WS Closed');
            this.stopHeartbeat();
            this.scheduleReconnect();
        };
    }

    private scheduleReconnect() {
        if (this.reconnectTimer) return;

        this.reconnectTimer = setTimeout(() => {
            this.reconnectTimer = null;
            this._connect();
        }, this.reconnectDelay);

        this.reconnectDelay = Math.min(30000, this.reconnectDelay * 1.5);
    }

    private clearReconnect() {
        if (this.reconnectTimer) {
            clearTimeout(this.reconnectTimer);
            this.reconnectTimer = null;
        }
    }

    private startHeartbeat() {
        this.stopHeartbeat();
        this.heartbeatTimer = window.setInterval(() => {
            if (this.ws?.readyState === WebSocket.OPEN) {
                this.ws.send(JSON.stringify({ type: 'ping' }));
            } else {
                this.stopHeartbeat();
            }
        }, 25000);
    }

    private stopHeartbeat() {
        if (this.heartbeatTimer) {
            clearInterval(this.heartbeatTimer);
            this.heartbeatTimer = null;
        }
    }

    public close() {
        this.clearReconnect();
        this.stopHeartbeat();
        if (this.ws) {
            this.ws.onclose = null;
            this.ws.close();
            this.ws = null;
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
