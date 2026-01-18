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
}

/**
 * Langchain response interfaces
 */

export interface Root<T = unknown> {
    token: string;
    metadata: T;
}

// --------------------
// messages
// --------------------

export interface MessagesMetadata {
    lc: number;
    type: string;
    id: string[];
    kwargs: AIMessageChunkKwargs;
    tags?: string[];
    langgraph_step?: number;
    langgraph_node?: string;
    langgraph_triggers?: string[];
    langgraph_path?: string[];
    langgraph_checkpoint_ns?: string;
    __pregel_task_id?: string;
    checkpoint_ns?: string;
    ls_provider?: string;
    ls_model_name?: string;
    ls_model_type?: string;
    ls_temperature?: number;
}

export interface AIMessageChunkKwargs {
    content: string;
    tool_call_chunks: IToolCallChunk[];
    additional_kwargs: Record<string, unknown>;
    id: string;
    response_metadata: ResponseMetadata;
    tool_calls: IToolCall[];
    invalid_tool_calls: IToolCall[];
}

export interface ResponseMetadata {
    usage: UsageStats;
    timing: TimingStats;
}

export interface UsageStats {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
    queue_time?: number;
    prompt_tokens?: number;
    prompt_time?: number;
    completion_tokens?: number;
    completion_time?: number;
    completion_tokens_details?: {
        reasoning_tokens: number;
    };
}

export interface TimingStats {
    completion_time: number;
    prompt_time: number;
    queue_time: number;
    total_time: number;
}

// --------------------
// updates
// --------------------

export interface UpdatesMetadata {
    model_request: {
        messages: ModelMessage[];
    };
}

export interface ModelMessage {
    lc: number;
    type: string;
    id: string[];
    kwargs: ModelMessageKwargs;
}

// TODO
export interface IToolCall {
    id: string;
    type: string;
    name: string;
    args: string;
    index: number;
}

export interface IToolCallChunk {
    id: string;
    type: string;
    function: {
        name: string;
        arguments: Record<string, unknown> | string;
    };
}

export interface ModelMessageKwargs {
    content: string;
    additional_kwargs: Record<string, unknown>;
    response_metadata: ModelResponseMetadata;
    tool_call_chunks: IToolCallChunk[];
    id: string;
    tool_calls: IToolCall[];
    invalid_tool_calls: IToolCall[];
    name: string;
}

export interface ModelResponseMetadata {
    usage: UsageStats;
    timing: TimingStats;
    id: string;
    object: string;
    created: number;
    model: string;
    system_fingerprint: string;
    service_tier: string;
}
