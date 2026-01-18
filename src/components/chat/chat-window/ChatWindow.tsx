import { useCallback, useEffect, useRef, useState } from 'react';
import { createConnection } from '../../../services/connection';
import type { IConnection, TMessage } from '../../../services/connection.interface';
import { Sidebar } from '../../sidebar/sidebar';
import { ChatList } from '../chat-list/ChatList';
import type { IChatWindowInput, IToolCall, ModelMessage } from '../interfaces';
import { MessageInput } from '../message-input/MessageInput';
import { ThemeProvider, useTheme } from '../providers/ThemeProvider';
import './ChatWindow.css';

export const ChatWindow = ({
    url,
    ownId,
    chatName,
    minLength,
    maxLength,
    disabled,
    sendButtonText,
    minLengthErrorText,
    maxLengthErrorText,
    themeSwitcherName,
    showToolsCalls,
}: Required<IChatWindowInput>) => {
    const [messages, setMessages] = useState<TMessage[]>([]);
    const [showScrollButton, setShowScrollButton] = useState<boolean>(false);
    const [isSettingsAreOpen, setIsSettingsAreOpen] = useState<boolean>(false);
    const connRef = useRef<IConnection>(createConnection(url));
    const listRef = useRef<HTMLDivElement | null>(null);
    const [isStreaming, setIsStreaming] = useState<boolean>(false);
    const { toggle, theme } = useTheme();

    const scrollToBottom = useCallback(() => {
        if (listRef.current) {
            listRef.current.scrollTop = listRef.current.scrollHeight;
        }
    }, []);

    const send = useCallback(
        (text: string) => {
            const msg: TMessage = {
                id: String(Date.now()) + Math.random(),
                author: ownId,
                text,
                timestamp: Date.now(),
                type: 'human',
            };

            try {
                connRef.current?.send(text);
                setMessages((p) => [...p, msg].slice(-500));
                setIsStreaming(true);
            } catch (err) {
                const errorMsg: TMessage = {
                    id: String(Date.now()) + Math.random(),
                    author: 'error',
                    text: `Error while sending: ${(err as Error).message}`,
                    timestamp: Date.now(),
                    type: 'error',
                };
                setMessages((p) => [...p, errorMsg].slice(-500));
            }
        },
        [ownId],
    );

    const cancel = useCallback(() => {
        const msg: TMessage = {
            id: String(Date.now()) + Math.random(),
            author: ownId,
            text: '',
            timestamp: Date.now(),
            type: 'stop',
        };

        try {
            connRef.current?.send('', msg.type);
        } catch (e) {
            console.error(e);
        }
    }, [ownId]);

    useEffect(() => {
        const el = listRef.current;
        if (!el) return;

        const handler = () => {
            const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 50;
            setShowScrollButton(!nearBottom);
        };

        el.addEventListener('scroll', handler);
        return () => el.removeEventListener('scroll', handler);
    }, []);

    useEffect(() => {
        connRef.current.onOpen(() => {});

        connRef.current.onMessage((raw: unknown) => {
            try {
                const data = typeof raw === 'string' ? JSON.parse(raw) : raw;

                if (data.error) {
                    const errorMsg: TMessage = {
                        id: String(Date.now()) + Math.random(),
                        author: 'system',
                        text: data.error,
                        timestamp: Date.now(),
                        type: 'error',
                    };
                    setMessages((prev) => [...prev, errorMsg].slice(-500));
                    setIsStreaming(false);
                    return;
                }

                if (data.metadata?.model_request?.messages) {
                    data.metadata.model_request.messages.forEach((msg: ModelMessage) => {
                        if (msg.kwargs?.tool_calls?.length) {
                            msg.kwargs.tool_calls.forEach((tool: IToolCall) => {
                                const toolMsg: TMessage = {
                                    id: String(Date.now()) + Math.random(),
                                    author: 'ai',
                                    text: `Tool call: ${tool.name}`,
                                    timestamp: Date.now(),
                                    type: 'tool',
                                    toolName: tool.name,
                                    toolParams: tool.args,
                                };
                                setMessages((prev) => [...prev, toolMsg].slice(-500));
                            });
                        }
                    });
                }

                if (data.metadata?.model_request?.messages?.length) {
                    setMessages((prev) => {
                        const last = prev[prev.length - 1];

                        if (last && last.type === 'ai' && !last.done) {
                            const appendedText = data.metadata.model_request.messages
                                .map((msg: ModelMessage) => msg.kwargs.content)
                                .join('')
                                .trim();

                            const updated: TMessage = {
                                ...last,
                                text: last.text + appendedText,
                            };
                            return [...prev.slice(0, -1), updated];
                        } else {
                            const newMsg: TMessage = {
                                id: String(Date.now()) + Math.random(),
                                author: 'ai',
                                text: data.metadata.model_request.messages
                                    .map((msg: ModelMessage) => msg.kwargs.content)
                                    .join('')
                                    .trim(),
                                timestamp: Date.now(),
                                type: 'ai',
                                done: false,
                            };
                            return [...prev, newMsg].slice(-500);
                        }
                    });
                }

                if (data.done) {
                    setIsStreaming(false);
                    setMessages((prev) => {
                        const last = prev[prev.length - 1];
                        if (last && last.type === 'ai') {
                            return [...prev.slice(0, -1), { ...last, done: true }];
                        }
                        return prev;
                    });
                }
            } catch {
                setIsStreaming(false);
                setMessages((prev) => [...prev, raw as TMessage].slice(-500));
            }
        });

        connRef.current.onError((e) => {
            const errorMsg: TMessage = {
                id: String(Date.now()) + Math.random(),
                author: 'system',
                text: `Connection error: ${(e as Error)?.message ?? 'Unknown error'}`,
                timestamp: Date.now(),
                type: 'error',
            };
            setMessages((prev) => [...prev, errorMsg].slice(-500));
        });

        connRef.current.connect();
        return () => connRef?.current?.close();
    }, []);

    return (
        <section className="agent-chat-root" aria-labelledby="chatHeaderText">
            <header className="chat-header">
                <div id="chatHeaderText" className="chat-header-name">
                    {chatName}
                </div>
                <button
                    id="sidebarSettingsBtn"
                    aria-controls="settingsSidebarContent"
                    className="open-sidebar-btn"
                    onClick={() => setIsSettingsAreOpen(true)}
                    aria-label="Open settings"
                >
                    <svg width="16px" height="16px" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
                        <path
                            d="M262.29,192.31a64,64,0,1,0,57.4,57.4A64.13,64.13,0,0,0,262.29,192.31ZM416.39,256a154.34,154.34,0,0,1-1.53,20.79l45.21,35.46A10.81,10.81,0,0,1,462.52,326l-42.77,74a10.81,10.81,0,0,1-13.14,4.59l-44.9-18.08a16.11,16.11,0,0,0-15.17,1.75A164.48,164.48,0,0,1,325,400.8a15.94,15.94,0,0,0-8.82,12.14l-6.73,47.89A11.08,11.08,0,0,1,298.77,470H213.23a11.11,11.11,0,0,1-10.69-8.87l-6.72-47.82a16.07,16.07,0,0,0-9-12.22,155.3,155.3,0,0,1-21.46-12.57,16,16,0,0,0-15.11-1.71l-44.89,18.07a10.81,10.81,0,0,1-13.14-4.58l-42.77-74a10.8,10.8,0,0,1,2.45-13.75l38.21-30a16.05,16.05,0,0,0,6-14.08c-.36-4.17-.58-8.33-.58-12.5s.21-8.27.58-12.35a16,16,0,0,0-6.07-13.94l-38.19-30A10.81,10.81,0,0,1,49.48,186l42.77-74a10.81,10.81,0,0,1,13.14-4.59l44.9,18.08a16.11,16.11,0,0,0,15.17-1.75A164.48,164.48,0,0,1,187,111.2a15.94,15.94,0,0,0,8.82-12.14l6.73-47.89A11.08,11.08,0,0,1,213.23,42h85.54a11.11,11.11,0,0,1,10.69,8.87l6.72,47.82a16.07,16.07,0,0,0,9,12.22,155.3,155.3,0,0,1,21.46,12.57,16,16,0,0,0,15.11,1.71l44.89-18.07a10.81,10.81,0,0,1,13.14,4.58l42.77,74a10.8,10.8,0,0,1-2.45,13.75l-38.21,30a16.05,16.05,0,0,0-6.05,14.08C416.17,247.67,416.39,251.83,416.39,256Z"
                            style={{
                                fill: 'none',
                                stroke: '#000000',
                                strokeLinecap: 'round',
                                strokeLinejoin: 'round',
                                strokeWidth: '32px',
                            }}
                        />
                    </svg>
                </button>
                {isSettingsAreOpen && (
                    <Sidebar
                        position="right"
                        isOpen={isSettingsAreOpen}
                        setIsOpen={setIsSettingsAreOpen}
                        onClose={() => setIsSettingsAreOpen(false)}
                    >
                        <div id="settingsSidebarContent" aria-owns="sidebarSettingsBtn" className="theme-switcher-wrapper">
                            <span id="themeSwitcherLabel" className="theme-switch-text-label">
                                {themeSwitcherName}
                            </span>
                            <label className="theme-switch" aria-labelledby="themeSwitcherLabel">
                                <input name="Theme switch" onChange={toggle} type="checkbox" value={theme} checked={theme === 'light'} />
                                <span className="slider"></span>
                            </label>
                        </div>
                    </Sidebar>
                )}
            </header>
            <div className="messages-list" ref={listRef}>
                <ChatList messages={messages} ownId={ownId} showToolsCalls={showToolsCalls} />
            </div>

            {showScrollButton && (
                <button onClick={scrollToBottom} className={'scroll-button visible'} aria-label="Scroll chat to bottom">
                    &#8681;
                </button>
            )}

            <MessageInput
                onSend={send}
                minLength={minLength}
                maxLength={maxLength}
                sendButtonText={sendButtonText}
                disabled={disabled}
                minLengthErrorText={minLengthErrorText}
                maxLengthErrorText={maxLengthErrorText}
                isStreaming={isStreaming}
                onCancel={cancel}
            />
        </section>
    );
};

export const ChatWindowWithProvider = (params: Required<IChatWindowInput>) => (
    <ThemeProvider>
        <ChatWindow {...params} />
    </ThemeProvider>
);

export default ChatWindowWithProvider;
