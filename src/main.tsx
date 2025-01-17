import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './App.tsx';

(() => {
  const initializeChat = (): void => {
    const chatContainer = document.createElement("div");
    chatContainer.id = "giraichat";
    document.body.appendChild(chatContainer);
    createRoot(document.getElementById(chatContainer.id)!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  };
  initializeChat();
})();