export type KnownTopic =
  | 'System Design'
  | 'AI & LLMs'
  | 'Backend'
  | 'Product'
  | 'Frontend'
  | 'DevOps'
  | 'Security'
  | 'Surprise Me';

export type Topic = KnownTopic | (string & {});

export type Difficulty = 'Foundational' | 'Intermediate' | 'Staff Level';

export type CardType =
  | 'hook'
  | 'multiple_choice'
  | 'drag_to_order'
  | 'match_pairs'
  | 'spot_the_mistake'
  | 'choose_the_tradeoff'
  | 'build_the_system'
  | 'predict_what_happens'
  | 'before_vs_after'
  | 'guess_the_metric'
  | 'timeline'
  | 'debug_session'
  | 'takeaway';

export interface BaseCard {
  id: string;
  type: CardType;
  title?: string;
  subtitle?: string;
  category?: string;
  difficulty?: Difficulty;
  hint?: string;
  simpleExplanation?: string;
}

export interface HookCardData extends BaseCard {
  type: 'hook';
  headline: string;
  body: string;
  statBadge?: { label: string; value: string };
  iconName?: string;
}

export interface MultipleChoiceCardData extends BaseCard {
  type: 'multiple_choice';
  question: string;
  options: {
    id: string;
    text: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface DragToOrderCardData extends BaseCard {
  type: 'drag_to_order';
  instruction: string;
  items: {
    id: string;
    label: string;
    sublabel?: string;
    correctIndex: number;
  }[];
  explanation: string;
}

export interface MatchPairsCardData extends BaseCard {
  type: 'match_pairs';
  instruction: string;
  pairs: {
    id: string;
    left: string;
    right: string;
  }[];
  explanation: string;
}

export interface SpotTheMistakeCardData extends BaseCard {
  type: 'spot_the_mistake';
  instruction: string;
  question?: string;
  contextCodeOrDiagram: {
    type: 'code' | 'diagram';
    content: string;
    nodes?: { id: string; label: string; isMistake: boolean; subtext?: string }[];
    codeLines?: { line: number; text: string; isMistake: boolean }[];
  };
  explanation: string;
}

export interface ChooseTheTradeoffCardData extends BaseCard {
  type: 'choose_the_tradeoff';
  scenario: string;
  options: {
    id: string;
    title: string;
    pros: string[];
    cons: string[];
    isBestChoice: boolean;
    why: string;
  }[];
}

export interface BuildTheSystemCardData extends BaseCard {
  type: 'build_the_system';
  task: string;
  availableBlocks: { id: string; label: string; icon: string }[];
  targetSlots: { slotId: string; label: string; correctBlockId: string }[];
  explanation: string;
}

export interface PredictWhatHappensCardData extends BaseCard {
  type: 'predict_what_happens';
  scenario: string;
  metricLabel: string;
  minVal: number;
  maxVal: number;
  unit: string;
  outcomes: {
    threshold: number;
    title: string;
    status: 'success' | 'warning' | 'critical';
    description: string;
    diagramState: string;
  }[];
  targetValue: number;
  explanation: string;
}

export interface BeforeVsAfterCardData extends BaseCard {
  type: 'before_vs_after';
  question: string;
  optionA: {
    id: string;
    label: string;
    diagramType: string;
    metrics: { label: string; value: string }[];
    isBetter: boolean;
  };
  optionB: {
    id: string;
    label: string;
    diagramType: string;
    metrics: { label: string; value: string }[];
    isBetter: boolean;
  };
  explanation: string;
}

export interface GuessTheMetricCardData extends BaseCard {
  type: 'guess_the_metric';
  metricTitle: string;
  chartData: { time: string; value: number; spike?: boolean }[];
  question: string;
  choices: {
    id: string;
    label: string;
    isCorrect: boolean;
    explanation: string;
  }[];
}

export interface TimelineCardData extends BaseCard {
  type: 'timeline';
  title: string;
  instruction: string;
  events: {
    id: string;
    stepNumber?: number;
    title: string;
    description: string;
    correctOrder: number;
  }[];
  explanation: string;
}

export interface DebugSessionCardData extends BaseCard {
  type: 'debug_session';
  bugTitle: string;
  symptom: string;
  stackTraceOrLog?: string;
  codeSnippet: {
    filename?: string;
    language?: string;
    lines: {
      lineNumber: number;
      code: string;
      isBuggyLine: boolean;
    }[];
  };
  fixOptions?: {
    id: string;
    patchCode: string;
    isCorrectFix: boolean;
    explanation: string;
  }[];
  explanation: string;
}

export interface TakeawayCardData extends BaseCard {
  type: 'takeaway';
  oneSentenceSummary: string;
  keyInsights: string[];
  suggestedNextTopic?: Topic;
}

export type LessonCard =
  | HookCardData
  | MultipleChoiceCardData
  | DragToOrderCardData
  | MatchPairsCardData
  | SpotTheMistakeCardData
  | ChooseTheTradeoffCardData
  | BuildTheSystemCardData
  | PredictWhatHappensCardData
  | BeforeVsAfterCardData
  | GuessTheMetricCardData
  | TimelineCardData
  | DebugSessionCardData
  | TakeawayCardData;

export interface Lesson {
  id: string;
  title: string;
  topic: Topic;
  difficulty: Difficulty;
  durationMinutes?: number;
  subtitle: string;
  cards: LessonCard[];
}

