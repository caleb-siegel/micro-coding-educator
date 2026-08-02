import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DragToOrderCardData } from '../../types/lesson';
import { ChevronUp, ChevronDown, CheckCircle2, GripVertical } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: DragToOrderCardData;
}

export const DragToOrderCard: React.FC<Props> = ({ data }) => {
  const [items, setItems] = useState(data.items);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const moveItem = (index: number, direction: 'up' | 'down') => {
    if (isSubmitted) return;
    sounds.playTap();
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    const temp = newItems[index];
    newItems[index] = newItems[targetIndex];
    newItems[targetIndex] = temp;
    setItems(newItems);
  };

  const handleCheck = () => {
    const correct = items.every((item, idx) => item.correctIndex === idx);
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
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '6px' }}>
          {data.instruction}
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>Tap arrows or drag to arrange in correct execution order:</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {items.map((item, idx) => {
          let itemStyle: React.CSSProperties = {
            padding: '12px 14px',
            borderRadius: '14px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          };

          if (isSubmitted) {
            const isItemCorrect = item.correctIndex === idx;
            if (isItemCorrect) {
              itemStyle.background = 'rgba(16, 185, 129, 0.12)';
              itemStyle.borderColor = 'rgba(16, 185, 129, 0.3)';
            } else {
              itemStyle.background = 'rgba(244, 63, 94, 0.12)';
              itemStyle.borderColor = 'rgba(244, 63, 94, 0.3)';
            }
          }

          return (
            <motion.div
              key={item.id}
              layout
              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              style={itemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GripVertical size={18} color="#64748b" />
                <span style={{ fontSize: '14px', fontWeight: 600, color: '#e2e8f0' }}>
                  {item.label}
                </span>
              </div>

              {!isSubmitted ? (
                <div style={{ display: 'flex', gap: '4px' }}>
                  <button
                    onClick={() => moveItem(idx, 'up')}
                    disabled={idx === 0}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px',
                      color: '#cbd5e1',
                      cursor: idx === 0 ? 'not-allowed' : 'pointer',
                      opacity: idx === 0 ? 0.3 : 1
                    }}
                  >
                    <ChevronUp size={16} />
                  </button>
                  <button
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    style={{
                      background: 'rgba(255, 255, 255, 0.08)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px',
                      color: '#cbd5e1',
                      cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: idx === items.length - 1 ? 0.3 : 1
                    }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              ) : (
                item.correctIndex === idx && <CheckCircle2 size={18} color="#34d399" />
              )}
            </motion.div>
          );
        })}
      </div>

      {!isSubmitted ? (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleCheck}
          className="tactile-btn tactile-btn-primary"
          style={{ marginTop: 'auto', width: '100%' }}
        >
          Validate Order
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
              background: isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
              border: `1px solid ${isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: isCorrect ? '#34d399' : '#818cf8', marginBottom: '4px' }}>
              {isCorrect ? '✨ Perfect Sequence!' : '💡 Intended Sequence:'}
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.5, color: '#cbd5e1' }}>
              {data.explanation}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
