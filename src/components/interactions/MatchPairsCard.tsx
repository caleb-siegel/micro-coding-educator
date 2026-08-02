import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { MatchPairsCardData } from '../../types/lesson';
import { Check, Zap } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: MatchPairsCardData;
}

export const MatchPairsCard: React.FC<Props> = ({ data }) => {
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({}); // leftId -> rightId
  const [wrongFlash, setWrongFlash] = useState<string | null>(null);

  // Shuffle rights for challenge
  const [rightItems] = useState(() => {
    return [...data.pairs].sort(() => Math.random() - 0.5);
  });

  const isComplete = Object.keys(matchedPairs).length === data.pairs.length;

  const handleLeftTap = (pairId: string) => {
    if (matchedPairs[pairId]) return;
    sounds.playSelect();
    setSelectedLeft(pairId);
    setWrongFlash(null);
  };

  const handleRightTap = (pairId: string) => {
    if (!selectedLeft) return;
    if (Object.values(matchedPairs).includes(pairId)) return;

    if (selectedLeft === pairId) {
      // Matched!
      sounds.playSuccess();
      const nextMatched = { ...matchedPairs, [selectedLeft]: pairId };
      setMatchedPairs(nextMatched);
      setSelectedLeft(null);
    } else {
      // Wrong match
      sounds.playError();
      setWrongFlash(pairId);
      setTimeout(() => setWrongFlash(null), 600);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
          {data.instruction}
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tap a Concept on the left, then tap its Definition on the right:</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', flex: 1 }}>
        {/* Left Column - Concepts */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {data.pairs.map((p) => {
            const isMatched = !!matchedPairs[p.id];
            const isSelected = selectedLeft === p.id;

            return (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleLeftTap(p.id)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: isSelected
                    ? '2px solid var(--accent-primary)'
                    : isMatched
                    ? '1px solid var(--badge-emerald-border)'
                    : '1px solid var(--border-subtle)',
                  background: isSelected
                    ? 'var(--badge-indigo-bg)'
                    : isMatched
                    ? 'var(--badge-emerald-bg)'
                    : 'var(--chip-bg)',
                  color: isMatched ? 'var(--accent-emerald)' : 'var(--text-main)',
                  fontSize: '13px',
                  fontWeight: 600,
                  textAlign: 'left',
                  cursor: isMatched ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <span>{p.left}</span>
                {isMatched && <Check size={16} color="var(--accent-emerald)" />}
              </motion.button>
            );
          })}
        </div>

        {/* Right Column - Definitions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {rightItems.map((p) => {
            const isMatched = Object.values(matchedPairs).includes(p.id);
            const isWrong = wrongFlash === p.id;

            return (
              <motion.button
                key={p.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => handleRightTap(p.id)}
                style={{
                  padding: '12px',
                  borderRadius: '12px',
                  border: isWrong
                    ? '2px solid var(--accent-rose)'
                    : isMatched
                    ? '1px solid var(--badge-emerald-border)'
                    : '1px solid var(--border-subtle)',
                  background: isWrong
                    ? 'rgba(244, 63, 94, 0.2)'
                    : isMatched
                    ? 'var(--badge-emerald-bg)'
                    : 'var(--chip-bg)',
                  color: isMatched ? 'var(--accent-emerald)' : 'var(--text-muted)',
                  fontSize: '12px',
                  lineHeight: 1.4,
                  textAlign: 'left',
                  cursor: isMatched ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '8px'
                }}
              >
                <span>{p.right}</span>
                {isMatched && <Check size={16} color="var(--accent-emerald)" />}
              </motion.button>
            );
          })}
        </div>
      </div>

      {isComplete && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '14px',
              borderRadius: '14px',
              background: 'var(--badge-emerald-bg)',
              border: '1px solid var(--badge-emerald-border)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Zap size={16} /> All Concepts Matched!
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
