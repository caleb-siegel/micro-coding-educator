import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { SpotTheMistakeCardData } from '../../types/lesson';
import { AlertTriangle, ShieldAlert } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: SpotTheMistakeCardData;
}

export const SpotTheMistakeCard: React.FC<Props> = ({ data }) => {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedLine, setSelectedLine] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const isCodeMode = data.contextCodeOrDiagram.type === 'code';

  const handleNodeClick = (nodeId: string, isMistake: boolean) => {
    if (revealed) return;
    setSelectedNodeId(nodeId);
    setRevealed(true);
    if (isMistake) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
  };

  const handleLineClick = (lineNum: number, isMistake: boolean) => {
    if (revealed) return;
    setSelectedLine(lineNum);
    setRevealed(true);
    if (isMistake) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div>
        <h3 style={{ fontSize: '18px', fontWeight: 700, color: '#f8fafc', marginBottom: '4px' }}>
          {data.instruction}
        </h3>
        <p style={{ fontSize: '13px', color: '#94a3b8' }}>
          {isCodeMode ? 'Tap the line containing the flaw:' : 'Tap the bottleneck/flawed component below:'}
        </p>
      </div>

      {!isCodeMode && data.contextCodeOrDiagram.nodes ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {data.contextCodeOrDiagram.nodes.map((node) => {
            const isSelected = selectedNodeId === node.id;

            let cardStyle: React.CSSProperties = {
              padding: '14px',
              borderRadius: '16px',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              background: 'rgba(255, 255, 255, 0.04)',
              cursor: revealed ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '12px'
            };

            if (revealed) {
              if (node.isMistake) {
                cardStyle.background = 'rgba(244, 63, 94, 0.18)';
                cardStyle.borderColor = 'rgba(244, 63, 94, 0.5)';
              } else if (isSelected && !node.isMistake) {
                cardStyle.background = 'rgba(255, 255, 255, 0.08)';
              } else {
                cardStyle.opacity = 0.5;
              }
            }

            return (
              <motion.div
                key={node.id}
                whileTap={!revealed ? { scale: 0.98 } : {}}
                onClick={() => handleNodeClick(node.id, node.isMistake)}
                style={cardStyle}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: 700, color: '#f8fafc' }}>
                    {node.label}
                  </div>
                  {node.subtext && (
                    <div style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>
                      {node.subtext}
                    </div>
                  )}
                </div>

                {revealed && node.isMistake && (
                  <ShieldAlert size={22} color="#fb7185" style={{ flexShrink: 0 }} />
                )}
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="code-block" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {data.contextCodeOrDiagram.codeLines?.map((line) => {
            const isSelected = selectedLine === line.line;

            let lineStyle: React.CSSProperties = {
              padding: '6px 10px',
              borderRadius: '8px',
              cursor: revealed ? 'default' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '12px'
            };

            if (revealed) {
              if (line.isMistake) {
                lineStyle.background = 'rgba(244, 63, 94, 0.25)';
              } else if (isSelected && !line.isMistake) {
                lineStyle.background = 'rgba(255, 255, 255, 0.1)';
              }
            }

            return (
              <motion.div
                key={line.line}
                whileTap={!revealed ? { scale: 0.99 } : {}}
                onClick={() => handleLineClick(line.line, line.isMistake)}
                style={lineStyle}
              >
                <span style={{ color: '#64748b', width: '20px', fontSize: '12px' }}>{line.line}</span>
                <span style={{ color: line.isMistake && revealed ? '#fb7185' : '#e2e8f0', fontWeight: line.isMistake && revealed ? 700 : 400 }}>
                  {line.text}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}

      {revealed && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 'auto',
              padding: '14px',
              borderRadius: '14px',
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)'
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: '#fb7185', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertTriangle size={16} /> Bottleneck Revealed!
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
