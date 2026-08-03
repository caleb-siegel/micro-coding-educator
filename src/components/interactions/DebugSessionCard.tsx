import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { DebugSessionCardData } from '../../types/lesson';
import { Bug, Terminal, CheckCircle2, AlertOctagon, Wrench } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: DebugSessionCardData;
}

export const DebugSessionCard: React.FC<Props> = ({ data }) => {
  const [tappedLine, setTappedLine] = useState<number | null>(null);
  const [isBugFound, setIsBugFound] = useState(false);
  const [selectedFixId, setSelectedFixId] = useState<string | null>(null);
  const [isResolved, setIsResolved] = useState(false);

  const [shuffledFixes] = useState(() => {
    const orig = data.fixOptions || [];
    if (orig.length <= 1) return [...orig];
    return [...orig].sort(() => Math.random() - 0.5);
  });

  const handleLineTap = (lineNum: number, isBuggyLine: boolean) => {
    if (isBugFound) return;
    setTappedLine(lineNum);

    if (isBuggyLine) {
      sounds.playSuccess();
      setIsBugFound(true);
    } else {
      sounds.playError();
    }
  };

  const handleSelectFix = (fixId: string, isCorrectFix: boolean) => {
    if (isResolved) return;
    setSelectedFixId(fixId);

    if (isCorrectFix) {
      sounds.playSuccess();
      setIsResolved(true);
    } else {
      sounds.playError();
    }
  };

  const selectedFix = shuffledFixes.find((f) => f.id === selectedFixId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '14px' }}>
      {/* Header Banner */}
      <div>
        <div style={{ fontSize: '11px', fontWeight: 800, color: 'var(--accent-rose)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '3px', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <Bug size={14} /> Production Incident Debug Session
        </div>
        <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.3 }}>
          {data.bugTitle}
        </h3>
      </div>

      {/* Symptom & Log Banner */}
      <div
        style={{
          padding: '10px 12px',
          borderRadius: '12px',
          background: 'rgba(244, 63, 94, 0.12)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px'
        }}
      >
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-rose)', display: 'flex', alignItems: 'center', gap: '5px' }}>
          <AlertOctagon size={14} /> Symptom: {data.symptom}
        </div>
        {data.stackTraceOrLog && (
          <div style={{ fontSize: '11px', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', background: 'var(--code-bg)', padding: '6px 8px', borderRadius: '6px', whiteSpace: 'pre-wrap' }}>
            {data.stackTraceOrLog}
          </div>
        )}
      </div>

      {/* Code Inspector Step 1 */}
      <div>
        <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>{isBugFound ? '1. ✅ Flaw Located' : '1. Tap line with the root cause bug:'}</span>
          <span style={{ fontSize: '11px', color: 'var(--accent-primary)', fontFamily: 'var(--font-mono)' }}>
            📄 {data.codeSnippet.filename || 'source_file'}
          </span>
        </div>

        <div className="code-block" style={{ padding: '8px', display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '180px', overflowY: 'auto' }}>
          {data.codeSnippet.lines.map((line) => {
            const isSelected = tappedLine === line.lineNumber;
            let lineBg = 'transparent';
            let textColor = 'var(--code-text)';
            let borderColor = 'transparent';

            if (isSelected) {
              if (line.isBuggyLine) {
                lineBg = 'rgba(244, 63, 94, 0.25)';
                textColor = 'var(--accent-rose)';
                borderColor = 'var(--accent-rose)';
              } else {
                lineBg = 'rgba(255, 255, 255, 0.08)';
              }
            } else if (isBugFound && line.isBuggyLine) {
              lineBg = 'rgba(244, 63, 94, 0.25)';
              textColor = 'var(--accent-rose)';
            }

            return (
              <motion.div
                key={line.lineNumber}
                whileTap={!isBugFound ? { scale: 0.99 } : {}}
                onClick={() => handleLineTap(line.lineNumber, line.isBuggyLine)}
                style={{
                  padding: '4px 8px',
                  borderRadius: '6px',
                  background: lineBg,
                  border: `1px solid ${borderColor}`,
                  cursor: isBugFound ? 'default' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  fontSize: '12px',
                  fontFamily: 'var(--font-mono)'
                }}
              >
                <span style={{ color: 'var(--text-dim)', width: '18px', fontSize: '11px', userSelect: 'none' }}>
                  {line.lineNumber}
                </span>
                <span style={{ color: textColor, fontWeight: line.isBuggyLine && isBugFound ? 700 : 400 }}>
                  {line.code}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Code Fix Selector Step 2 */}
      {isBugFound && shuffledFixes.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Wrench size={13} /> 2. Select Code Patch to Resolve:
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {shuffledFixes.map((fix) => {
              const isSelected = selectedFixId === fix.id;

              let btnStyle: React.CSSProperties = {
                padding: '10px 12px',
                borderRadius: '10px',
                border: '1px solid var(--border-subtle)',
                background: 'var(--chip-bg)',
                cursor: isResolved ? 'default' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '8px',
                fontFamily: 'var(--font-mono)',
                fontSize: '12px'
              };

              if (selectedFixId) {
                if (fix.isCorrectFix) {
                  btnStyle.background = 'var(--badge-emerald-bg)';
                  btnStyle.borderColor = 'var(--badge-emerald-border)';
                } else if (isSelected && !fix.isCorrectFix) {
                  btnStyle.background = 'rgba(244, 63, 94, 0.15)';
                  btnStyle.borderColor = 'rgba(244, 63, 94, 0.4)';
                } else {
                  btnStyle.opacity = 0.5;
                }
              }

              return (
                <motion.div
                  key={fix.id}
                  whileTap={!isResolved ? { scale: 0.98 } : {}}
                  onClick={() => handleSelectFix(fix.id, fix.isCorrectFix)}
                  style={btnStyle}
                >
                  <span style={{ color: fix.isCorrectFix && selectedFixId ? 'var(--accent-emerald)' : 'var(--text-main)' }}>
                    {fix.patchCode}
                  </span>
                  {selectedFixId && fix.isCorrectFix && <CheckCircle2 size={16} color="var(--accent-emerald)" />}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Resolution & Explanation Drawer */}
      <AnimatePresence>
        {(isResolved || (isBugFound && !data.fixOptions)) && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 'auto',
              padding: '12px 14px',
              borderRadius: '14px',
              background: 'var(--badge-emerald-bg)',
              border: '1px solid var(--badge-emerald-border)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--accent-emerald)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Terminal size={16} /> Incident Resolved & Post-Mortem Lesson:
            </div>
            <div style={{ fontSize: '12.5px', lineHeight: 1.5, color: 'var(--text-main)' }}>
              {selectedFix?.explanation || data.explanation}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
