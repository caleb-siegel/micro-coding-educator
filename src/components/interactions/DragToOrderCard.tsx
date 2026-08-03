import React, { useState } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import type { DragToOrderCardData } from '../../types/lesson';
import { ChevronUp, ChevronDown, CheckCircle2, GripVertical } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: DragToOrderCardData;
}

export const DragToOrderCard: React.FC<Props> = ({ data }) => {
  const [items, setItems] = useState(() => {
    const orig = data.items || [];
    if (orig.length <= 1) return [...orig];
    let shuffled = [...orig];
    let attempts = 0;
    do {
      shuffled = [...orig].sort(() => Math.random() - 0.5);
      attempts++;
    } while (
      attempts < 10 &&
      shuffled.every((item, idx) => item.correctIndex === idx)
    );
    return shuffled;
  });
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

  const handleReorder = (newItems: typeof items) => {
    if (isSubmitted) return;
    sounds.playTap();
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
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
          {data.instruction}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Drag cards or tap arrows to arrange in correct execution order:</p>
      </div>

      <Reorder.Group
        axis="y"
        values={items}
        onReorder={handleReorder}
        style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: 0, margin: 0, listStyle: 'none' }}
      >
        {items.map((item, idx) => {
          let itemStyle: React.CSSProperties = {
            padding: '12px 14px',
            borderRadius: '14px',
            background: 'var(--chip-bg)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px',
            cursor: !isSubmitted ? 'grab' : 'default',
            touchAction: 'none',
            userSelect: 'none'
          };

          if (isSubmitted) {
            const isItemCorrect = item.correctIndex === idx;
            if (isItemCorrect) {
              itemStyle.background = 'var(--badge-emerald-bg)';
              itemStyle.borderColor = 'var(--badge-emerald-border)';
            } else {
              itemStyle.background = 'rgba(244, 63, 94, 0.15)';
              itemStyle.borderColor = 'rgba(244, 63, 94, 0.4)';
            }
          }

          return (
            <Reorder.Item
              key={item.id}
              value={item}
              dragListener={!isSubmitted}
              whileDrag={{ scale: 1.02, boxShadow: '0 8px 24px rgba(0, 0, 0, 0.4)', zIndex: 20 }}
              style={itemStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <GripVertical size={18} color="var(--text-dim)" style={{ flexShrink: 0 }} />
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
                  {item.label}
                </span>
              </div>

              {!isSubmitted ? (
                <div style={{ display: 'flex', gap: '4px' }} onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => moveItem(idx, 'up')}
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
                    onClick={() => moveItem(idx, 'down')}
                    disabled={idx === items.length - 1}
                    style={{
                      background: 'var(--chip-bg-hover)',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '4px',
                      color: 'var(--text-main)',
                      cursor: idx === items.length - 1 ? 'not-allowed' : 'pointer',
                      opacity: idx === items.length - 1 ? 0.3 : 1
                    }}
                  >
                    <ChevronDown size={16} />
                  </button>
                </div>
              ) : (
                item.correctIndex === idx && <CheckCircle2 size={18} color="var(--accent-emerald)" />
              )}
            </Reorder.Item>
          );
        })}
      </Reorder.Group>

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
              background: isCorrect ? 'var(--badge-emerald-bg)' : 'var(--badge-indigo-bg)',
              border: `1px solid ${isCorrect ? 'var(--badge-emerald-border)' : 'var(--badge-indigo-border)'}`
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: isCorrect ? 'var(--accent-emerald)' : 'var(--accent-primary)', marginBottom: '4px' }}>
              {isCorrect ? '✨ Perfect Sequence!' : '💡 Intended Sequence:'}
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-main)' }}>
              {data.explanation}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
