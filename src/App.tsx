import { useState } from 'react';
import type { Topic, Difficulty, Lesson } from './types/lesson';
import { startPracticeSession } from './services/api';
import { HomeScreen } from './components/HomeScreen';
import { LessonDeckScreen } from './components/LessonDeckScreen';
import { ThemeProvider } from './context/ThemeContext';
import { Analytics } from '@vercel/analytics/react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Loader2, AlertCircle } from 'lucide-react';
import { sounds } from './utils/audio';

function AppContent() {
  const [activeScreen, setActiveScreen] = useState<'home' | 'lesson'>('home');
  const [currentLesson, setCurrentLesson] = useState<Lesson | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingTopic, setLoadingTopic] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleStartSession = async (topic: Topic, difficulty: Difficulty) => {
    setIsLoading(true);
    setLoadingTopic(topic);
    setErrorMessage(null);
    try {
      const lesson = await startPracticeSession(topic, difficulty);
      setCurrentLesson(lesson);
      setActiveScreen('lesson');
    } catch (err: any) {
      console.error('[App] Failed to load session:', err);
      setErrorMessage(err.message || 'Failed to access practice session.');
      sounds.playError();
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
    setErrorMessage(null);
    try {
      const lesson = await startPracticeSession(topic, 'Foundational');
      setCurrentLesson(lesson);
      setActiveScreen('lesson');
    } catch (err: any) {
      console.error('[App] Failed to load next topic session:', err);
      setErrorMessage(err.message || 'Failed to access practice session.');
      sounds.playError();
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
                Generating interactive cards via AI API
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Alert Dialog */}
      <AnimatePresence>
        {errorMessage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 60,
              background: 'rgba(0, 0, 0, 0.7)',
              backdropFilter: 'blur(12px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '24px'
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 10 }}
              style={{
                width: '100%',
                maxWidth: '400px',
                background: 'var(--bg-card)',
                borderRadius: '20px',
                border: '1px solid var(--border-subtle)',
                padding: '24px',
                boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
                position: 'relative'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '12px',
                    background: 'rgba(239, 68, 68, 0.15)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#ef4444'
                  }}
                >
                  <AlertCircle size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--text-main)' }}>
                    Data Unavailable
                  </h3>
                  <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Backend AI API Status Notice
                  </span>
                </div>
              </div>

              <div
                style={{
                  fontSize: '13px',
                  color: 'var(--text-muted)',
                  lineHeight: 1.5,
                  background: 'var(--chip-bg)',
                  padding: '12px',
                  borderRadius: '10px',
                  border: '1px solid var(--border-subtle)'
                }}
              >
                {errorMessage}
              </div>

              <button
                onClick={() => setErrorMessage(null)}
                className="tactile-btn tactile-btn-primary"
                style={{ width: '100%', padding: '12px' }}
              >
                Dismiss
              </button>
            </motion.div>
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
