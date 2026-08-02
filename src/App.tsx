import { useState } from 'react';
import type { Topic, Difficulty, Lesson } from './types/lesson';
import { fetchOrCreateLesson } from './services/api';
import { HomeScreen } from './components/HomeScreen';
import { LessonDeckScreen } from './components/LessonDeckScreen';
import { ThemeProvider } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';

function AppContent() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'lesson'>('home');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTopic, setLoadingTopic] = useState<string>('');

  const handleStartSession = async (topic: Topic, duration: number, difficulty: Difficulty) => {
    setIsLoading(true);
    setLoadingTopic(topic);
    try {
      const lesson = await fetchOrCreateLesson(topic, duration, difficulty);
      setCurrentLesson(lesson);
      setActiveScreen('lesson');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExitLesson = () => {
    setActiveScreen('home');
    setCurrentLesson(null);
  };

  const handleSelectNextTopic = async (topic: Topic) => {
    setIsLoading(true);
    setLoadingTopic(topic);
    try {
      const lesson = await fetchOrCreateLesson(topic, 5, 'Foundational');
      setCurrentLesson(lesson);
      setActiveScreen('lesson');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mobile-app-shell">
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 50,
              background: 'var(--modal-overlay)',
              backdropFilter: 'blur(16px)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
              padding: '24px',
              textAlign: 'center'
            }}
          >
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
              style={{ color: 'var(--accent-primary)' }}
            >
              <Loader2 size={36} />
            </motion.div>

            <div>
              <div
                style={{
                  fontSize: '16px',
                  fontWeight: 800,
                  color: 'var(--text-main)',
                  marginBottom: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px'
                }}
              >
                <Sparkles size={16} color="var(--accent-primary)" /> Crafting {loadingTopic} Challenge...
              </div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Building interactive system diagrams and tactile cards
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {activeScreen === 'home' && (
        <HomeScreen onStartSession={handleStartSession} />
      )}

      {activeScreen === 'lesson' && currentLesson && (
        <LessonDeckScreen
          lesson={currentLesson}
          onExit={handleExitLesson}
          onSelectNextTopic={handleSelectNextTopic}
        />
      )}
    </div>
  );
}

export function App() {
  return (
    <ThemeProvider>
      <AppContent />
      <Analytics />
    </ThemeProvider>
  );
}

export default App;
