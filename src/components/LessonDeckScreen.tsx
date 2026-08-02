import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lesson, LessonCard, Topic } from '../types/lesson';
import { X, Volume2, VolumeX, ArrowRight } from 'lucide-react';
import { sounds } from '../utils/audio';

// Interaction components
import { HookCard } from './interactions/HookCard';
import { MultipleChoiceCard } from './interactions/MultipleChoiceCard';
import { DragToOrderCard } from './interactions/DragToOrderCard';
import { MatchPairsCard } from './interactions/MatchPairsCard';
import { SpotTheMistakeCard } from './interactions/SpotTheMistakeCard';
import { ChooseTheTradeoffCard } from './interactions/ChooseTheTradeoffCard';
import { BuildTheSystemCard } from './interactions/BuildTheSystemCard';
import { PredictWhatHappensCard } from './interactions/PredictWhatHappensCard';
import { BeforeVsAfterCard } from './interactions/BeforeVsAfterCard';
import { GuessTheMetricCard } from './interactions/GuessTheMetricCard';
import { TimelineCard } from './interactions/TimelineCard';
import { TakeawayCard } from './interactions/TakeawayCard';

interface Props {
  lesson: Lesson;
  onExit: () => void;
  onSelectNextTopic?: (topic: Topic) => void;
}

export const LessonDeckScreen: React.FC<Props> = ({ lesson, onExit, onSelectNextTopic }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());

  const currentCard: LessonCard = lesson.cards[currentIndex];
  const totalCards = lesson.cards.length;
  const isLastCard = currentIndex === totalCards - 1;

  const handleNext = () => {
    if (currentIndex < totalCards - 1) {
      sounds.playSwipe();
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      sounds.playSwipe();
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const toggleAudio = () => {
    const muted = sounds.toggleMute();
    setIsMuted(muted);
  };

  const renderCardContent = (card: LessonCard) => {
    switch (card.type) {
      case 'hook':
        return <HookCard data={card} />;
      case 'multiple_choice':
        return <MultipleChoiceCard data={card} />;
      case 'drag_to_order':
        return <DragToOrderCard data={card} />;
      case 'match_pairs':
        return <MatchPairsCard data={card} />;
      case 'spot_the_mistake':
        return <SpotTheMistakeCard data={card} />;
      case 'choose_the_tradeoff':
        return <ChooseTheTradeoffCard data={card} />;
      case 'build_the_system':
        return <BuildTheSystemCard data={card} />;
      case 'predict_what_happens':
        return <PredictWhatHappensCard data={card} />;
      case 'before_vs_after':
        return <BeforeVsAfterCard data={card} />;
      case 'guess_the_metric':
        return <GuessTheMetricCard data={card} />;
      case 'timeline':
        return <TimelineCard data={card} />;
      case 'takeaway':
        return (
          <TakeawayCard
            data={card}
            onNextTopicSelected={onSelectNextTopic}
            onRestartHome={onExit}
          />
        );
      default:
        return <div>Unknown Card</div>;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px 20px 24px 20px',
        gap: '16px',
        position: 'relative'
      }}
    >
      {/* Top Header Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onExit}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#94a3b8',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          <div
            style={{
              fontSize: '12px',
              fontWeight: 800,
              color: '#818cf8',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              background: 'rgba(99, 102, 241, 0.12)',
              padding: '4px 12px',
              borderRadius: '12px',
              border: '1px solid rgba(99, 102, 241, 0.2)'
            }}
          >
            {lesson.topic}
          </div>

          <button
            onClick={toggleAudio}
            style={{
              background: 'rgba(255, 255, 255, 0.06)',
              border: 'none',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: isMuted ? '#64748b' : '#34d399',
              cursor: 'pointer'
            }}
          >
            {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
          </button>
        </div>

        {/* Multi-step Progress Bar */}
        <div style={{ display: 'flex', gap: '4px', height: '4px' }}>
          {lesson.cards.map((_, idx) => (
            <div
              key={idx}
              style={{
                flex: 1,
                borderRadius: '4px',
                background:
                  idx === currentIndex
                    ? '#6366f1'
                    : idx < currentIndex
                    ? '#34d399'
                    : 'rgba(255, 255, 255, 0.1)',
                transition: 'background 0.3s ease'
              }}
            />
          ))}
        </div>
      </div>

      {/* Card Deck Viewport */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={currentCard.id}
            initial={{ opacity: 0, scale: 0.94, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: -20 }}
            transition={{ type: 'spring', stiffness: 350, damping: 28 }}
            drag="x"
            dragConstraints={{ left: 0, right: 0 }}
            onDragEnd={(_, info) => {
              if (info.offset.x < -60) handleNext();
              if (info.offset.x > 60) handlePrev();
            }}
            className="glass-card"
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          >
            {renderCardContent(currentCard)}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Bottom Action / Navigation Bar */}
      {currentCard.type !== 'takeaway' && (
        <div style={{ display: 'flex', gap: '10px' }}>
          {currentIndex > 0 && (
            <button
              onClick={handlePrev}
              className="tactile-btn tactile-btn-secondary"
              style={{ padding: '14px 18px' }}
            >
              Back
            </button>
          )}

          <motion.button
            whileTap={{ scale: 0.96 }}
            onClick={handleNext}
            className="tactile-btn tactile-btn-primary"
            style={{ flex: 1, padding: '16px' }}
          >
            <span>{isLastCard ? 'Finish Lesson' : 'Continue'}</span>
            <ArrowRight size={18} />
          </motion.button>
        </div>
      )}
    </div>
  );
};
