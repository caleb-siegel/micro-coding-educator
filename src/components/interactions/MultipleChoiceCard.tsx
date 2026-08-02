import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MultipleChoiceCardData } from '../../types/lesson';
import { CheckCircle2, XCircle } from 'lucide-react';
import { sounds } from '../../utils/audio';
import { CardLearningSupport } from '../CardLearningSupport';

interface Props {
  data: MultipleChoiceCardData;
  onAnswerSelected?: (isCorrect: boolean) => void;
}

export const MultipleChoiceCard: React.FC<Props> = ({ data, onAnswerSelected }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = (optionId: string, isCorrect: boolean) => {
    if (selectedId) return; // locked once answered
    setSelectedId(optionId);
    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
    if (onAnswerSelected) {
      onAnswerSelected(isCorrect);
    }
  };

  const selectedOption = data.options.find((o) => o.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div>
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 700,
            lineHeight: 1.4,
            color: '#f8fafc',
            marginBottom: '4px'
          }}
        >
          {data.question}
        </h3>

        {/* Hint before answer */}
        <CardLearningSupport hint={data.hint} simpleExplanation={data.simpleExplanation} isAnswered={selectedId !== null} />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.options.map((opt, i) => {
          const isSelected = selectedId === opt.id;
          const isAnswered = selectedId !== null;

          let optionStyle: React.CSSProperties = {
            padding: '12px 14px',
            borderRadius: '14px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            background: 'rgba(255, 255, 255, 0.03)',
            cursor: isAnswered ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            transition: 'all 0.2s ease'
          };

          if (isAnswered) {
            if (opt.isCorrect) {
              optionStyle.background = 'rgba(16, 185, 129, 0.15)';
              optionStyle.borderColor = 'rgba(16, 185, 129, 0.4)';
            } else if (isSelected && !opt.isCorrect) {
              optionStyle.background = 'rgba(244, 63, 94, 0.15)';
              optionStyle.borderColor = 'rgba(244, 63, 94, 0.4)';
            } else {
              optionStyle.opacity = 0.5;
            }
          }

          return (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              onClick={() => handleSelect(opt.id, opt.isCorrect)}
              style={optionStyle}
            >
              <span style={{ fontSize: '13px', fontWeight: 500, lineHeight: 1.4, color: '#e2e8f0' }}>
                {opt.text}
              </span>

              {isAnswered && opt.isCorrect && (
                <CheckCircle2 size={18} color="#34d399" style={{ flexShrink: 0 }} />
              )}
              {isAnswered && isSelected && !opt.isCorrect && (
                <XCircle size={18} color="#fb7185" style={{ flexShrink: 0 }} />
              )}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedOption && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '14px',
              background: selectedOption.isCorrect ? 'rgba(16, 185, 129, 0.12)' : 'rgba(99, 102, 241, 0.12)',
              border: `1px solid ${selectedOption.isCorrect ? 'rgba(16, 185, 129, 0.3)' : 'rgba(99, 102, 241, 0.3)'}`
            }}
          >
            <div style={{ fontSize: '12px', fontWeight: 700, color: selectedOption.isCorrect ? '#34d399' : '#818cf8', marginBottom: '4px' }}>
              {selectedOption.isCorrect ? '⚡ Clever Insight!' : '💡 Key Learning:'}
            </div>
            <div style={{ fontSize: '12px', lineHeight: 1.4, color: '#cbd5e1' }}>
              {selectedOption.explanation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
