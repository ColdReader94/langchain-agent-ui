# Langchain Agent UI Chat Microfrontend (Beta)

A dynamic lightweight **UI chat app** built with **React + TypeScript + Vite**.  
It can be mounted/unmounted inside any JavaScript project, integrated into **any framework** (React, Vue, Angular, Svelte, etc.), used with **vanilla JS**, or run as a **standalone application**.  

The component communicates via **WebSocket connection** to a backend server and is designed to work exclusively with the **response format of a LangChain agent**.  
It also supports **tool call tracking**, **accessibility features (ARIA, focus management, semantic roles)**, and **theming** for flexible UI customization.  

You can use it during the **development of your own agents** to simplify testing, or as a **lightweight ready-made chat solution** for connecting to an existing agent.

---

## 🚀 Getting Started

### Development Mode
Run locally with:

    npm install
    npm run dev

This starts the Vite dev server.  
By default, the chat window connects to:

    wss://localhost:3002

---

### Production Build
Build and preview for production:

    npm run build
    npm run preview

- `npm run build` → Compiles TypeScript and bundles with Vite  
- `npm run preview` → Serves the production build locally  

Default production WebSocket URL:

    wss://localhost:8080

---

## 🛠 Scripts

- `npm run dev` → Start development server  
- `npm run build` → Build for production  
- `npm run preview` → Preview production build  
- `npm run lint` → Run ESLint  
- `npm run lint:fix` → Fix lint issues  
- `npm run format:check` → Check formatting with Prettier  
- `npm run format:write` → Format code with Prettier  

---

## 📦 Usage in Your Project

You can mount/unmount the chat window anywhere:

### Mounting

    // Mount the chat window
    window.mountAgentUiApp(containerElement, {
      url: 'wss://your-server:8080',
      showToolsCalls: true,
      chatName: 'Support Chat',
      ownId: 'user123',
      sendButtonText: 'Send Message',
      minLength: 5,
      maxLength: 5000,
      themeSwitcherName: 'Dark theme:',
    });

### Unmounting

    // Unmount the chat window
    window.unmountAgentUiApp();

---

## ⚙️ Configuration Options

| Parameter            | Type      | Default Value                  | Description                                                                 |
|----------------------|-----------|--------------------------------|-----------------------------------------------------------------------------|
| `url`                | `string`  | `wss://localhost:8080`         | WebSocket server URL                                                        |
| `showToolsCalls`     | `boolean` | `false`                        | Show tool calls in the chat                                                 |
| `disabled`           | `boolean` | `false`                        | Disable input and sending                                                   |
| `sendButtonText`     | `string`  | `"Send"`                       | Text for the send button                                                    |
| `maxLength`          | `number`  | `10000`                        | Maximum allowed message length                                              |
| `minLength`          | `number`  | `3`                            | Minimum required message length                                             |
| `minLengthErrorText` | `string`  | `"Min characters allowed: 3"`  | Error message when below minimum length                                     |
| `maxLengthErrorText` | `string`  | `"Max characters allowed: 10000"` | Error message when exceeding maximum length                              |
| `chatName`           | `string`  | `""`                           | Optional chat name/title                                                    |
| `ownId`              | `string`  | `"me"`                         | Identifier for the current user                                             |
| `themeSwitcherName`  | `string`  | `"Light theme:"`               | Label for theme switcher                                                    |

---

## 🔗 Integration Options

You can use this chat window in multiple ways:

1. Inside any JS framework (React, Vue, Angular, Svelte, etc.)  
2. With vanilla JavaScript  
3. As a standalone app  

---


## 📖 Example: React Integration
You can dynamically mount/unmount the chat window inside your component.  
Make sure to **import the built bundle** (`agent-chat-ui.js`) either:

- **Locally** from your build output (e.g. `./dist/agent-chat-ui.js`)  
- Or **remotely** from a CDN / GitHub Pages (e.g. `https://coldreader94.github.io/langchain-agent-ui/agent-chat-ui.js`)  

### Example Code

```tsx
import { useEffect, useRef } from 'react';

export default function ChatWrapper({ isAgentChatEnabled }: { isAgentChatEnabled: boolean }) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    try {
      if (isAgentChatEnabled) {
        (async () => {
          // Import the ready-made bundle (local or remote)
          await import('./agent-chat-ui.js'); 
          // Or: await import('https://coldreader94.github.io/langchain-agent-ui/agent-chat-ui.js');

          window?.mountAgentUiApp(containerRef.current, {
            url: 'wss://my-server:8000',
            sendButtonText: 'Send message',
            minLengthErrorText: 'Minimal length: 3',
            maxLengthErrorText: 'Max length: 10000',
          });
        })();
      } else {
        window?.unmountAgentUiApp?.();
      }
    } catch (e) {
      console.error(e);
    }
  }, [isAgentChatEnabled]);

  return <div ref={containerRef} style={{ height: '100%', width: '100%' }} />;
}

