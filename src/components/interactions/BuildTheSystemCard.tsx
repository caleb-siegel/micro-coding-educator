import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { BuildTheSystemCardData } from '../../types/lesson';
import { Database, Layers, HardDrive, Cpu, CheckCircle2, Zap } from 'lucide-react';
import { sounds } from '../../utils/audio';

interface Props {
  data: BuildTheSystemCardData;
}

const ICON_COMPONENTS: Record<string, React.ElementType> = {
  Database,
  Layers,
  HardDrive,
  Cpu
};

export const BuildTheSystemCard: React.FC<Props> = ({ data }) => {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [slotAssignments, setSlotAssignments] = useState<Record<string, string>>({}); // slotId -> blockId
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleBlockTap = (blockId: string) => {
    if (isSubmitted) return;
    sounds.playSelect();
    setSelectedBlockId(blockId);
  };

  const handleSlotTap = (slotId: string) => {
    if (isSubmitted) return;
    if (!selectedBlockId) return;
    sounds.playTap();

    const newAssignments = { ...slotAssignments, [slotId]: selectedBlockId };
    setSlotAssignments(newAssignments);
    setSelectedBlockId(null);
  };

  const handleCheck = () => {
    const correct = data.targetSlots.every(
      (slot) => slotAssignments[slot.slotId] === slot.correctBlockId
    );
    setIsCorrect(correct);
    setIsSubmitted(true);
    if (correct) {
      sounds.playSuccess();
    } else {
      sounds.playError();
    }
  };

  const allFilled = Object.keys(slotAssignments).length === data.targetSlots.length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', gap: '16px' }}>
      <div>
        <h3 style={{ fontSize: '17px', fontWeight: 700, color: 'var(--text-main)', marginBottom: '4px' }}>
          {data.task}
        </h3>
        <p style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Tap a block below, then tap the matching system slot:</p>
      </div>

      {/* Target Slots Canvas */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {data.targetSlots.map((slot) => {
          const assignedBlockId = slotAssignments[slot.slotId];
          const assignedBlock = data.availableBlocks.find((b) => b.id === assignedBlockId);
          const IconComp = assignedBlock ? ICON_COMPONENTS[assignedBlock.icon] || Database : null;

          let slotStyle: React.CSSProperties = {
            padding: '10px 14px',
            borderRadius: '12px',
            border: selectedBlockId
              ? '2px dashed var(--accent-primary)'
              : '1px dashed var(--border-strong)',
            background: assignedBlock ? 'var(--badge-indigo-bg)' : 'var(--chip-bg)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            minHeight: '46px',
            cursor: selectedBlockId ? 'pointer' : 'default'
          };

          if (isSubmitted) {
            const isSlotCorrect = assignedBlockId === slot.correctBlockId;
            slotStyle.borderStyle = 'solid';
            slotStyle.borderColor = isSlotCorrect ? 'var(--badge-emerald-border)' : 'rgba(244, 63, 94, 0.4)';
            slotStyle.background = isSlotCorrect ? 'var(--badge-emerald-bg)' : 'rgba(244, 63, 94, 0.15)';
          }

          return (
            <motion.div key={slot.slotId} onClick={() => handleSlotTap(slot.slotId)} style={slotStyle}>
              <span style={{ fontSize: '12px', color: 'var(--text-muted)', fontWeight: 600 }}>{slot.label}</span>
              {assignedBlock ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-primary)', fontWeight: 700, fontSize: '13px' }}>
                  {IconComp && <IconComp size={16} />}
                  <span>{assignedBlock.label}</span>
                </div>
              ) : (
                <span style={{ fontSize: '12px', color: 'var(--text-dim)', fontStyle: 'italic' }}>[ Empty Slot ]</span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Available Blocks Pool */}
      {!isSubmitted && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
          {data.availableBlocks.map((block) => {
            const isSelected = selectedBlockId === block.id;
            const IconComp = ICON_COMPONENTS[block.icon] || Database;

            return (
              <motion.button
                key={block.id}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleBlockTap(block.id)}
                style={{
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: isSelected ? '2px solid var(--accent-primary)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'var(--badge-indigo-bg)' : 'var(--chip-bg)',
                  color: 'var(--text-main)',
                  fontSize: '12px',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  cursor: 'pointer'
                }}
              >
                <IconComp size={14} color="var(--accent-primary)" />
                <span>{block.label}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {!isSubmitted ? (
        <motion.button
          whileTap={{ scale: 0.96 }}
          onClick={handleCheck}
          disabled={!allFilled}
          className="tactile-btn tactile-btn-primary"
          style={{ marginTop: 'auto', width: '100%', opacity: allFilled ? 1 : 0.4 }}
        >
          Test Architecture
        </motion.button>
      ) : (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              marginTop: 'auto',
              padding: '12px',
              borderRadius: '14px',
              background: isCorrect ? 'var(--badge-emerald-bg)' : 'var(--badge-indigo-bg)',
              border: `1px solid ${isCorrect ? 'var(--badge-emerald-border)' : 'var(--badge-indigo-border)'}`
            }}
          >
            <div style={{ fontSize: '13px', fontWeight: 700, color: isCorrect ? 'var(--accent-emerald)' : 'var(--accent-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              {isCorrect ? <CheckCircle2 size={16} /> : <Zap size={16} />}
              {isCorrect ? 'System Operational!' : 'Architecture Note:'}
            </div>
            <div style={{ fontSize: '12px', lineHeight: 1.5, color: 'var(--text-main)' }}>
              {data.explanation}
            </div>
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  );
};
