export type ScaleValue = 1 | 2 | 3 | 4 | 5;

export type ScaleOption = {
  value: ScaleValue;
  label: string;
};

export type Parameter = {
  id: string;
  title: string;
  prompt: string;
  options: ScaleOption[];
};

export type Dimension = {
  id: string;
  emoji: string;
  title: string;
  blurb: string;
  accent: string;
  parameters: Parameter[];
};

function scale(
  one: string,
  two: string,
  three: string,
  four: string,
  five: string,
): ScaleOption[] {
  return [
    { value: 1, label: one },
    { value: 2, label: two },
    { value: 3, label: three },
    { value: 4, label: four },
    { value: 5, label: five },
  ];
}

export const DIMENSIONS: Dimension[] = [
  {
    id: 'leadership',
    emoji: '🌟',
    title: 'Leadership Style & Vibes',
    blurb: 'How they steer the ship and motivate the crew.',
    accent: '#FF4D6D',
    parameters: [
      {
        id: 'leadership-vision',
        title: 'Vision Clarity',
        prompt: 'How well do they set the path?',
        options: scale(
          'Lost in Space',
          'Foggy windshield',
          'GPS is recalculating',
          'Clear skies ahead',
          'Ultimate oracle',
        ),
      },
      {
        id: 'leadership-crisis',
        title: 'Crisis Management',
        prompt: 'How do they handle fires?',
        options: scale(
          'Running around screaming',
          'Sweating through the suit',
          'Keeping it together outwardly',
          'Cool under pressure',
          'The ultimate firefighter',
        ),
      },
      {
        id: 'leadership-freedom',
        title: 'Micromanager vs. Freedom Fighter',
        prompt: 'Do they let you breathe?',
        options: scale(
          'Hovercraft parent',
          'Frequent checker-in',
          'Balanced guide',
          'Hands-off supporter',
          'Autonomous paradise',
        ),
      },
      {
        id: 'leadership-inclusivity',
        title: 'Inclusivity & Equity',
        prompt: 'Does everyone get a seat?',
        options: scale(
          'V.I.P. club only',
          'Select favorites',
          'Standard invite list',
          'Welcoming committee',
          'True open-door champion',
        ),
      },
      {
        id: 'leadership-flexibility',
        title: 'Strategic Flexibility',
        prompt: 'Can they pivot when plans fail?',
        options: scale(
          'Stubborn as a brick',
          'Slow to turn',
          'Adapts when forced',
          'Agile switcher',
          'Parkour master',
        ),
      },
    ],
  },
  {
    id: 'communication',
    emoji: '💬',
    title: 'Communication Style',
    blurb: 'Day-to-day interactions, emails, and meetings.',
    accent: '#5B3FFF',
    parameters: [
      {
        id: 'communication-email',
        title: 'Email Clarity',
        prompt: 'Are their written briefs understandable?',
        options: scale(
          'Hieroglyphics',
          'Word salad',
          'Standard corporate speak',
          'Clear and concise',
          'Absolute poetry',
        ),
      },
      {
        id: 'communication-response',
        title: 'Slack / Ping Response Time',
        prompt: 'How fast do they reply?',
        options: scale(
          'Ghost town',
          'Next business day',
          'Standard few hours',
          'Quick texter',
          'Lightning speed',
        ),
      },
      {
        id: 'communication-meetings',
        title: 'Meeting Efficiency',
        prompt: 'Do their meetings make sense?',
        options: scale(
          'Could have been an email',
          'Rambling whiteboard session',
          'Hits the main points',
          'Sharp and structured',
          'Finishes 10 minutes early',
        ),
      },
      {
        id: 'communication-approachability',
        title: 'Approachability',
        prompt: 'How scary are they to talk to?',
        options: scale(
          "Ice dragon's lair",
          'Intimidating presence',
          'Politely professional',
          'Easy to chat with',
          'Coffee buddy status',
        ),
      },
      {
        id: 'communication-listening',
        title: 'Active Listening',
        prompt: 'Do they actually hear you?',
        options: scale(
          'Nodding while typing',
          'Waiting for their turn',
          'Processing the words',
          'Deeply engaged',
          'Mind reader',
        ),
      },
    ],
  },
  {
    id: 'feedback',
    emoji: '📋',
    title: 'Feedback Style',
    blurb: 'How they deliver critique — and how they take it.',
    accent: '#F5B400',
    parameters: [
      {
        id: 'feedback-delivery',
        title: 'Delivery Method',
        prompt: 'How does the critique feel?',
        options: scale(
          'Sledgehammer to the ego',
          'Awkwardly blunt',
          'Standard compliment sandwich',
          'Constructive and encouraging',
          'Masterful growth coach',
        ),
      },
      {
        id: 'feedback-frequency',
        title: 'Frequency',
        prompt: 'How often do you hear from them?',
        options: scale(
          'Annual surprise party',
          'Only when things break',
          'Occasional 1-on-1s',
          'Steady flow',
          'Real-time alignment',
        ),
      },
      {
        id: 'feedback-actionability',
        title: 'Actionability',
        prompt: 'Can you actually use the advice?',
        options: scale(
          '“Just do better”',
          'Vague suggestions',
          'Standard goals',
          'Clear next steps',
          'Detailed blueprint',
        ),
      },
      {
        id: 'feedback-credit',
        title: 'Credit Allocation',
        prompt: 'Who gets the applause?',
        options: scale(
          'Spotlight thief',
          'Mentions the team casually',
          'Shares the stage equally',
          'Shines light on you',
          'Ultimate hype person',
        ),
      },
      {
        id: 'feedback-reception',
        title: 'Reception to Feedback',
        prompt: 'How do they take your critique?',
        options: scale(
          'Immediate defensive wall',
          'Polite smile, zero change',
          'Listens and considers',
          'Actively tries to adjust',
          'Welcomes it with open arms',
        ),
      },
    ],
  },
  {
    id: 'personality',
    emoji: '🧠',
    title: 'Personality & Workspace Vibes',
    blurb: 'The human element and the energy they bring to the floor.',
    accent: '#12B5A0',
    parameters: [
      {
        id: 'personality-empathy',
        title: 'Empathy & Compassion',
        prompt: 'Do they treat you like a person?',
        options: scale(
          'Cold corporate robot',
          'Mechanically polite',
          'Shows basic concern',
          'Truly understanding',
          'Absolute saint',
        ),
      },
      {
        id: 'personality-humor',
        title: 'Sense of Humor',
        prompt: 'Can they take or make a joke?',
        options: scale(
          'Total funeral vibes',
          'Forced dry chuckle',
          'Chuckles at safe jokes',
          'Genuinely funny',
          'Stand-up comedian level',
        ),
      },
      {
        id: 'personality-regulation',
        title: 'Emotional Regulation',
        prompt: 'Are they a mood wild card?',
        options: scale(
          'Volcano erupting daily',
          'Passive-aggressive rollercoaster',
          'Average human mood swings',
          'Steady and predictable',
          'Zen master calm',
        ),
      },
      {
        id: 'personality-balance',
        title: 'Work-Life Balance Respect',
        prompt: 'Do they respect the weekend?',
        options: scale(
          '11 PM “quick call” offender',
          'Hints at staying late',
          'Standard 9-to-5 expectations',
          'Protects your evenings',
          'Forces you to log off',
        ),
      },
      {
        id: 'personality-energy',
        title: 'Energy Infusion',
        prompt: 'What’s the room vibe when they walk in?',
        options: scale(
          'Energy vampire drain',
          'Slight collective sigh',
          'Neutral workspace hum',
          'Spark of motivation',
          'Power generator boost',
        ),
      },
    ],
  },
  {
    id: 'innovation',
    emoji: '🚀',
    title: 'Innovation & Risk Appetite',
    blurb: 'Fresh ideas, room to miss, and whether they fund the bet.',
    accent: '#FF7A1A',
    parameters: [
      {
        id: 'innovation-ideas',
        title: 'Idea Reception',
        prompt: 'How do they react to new pitches?',
        options: scale(
          'Direct shutdown',
          'Skeptical eyebrow',
          'Safe consideration',
          'Enthusiastic greenlight',
          'Ultimate co-conspirator',
        ),
      },
      {
        id: 'innovation-failure',
        title: 'Failure Tolerance',
        prompt: 'What happens when a project tanks?',
        options: scale(
          'Blame game championship',
          'Summary execution',
          'Awkward autopsy',
          'Practical debrief',
          'Fail-forward celebration',
        ),
      },
      {
        id: 'innovation-resources',
        title: 'Resource Allocation',
        prompt: 'Do they back ideas with actual budget and time?',
        options: scale(
          'Zero-budget dreams',
          'Scraping pennies',
          'Standard allocation',
          'Solid funding',
          'Infinite piggy bank',
        ),
      },
      {
        id: 'innovation-bureaucracy',
        title: 'Bureaucracy Busting',
        prompt: 'Do they cut through corporate red tape?',
        options: scale(
          'Red tape mummy',
          'Form filler',
          'Standard process follower',
          'Shortcut finder',
          'Corporate bulldozer',
        ),
      },
      {
        id: 'innovation-future',
        title: 'Future-Proofing',
        prompt: 'Are they keeping up with modern trends and tech?',
        options: scale(
          'Using dial-up internet',
          'Traditionalist',
          'Average adopter',
          'Modern tech fan',
          'Sci-fi pioneer',
        ),
      },
    ],
  },
  {
    id: 'growth',
    emoji: '🧗',
    title: 'Career Growth & Advocacy',
    blurb: 'How much they care about your trajectory and promotions.',
    accent: '#E23EC8',
    parameters: [
      {
        id: 'growth-hype',
        title: 'Internal Hype',
        prompt: 'Do they talk you up to higher-ups?',
        options: scale(
          'Secret keeper',
          'Quiet observer',
          'Performance reviewer',
          'Loud supporter',
          'Chief publicity officer',
        ),
      },
      {
        id: 'growth-stretch',
        title: 'Skill Stretch',
        prompt: 'Do they give you projects that force you to learn?',
        options: scale(
          'Comfort zone prison',
          'Routine repetitive tasks',
          'Occasional challenges',
          'Active development',
          'Growth catalyst',
        ),
      },
      {
        id: 'growth-mentorship',
        title: 'Mentorship',
        prompt: 'Do they actively coach you?',
        options: scale(
          'Ghost manager',
          'Advice on demand',
          'Standard career talker',
          'Dedicated teacher',
          'Yoda level master',
        ),
      },
      {
        id: 'growth-network',
        title: 'Networking Support',
        prompt: 'Do they connect you with key people?',
        options: scale(
          'Gatekeeping fortress',
          'Closed circle',
          'Open calendar',
          'Connector',
          'VIP pass provider',
        ),
      },
      {
        id: 'growth-promotion',
        title: 'Promotion Push',
        prompt: 'How hard do they fight for your raise or title?',
        options: scale(
          'Passive blocker',
          '“Next cycle” staller',
          'Moderate advocate',
          'Aggressive pusher',
          'Financial fairy godparent',
        ),
      },
    ],
  },
  {
    id: 'shielding',
    emoji: '🏰',
    title: 'Team Shielding & Politics',
    blurb: 'How well they protect the team from chaos and politics.',
    accent: '#2D6CFF',
    parameters: [
      {
        id: 'shielding-defense',
        title: 'Defending Mistakes',
        prompt: 'Do they stand up for you to clients and execs?',
        options: scale(
          'Bus throwing champion',
          'Backstepping bystander',
          'Neutral referee',
          'Shield wall',
          'Titanium fortress',
        ),
      },
      {
        id: 'shielding-scope',
        title: 'Scope Creep Guarding',
        prompt: 'Do they stop extra work from piling on?',
        options: scale(
          'Boundary-less funnel',
          'Yes-man filter',
          'Standard negotiator',
          'Guard dog',
          'Great Wall of China',
        ),
      },
      {
        id: 'shielding-politics',
        title: 'Political Navigation',
        prompt: 'How well do they handle upper management?',
        options: scale(
          'Politically clueless',
          'Nervous diplomat',
          'Tactical survivalist',
          'Smooth operator',
          'House of Cards master',
        ),
      },
      {
        id: 'shielding-resources',
        title: 'Resource Fighting',
        prompt: 'Do they fight to get the team tools and headcount?',
        options: scale(
          'Total surrender',
          'Quiet asking',
          'Standard request submitter',
          'Fierce negotiator',
          'Apex predator lobbyist',
        ),
      },
      {
        id: 'shielding-transparency',
        title: 'Rumor Transparency',
        prompt: 'Do they keep you informed of what is happening in the company?',
        options: scale(
          'Dark bunker vault',
          'Need-to-know basis',
          'Standard updates',
          'Open book',
          'Live ticker reporter',
        ),
      },
    ],
  },
];

export const QUESTION_COUNT = DIMENSIONS.reduce(
  (sum, dimension) => sum + dimension.parameters.length,
  0,
);

export type QuestionRef = {
  dimensionIndex: number;
  parameterIndex: number;
  dimension: Dimension;
  parameter: Parameter;
  globalIndex: number;
};

export function getQuestion(globalIndex: number): QuestionRef | null {
  if (globalIndex < 0) return null;
  let remaining = globalIndex;
  for (let dimensionIndex = 0; dimensionIndex < DIMENSIONS.length; dimensionIndex += 1) {
    const dimension = DIMENSIONS[dimensionIndex];
    if (remaining < dimension.parameters.length) {
      return {
        dimensionIndex,
        parameterIndex: remaining,
        dimension,
        parameter: dimension.parameters[remaining],
        globalIndex,
      };
    }
    remaining -= dimension.parameters.length;
  }
  return null;
}

export function isLastInDimension(question: QuestionRef): boolean {
  return question.parameterIndex === question.dimension.parameters.length - 1;
}

export function isFirstInDimension(question: QuestionRef): boolean {
  return question.parameterIndex === 0;
}
