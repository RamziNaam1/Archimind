'use client'

import { useState, useRef, useEffect } from 'react'

const UML_TYPES = [
  { value: 'USE_CASE',     label: 'Use Case Diagram' },
  { value: 'CLASS',        label: 'Class Diagram' },
  { value: 'SEQUENCE',     label: 'Sequence Diagram' },
  { value: 'ACTIVITY',     label: 'Activity Diagram' },
  { value: 'ER',           label: 'Entity Relationship' },
]

const INITIAL_MESSAGES = [
  {
    id: 1,
    role: 'ai',
    text: 'Ready to design. Tell me about your system architecture or specific classes you need.',
  },
]

export default function ChatPanel({ onGenerate, diagramType, onDiagramTypeChange, projectId, projectName, currentCode }) {
  const [messages, setMessages] = useState(INITIAL_MESSAGES)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
  localStorage.setItem(`chat_${projectId}`, JSON.stringify(messages));
}, [messages, projectId]);

// Load messages from localStorage on mount
useEffect(() => {
  const saved = localStorage.getItem(`chat_${projectId}`);
  if (saved) {
    setMessages(JSON.parse(saved));
  }
}, [projectId]);

  const handleGenerate = async (inputOverride) => {
    const textToProcess = typeof inputOverride === 'string' ? inputOverride : prompt;
    
    if (!textToProcess.trim()) return;

    // 1. Ajouter immédiatement le message de l'utilisateur au chat
    const userMessage = { id: Date.now(), role: 'user', text: textToProcess };
    setMessages((prev) => [...prev, userMessage]);

    setLoading(true);
    
    try {
      const response = await fetch('/api/uml/generate', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          // 2. Envoyer le code actuel pour que l'IA garde le contexte
          text: `Voici le code actuel: ${currentCode}. Modification demandée: ${textToProcess}`,
          type: diagramType || 'CLASS',
          diagramId: projectId,
          name: projectName || 'Untitled Diagram'
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || "Erreur lors de la génération");
      }

      const data = await response.json();
      const rawCode = data.generatedCode;

      if (rawCode) {
        let cleanCode = rawCode.replace(/\u00A0/g, ' ').replace(/\\n/g, '\n');
        const finalCode = cleanCode.includes('```') 
          ? cleanCode.split('```')[1]?.replace(/^mermaid/, '').trim() 
          : cleanCode.trim();

        onGenerate(finalCode);
        setPrompt(''); 
        // 3. Ajouter la confirmation de l'IA
        setMessages((prev) => [
          ...prev,
          { id: Date.now(), role: 'ai', text: `Blueprint updated successfully.` },
        ]);
      }
    } catch (error) {
      console.error("Détail de l'erreur:", error);
      alert("Erreur : " + error.message); 
    } finally {
      setLoading(false); 
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        handleGenerate();
    }
  };

  return (
    <section className="chat-panel">
      <div className="chat-panel-header">
        <span className="chat-panel-title">AI Architect</span>
        <span className="chat-panel-status" style={{ background: loading ? '#eab308' : '#22c55e' }} />
      </div>

      <div className="chat-messages">
        {messages.map((msg) => (
          <div key={msg.id} className={`chat-msg ${msg.role}`}>
            <span className="chat-msg-label">
              {msg.role === 'ai' ? 'AI_SYSTEM' : 'USER_CMD'}
            </span>
            <div className="chat-msg-bubble">{msg.text}</div>
          </div>
        ))}
        {loading && (
          <div className="chat-msg ai">
            <span className="chat-msg-label">AI_SYSTEM</span>
            <div className="chat-msg-bubble" style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
              <span>●</span><span>●</span><span>●</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <select
          className="chat-select"
          value={diagramType}
          onChange={(e) => onDiagramTypeChange(e.target.value)}
          disabled={loading}
        >
          {UML_TYPES.map((t) => (
            <option key={t.value} value={t.value}>{t.label}</option>
          ))}
        </select>

        <textarea
          className="chat-textarea"
          placeholder="Describe modification... (Ctrl+Enter to generate)"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={loading}
        />

        <button
          className="chat-generate-btn"
          onClick={() => handleGenerate()}
          disabled={loading || !prompt.trim()}
        >
          <span className="material-symbols-outlined" style={{ fontSize: 20 }}>magic_button</span>
          <span>{loading ? 'Generating...' : 'Generate'}</span>
        </button>
      </div>
    </section>
  )
}