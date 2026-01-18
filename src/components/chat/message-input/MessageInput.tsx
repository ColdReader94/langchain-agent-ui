import { useRef, useState } from 'react';
import type { IMessageInput } from '../interfaces';
import './MessageInput.css';

export const MessageInput = ({
    onSend,
    onCancel,
    disabled,
    sendButtonText,
    minLength,
    maxLength,
    minLengthErrorText,
    maxLengthErrorText,
    isStreaming,
}: IMessageInput) => {
    const textAreaRef = useRef<HTMLTextAreaElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [pristine, setPristine] = useState<boolean>(true);

    const validate = (value: string) => {
        if (value.length < minLength) return minLengthErrorText;
        if (value.length > maxLength) return maxLengthErrorText;
        return null;
    };
    const handleInput = (e: React.FormEvent<HTMLTextAreaElement>) => setError(validate(e.currentTarget.value));

    const submit = () => {
        const message = textAreaRef.current?.value.trim() ?? '';
        const validationError = validate(message);
        if (validationError) {
            setError(validationError);
            return;
        }
        setError(null);
        onSend(message);
        if (textAreaRef.current) {
            textAreaRef.current.value = '';
            textAreaRef.current.focus();
        }
        setPristine(true);
    };

    return (
        <div className="chat-input">
            <div className="chat-input-wrapper">
                <textarea
                    autoFocus
                    id="agent-input"
                    ref={textAreaRef}
                    onInput={handleInput}
                    onKeyDown={(e) => {
                        if (pristine) setPristine(false);
                        if (e.key === 'Enter' && !e.shiftKey && !isStreaming) {
                            e.preventDefault();
                            submit();
                        }
                    }}
                    aria-label="Message to agent"
                    disabled={disabled}
                    aria-invalid={!!error}
                />
                {error && (
                    <span className="error-input-message" role="alert">
                        {error}
                    </span>
                )}
            </div>
            {isStreaming ? (
                <button className="cancel-msg-btn" type="button" aria-label="stop" onClick={onCancel}>
                    &#9632;
                </button>
            ) : (
                <button className="send-msg-btn" type="button" onClick={submit} disabled={disabled || !!error || (!!minLength && pristine)}>
                    {sendButtonText}
                </button>
            )}
        </div>
    );
};
