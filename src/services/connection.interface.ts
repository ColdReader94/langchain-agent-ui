export type TMessageOwner = 'human' | 'ai' | 'tool' | 'system';
export type TMessageType = 'message' | 'prompt' | 'stop' | 'error' | 'done' | 'token' | 'context' | 'ping';

export type TMessage = {
    id: string;
    author: string;
    text: string;
    timestamp: number;
    done?: boolean;
    type: TMessageOwner;
    toolName?: string;
    toolParams?: Record<string, unknown> | string;
};

export interface IConnection {
    connect(): void;
    send(text: unknown, type?: TMessageType): void;
    close(): void;
    onMessage(cb: (msg: TMessage) => void): void;
    onOpen(cb: () => void): void;
    onError(cb: (e: Event | Error) => void): void;
}

export type THandlers = {
    message?: (m: TMessage) => void;
    open?: () => void;
    error?: (e: Event | Error) => void;
};

export type TConnectionType = 'ws';
