import type { TMessage } from '../../../services/connection.interface';
import './ChatList.css';

type Props = { messages: TMessage[]; ownId?: string; showToolsCalls: boolean };
export const ChatList = ({ messages, ownId, showToolsCalls }: Props) => (
    <div className="chat-list" role="log" aria-live="polite">
        {messages.map((m: TMessage) => (
            <article
                key={m.id}
                className={`chat-msg ${m.author === ownId ? 'own' : ''} ${m.type === 'error' ? 'error' : ''} ${m.type === 'tool' ? 'tool' : ''}`}
            >
                {m.type === 'tool' && showToolsCalls ? (
                    <div className="message-content tool-call">
                        <span className="tool-icon">⚙️</span>
                        <div>
                            <div className="tool-name">
                                <strong>{m.toolName}</strong>
                            </div>
                            {m.toolParams && <pre className="tool-params">{JSON.stringify(m.toolParams, null, 2)}</pre>}
                        </div>
                    </div>
                ) : (
                    <div className="message-content">{m.text}</div>
                )}

                <address className="message-item">
                    <time itemProp="published" dateTime={new Date(m.timestamp).toISOString()}>
                        {new Date(m.timestamp).toLocaleTimeString()}
                    </time>
                    <span className="chat-msg-author">{m.author}</span>
                </address>
            </article>
        ))}
    </div>
);
