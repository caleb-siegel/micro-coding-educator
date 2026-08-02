import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { TimelineCardData } from '../../types/lesson';
import { ChevronUp, ChevronDown, CheckCircle2, History } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: TimelineCardData;
}

export const TimelineCard: React.FC<Props> = ({ data }) => {
  const [events, setEvents] = useState(data.events);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const moveEvent = (index: number, direction: 'up' | 'down') => {
    if (isSubmitted) return;
    sounds.playTap();
    const newEvents = [...events];
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= newEvents.length) return;

    const temp = newEvents[index];
    newEvents[index] = newEvents[targetIdx];
    newEvents[targetIdx] = temp;
    setEvents(newEvents);
  };

  const handleValidate = () => {
    const correct = events.every((evt, idx) => evt.correctOrder === idx + 1);
    setIsCorrect(correct);
    setIsSubmitted(true);
    if (correct) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <History size={14} /> Chronological Timeline
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)' }}>
          {data.instruction}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {events.map((evt, idx) => {
          let cardStyle: React.CSSProperties = {
            padding: '12px 14px',
            borderRadius: '14px',
            background: 'var(--chip-bg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          };

          if (isSubmitted) {
            const isItemCorrect = evt.correctOrder === idx + 1;
            cardStyle.borderColor = isItemCorrect ? 'var(--badge-emerald-border)' : 'rgba(244, 63, 94, 0.4)';
            cardStyle.background = isItemCorrect ? 'var(--badge-emerald-bg)' : 'rgba(244, 63, 94, 0.12)';
          }

          return (
            <motion.div key={evt.id} layout transition={{ type: 'spring', stiffness: 400, damping: 25 }} style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    background: 'var(--badge-indigo-bg)',
                    border: '1px solid var(--badge-indigo-border)',
                    color: 'var(--badge-indigo-text)',
                    fontSize: '12px',
                    fontWeight: 800,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  {idx + 1}
                </span>

                <div>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                    {evt.title}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {evt.description}
                  </div>
                </div>
              </div>

              {!isSubmitted ? (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => moveEvent(idx, 'up')}
                    disabled={idx === 0}
                    style={{
                      background: 'var(--chip-bg-hover)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px',
                      color: 'var(--text-main)',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      opacity: idx === 0 ? 0.3 : 1
                    }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveEvent(idx, 'down')}
                    disabled={idx === events.length - 1}
                    style={{
                      background: 'var(--chip-bg-hover)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px',
                      color: 'var(--text-main)',
                      cursor: idx === events.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: idx === events.length - 1 ? 0.3 : 1
                    }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              ) : (
                evt.correctOrder === idx + 1 && <CheckCircle2 size={18} color="var(--accent-emerald)" />
              )}
            </motion.div>
          );
        })}
      </div>

      {!isSubmitted ? (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleValidate}
          className="tactile-btn tactile-btn-primary"
          style={{ marginTop: 'auto', width: '100%' }}
        >
          Check Timeline
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 'auto',
              padding: '14px',
              borderRadius: '14px',
              background: isCorrect ? 'var(--badge-emerald-bg)' : 'var(--badge-indigo-bg)',
              border: `1px solid ${isCorrect ? 'var(--badge-emerald-border)' : 'var(--badge-indigo-border)'}`
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: isCorrect ? 'var(--accent-emerald)' : 'var(--accent-primary)', marginBottom: '4px' }}>
              {isCorrect ? '✨ Perfect Milestone Order!' : '💡 Historical Context:'}
            </div>
            <div style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-main)' }}>
              {data.explanation}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
