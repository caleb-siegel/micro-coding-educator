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
        <div style={{ fontSize: '12px', fontWeight: 700, color: '#818cf8', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>
          Interactive Simulation
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#f8fafc', lineHeight: 1.4 }}>
          {data.scenario}
        </h3>
      </div>

      {/* Interactive Control */}
      <div style={{ padding: '16px', borderRadius: '16px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '13px', fontWeight: 600, color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Sliders size={16} /> {data.metricLabel}
          </span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#818cf8', fontFamily: 'var(--font-mono)' }}>
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
          style={{ width: '100%', accentColor: '#6366f1', cursor: 'pointer' }}
        />

        {/* Dynamic Status Badge */}
        <div
          style={{
            padding: '10px 14px',
            borderRadius: '12px',
            background:
              currentOutcome.status === 'success'
                ? 'rgba(16, 185, 129, 0.15)'
                : currentOutcome.status === 'warning'
                ? 'rgba(245, 158, 11, 0.15)'
                : 'rgba(244, 63, 94, 0.15)',
            border: `1px solid ${
              currentOutcome.status === 'success'
                ? 'rgba(16, 185, 129, 0.4)'
                : currentOutcome.status === 'warning'
                ? 'rgba(245, 158, 11, 0.4)'
                : 'rgba(244, 63, 94, 0.4)'
            }`,
            display: 'flex',
            alignItems: 'center',
            gap: '10px'
          }}
        >
          {currentOutcome.status === 'success' && <CheckCircle size={18} color="#34d399" />}
          {currentOutcome.status === 'warning' && <AlertTriangle size={18} color="#fbbf24" />}
          {currentOutcome.status === 'critical' && <AlertCircle size={18} color="#fb7185" />}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#f8fafc' }}>
              {currentOutcome.title}
            </div>
            <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
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
              background: 'rgba(99, 102, 241, 0.12)',
              border: '1px solid rgba(99, 102, 241, 0.3)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#818cf8', marginBottom: '4px' }}>
              💡 System Insight:
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
