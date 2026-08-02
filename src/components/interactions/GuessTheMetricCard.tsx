import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { GuessTheMetricCardData } from '../../types/lesson';
import { CheckCircle2, TrendingUp, XCircle } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: GuessTheMetricCardData;
}

export const GuessTheMetricCard: React.FC<Props> = ({ data }) => {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleChoice = (id: string, isCorrect: boolean) => {
    if (selectedId) return;
    setSelectedId(id);
    if (isCorrect) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
  };

  const maxVal = Math.max(...data.chartData.map((d) => d.value));
  const minVal = Math.min(...data.chartData.map((d) => d.value));

  // Compute SVG path string
  const svgWidth = 320;
  const svgHeight = 110;
  const padding = 20;

  const points = data.chartData.map((d, index) => {
    const x = padding + (index / (data.chartData.length - 1)) * (svgWidth - padding * 2);
    const normalizedY = (d.value - minVal) / (maxVal - minVal || 1);
    const y = svgHeight - padding - normalizedY * (svgHeight - padding * 2);
    return { x, y, data: d };
  });

  const pathD = points.reduce(
    (acc, pt, idx) => (idx === 0 ? `M ${pt.x} ${pt.y}` : `${acc} L ${pt.x} ${pt.y}`),
    ''
  );

  const selectedChoice = data.choices.find((c) => c.id === selectedId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-amber)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <TrendingUp size={14} /> Metric Anomaly
        </div>
        <h3 style={{ fontSize: '15px', fontWeight: 700, color: 'var(--text-main)' }}>
          {data.metricTitle}
        </h3>
      </div>

      {/* SVG Metric Chart */}
      <div style={{ background: 'var(--code-bg)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '12px', position: 'relative' }}>
        <svg width="100%" viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ overflow: 'visible' }}>
          {/* Gradient Fill under path */}
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--accent-rose)" stopOpacity="0.3" />
              <stop offset="100%" stopColor="var(--accent-rose)" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          <path d={`${pathD} L ${points[points.length - 1].x} ${svgHeight - padding} L ${points[0].x} ${svgHeight - padding} Z`} fill="url(#chartGrad)" />
          <path d={pathD} fill="none" stroke="var(--accent-rose)" strokeWidth="3" strokeLinecap="round" />

          {/* Points */}
          {points.map((pt, idx) => (
            <g key={idx}>
              <circle cx={pt.x} cy={pt.y} r={pt.data.spike ? 6 : 3} fill={pt.data.spike ? 'var(--accent-rose)' : 'var(--accent-primary)'} />
              {pt.data.spike && (
                <circle cx={pt.x} cy={pt.y} r={10} fill="none" stroke="var(--accent-rose)" strokeWidth="1.5">
                  <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
                  <animate attributeName="opacity" values="1;0.2;1" dur="2s" repeatCount="indefinite" />
                </circle>
              )}
            </g>
          ))}
        </svg>

        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>
          {data.chartData.map((d, i) => (
            <span key={i} style={{ color: d.spike ? 'var(--accent-rose)' : 'var(--text-dim)', fontWeight: d.spike ? 700 : 400 }}>{d.time}</span>
          ))}
        </div>
      </div>

      <div style={{ fontSize: '14px', fontWeight: 600, color: 'var(--text-main)' }}>
        {data.question}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.choices.map((c) => {
          const isSelected = selectedId === c.id;
          const isAnswered = selectedId !== null;

          let btnStyle: React.CSSProperties = {
            padding: '12px 14px',
            borderRadius: '12px',
            border: '1px solid var(--border-subtle)',
            background: 'var(--chip-bg)',
            cursor: isAnswered ? 'default' : 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '10px'
          };

          if (isAnswered) {
            if (c.isCorrect) {
              btnStyle.background = 'var(--badge-emerald-bg)';
              btnStyle.borderColor = 'var(--badge-emerald-border)';
            } else if (isSelected && !c.isCorrect) {
              btnStyle.background = 'rgba(244, 63, 94, 0.15)';
              btnStyle.borderColor = 'rgba(244, 63, 94, 0.4)';
            } else {
              btnStyle.opacity = 0.5;
            }
          }

          return (
            <motion.div
              key={c.id}
              whileTap={!isAnswered ? { scale: 0.98 } : {}}
              onClick={() => handleChoice(c.id, c.isCorrect)}
              style={btnStyle}
            >
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)' }}>{c.label}</span>
              {isAnswered && c.isCorrect && <CheckCircle2 size={18} color="var(--accent-emerald)" />}
              {isAnswered && isSelected && !c.isCorrect && <XCircle size={18} color="var(--accent-rose)" />}
            </motion.div>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedChoice && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '14px',
              background: selectedChoice.isCorrect ? 'var(--badge-emerald-bg)' : 'var(--badge-indigo-bg)',
              border: `1px solid ${selectedChoice.isCorrect ? 'var(--badge-emerald-border)' : 'var(--badge-indigo-border)'}`
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: selectedChoice.isCorrect ? 'var(--accent-emerald)' : 'var(--accent-primary)', marginBottom: '4px' }}>
              {selectedChoice.isCorrect ? '🎯 Accurate Root Cause!' : '💡 Diagnostic Note:'}
            </div>
            <div style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-main)' }}>
              {selectedChoice.explanation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
