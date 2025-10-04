import type { Comment, Alert, DashboardData, KeywordAlert, BillingRecord } from '@/types';

// Mock comments for SupportPage
export const mockComments: Comment[] = [
  {
    id: 1,
    platform: 'Facebook',
    username: 'Олексій К.',
    avatar: '👨‍💼',
    text: 'Дуже погана якість доставки! Замовляв на понеділок, а привезли тільки в четвер. Кур\'єр був грубий і не знав де знаходиться мій будинок. Гроші витрачені дарма!',
    highlightedKeywords: ['доставка', 'кур\'єр'],
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
    highlightedKeywords: ['додаток', 'інтерфейс'],
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
    highlightedKeywords: ['додаток', 'оплатити', 'підтримка'],
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
    highlightedKeywords: ['платежі', 'обробці'],
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
    highlightedKeywords: ['інтерфейс', 'замовлення'],
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

// Mock keyword alerts
export const mockKeywordAlerts: KeywordAlert[] = [
  {
    id: 1,
    keyword: 'доставка',
    count: 23,
    trend: 'up',
    severity: 'high',
    lastMention: '2 години тому',
    comments: [
      {
        id: 1,
        platform: 'Facebook',
        username: 'Олексій К.',
        avatar: '👨‍💼',
        text: 'Дуже погана якість доставки! Замовляв на понеділок, а привезли тільки в четвер. Кур\'єр був грубий і не знав де знаходиться мій будинок.',
        timestamp: '2 години тому',
        sentiment: 'negative',
        priority: 'high',
        likes: 12,
        replies: 3,
        url: 'https://facebook.com/post/123',
        highlightedKeywords: ['доставка', 'кур\'єр']
      },
      {
        id: 6,
        platform: 'Instagram',
        username: 'Катя М.',
        avatar: '👩‍💼',
        text: 'Доставка затрималась на 3 дні. Нарешті привезли, але товар пошкоджений. Дуже розчарована.',
        timestamp: '4 години тому',
        sentiment: 'negative',
        priority: 'high',
        likes: 8,
        replies: 1,
        url: 'https://instagram.com/post/789',
        highlightedKeywords: ['доставка']
      }
    ]
  },
  {
    id: 2,
    keyword: 'додаток',
    count: 18,
    trend: 'up',
    severity: 'high',
    lastMention: '6 годин тому',
    comments: [
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
        url: 'https://instagram.com/post/456',
        highlightedKeywords: ['додаток', 'інтерфейс']
      },
      {
        id: 3,
        platform: 'TrustPilot',
        username: 'Андрій П.',
        avatar: '👨‍🔧',
        text: 'Додаток постійно крашиться при спробі оплатити замовлення. Вже третій день не можу завершити покупку.',
        timestamp: '6 годин тому',
        sentiment: 'negative',
        priority: 'high',
        likes: 8,
        replies: 0,
        url: 'https://trustpilot.com/review/789',
        highlightedKeywords: ['додаток', 'оплатити']
      }
    ]
  },
  {
    id: 3,
    keyword: 'інтерфейс',
    count: 15,
    trend: 'stable',
    severity: 'medium',
    lastMention: '12 годин тому',
    comments: [
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
        url: 'https://instagram.com/post/456',
        highlightedKeywords: ['додаток', 'інтерфейс']
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
        url: 'https://apps.apple.com/app/reviews',
        highlightedKeywords: ['інтерфейс', 'замовлення']
      }
    ]
  },
  {
    id: 4,
    keyword: 'оплатити',
    count: 12,
    trend: 'up',
    severity: 'medium',
    lastMention: '6 годин тому',
    comments: [
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
        url: 'https://trustpilot.com/review/789',
        highlightedKeywords: ['додаток', 'оплатити', 'підтримка']
      }
    ]
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

// Mock billing history
export const mockBillingHistory: BillingRecord[] = [
  {
    id: '1',
    date: '2024-12-29',
    requests: 100,
    cost: 5.50,
    description: 'Парсинг коментарів з Facebook та Instagram',
    type: 'parsing'
  },
  {
    id: '2',
    date: '2024-12-28',
    requests: 75,
    cost: 4.25,
    description: 'API запити для аналізу тональності',
    type: 'api'
  },
  {
    id: '3',
    date: '2024-12-27',
    requests: 120,
    cost: 6.00,
    description: 'Експорт звітів та парсинг нових джерел',
    type: 'export'
  },
  {
    id: '4',
    date: '2024-12-26',
    requests: 85,
    cost: 4.75,
    description: 'Парсинг коментарів з Twitter та Reddit',
    type: 'parsing'
  },
  {
    id: '5',
    date: '2024-12-25',
    requests: 60,
    cost: 3.50,
    description: 'API запити для моніторингу ключових слів',
    type: 'api'
  },
  {
    id: '6',
    date: '2024-12-24',
    requests: 95,
    cost: 5.25,
    description: 'Парсинг відгуків з TrustPilot',
    type: 'parsing'
  },
  {
    id: '7',
    date: '2024-12-23',
    requests: 45,
    cost: 2.75,
    description: 'Експорт даних для аналізу',
    type: 'export'
  },
  {
    id: '8',
    date: '2024-12-22',
    requests: 110,
    cost: 6.25,
    description: 'Парсинг коментарів з усіх джерел',
    type: 'parsing'
  },
  {
    id: '9',
    date: '2024-12-21',
    requests: 70,
    cost: 4.00,
    description: 'API запити для оновлення метрик',
    type: 'api'
  },
  {
    id: '10',
    date: '2024-12-20',
    requests: 130,
    cost: 7.50,
    description: 'Парсинг нових згадок бренду',
    type: 'parsing'
  },
  {
    id: '11',
    date: '2024-12-19',
    requests: 55,
    cost: 3.25,
    description: 'Експорт звітів за тиждень',
    type: 'export'
  },
  {
    id: '12',
    date: '2024-12-18',
    requests: 90,
    cost: 5.00,
    description: 'Парсинг коментарів з форумів',
    type: 'parsing'
  },
  {
    id: '13',
    date: '2024-12-17',
    requests: 65,
    cost: 3.75,
    description: 'API запити для аналізу трендів',
    type: 'api'
  },
  {
    id: '14',
    date: '2024-12-16',
    requests: 105,
    cost: 5.75,
    description: 'Парсинг відгуків з Google Play',
    type: 'parsing'
  },
  {
    id: '15',
    date: '2024-12-15',
    requests: 80,
    cost: 4.50,
    description: 'Експорт даних для презентації',
    type: 'export'
  },
  {
    id: '16',
    date: '2024-12-14',
    requests: 95,
    cost: 5.25,
    description: 'Парсинг коментарів з LinkedIn',
    type: 'parsing'
  },
  {
    id: '17',
    date: '2024-12-13',
    requests: 65,
    cost: 3.75,
    description: 'API запити для аналізу конкурентів',
    type: 'api'
  },
  {
    id: '18',
    date: '2024-12-12',
    requests: 140,
    cost: 8.00,
    description: 'Парсинг відгуків з всіх джерел',
    type: 'parsing'
  },
  {
    id: '19',
    date: '2024-12-11',
    requests: 50,
    cost: 3.00,
    description: 'Експорт звітів для клієнта',
    type: 'export'
  },
  {
    id: '20',
    date: '2024-12-10',
    requests: 110,
    cost: 6.25,
    description: 'Парсинг коментарів з YouTube',
    type: 'parsing'
  },
  {
    id: '21',
    date: '2024-12-09',
    requests: 75,
    cost: 4.25,
    description: 'API запити для моніторингу трендів',
    type: 'api'
  },
  {
    id: '22',
    date: '2024-12-08',
    requests: 125,
    cost: 7.00,
    description: 'Парсинг згадок з новинних сайтів',
    type: 'parsing'
  },
  {
    id: '23',
    date: '2024-12-07',
    requests: 40,
    cost: 2.50,
    description: 'Експорт даних для звіту',
    type: 'export'
  },
  {
    id: '24',
    date: '2024-12-06',
    requests: 85,
    cost: 4.75,
    description: 'API запити для аналізу настроїв',
    type: 'api'
  },
  {
    id: '25',
    date: '2024-12-05',
    requests: 160,
    cost: 9.00,
    description: 'Парсинг коментарів з TikTok',
    type: 'parsing'
  },
  {
    id: '26',
    date: '2024-12-04',
    requests: 55,
    cost: 3.25,
    description: 'Експорт метрик за місяць',
    type: 'export'
  },
  {
    id: '27',
    date: '2024-12-03',
    requests: 100,
    cost: 5.50,
    description: 'Парсинг відгуків з Amazon',
    type: 'parsing'
  },
  {
    id: '28',
    date: '2024-12-02',
    requests: 70,
    cost: 4.00,
    description: 'API запити для оновлення дашборду',
    type: 'api'
  },
  {
    id: '29',
    date: '2024-12-01',
    requests: 90,
    cost: 5.00,
    description: 'Парсинг новорічних згадок бренду',
    type: 'parsing'
  },
  {
    id: '30',
    date: '2024-11-30',
    requests: 45,
    cost: 2.75,
    description: 'Експорт підсумкового звіту за рік',
    type: 'export'
  },
  {
    id: '31',
    date: '2024-11-29',
    requests: 115,
    cost: 6.50,
    description: 'Парсинг коментарів з Instagram Stories',
    type: 'parsing'
  },
  {
    id: '32',
    date: '2024-11-28',
    requests: 80,
    cost: 4.50,
    description: 'API запити для аналізу конкурентів',
    type: 'api'
  },
  {
    id: '33',
    date: '2024-11-27',
    requests: 135,
    cost: 7.75,
    description: 'Парсинг відгуків з Google Maps',
    type: 'parsing'
  },
  {
    id: '34',
    date: '2024-11-26',
    requests: 60,
    cost: 3.50,
    description: 'Експорт даних для презентації',
    type: 'export'
  },
  {
    id: '35',
    date: '2024-11-25',
    requests: 105,
    cost: 5.75,
    description: 'Парсинг коментарів з різдвяних постів',
    type: 'parsing'
  }
];
