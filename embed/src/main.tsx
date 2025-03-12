import { createRoot } from 'react-dom/client';
import Chat from './chat';

(() => {
  const initializeChat = (): void => {
    const chatContainer = document.createElement("div");
    chatContainer.id = "giraichat";
    document.body.appendChild(chatContainer);
    createRoot(document.getElementById(chatContainer.id)!).render(
      <Chat />,
    )
  };
  initializeChat();
})();