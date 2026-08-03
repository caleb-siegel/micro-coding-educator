import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Bot, User, Sparkles, AlertCircle, RefreshCw, HelpCircle } from 'lucide-react';
import { askCardChat, type ChatMessage } from '../services/api';
import type { LessonCard } from '../types/lesson';
import { sounds } from '../utils/audio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  card: LessonCard;
  lessonTopic: string;
  difficulty: string;
}

export const CardChatModal: React.FC<Props> = ({
  isOpen,
  onClose,
  card,
  lessonTopic,
  difficulty,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, error]);

  // Reset messages when active card changes
  useEffect(() => {
    setMessages([]);
    setError(null);
  }, [card.id]);

  if (!isOpen) return null;

  const handleSend = async (promptToSend?: string) => {
    const text = (promptToSend || input).trim();
    if (!text || isLoading) return;

    sounds.playTap();
    const newMessages: ChatMessage[] = [...messages, { role: 'user', content: text }];
    setMessages(newMessages);
    if (!promptToSend) setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const reply = await askCardChat(
        lessonTopic,
        difficulty,
        card,
        newMessages.slice(0, -1), // previous history
        text
      );
      setMessages((prev) => [...prev, { role: 'assistant', content: reply }]);
      sounds.playSuccess();
    } catch (err: any) {
      console.error('[CardChatModal] Chat error:', err);
      setError(err.message || 'Failed to get a response from AI.');
      sounds.playError();
    } finally {
      setIsLoading(false);
    }
  };

  const getCardSummaryPill = () => {
    switch (card.type) {
      case 'multiple_choice':
        return `Question: ${(card as any).question || 'Multiple Choice'}`;
      case 'spot_the_mistake':
        return `Spot the Mistake: ${(card as any).instruction || 'Code/Diagram Review'}`;
      case 'choose_the_tradeoff':
        return `Trade-off Scenario: ${(card as any).scenario || 'Architecture Choice'}`;
      case 'build_the_system':
        return `Build System: ${(card as any).task || 'System Pipeline'}`;
      case 'predict_what_happens':
        return `Prediction: ${(card as any).scenario || 'System Metric Spike'}`;
      case 'before_vs_after':
        return `Topology: ${(card as any).question || 'Before vs After'}`;
      case 'guess_the_metric':
        return `Metric Spikes: ${(card as any).question || card.title || 'Telemetry Analysis'}`;
      case 'timeline':
        return `Timeline: ${(card as any).title || 'Event Sequence'}`;
      case 'debug_session':
        return `Debug Bug: ${(card as any).bugTitle || 'Stack Trace Analysis'}`;
      case 'hook':
        return `Overview: ${(card as any).headline || 'Concept Hook'}`;
      default:
        return card.title || `Card: ${card.type}`;
    }
  };

  const quickPrompts = [
    { label: '💡 Explain simply (ELI5)', prompt: 'Can you explain this question and the core concept in simple, plain terms with an intuitive analogy?' },
    { label: '🔍 Why is the correct answer right?', prompt: 'Why is the correct answer right, and why are the alternatives incorrect or non-optimal?' },
    { label: '⚡ Real-world production pitfalls', prompt: 'What are the main real-world production pitfalls or outages caused by misunderstanding this concept?' },
    { label: '🛠️ Code / Architecture Example', prompt: 'Can you show a concrete code snippet or system design example demonstrating this concept?' },
  ];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.65)',
          backdropFilter: 'blur(8px)',
          zIndex: 999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'flex-end',
          padding: '0'
        }}
      >
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 26, stiffness: 280 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            width: '100%',
            maxWidth: '640px',
            maxHeight: '85vh',
            height: '750px',
            background: 'var(--bg-card, #121826)',
            borderTopLeftRadius: '24px',
            borderTopRightRadius: '24px',
            border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
            boxShadow: '0 -10px 40px rgba(0,0,0,0.5)',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            color: 'var(--text-main, #fff)'
          }}
        >
          {/* Top Bar Header */}
          <div
            style={{
              padding: '16px 20px',
              borderBottom: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'var(--card-header-bg, rgba(255,255,255,0.03))'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '10px',
                  background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  boxShadow: '0 4px 12px rgba(99, 102, 241, 0.35)'
                }}
              >
                <Bot size={20} />
              </div>
              <div>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  AI Question Assistant
                  <Sparkles size={14} style={{ color: '#a855f7' }} />
                </h3>
                <p style={{ fontSize: '11px', color: 'var(--text-muted, #94a3b8)', margin: 0, marginTop: '2px' }}>
                  Ask questions or request deeper explanations about this card
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close AI Chat"
              style={{
                background: 'var(--chip-bg, rgba(255,255,255,0.08))',
                border: 'none',
                borderRadius: '50%',
                width: '32px',
                height: '32px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--text-muted, #94a3b8)',
                cursor: 'pointer'
              }}
            >
              <X size={18} />
            </button>
          </div>

          {/* Active Card Context Pill */}
          <div
            style={{
              padding: '10px 20px',
              background: 'rgba(99, 102, 241, 0.08)',
              borderBottom: '1px solid rgba(99, 102, 241, 0.15)',
              fontSize: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              color: 'var(--text-main, #e2e8f0)'
            }}
          >
            <HelpCircle size={14} style={{ color: '#818cf8', flexShrink: 0 }} />
            <span style={{ fontWeight: 600, color: '#818cf8', whiteSpace: 'nowrap' }}>Active Context:</span>
            <span
              style={{
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                fontWeight: 500,
                color: 'var(--text-muted, #cbd5e1)'
              }}
            >
              {getCardSummaryPill()}
            </span>
          </div>

          {/* Messages Container */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px'
            }}
          >
            {messages.length === 0 && !isLoading && (
              <div
                style={{
                  margin: 'auto 0',
                  textAlign: 'center',
                  padding: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '12px'
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '16px',
                    background: 'rgba(99, 102, 241, 0.1)',
                    border: '1px solid rgba(99, 102, 241, 0.2)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#818cf8'
                  }}
                >
                  <Sparkles size={24} />
                </div>
                <h4 style={{ fontSize: '15px', fontWeight: 600, margin: 0 }}>
                  What would you like to explore about this question?
                </h4>
                <p style={{ fontSize: '12px', color: 'var(--text-muted, #94a3b8)', maxWidth: '380px', margin: 0 }}>
                  Tap a quick prompt below or type your own question to get clear, context-aware AI explanations.
                </p>

                {/* Quick Prompts Grid */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '1fr 1fr',
                    gap: '10px',
                    width: '100%',
                    marginTop: '12px'
                  }}
                >
                  {quickPrompts.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSend(item.prompt)}
                      style={{
                        padding: '10px 12px',
                        borderRadius: '12px',
                        background: 'var(--chip-bg, rgba(255,255,255,0.04))',
                        border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                        color: 'var(--text-main, #f1f5f9)',
                        fontSize: '12px',
                        fontWeight: 500,
                        textAlign: 'left',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      <span>{item.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Message History */}
            {messages.map((msg, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{
                  display: 'flex',
                  gap: '10px',
                  justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
                }}
              >
                {msg.role === 'assistant' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#fff',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <Bot size={16} />
                  </div>
                )}

                <div
                  style={{
                    maxWidth: '82%',
                    padding: '12px 16px',
                    borderRadius: msg.role === 'user' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                    background:
                      msg.role === 'user'
                        ? 'linear-gradient(135deg, #4f46e5 0%, #6366f1 100%)'
                        : 'var(--chip-bg, rgba(255,255,255,0.06))',
                    border:
                      msg.role === 'user'
                        ? 'none'
                        : '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                    color: msg.role === 'user' ? '#ffffff' : 'var(--text-main, #f8fafc)',
                    fontSize: '13px',
                    lineHeight: '1.55',
                    whiteSpace: 'pre-wrap',
                    boxShadow: msg.role === 'user' ? '0 4px 14px rgba(79, 70, 229, 0.3)' : 'none'
                  }}
                >
                  {msg.content}
                </div>

                {msg.role === 'user' && (
                  <div
                    style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '8px',
                      background: 'var(--chip-bg, rgba(255,255,255,0.12))',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: 'var(--text-main, #fff)',
                      flexShrink: 0,
                      marginTop: '2px'
                    }}
                  >
                    <User size={16} />
                  </div>
                )}
              </motion.div>
            ))}

            {/* Loading Indicator */}
            {isLoading && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                style={{ display: 'flex', gap: '10px', alignItems: 'center' }}
              >
                <div
                  style={{
                    width: '28px',
                    height: '28px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #6366f1, #a855f7)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#fff'
                  }}
                >
                  <Bot size={16} />
                </div>
                <div
                  style={{
                    padding: '10px 16px',
                    borderRadius: '18px 18px 18px 4px',
                    background: 'var(--chip-bg, rgba(255,255,255,0.06))',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                    fontSize: '13px',
                    color: 'var(--text-muted, #94a3b8)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  <RefreshCw size={14} style={{ animation: 'spin 1.5s linear infinite' }} />
                  Analyzing card context & generating answer...
                </div>
              </motion.div>
            )}

            {/* Explicit Error Display Banner */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                style={{
                  padding: '12px 16px',
                  borderRadius: '12px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  color: '#f87171',
                  fontSize: '12px',
                  lineHeight: '1.4',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '10px',
                  marginTop: '8px'
                }}
              >
                <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                <div style={{ flex: 1 }}>
                  <strong style={{ display: 'block', fontWeight: 600, marginBottom: '2px' }}>
                    AI Service Error
                  </strong>
                  {error}
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Horizontal Scroll (When conversation active) */}
          {messages.length > 0 && !isLoading && (
            <div
              style={{
                padding: '8px 16px',
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.06))',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {quickPrompts.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSend(item.prompt)}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '6px 10px',
                    borderRadius: '8px',
                    background: 'var(--chip-bg, rgba(255,255,255,0.05))',
                    border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
                    color: 'var(--text-muted, #cbd5e1)',
                    fontSize: '11px',
                    cursor: 'pointer',
                    flexShrink: 0
                  }}
                >
                  {item.label}
                </button>
              ))}
            </div>
          )}

          {/* Bottom Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            style={{
              padding: '14px 20px',
              borderTop: '1px solid var(--border-subtle, rgba(255,255,255,0.08))',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              background: 'var(--card-header-bg, rgba(255,255,255,0.02))'
            }}
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about this topic or card..."
              disabled={isLoading}
              style={{
                flex: 1,
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--input-bg, rgba(255,255,255,0.05))',
                border: '1px solid var(--border-subtle, rgba(255,255,255,0.12))',
                color: 'var(--text-main, #fff)',
                fontSize: '13px',
                outline: 'none',
                transition: 'border 0.2s ease'
              }}
            />

            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '12px',
                background: input.trim() && !isLoading
                  ? 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)'
                  : 'var(--chip-bg, rgba(255,255,255,0.08))',
                border: 'none',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: input.trim() && !isLoading ? 'pointer' : 'not-allowed',
                opacity: input.trim() && !isLoading ? 1 : 0.4,
                boxShadow: input.trim() && !isLoading ? '0 4px 12px rgba(99, 102, 241, 0.35)' : 'none'
              }}
            >
              <Send size={18} />
            </button>
          </form>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};
