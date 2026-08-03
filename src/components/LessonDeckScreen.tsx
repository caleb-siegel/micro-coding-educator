import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { Lesson, LessonCard, Topic } from '../types/lesson';
import { X, Volume2, VolumeX, ArrowRight, Bot, Sparkles, Loader2, Infinity as InfinityIcon } from 'lucide-react';
import { sounds } from '../utils/audio';
import { ThemeToggle } from './ThemeToggle';
import { CardChatModal } from './CardChatModal';
import { fetchMoreCards } from '../services/api';

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
import { DebugSessionCard } from './interactions/DebugSessionCard';

interface Props {
  lesson: Lesson;
  onExit: () => void;
  onSelectNextTopic?: (topic: Topic) => void;
}

function getCardTitle(card: LessonCard): string {
  if ('title' in card && card.title) return card.title;
  if ('headline' in card && card.headline) return card.headline;
  if ('question' in card && card.question) return card.question;
  if ('instruction' in card && card.instruction) return card.instruction;
  if ('scenario' in card && card.scenario) return card.scenario;
  if ('bugTitle' in card && card.bugTitle) return card.bugTitle;
  return card.type;
}

export const LessonDeckScreen: React.FC<Props> = ({ lesson, onExit }) => {
  const [cards, setCards] = useState<LessonCard[]>(lesson.cards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(sounds.getMuted());
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const seenTitlesRef = useRef<Set<string>>(new Set());

  // Track initial card titles
  useEffect(() => {
    lesson.cards.forEach((c) => {
      seenTitlesRef.current.add(getCardTitle(c));
    });
  }, [lesson]);

  const fetchNextBatch = useCallback(async () => {
    if (isFetchingMore) return;
    setIsFetchingMore(true);

    try {
      const seenArray = Array.from(seenTitlesRef.current);
      const newCards = await fetchMoreCards(lesson.topic, lesson.difficulty, seenArray);

      if (newCards && newCards.length > 0) {
        newCards.forEach((c) => seenTitlesRef.current.add(getCardTitle(c)));
        setCards((prev) => [...prev, ...newCards]);
      }
    } catch (err) {
      console.warn('Error lazy loading questions:', err);
    } finally {
      setIsFetchingMore(false);
    }
  }, [isFetchingMore, lesson.topic, lesson.difficulty]);

  // Check pre-fetching trigger
  const checkPreFetch = useCallback((index: number, currentCardsCount: number) => {
    if (currentCardsCount - index <= 2 && !isFetchingMore) {
      fetchNextBatch();
    }
  }, [isFetchingMore, fetchNextBatch]);

  // Pre-fetch check on index change
  useEffect(() => {
    checkPreFetch(currentIndex, cards.length);
  }, [currentIndex, cards.length, checkPreFetch]);

  const currentCard: LessonCard | undefined = cards[currentIndex];

  const handleNext = () => {
    if (currentIndex < cards.length - 1) {
      sounds.playSwipe();
      const nextIdx = currentIndex + 1;
      setCurrentIndex(nextIdx);
      checkPreFetch(nextIdx, cards.length);
    } else {
      // User reached the end before background fetch finished
      sounds.playTap();
      if (!isFetchingMore) {
        fetchNextBatch();
      }
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
      case 'debug_session':
        return <DebugSessionCard data={card} />;
      default:
        return <div>Question stream card</div>;
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        padding: '16px 20px 24px 20px',
        gap: '14px',
        position: 'relative'
      }}
    >
      {/* Top Header Bar */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <button
            onClick={onExit}
            aria-label="Exit session"
            style={{
              background: 'var(--chip-bg)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '50%',
              width: '36px',
              height: '36px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>

          {/* Topic Badge & Infinite Stream Indicator */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <div
              style={{
                fontSize: '12px',
                fontWeight: 800,
                color: 'var(--badge-indigo-text)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                background: 'var(--badge-indigo-bg)',
                padding: '5px 14px',
                borderRadius: '14px',
                border: '1px solid var(--badge-indigo-border)',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <span>{lesson.topic}</span>
              <span style={{ opacity: 0.6 }}>•</span>
              <span style={{ color: 'var(--accent-primary)', display: 'flex', alignItems: 'center' }}>
                <InfinityIcon size={13} />
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              onClick={() => {
                sounds.playTap();
                setIsChatOpen(true);
              }}
              aria-label="Ask AI Assistant"
              style={{
                background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: '18px',
                padding: '6px 12px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                color: 'var(--accent-primary, #6366f1)',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(99, 102, 241, 0.15)',
                transition: 'all 0.2s ease'
              }}
            >
              <Bot size={16} />
              <span>Ask AI</span>
              <Sparkles size={12} style={{ color: '#a855f7' }} />
            </button>

            <ThemeToggle />

            <button
              onClick={toggleAudio}
              aria-label="Toggle sound"
              style={{
                background: 'var(--chip-bg)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '50%',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: isMuted ? 'var(--text-dim)' : 'var(--accent-emerald)',
                cursor: 'pointer'
              }}
            >
              {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
            </button>
          </div>
        </div>

        {/* Dynamic Card Stream Header Bar */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 4px' }}>
          <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Question {currentIndex + 1}</span>
            <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
              (Infinite Feed)
            </span>
          </div>

          <AnimatePresence>
            {isFetchingMore && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '11px',
                  fontWeight: 600,
                  color: 'var(--accent-primary)',
                  background: 'var(--badge-indigo-bg)',
                  padding: '3px 10px',
                  borderRadius: '12px',
                  border: '1px solid var(--badge-indigo-border)'
                }}
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 1.2, ease: 'linear' }}
                  style={{ display: 'flex' }}
                >
                  <Loader2 size={12} />
                </motion.div>
                <span>Fetching next questions...</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Card Deck Viewport */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        {currentCard ? (
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
              className="glass-card scrollable-card"
              style={{
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                position: 'absolute',
                top: 0,
                left: 0,
                overflowY: 'auto',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              {renderCardContent(currentCard)}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              color: 'var(--text-muted)'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              style={{ color: 'var(--accent-primary)' }}
            >
              <Loader2 size={32} />
            </motion.div>
            <div style={{ fontSize: '14px', fontWeight: 600 }}>Loading next question...</div>
          </div>
        )}
      </div>

      {/* Bottom Action / Navigation Bar */}
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
          <span>Continue</span>
          <ArrowRight size={18} />
        </motion.button>
      </div>

      {/* AI Context-Aware Chatbot Modal */}
      {currentCard && (
        <CardChatModal
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          card={currentCard}
          lessonTopic={lesson.topic}
          difficulty={lesson.difficulty}
        />
      )}
    </div>
  );
};
