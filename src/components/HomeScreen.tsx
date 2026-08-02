import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Topic, Difficulty } from '../types/lesson';
import { Zap, Clock, Sparkles, Target, Edit3 } from 'lucide-react';
import { sounds } from '../utils/audio';
import { ThemeToggle } from './ThemeToggle';

interface Props {
  onStartSession: (topic: Topic, duration: number, difficulty: Difficulty) => void;
}

const TOPICS: { name: string; icon: string }[] = [
  { name: 'System Design', icon: '🏗️' },
  { name: 'AI & LLMs', icon: '🤖' },
  { name: 'Backend', icon: '⚡' },
  { name: 'Frontend', icon: '🎨' },
  { name: 'DevOps', icon: '☁️' },
  { name: 'Security', icon: '🔒' },
  { name: 'Product', icon: '🚀' },
  { name: 'Surprise Me', icon: '🎲' },
  { name: 'Other...', icon: '✏️' }
];

const DIFFICULTIES: { name: Difficulty; label: string; badgeColor: string }[] = [
  { name: 'Foundational', label: '🌱 Intro', badgeColor: 'var(--accent-emerald)' },
  { name: 'Intermediate', label: '⚡ Mid', badgeColor: 'var(--accent-amber)' },
  { name: 'Staff Level', label: '🔥 Deep', badgeColor: 'var(--accent-rose)' }
];

const DURATIONS = [3, 5, 10];

export const HomeScreen: React.FC<Props> = ({ onStartSession }) => {
  const [selectedTopic, setSelectedTopic] = useState<string>('System Design');
  const [customTopicInput, setCustomTopicInput] = useState<string>('');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty>('Foundational');
  const [selectedDuration, setSelectedDuration] = useState<number>(5);

  const isOtherSelected = selectedTopic === 'Other...';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleTopicSelect = (topicName: string) => {
    sounds.playSelect();
    setSelectedTopic(topicName);
  };

  const handleDifficultySelect = (diff: Difficulty) => {
    sounds.playTap();
    setSelectedDifficulty(diff);
  };

  const handleDurationSelect = (dur: number) => {
    sounds.playTap();
    setSelectedDuration(dur);
  };

  const handleStart = () => {
    sounds.playSuccess();
    const finalTopic = isOtherSelected && customTopicInput.trim()
      ? customTopicInput.trim()
      : isOtherSelected
      ? 'Custom Architecture'
      : selectedTopic;

    onStartSession(finalTopic, selectedDuration, selectedDifficulty);
  };

  const activeTopicDisplay = isOtherSelected
    ? customTopicInput.trim() || 'Custom'
    : selectedTopic;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '24px 20px',
        justifyContent: 'space-between',
        overflowY: 'auto'
      }}
    >
      {/* Header & Greeting Bar */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div
            style={{
              padding: '4px 12px',
              borderRadius: '20px',
              background: 'var(--badge-indigo-bg)',
              border: '1px solid var(--badge-indigo-border)',
              color: 'var(--badge-indigo-text)',
              fontSize: '11px',
              fontWeight: 800,
              letterSpacing: '0.05em',
              textTransform: 'uppercase',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Sparkles size={13} /> NYT Games For Engineers
          </div>

          <ThemeToggle />
        </div>

        <h1
          style={{
            fontSize: '26px',
            fontWeight: 800,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
            color: 'var(--text-main)',
            marginTop: '4px'
          }}
        >
          {getGreeting()}.
        </h1>
        <p style={{ fontSize: '14px', color: 'var(--text-muted)', fontWeight: 500 }}>
          Ready for a {selectedDuration}-minute {selectedDifficulty.toLowerCase()} challenge?
        </p>
      </motion.div>

      {/* Selectors Body */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', margin: '14px 0' }}>
        {/* Topic Grid */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em'
            }}
          >
            Topics
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
            {TOPICS.map((t) => {
              const isSelected = selectedTopic === t.name;

              return (
                <motion.button
                  key={t.name}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleTopicSelect(t.name)}
                  style={{
                    padding: '11px 13px',
                    borderRadius: '16px',
                    border: isSelected
                      ? '2px solid var(--accent-primary)'
                      : '1px solid var(--border-subtle)',
                    background: isSelected
                      ? 'var(--badge-indigo-bg)'
                      : 'var(--chip-bg)',
                    color: isSelected ? 'var(--text-main)' : 'var(--text-muted)',
                    fontSize: '13px',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: isSelected ? '0 6px 16px -4px rgba(79, 70, 229, 0.25)' : 'none',
                    transition: 'all 0.18s ease'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '15px' }}>{t.icon}</span>
                    <span>{t.name}</span>
                  </span>
                </motion.button>
              );
            })}
          </div>

          {/* Custom Topic Input Field */}
          <AnimatePresence>
            {isOtherSelected && (
              <motion.div
                initial={{ opacity: 0, height: 0, y: -6 }}
                animate={{ opacity: 1, height: 'auto', y: 0 }}
                exit={{ opacity: 0, height: 0, y: -6 }}
                style={{ marginTop: '6px' }}
              >
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <Edit3 size={15} color="var(--accent-primary)" style={{ position: 'absolute', left: '12px' }} />
                  <input
                    type="text"
                    placeholder="Type custom topic (e.g. GraphQL, Rust, WASM)..."
                    value={customTopicInput}
                    onChange={(e) => setCustomTopicInput(e.target.value)}
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '11px 14px 11px 36px',
                      borderRadius: '14px',
                      border: '1.5px solid var(--accent-primary)',
                      background: 'var(--input-bg)',
                      color: 'var(--text-main)',
                      fontSize: '13px',
                      fontWeight: 600,
                      outline: 'none',
                      boxShadow: '0 0 16px rgba(79, 70, 229, 0.15)'
                    }}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Difficulty Level Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Target size={12} /> Difficulty Level
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {DIFFICULTIES.map((diff) => {
              const isSelected = selectedDifficulty === diff.name;

              return (
                <motion.button
                  key={diff.name}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDifficultySelect(diff.name)}
                  style={{
                    padding: '10px 8px',
                    borderRadius: '12px',
                    border: isSelected
                      ? `2px solid ${diff.badgeColor}`
                      : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--chip-bg-hover)' : 'var(--chip-bg)',
                    color: isSelected ? diff.badgeColor : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {diff.label}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Duration Selector */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 700,
              color: 'var(--text-dim)',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              display: 'flex',
              alignItems: 'center',
              gap: '4px'
            }}
          >
            <Clock size={12} /> Time Limit
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
            {DURATIONS.map((dur) => {
              const isSelected = selectedDuration === dur;

              return (
                <motion.button
                  key={dur}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleDurationSelect(dur)}
                  style={{
                    padding: '10px',
                    borderRadius: '12px',
                    border: isSelected
                      ? '2px solid var(--accent-primary)'
                      : '1px solid var(--border-subtle)',
                    background: isSelected ? 'var(--badge-indigo-bg)' : 'var(--chip-bg)',
                    color: isSelected ? 'var(--badge-indigo-text)' : 'var(--text-muted)',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {dur} min
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Start CTA Button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.96 }}
        onClick={handleStart}
        className="tactile-btn tactile-btn-primary glow-primary"
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '18px',
          fontSize: '16px',
          fontWeight: 800
        }}
      >
        <Zap size={18} /> Start {activeTopicDisplay} Challenge
      </motion.button>
    </div>
  );
};
