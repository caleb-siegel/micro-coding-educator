import React from 'react';
import { motion } from 'framer-motion';
import type { HookCardData } from '../../types/lesson';
import { Server, Sparkles, Zap, TrendingUp, Cpu, ShieldCheck } from 'lucide-react';
import { CardLearningSupport } from '../CardLearningSupport';

interface Props {
  data: HookCardData;
}

const ICON_MAP: Record<string, React.ElementType> = {
  Server,
  Sparkles,
  Zap,
  TrendingUp,
  Cpu,
  ShieldCheck
};

export const HookCard: React.FC<Props> = ({ data }) => {
  const IconComponent = data.iconName ? ICON_MAP[data.iconName] || Sparkles : Sparkles;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'center', gap: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4 }}
          style={{
            width: '52px',
            height: '52px',
            borderRadius: '16px',
            background: 'var(--badge-indigo-bg)',
            border: '1px solid var(--badge-indigo-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--badge-indigo-text)'
          }}
        >
          <IconComponent size={26} />
        </motion.div>

        {data.statBadge && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            style={{
              padding: '5px 12px',
              borderRadius: '20px',
              background: 'var(--badge-emerald-bg)',
              border: '1px solid var(--badge-emerald-border)',
              color: 'var(--badge-emerald-text)',
              fontSize: '12px',
              fontWeight: 700
            }}
          >
            {data.statBadge.label}: {data.statBadge.value}
          </motion.div>
        )}
      </div>

      <motion.h2
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        style={{
          fontSize: '22px',
          fontWeight: 800,
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
          color: 'var(--text-main)'
        }}
      >
        "{data.headline}"
      </motion.h2>

      <motion.p
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        style={{
          fontSize: '14px',
          lineHeight: 1.55,
          color: 'var(--text-muted)'
        }}
      >
        {data.body}
      </motion.p>

      {/* ELI5 / Learning Support */}
      <CardLearningSupport hint={data.hint} simpleExplanation={data.simpleExplanation} isAnswered={true} />
    </div>
  );
};
