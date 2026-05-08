import { useMemo, useState } from 'react';

const SYSTEM_PROMPT = 'You are an expert physics tutor. Answer questions clearly about mechanics, thermodynamics, waves, optics, electromagnetism, and modern physics. Use simple language with examples. When relevant, relate answers to simulations.';

const CHIP_LABELS = ['Explain this simulation', 'What is KE?', 'Give me a formula'];

export default function Chatbot({ topic = 'general physics', topicName = 'General Physics', subtopicName = '', view = 'lesson' }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hi! I'm NOVA 💬 Ask me about this physics topic or the current simulation." }
  ]);
  const [loading, setLoading] = useState(false);

  const context = useMemo(() => ({
    topic,
    topicName,
    subtopicName,
    view,
    hint: `The student is currently viewing ${topicName}${subtopicName ? ` / ${subtopicName}` : ''} in SimuVerse. Bias examples toward this page when helpful.`
  }), [topic, topicName, subtopicName, view]);

  async function sendMessage(text = input) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const nextMessages = [...messages, { role: 'user', content: trimmed }].slice(-10);
    setMessages(nextMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ systemPrompt: SYSTEM_PROMPT, context, messages: nextMessages })
      });
      const data = await response.json();
      const reply = response.ok
        ? data.reply
        : data.fallback || "NOVA can't connect right now. Please try again.";
      setMessages([...nextMessages, { role: 'assistant', content: reply }].slice(-10));
    } catch (error) {
      setMessages([...nextMessages, { role: 'assistant', content: 'NOVA is offline for a moment. Please check your connection and try again.' }].slice(-10));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="chat-panel">
      <div className={`chat-window ${open ? 'open' : ''}`}>
        <div className="chat-header">
          <div className="bot-avatar">💬</div>
          <div className="bot-info">
            <div className="name">NOVA — Physics AI</div>
            <div className="status"><span className="status-dot" /> {topicName}</div>
          </div>
          <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chatbot">✕</button>
        </div>

        <div className="chat-messages">
          {messages.map((message, index) => (
            <div className={`msg ${message.role === 'user' ? 'user' : 'bot'}`} key={`${message.role}-${index}`}>
              {message.content}
            </div>
          ))}
          {loading && <div className="msg bot typing">NOVA is thinking…</div>}
        </div>

        <div className="chat-chips">
          {CHIP_LABELS.map(label => <button type="button" key={label} onClick={() => sendMessage(label)}>{label}</button>)}
        </div>

        <div className="chat-input-area">
          <textarea
            className="chat-input"
            value={input}
            onChange={event => setInput(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter' && !event.shiftKey) {
                event.preventDefault();
                sendMessage();
              }
            }}
            placeholder="Ask NOVA about physics..."
            rows={1}
          />
          <button className="btn-send" onClick={() => sendMessage()} disabled={loading}>↑</button>
        </div>
      </div>

      <button className="chat-toggle" onClick={() => setOpen(!open)} aria-label="Open physics chatbot">
        💬
        <div className="chat-badge">AI</div>
      </button>
    </div>
  );
}
