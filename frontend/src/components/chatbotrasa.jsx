// ChatWidget.jsx
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

// 🎨 Paleta de color naranja + moderno
const primaryColor = '#ff7a00';
const secondaryColor = '#fff1e0';
const userBubble = '#ffe0b3';
const botBubble = '#fff';

const ChatContainer = styled.div`
  position: fixed;
  bottom: 100px;
  right: 40px;
  width: 380px;
  max-height: 550px;
  background: white;
  box-shadow: 0 0 16px rgba(0, 0, 0, 0.25);
  border-radius: 16px;
  overflow: hidden;
  display: ${props => (props.open ? 'flex' : 'none')};
  flex-direction: column;
  z-index: 9999;
  font-family: 'Segoe UI', sans-serif;
`;

const ChatHeader = styled.div`
  background: ${primaryColor};
  color: white;
  padding: 16px;
  font-weight: bold;
  font-size: 18px;
`;

const ChatMessages = styled.div`
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  font-size: 15px;
  background-color: ${secondaryColor};
`;

const ChatInputContainer = styled.form`
  display: flex;
  padding: 12px;
  border-top: 1px solid #ccc;
  background: white;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fdfdfd;
  margin-right: 8px;
  font-size: 14px;
`;

const SendButton = styled.button`
  background: ${primaryColor};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 14px;
  cursor: pointer;

  &:hover {
    background: #e86c00;
  }
`;

const ToggleButton = styled.button`
  position: fixed;
  bottom: 30px;
  right: 40px;
  background: ${primaryColor};
  color: white;
  border: none;
  border-radius: 50%;
  width: 64px;
  height: 64px;
  font-size: 28px;
  cursor: pointer;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  z-index: 9999;

  &:hover {
    background: #e86c00;
  }
`;

const Message = styled.div`
  margin-bottom: 10px;
  text-align: ${props => (props.$fromUser ? 'right' : 'left')};

  span {
    display: inline-block;
    background: ${props => (props.$fromUser ? userBubble : botBubble)};
    padding: 10px 14px;
    border-radius: 18px;
    max-width: 80%;
    font-size: 14px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  }
`;

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { text: '¡Hola! Soy tu asistente virtual OncoFeliz.', fromUser: false }
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = { text: input, fromUser: true };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:5005/webhooks/rest/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: 'usuario',
          message: input
        })
      });

      const data = await response.json();
      const botResponses = data.map(msg => ({ text: msg.text, fromUser: false }));
      setMessages(prev => [...prev, ...botResponses]);
    } catch (error) {
      setMessages(prev => [...prev, { text: 'Error al conectar con el servidor.', fromUser: false }]);
    }
  };

  return (
    <>
      <ChatContainer open={open}>
        <ChatHeader>🤖 OncoFeliz</ChatHeader>
        <ChatMessages>
          {messages.map((msg, i) => (
            <Message key={i} $fromUser={msg.fromUser}>
              <span>{msg.text}</span>
            </Message>
          ))}
          <div ref={messagesEndRef} />
        </ChatMessages>
        <ChatInputContainer onSubmit={handleSend}>
          <ChatInput
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu mensaje..."
          />
          <SendButton type="submit">Enviar</SendButton>
        </ChatInputContainer>
      </ChatContainer>

      <ToggleButton onClick={() => setOpen(!open)}>
        {open ? '✖' : '💬'}
      </ToggleButton>
    </>
  );
};

export default ChatWidget;
