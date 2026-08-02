import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { PredictWhatHappensCardData } from '../../types/lesson';
import { Sliders, AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: PredictWhatHappensCardData;
}

export const PredictWhatHappensCard: React.FC<Props> = ({ data }) => {
  const [val, setVal] = useState<number>(
    Math.round((data.minVal + data.maxVal) / 2)
  );
  const [isRevealed, setIsRevealed] = useState(false);

  // Find matching outcome threshold
  const currentOutcome =
    data.outcomes.find((o, idx) => {
      const nextOutcome = data.outcomes[idx + 1];
      if (!nextOutcome) return true;
      return val <= o.threshold;
    }) || data.outcomes[data.outcomes.length - 1];

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    sounds.playTap();
    setVal(Number(e.target.value));
  };

  const handleReveal = () => {
    setIsRevealed(true);
    if (currentOutcome.status === 'success') {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Interactive Simulation
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-main)', lineHeight: 1.4 }}>
          {data.scenario}
        </h3>
      </div>

      {/* Interactive Control */}
      <div style={{ padding: '16px', borderRadius: '16px', background: 'var(--chip-bg)', border: '1px solid var(--border-subtle)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={16} /> {data.metricLabel}
          </span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
            {val} {data.unit}
          </span>
        </div>

        <input
          type="range"
          min={data.minVal}
          max={data.maxVal}
          step={50}
          value={val}
          onChange={handleSliderChange}
          disabled={isRevealed}
          style={{ width: '100%', accentColor: 'var(--accent-primary)', cursor: 'pointer' }}
        />

        {/* Dynamic Status Badge */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background:
              currentOutcome.status === 'success'
                ? 'var(--badge-emerald-bg)'
                : currentOutcome.status === 'warning'
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${
              currentOutcome.status === 'success'
                ? 'var(--badge-emerald-border)'
                : currentOutcome.status === 'warning'
                ? 'rgba(245, 158, 11, 0.4)'
                : 'rgba(244, 63, 94, 0.4)'
            }`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {currentOutcome.status === 'success' && <CheckCircle size={18} color="var(--accent-emerald)" />}
          {currentOutcome.status === 'warning' && <AlertTriangle size={18} color="var(--accent-amber)" />}
          {currentOutcome.status === 'critical' && <AlertCircle size={18} color="var(--accent-rose)" />}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--text-main)' }}>
              {currentOutcome.title}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {currentOutcome.description}
            </div>
          </div>
        </div>
      </div>

      {!isRevealed ? (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleReveal}
          className="tactile-btn tactile-btn-primary"
          style={{ marginTop: 'auto', width: '100%' }}
        >
          Lock In & Reveal Analysis
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
              background: 'var(--badge-indigo-bg)',
              border: '1px solid var(--badge-indigo-border)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-primary)', marginBottom: '4px' }}>
              💡 System Insight:
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
