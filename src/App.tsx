import ChatWindowWithProvider from './components/chat/chat-window/ChatWindow';

import './App.css';
import type { IChatWindowInput } from './components/chat/interfaces';

function App({ config }: { config: IChatWindowInput }) {
    const {
        disabled = false,
        maxLength = 10000,
        minLength = 3,
        minLengthErrorText = `Min characters allowed: ${minLength}`,
        maxLengthErrorText = `Max characters allowed: ${maxLength}`,
        sendButtonText = 'Send',
        url = 'wss://localhost:8080',
        chatName = '',
        ownId = 'me',
        themeSwitcherName = 'Light theme:',
        showToolsCalls = false,
    } = config;
    return (
        <ChatWindowWithProvider
            showToolsCalls={showToolsCalls}
            url={url}
            disabled={disabled}
            sendButtonText={sendButtonText}
            maxLength={maxLength}
            minLength={minLength}
            chatName={chatName}
            ownId={ownId}
            minLengthErrorText={minLengthErrorText}
            maxLengthErrorText={maxLengthErrorText}
            themeSwitcherName={themeSwitcherName}
        />
    );
}

export default App;
