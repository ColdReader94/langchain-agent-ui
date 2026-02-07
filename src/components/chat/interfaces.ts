export type Theme = 'light' | 'dark';

export interface IMessageInput {
    onSend: (text: string, type?: string) => void;
    onCancel: () => void;
    disabled: boolean;
    isStreaming: boolean;
    sendButtonText: string;
    maxLength: number;
    minLength: number;
    minLengthErrorText: string;
    maxLengthErrorText: string;
}

export interface IChatWindowInput extends Omit<Partial<IMessageInput>, 'onSend' | 'onCancel' | 'isStreaming'> {
    url: string;
    ownId?: string;
    chatName?: string;
    themeSwitcherName?: string;
    showToolsCalls?: boolean;
    greetingsText?: string;
    context?: Record<string, unknown> | null;
}

export interface IChatTemplate {
    name: string;
    title: string;
    description: string;
    argumenst: unknown[];
}

export interface LangchainResponse {
    token: string;
    metadata: [MessageData, GraphGraphMetadata?];
}

// --------------------
// Messages
// --------------------

export interface MessageData {
    lc: number;
    type: 'constructor';
    id: string[];
    kwargs: MessageKwargs;
}

export interface MessageKwargs {
    content: string;
    id: string;
    tool_calls?: IToolCall[];
    tool_call_chunks?: IToolCallChunk[];
    invalid_tool_calls?: unknown[];
    additional_kwargs: Record<string, unknown>;
    response_metadata: Record<string, unknown>;
    status?: 'success' | 'error';
    tool_call_id?: string;
    name?: string;
}

export interface IToolCall {
    id: string;
    name: string;
    args: Record<string, unknown>;
    type: 'tool_call';
}

export interface IToolCallChunk {
    name?: string;
    args?: string;
    id?: string;
    index?: number;
    type: 'tool_call_chunk';
}

// --------------------
// LangGraph
// --------------------

export interface GraphGraphMetadata {
    thread_id: string;
    langgraph_step: number;
    langgraph_node: string;
    langgraph_triggers: string[];
    langgraph_path: string[];
    checkpoint_ns: string;
    ls_provider?: string;
    ls_model_name?: string;
    tags?: string[];
    __pregel_task_id?: string;
}

// --------------------
// Updates/State
// --------------------

export interface LanggraphUpdate {
    [nodeName: string]: {
        messages: MessageData[];
    };
}
