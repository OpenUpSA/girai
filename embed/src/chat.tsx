import './chat.scss';
import { CoreMessage } from 'ai';
import { SetStateAction, useState } from 'react';

const PersonSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 25 25"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="lucide lucide-user">
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
)

const ChatSvg = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    className="lucide lucide-bot-message-square"
    fill="none"
    viewBox="0 0 25 25"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 6V2H8" />
    <path d="m8 18-4 4V8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2Z" />
    <path d="M2 12h2" />
    <path d="M9 11v2" />
    <path d="M15 11v2" />
    <path d="M20 12h2" />
  </svg>
)

export default function Chat() {
  const [waiting, setWaiting] = useState<boolean>(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<CoreMessage[]>([
    { role: 'assistant', content: 'Hello, I am GIRAI, a knowlegeable AI bot here to guide you through the progress of different countries in implementing responsible AI practices. How can I help you?' },
  ]);

  const [open, setOpen] = useState<boolean>(false);

  const toggleChat = () => {
    setOpen(!open)
  }

  const inputKeydown = async (event: { key: string }) => {
    if (event.key === 'Enter') {
      setWaiting(true);

      const userMessage: CoreMessage = { role: 'user', content: input };
      setMessages((currentMessages: CoreMessage[]) => [userMessage, ...currentMessages]);

      setInput('');

      const response = await fetch('http://localhost:3000/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: [...messages, userMessage],
        }),
      });

      const { messages: newMessages } = await response.json();

      setWaiting(false);

      for (const botMessage of newMessages) {
        await typeMessage(botMessage);
      }

    }
  };


  const typeMessage = async (message: CoreMessage) => {
    return new Promise<void>((resolve) => {
      let currentText = '';

      const contentStr = typeof message.content === 'string'
        ? message.content
        : extractTextContent(message.content);

      if (!contentStr) {
        resolve();
        return;
      }

      const characters = contentStr.split('');

      setMessages((currentMessages: CoreMessage[]) => [
        { role: 'assistant', content: '' },
        ...currentMessages
      ]);

      characters.forEach((char, index) => {
        setTimeout(() => {
          setMessages((currentMessages: CoreMessage[]) => {
            const updatedMessages = [...currentMessages];

            updatedMessages[0] = { role: 'assistant', content: currentText + char };

            return updatedMessages;
          });

          currentText += char;

          if (index === characters.length - 1) {
            resolve();
          }
        }, index * 10);
      });
    });
  };

  const extractTextContent = (content: any): string => {
    if (Array.isArray(content)) {
      return content
        .filter(part => typeof part === 'object' && 'text' in part)
        .map(part => part.text)
        .join(' ');
    }

    if (typeof content === 'object' && 'text' in content) {
      return content.text;
    }

    return '';
  };

  const inputOnchange = (event: { target: { value: SetStateAction<string>; }; }) => {
    setInput(event.target.value);
  }

  return (
    <div className={`chat${open ? ' open' : ''}`}>
      <div className="chatContainer">
        <div className="messages">
          {waiting && (
            <div key={`${'assistant'}-${99999999999}`} className={`messageContainer role-${'assistant'}`}>
              <div className="role"><ChatSvg /></div>
              <div className="message pulsating-text">
                Thinking<span className="">...</span>
              </div>
            </div>
          )}
          {messages.map((message, index) => (
            <div key={`${message.role}-${index}`} className={`messageContainer role-${message.role}`}>
              <div className="role">{message.role === 'assistant' ? <ChatSvg /> : <PersonSvg />}</div>
              <div className="message">
                {typeof message.content === 'string'
                  ? message.content
                  : message.content
                    .filter(part => part.type === 'text')
                    .map((part, partIndex) => (
                      <div key={partIndex}>{part.text}</div>
                    ))}
              </div>
            </div>
          ))}
        </div>
        <div className="inputContainer">
          <textarea
            autoFocus={true}
            className="input"
            value={input}
            onChange={inputOnchange}
            onKeyUp={inputKeydown}
            placeholder="Ask your question here..."
          >
            {input}
          </textarea>
        </div>
      </div>

      <div className="activator" onClick={toggleChat}>
        <ChatSvg />
      </div>
    </div>
  );
}