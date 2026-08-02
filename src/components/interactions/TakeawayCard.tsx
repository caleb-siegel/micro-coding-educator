import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import type { TakeawayCardData, Topic } from '../../types/lesson';
import { Sparkles, Trophy, ArrowRight, Share2 } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: TakeawayCardData;
  onNextTopicSelected?: (topic: Topic) => void;
  onRestartHome?: () => void;
}

export const TakeawayCard: React.FC<Props> = ({ data, onNextTopicSelected, onRestartHome }) => {
  useEffect(() => {
    sounds.playSuccess();
    // Confetti celebration
    try {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.6 }
      });
    } catch {
      // safe fallback
    }
  }, []);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px', textAlign: 'left' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div
          style={{
            padding: '6px 12px',
            borderRadius: '20px',
            background: 'var(--badge-emerald-bg)',
            border: '1px solid var(--badge-emerald-border)',
            color: 'var(--badge-emerald-text)',
            fontSize: '12px',
            fontWeight: 800,
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px'
          }}
        >
          <Trophy size={14} /> Lesson Complete!
        </div>

        <button
          onClick={() => {
            sounds.playTap();
            if (navigator.share) {
              navigator.share({
                title: 'NYT Games for Engineers',
                text: `I just completed a 5-minute engineering challenge on NYT Games for Engineers! "${data.oneSentenceSummary}"`
              });
            }
          }}
          style={{
            background: 'var(--chip-bg)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '8px 12px',
            color: 'var(--text-main)',
            fontSize: '12px',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            cursor: 'pointer'
          }}
        >
          <Share2 size={14} /> Share
        </button>
      </div>

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        style={{
          padding: '16px',
          borderRadius: '16px',
          background: 'var(--badge-indigo-bg)',
          border: '1px solid var(--badge-indigo-border)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}
      >
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--badge-indigo-text)', textTransform: 'uppercase', letterSpacing: '0.05em', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Sparkles size={13} /> The 1-Sentence Takeaway
        </div>
        <div style={{ fontSize: '15px', fontWeight: 700, lineHeight: 1.4, color: 'var(--text-main)' }}>
          "{data.oneSentenceSummary}"
        </div>
      </motion.div>

      <div>
        <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '8px' }}>
          Key Insights Mastered:
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {data.keyInsights.map((insight, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + idx * 0.08 }}
              style={{
                padding: '10px 12px',
                borderRadius: '12px',
                background: 'var(--chip-bg)',
                border: '1px solid var(--border-subtle)',
                fontSize: '13px',
                lineHeight: 1.4,
                color: 'var(--text-main)',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span style={{ color: 'var(--accent-emerald)', fontWeight: 800 }}>✓</span>
              <span>{insight}</span>
            </motion.div>
          ))}
        </div>
      </div>

      <div style={{ marginTop: 'auto', display: 'flex', gap: '10px' }}>
        <button
          onClick={onRestartHome}
          className="tactile-btn tactile-btn-secondary"
          style={{ flex: 1 }}
        >
          Home
        </button>

        {data.suggestedNextTopic && onNextTopicSelected && (
          <button
            onClick={() => onNextTopicSelected(data.suggestedNextTopic!)}
            className="tactile-btn tactile-btn-primary"
            style={{ flex: 2 }}
          >
            Next: {data.suggestedNextTopic} <ArrowRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};
