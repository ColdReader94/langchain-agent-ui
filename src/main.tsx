import { createRoot } from 'react-dom/client';
import App from './App';
import type { IChatWindowInput } from './components/chat/interfaces';

let root: ReturnType<typeof createRoot> | null = null;

function mountAgentUiApp(container: HTMLElement, config: IChatWindowInput = { url: 'wss://localhost:8080' }) {
    root = createRoot(container);
    root.render(
        // <StrictMode>
        <App config={config} />,
        // </StrictMode>,
    );
}
function unmountAgentUiApp() {
    if (root) {
        root.unmount();
        root = null;
    }
}

declare global {
    interface Window {
        mountAgentUiApp: typeof mountAgentUiApp;
        unmountAgentUiApp: typeof unmountAgentUiApp;
    }
}
window.mountAgentUiApp = mountAgentUiApp;
window.unmountAgentUiApp = unmountAgentUiApp;

if (import.meta.env.DEV) {
    const container = document.getElementById('agent-chat-standalone');
    if (container) {
        mountAgentUiApp(container, {
            greetingsText: 'Hi',
            showToolsCalls: true,
            url: 'wss://localhost:3002',
        });
    }
}
