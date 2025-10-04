import type { Comment, Alert, DashboardData } from '@/types';

// Mock comments for SupportPage
export const mockComments: Comment[] = [
  {
    id: 1,
    platform: 'Facebook',
    username: 'Олексій К.',
    avatar: '👨‍💼',
    text: 'Дуже погана якість доставки! Замовляв на понеділок, а привезли тільки в четвер. Кур\'єр був грубий і не знав де знаходиться мій будинок. Гроші витрачені дарма!',
    timestamp: '2 години тому',
    sentiment: 'negative',
    priority: 'high',
    likes: 12,
    replies: 3,
    url: 'https://facebook.com/post/123'
  },
  {
    id: 2,
    platform: 'Instagram',
    username: 'Марія С.',
    avatar: '👩‍🎨',
    text: 'Чудовий сервіс! Швидко, якісно, приємні ціни. Рекомендую всім друзям. Особливо подобається мобільний додаток - дуже зручний інтерфейс 😍',
    timestamp: '4 години тому',
    sentiment: 'positive',
    priority: 'low',
    likes: 28,
    replies: 1,
    url: 'https://instagram.com/post/456'
  },
  {
    id: 3,
    platform: 'TrustPilot',
    username: 'Андрій П.',
    avatar: '👨‍🔧',
    text: 'Додаток постійно крашиться при спробі оплатити замовлення. Вже третій день не можу завершити покупку. Підтримка не відповідає на мої звернення.',
    timestamp: '6 годин тому',
    sentiment: 'negative',
    priority: 'high',
    likes: 8,
    replies: 0,
    url: 'https://trustpilot.com/review/789'
  },
  {
    id: 4,
    platform: 'Reddit',
    username: 'u/tech_guy_ua',
    avatar: '👨‍💻',
    text: 'Чи хтось знає, чому цей сервіс так довго обробляє платежі? Вже 2 дні статус "в обробці". Це нормально?',
    timestamp: '8 годин тому',
    sentiment: 'neutral',
    priority: 'medium',
    likes: 5,
    replies: 7,
    url: 'https://reddit.com/r/ukraine/comments/abc123'
  },
  {
    id: 5,
    platform: 'App Store',
    username: 'Користувач iOS',
    avatar: '📱',
    text: 'Оновлення зламало весь інтерфейс. Тепер не можу знайти свої замовлення. Коли виправлять?',
    timestamp: '12 годин тому',
    sentiment: 'negative',
    priority: 'high',
    likes: 15,
    replies: 2,
    url: 'https://apps.apple.com/app/reviews'
  }
];

// Mock alerts for SupportPage
export const mockAlerts: Alert[] = [
  {
    id: 1,
    type: 'critical',
    title: 'Сплеск негативних відгуків про доставку',
    description: 'За останні 2 години +300% негативних коментарів про проблеми з доставкою',
    platform: 'Facebook, Instagram',
    keywords: ['доставка', 'затримка', 'кур\'єр'],
    count: 23,
    trend: 'up'
  },
  {
    id: 2,
    type: 'warning',
    title: 'Проблеми з мобільним додатком',
    description: 'Збільшення скарг на краші додатку на 150%',
    platform: 'App Store, Google Play',
    keywords: ['краш', 'crash', 'не працює'],
    count: 18,
    trend: 'up'
  },
  {
    id: 3,
    type: 'info',
    title: 'Питання про оплату',
    description: 'Збільшення питань про статус платежів',
    platform: 'Reddit, TrustPilot',
    keywords: ['оплата', 'платіж', 'статус'],
    count: 12,
    trend: 'stable'
  }
];

// Mock dashboard data
export const mockDashboardData: DashboardData = {
  reputationScore: 78,
  totalMentions: 1247,
  sentiment: {
    positive: 45,
    negative: 23,
    neutral: 32
  },
  sources: {
    'Google SERP': 342,
    'App Store': 189,
    'Google Play': 156,
    'TrustPilot': 98,
    'Facebook': 234,
    'Instagram': 178,
    'Reddit': 45,
    'Quora': 23,
    'Форуми': 22
  },
  intentClassification: {
    'Скарги': 28,
    'Питання': 35,
    'Рекомендації': 25,
    'Нейтральні': 12
  },
  trendingTopics: [
    { topic: 'Якість продукту', mentions: 89, trend: 'up' },
    { topic: 'Ціна', mentions: 67, trend: 'down' },
    { topic: 'Підтримка', mentions: 45, trend: 'up' },
    { topic: 'Доставка', mentions: 34, trend: 'stable' },
    { topic: 'Інтерфейс', mentions: 23, trend: 'up' }
  ],
  priorityIssues: [
    {
      id: 1,
      title: 'Проблеми з доставкою в регіоні Київ',
      severity: 'high',
      mentions: 45,
      trend: 'up',
      source: 'TrustPilot',
      sentiment: 'negative'
    },
    {
      id: 2,
      title: 'Повільна робота мобільного додатку',
      severity: 'medium',
      mentions: 32,
      trend: 'stable',
      source: 'App Store',
      sentiment: 'negative'
    },
    {
      id: 3,
      title: 'Відсутність української мови',
      severity: 'medium',
      mentions: 28,
      trend: 'up',
      source: 'Reddit',
      sentiment: 'neutral'
    }
  ],
  dailyStats: [
    { date: '2024-01-01', mentions: 45, sentiment: 0.7 },
    { date: '2024-01-02', mentions: 52, sentiment: 0.6 },
    { date: '2024-01-03', mentions: 38, sentiment: 0.8 },
    { date: '2024-01-04', mentions: 67, sentiment: 0.5 },
    { date: '2024-01-05', mentions: 43, sentiment: 0.7 },
    { date: '2024-01-06', mentions: 58, sentiment: 0.6 },
    { date: '2024-01-07', mentions: 41, sentiment: 0.8 }
  ]
};
