export type TMessageOwner = 'human' | 'ai' | 'tool' | 'error' | 'stop';

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
    send(text: string, type?: string): void;
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

export type TConnectionType = 'ws' | 'rest';
