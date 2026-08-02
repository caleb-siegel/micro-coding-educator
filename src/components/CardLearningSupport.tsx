import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HelpCircle, BookOpen, Lightbulb } from 'lucide-react';
import { sounds } from '../utils/audio';

interface Props {
  hint?: string;
  simpleExplanation?: string;
  isAnswered: boolean;
}

export const CardLearningSupport: React.FC<Props> = ({ hint, simpleExplanation, isAnswered }) => {
  const [showHint, setShowHint] = useState(false);
  const [showEli5, setShowEli5] = useState(false);

  if (!hint && !simpleExplanation) return null;

  return (
    <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
      {/* Before Answered: Hint Trigger */}
      {!isAnswered && hint && (
        <div>
          <button
            onClick={() => {
              sounds.playTap();
              setShowHint(!showHint);
            }}
            style={{
              background: 'none',
              border: 'none',
              color: '#818cf8',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              padding: '2px 0'
            }}
          >
            <Lightbulb size={13} />
            <span>{showHint ? 'Hide Hint' : 'Need a quick hint?'}</span>
          </button>

          <AnimatePresence>
            {showHint && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  padding: '10px 12px',
                  borderRadius: '10px',
                  background: 'rgba(99, 102, 241, 0.12)',
                  border: '1px solid rgba(99, 102, 241, 0.25)',
                  fontSize: '12px',
                  lineHeight: 1.4,
                  color: '#cbd5e1',
                  marginTop: '4px'
                }}
              >
                <strong>Hint:</strong> {hint}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* After Answered: ELI5 Simple Explanation Trigger */}
      {isAnswered && simpleExplanation && (
        <div>
          <button
            onClick={() => {
              sounds.playTap();
              setShowEli5(!showEli5);
            }}
            style={{
              background: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              borderRadius: '8px',
              color: '#38bdf8',
              fontSize: '12px',
              fontWeight: 600,
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              cursor: 'pointer',
              padding: '6px 10px'
            }}
          >
            <BookOpen size={13} />
            <span>{showEli5 ? 'Hide Simple Analogy' : 'Explain Simply (ELI5)'}</span>
          </button>

          <AnimatePresence>
            {showEli5 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  background: 'rgba(56, 189, 248, 0.12)',
                  border: '1px solid rgba(56, 189, 248, 0.3)',
                  fontSize: '12px',
                  lineHeight: 1.5,
                  color: '#e0f2fe',
                  marginTop: '6px'
                }}
              >
                <div style={{ fontWeight: 700, color: '#38bdf8', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <HelpCircle size={14} /> Simplified Concept:
                </div>
                {simpleExplanation}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};
