import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BeforeVsAfterCardData } from '../../types/lesson';
import { CheckCircle2, Zap } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: BeforeVsAfterCardData;
}

export const BeforeVsAfterCard: React.FC<Props> = ({ data }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (id: string, isBetter: boolean) => {
    if (selectedId) return;
    setSelectedId(id);
    if (isBetter) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
  };

  const selectedOpt =
    selectedId === data.optionA.id ? data.optionA : selectedId === data.optionB.id ? data.optionB : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Topology Comparison
        </div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.4 }}>
          {data.question}
        </h3>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
        {[data.optionA, data.optionB].map((opt) => {
          const isSelected = selectedId === opt.id;
          const isAnswered = selectedId !== null;

          let cardStyle: React.CSSProperties = {
            padding: '14px',
            borderRadius: '16px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.03)',
            cursor: isAnswered ? 'default' : 'pointer',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px',
            justifyContent: 'space-between'
          };

          if (isAnswered) {
            if (opt.isBetter) {
              cardStyle.background = 'rgba(16, 185, 129, 0.15)';
              cardStyle.borderColor = 'rgba(16, 185, 129, 0.5)';
            } else if (isSelected && !opt.isBetter) {
              cardStyle.background = 'rgba(244, 63, 94, 0.15)';
              cardStyle.borderColor = 'rgba(244, 63, 94, 0.5)';
            } else {
              cardStyle.opacity = 0.4;
            }
          }

          return (
            <motion.div
              key={opt.id}
              whileTap={!isAnswered ? { scale: 0.97 } : {}}
              onClick={() => handleSelect(opt.id, opt.isBetter)}
              style={cardStyle}
            >
              <div>
                <div style={{ fontSize: '13px', fontWeight: 800, color: '#f8fafc', lineHeight: 1.3, marginBottom: '8px' }}>
                  {opt.label}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {opt.metrics.map((m, idx) => (
                    <div key={idx} style={{ background: 'rgba(0, 0, 0, 0.3)', padding: '6px 8px', borderRadius: '8px' }}>
                      <div style={{ fontSize: '10px', color: '#94a3b8', textTransform: 'uppercase' }}>{m.label}</div>
                      <div style={{ fontSize: '12px', fontWeight: 700, color: '#e2e8f0', fontFamily: 'var(--font-mono)' }}>{m.value}</div>
                    </div>
                  ))}
                </div>
              </div>

              {isAnswered && opt.isBetter && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#34d399', fontSize: '12px', fontWeight: 700 }}>
                  <CheckCircle2 size={16} /> Scales Better!
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedOpt && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: selectedOpt.isBetter ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
              border: `1px solid ${selectedOpt.isBetter ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedOpt.isBetter ? '#34d399' : '#818cf8', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} /> Topology Breakdown:
            </div>
            <div style={{ fontSize: '13px', lineHeight: 1.5, color: '#cbd5e1' }}>
              {data.explanation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
