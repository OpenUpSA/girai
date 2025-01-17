import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.scss';
import App from './App.tsx';

(() => {
  console.log("Chat module loaded!");

  // Define your chat initialization logic
  const initializeChat = (): void => {
    console.log("Chat initialized!");
    const chatContainer = document.createElement("div");
    chatContainer.id = "giraichat";
    document.body.appendChild(chatContainer);
    createRoot(document.getElementById(chatContainer.id)!).render(
      <StrictMode>
        <App />
      </StrictMode>,
    )
  };

  // Automatically initialize the chat module
  initializeChat();
})();