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
  const [userFirstTapId, setUserFirstTapId] = useState<string | null>(null);

  const handleSelect = (optionId: string, isCorrect: boolean) => {
    // Record first attempt for score tracking & haptics
    if (!userFirstTapId) {
      setUserFirstTapId(optionId);
      if (isCorrect) {
        sounds.playSuccess();
      } else {
        sounds.playError();
      }
      if (onAnswerSelected) {
        onAnswerSelected(isCorrect);
      }
    } else {
      // Allow tapping any option to explore its explanation
      sounds.playSelect();
    }

    setSelectedId(optionId);
  };

  const activeOption = data.options.find((o) => o.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100%', gap: '14px' }}>
      <div>
        <h3
          style={{
            fontSize: '17px',
            fontWeight: 700,
            lineHeight: 1.4,
            color: 'var(--text-main)',
            marginBottom: '4px'
          }}
        >
          {data.question}
        </h3>

        {/* Hint before answer */}
        <CardLearningSupport
          hint={data.hint}
          simpleExplanation={data.simpleExplanation}
          isAnswered={selectedId !== null}
        />
      </div>

      {/* Option Cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {data.options.map((opt, i) => {
          const isFocused = selectedId === opt.id;
          const isFirstTapped = userFirstTapId === opt.id;
          const isAnswered = selectedId !== null;

          let optionStyle: React.CSSProperties = {
            padding: '12px 14px',
            borderRadius: '14px',
            border: isFocused
              ? opt.isCorrect
                ? '2px solid var(--accent-emerald)'
                : '2px solid var(--accent-primary)'
              : '1px solid var(--border-subtle)',
            background: 'var(--chip-bg)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            transition: 'all 0.2s ease',
            boxShadow: isFocused ? '0 4px 16px rgba(79, 70, 229, 0.2)' : 'none'
          };

          if (isAnswered) {
            if (opt.isCorrect) {
              optionStyle.background = 'var(--badge-emerald-bg)';
              optionStyle.borderColor = isFocused ? 'var(--accent-emerald)' : 'var(--badge-emerald-border)';
            } else if (isFirstTapped && !opt.isCorrect) {
              optionStyle.background = 'rgba(244, 63, 94, 0.15)';
              optionStyle.borderColor = isFocused ? 'var(--accent-rose)' : 'rgba(244, 63, 94, 0.4)';
            } else if (!isFocused) {
              optionStyle.opacity = 0.6;
            }
          }

          return (
            <motion.div
              key={opt.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => handleSelect(opt.id, opt.isCorrect)}
              style={optionStyle}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, lineHeight: 1.4, color: 'var(--text-main)' }}>
                {opt.text}
              </span>

              {isAnswered && opt.isCorrect && (
                <CheckCircle2 size={18} color="var(--accent-emerald)" style={{ flexShrink: 0 }} />
              )}
              {isAnswered && isFirstTapped && !opt.isCorrect && (
                <XCircle size={18} color="var(--accent-rose)" style={{ flexShrink: 0 }} />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Explanation Drawer for currently selected option */}
      <AnimatePresence>
        {activeOption && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: 10 }}
            animate={{ opacity: 1, height: 'auto', y: 0 }}
            exit={{ opacity: 0, height: 0 }}
            style={{
              marginTop: 'auto',
              padding: '12px 14px',
              borderRadius: '14px',
              background: activeOption.isCorrect ? 'var(--badge-emerald-bg)' : 'var(--badge-indigo-bg)',
              border: `1px solid ${activeOption.isCorrect ? 'var(--badge-emerald-border)' : 'var(--badge-indigo-border)'}`
            }}
          >
            <div
              style={{
                fontSize: '12px',
                fontWeight: 700,
                color: activeOption.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-primary)',
                marginBottom: '4px'
              }}
            >
              {activeOption.isCorrect ? '⚡ Why This Is Correct:' : '💡 Option Explanation:'}
            </div>
            <div style={{ fontSize: '12.5px', lineHeight: 1.45, color: 'var(--text-main)' }}>
              {activeOption.explanation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
