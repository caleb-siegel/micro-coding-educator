import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { ChooseTheTradeoffCardData } from '../../types/lesson';
import { CheckCircle2, ThumbsUp, ThumbsDown } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: ChooseTheTradeoffCardData;
}

export const ChooseTheTradeoffCard: React.FC<Props> = ({ data }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const [options] = useState(() => {
    const orig = data.options || [];
    if (orig.length <= 1) return [...orig];
    return [...orig].sort(() => Math.random() - 0.5);
  });

  const handleSelect = (optionId: string, isBest: boolean) => {
    if (selectedId) return;
    setSelectedId(optionId);
    if (isBest) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
  };

  const selectedOption = options.find((o) => o.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Architectural Tradeoff
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
          {data.scenario}
        </h3>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {options.map((opt) => {
          const isSelected = selectedId === opt.id;
          const isAnswered = selectedId !== null;

          let cardStyle: React.CSSProperties = {
            padding: '12px 14px',
            borderRadius: '14px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--chip-bg)',
            cursor: isAnswered ? 'default' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '6px'
          };

          if (isAnswered) {
            if (opt.isBestChoice) {
              cardStyle.background = 'var(--badge-emerald-bg)';
              cardStyle.borderColor = 'var(--badge-emerald-border)';
            } else if (isSelected && !opt.isBestChoice) {
              cardStyle.background = 'rgba(244, 63, 94, 0.15)';
              cardStyle.borderColor = 'rgba(244, 63, 94, 0.4)';
            } else {
              cardStyle.opacity = 0.4;
            }
          }

          return (
            <motion.div
              key={opt.id}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(opt.id, opt.isBestChoice)}
              style={cardStyle}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--text-main)' }}>
                  {opt.title}
                </span>
                {isAnswered && opt.isBestChoice && (
                  <CheckCircle2 size={18} color="var(--accent-emerald)" />
                )}
              </div>

              <div style={{ display: 'flex', gap: '12px', fontSize: '12px' }}>
                {opt.pros.length > 0 && (
                  <div style={{ color: 'var(--accent-emerald)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ThumbsUp size={12} /> {opt.pros[0]}
                  </div>
                )}
                {opt.cons.length > 0 && (
                  <div style={{ color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <ThumbsDown size={12} /> {opt.cons[0]}
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              marginTop: 'auto',
              padding: '14px',
              borderRadius: '14px',
              background: selectedOption.isBestChoice ? 'var(--badge-emerald-bg)' : 'var(--badge-indigo-bg)',
              border: `1px solid ${selectedOption.isBestChoice ? 'var(--badge-emerald-border)' : 'var(--badge-indigo-border)'}`
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedOption.isBestChoice ? 'var(--accent-emerald)' : 'var(--accent-primary)', marginBottom: '4px' }}>
              {selectedOption.isBestChoice ? '🎯 Optimal Architecture Choice!' : '💡 Tradeoff Analysis:'}
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.5, color: 'var(--text-main)' }}>
              {selectedOption.why}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
