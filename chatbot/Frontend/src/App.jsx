import { useState, useEffect, useRef } from 'react';
import './chatbot.css';

const defaultTitle = "New Chat";

function getInitialChats() {
  const saved = JSON.parse(localStorage.getItem('allChats') || 'null');
  if (saved && Array.isArray(saved) && saved.length > 0) return saved;
  return [{
    id: Date.now(),
    title: defaultTitle,
    messages: []
  }];
}

export default function App() {
  const [allChats, setAllChats] = useState(getInitialChats);
  const [selectedId, setSelectedId] = useState(allChats[0].id);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('allChats', JSON.stringify(allChats));
  }, [allChats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [allChats, selectedId, loading]);

  const currentChat = allChats.find(c => c.id === selectedId);

  function handleNewChat() {
    const newChat = {
      id: Date.now(),
      title: defaultTitle,
      messages: []
    };
    setAllChats([newChat, ...allChats]);
    setSelectedId(newChat.id);
  }

  function handleSelectChat(id) {
    setSelectedId(id);
  }

  function handleClearChat() {
    setAllChats(allChats.map(chat =>
      chat.id === selectedId
        ? { ...chat, messages: [] }
        : chat
    ));
  }

  function updateChatMessages(newMessages) {
    setAllChats(allChats.map(chat =>
      chat.id === selectedId
        ? { ...chat, messages: newMessages }
        : chat
    ));
  }

  const sendMessage = async () => {
    if (!input.trim()) return;
    setLoading(true);
    const userMsg = { role: 'user', content: input };
    const updatedMessages = [...currentChat.messages, userMsg];
    updateChatMessages(updatedMessages);

    try {
      const res = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: input, role: 'user', conversation_id: String(selectedId) }),
      });
      const data = await res.json();
      const botMsg = { role: 'assistant', content: data.response };
      updateChatMessages([...updatedMessages, botMsg]);
      if (currentChat.title === defaultTitle && input.trim().length > 0) {
        setAllChats(allChats.map(chat =>
          chat.id === selectedId
            ? { ...chat, title: input.slice(0, 20) + (input.length > 20 ? "..." : "") }
            : chat
        ));
      }
    } catch (err) {
      updateChatMessages([...updatedMessages, { role: 'assistant', content: 'Error contacting backend.' }]);
    }
    setInput('');
    setLoading(false);
  };

  return (
    <div className="app-layout">
      <div className="sidebar">
        <div className="sidebar-title">Chats</div>
        <button className="new-chat-btn" onClick={handleNewChat}>+ New Chat</button>
        <div className="chat-list">
          {allChats.map(chat => (
            <button
              key={chat.id}
              className={chat.id === selectedId ? "selected" : ""}
              onClick={() => handleSelectChat(chat.id)}
            >
              {chat.title}
            </button>
          ))}
        </div>
      </div>
      <div className="fullscreen-chatbot">
        <div className="chat-window">
          <div className="chat-header">
            My Chatbot
            <button className="clear-btn" onClick={handleClearChat}>Clear</button>
          </div>
          <div className="messages">
            {currentChat.messages.map((msg, idx) => (
              <div
                key={idx}
                className={`message-row ${msg.role}`}
              >
                <div className={`message ${msg.role}`}>
                  <b>{msg.role === 'user' ? 'You' : 'Bot'}:</b> {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="message-row assistant">
                <div className="message assistant">Bot is typing...</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          <div className="input-row">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              disabled={loading}
            />
            <button onClick={sendMessage} disabled={loading || !input.trim()}>Send</button>
          </div>
        </div>
      </div>
    </div>
  );
}
