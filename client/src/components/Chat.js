import React, { useState, useEffect, useRef } from 'react';

const Chat = () => {
  const [messages, setMessages] = useState([
    { sender: 'ai', text: 'Hello! How can I help you learn bash today?' }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    if (e.key === 'Enter' && input.trim()) {
      const userMessage = { sender: 'user', text: input };
      setMessages(prevMessages => [...prevMessages, userMessage]);
      const currentInput = input;
      setInput('');

      try {
        const response = await fetch('/api/ai/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({ message: currentInput })
        });

        if (response.ok) {
          const data = await response.json();
          const aiMessage = { sender: 'ai', text: data.reply };
          setMessages(prevMessages => [...prevMessages, aiMessage]);
        } else {
          const aiMessage = { sender: 'ai', text: 'Sorry, I am having trouble connecting. Please try again later.' };
          setMessages(prevMessages => [...prevMessages, aiMessage]);
        }
      } catch (error) {
        console.error('Failed to send message:', error);
        const aiMessage = { sender: 'ai', text: 'Sorry, an error occurred. Please check the console for details.' };
        setMessages(prevMessages => [...prevMessages, aiMessage]);
      }
    }
  };

  return (
    <div style={{ border: '1px solid #ccc', padding: '10px', height: '100%', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginTop: 0, marginBottom: '10px' }}>AI Assistant</h2>
      <div style={{ flex: 1, overflowY: 'auto', marginBottom: '10px', border: '1px solid #eee', padding: '5px' }}>
        {messages.map((msg, index) => (
          <p key={index} style={{ margin: '5px 0', textAlign: msg.sender === 'user' ? 'right' : 'left' }}>
            <strong style={{ color: msg.sender === 'user' ? '#007bff' : '#28a745' }}>{msg.sender === 'user' ? 'You' : 'AI'}:</strong> {msg.text}
          </p>
        ))}
        <div ref={messagesEndRef} />
      </div>
      <input
        type="text"
        placeholder="Type your message and press Enter..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={handleSendMessage}
        style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
      />
    </div>
  );
};

export default Chat;
