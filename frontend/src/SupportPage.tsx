import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ArrowLeft, 
  MessageSquare, 
  Copy, 
  Send, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  User, 
  Calendar,
  ExternalLink,
  CheckCircle,
  XCircle,
  Zap,
  Shield,
  Heart,
  ThumbsUp,
  ThumbsDown
} from 'lucide-react';

interface Comment {
  id: number;
  platform: string;
  username: string;
  avatar: string;
  text: string;
  timestamp: string;
  sentiment: 'positive' | 'negative' | 'neutral';
  priority: 'high' | 'medium' | 'low';
  likes: number;
  replies: number;
  url: string;
}

function SupportPage() {
  const [selectedComment, setSelectedComment] = useState<Comment | null>(null);
  const [responseText, setResponseText] = useState('');
  const [responseStyle, setResponseStyle] = useState<'official' | 'friendly' | 'support'>('friendly');

  // Мокові дані коментарів
  const mockComments: Comment[] = [
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

  // Система раннього попередження
  const warningAlerts = [
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

  // Конструктор відповідей
  const generateResponse = (comment: Comment, style: string) => {
    const templates = {
      official: `Шановний(а) ${comment.username},

Дякуємо за ваш відгук. Ми серйозно ставимося до вашої скарги та вживаємо всіх необхідних заходів для вирішення цієї проблеми.

Наша команда підтримки зв'яжеться з вами найближчим часом для детального обговорення ситуації.

З повагою,
Команда BrandDefender`,

      friendly: `Привіт, ${comment.username}! 👋

Дякуємо, що поділилися своїм досвідом з нами. Ми розуміємо ваше занепокоєння і обов'язково розберемося з цією ситуацією.

Наша команда вже працює над вирішенням цієї проблеми. Ми зв'яжемося з вами найближчим часом з детальним поясненням.

Якщо у вас є додаткові питання, будь ласка, не соромтеся звертатися до нас!

З найкращими побажаннями,
Команда BrandDefender 💙`,

      support: `Доброго дня, ${comment.username}!

Дякуємо за звернення. Ми зафіксували вашу проблему та передали її відповідному відділу для негайного розгляду.

Для швидшого вирішення питання, будь ласка, надайте нам додаткову інформацію:
- Номер вашого замовлення
- Час виникнення проблеми
- Скріншот помилки (якщо є)

Наші спеціалісти зв'яжуться з вами протягом 2 годин.

Технічна підтримка BrandDefender`
    };

    return templates[style as keyof typeof templates] || templates.friendly;
  };

  const handleGenerateResponse = () => {
    if (selectedComment) {
      const response = generateResponse(selectedComment, responseStyle);
      setResponseText(response);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(responseText);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link 
                to="/dashboard"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Назад до дашборду
              </Link>
              <div className="flex items-center gap-3 ml-8">
                <MessageSquare className="w-8 h-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">Сапорт центр</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 text-sm text-gray-400">
                <Clock className="w-4 h-4" />
                Останнє оновлення: 2 хв тому
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Early Warning System */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Система раннього попередження
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {warningAlerts.map((alert) => (
              <div 
                key={alert.id} 
                className={`rounded-xl p-4 border ${
                  alert.type === 'critical' ? 'bg-red-500/10 border-red-500/30' :
                  alert.type === 'warning' ? 'bg-yellow-500/10 border-yellow-500/30' :
                  'bg-blue-500/10 border-blue-500/30'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className={`font-semibold ${
                    alert.type === 'critical' ? 'text-red-400' :
                    alert.type === 'warning' ? 'text-yellow-400' :
                    'text-blue-400'
                  }`}>
                    {alert.title}
                  </h3>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="w-4 h-4 text-red-400" />
                    <span className="text-red-400 text-sm font-bold">+{alert.count}</span>
                  </div>
                </div>
                <p className="text-gray-300 text-sm mb-2">{alert.description}</p>
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span>{alert.platform}</span>
                  <div className="flex gap-1">
                    {alert.keywords.map((keyword, index) => (
                      <span key={index} className="bg-slate-700 px-2 py-1 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Comments Feed */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Коментарі з соціальних мереж</h2>
            <div className="space-y-4">
              {mockComments.map((comment) => (
                <div 
                  key={comment.id}
                  className={`bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border cursor-pointer transition-all hover:scale-105 ${
                    selectedComment?.id === comment.id 
                      ? 'border-purple-500/50 bg-purple-500/10' 
                      : 'border-purple-500/20 hover:border-purple-500/50'
                  }`}
                  onClick={() => setSelectedComment(comment)}
                >
                  <div className="flex items-start gap-4">
                    <div className="text-2xl">{comment.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-white">{comment.username}</h3>
                        <span className="text-sm text-gray-400">{comment.platform}</span>
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          comment.priority === 'high' ? 'bg-red-500/20 text-red-400' :
                          comment.priority === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {comment.priority === 'high' ? 'Високий' : 
                           comment.priority === 'medium' ? 'Середній' : 'Низький'}
                        </span>
                      </div>
                      <p className="text-gray-300 mb-3">{comment.text}</p>
                      <div className="flex items-center justify-between text-sm text-gray-400">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {comment.timestamp}
                          </span>
                          <span className="flex items-center gap-1">
                            <ThumbsUp className="w-4 h-4" />
                            {comment.likes}
                          </span>
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-4 h-4" />
                            {comment.replies}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          {comment.sentiment === 'positive' && <ThumbsUp className="w-4 h-4 text-green-400" />}
                          {comment.sentiment === 'negative' && <ThumbsDown className="w-4 h-4 text-red-400" />}
                          {comment.sentiment === 'neutral' && <div className="w-4 h-4 bg-gray-400 rounded-full"></div>}
                          <a 
                            href={comment.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-purple-400 hover:text-purple-300"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Response Constructor */}
          <div>
            <h2 className="text-2xl font-bold text-white mb-6">Конструктор відповідей</h2>
            
            {selectedComment ? (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-2">Обраний коментар:</h3>
                  <div className="bg-slate-700/50 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg">{selectedComment.avatar}</span>
                      <span className="font-semibold text-white">{selectedComment.username}</span>
                      <span className="text-sm text-gray-400">({selectedComment.platform})</span>
                    </div>
                    <p className="text-gray-300">{selectedComment.text}</p>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Стиль відповіді:
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      onClick={() => setResponseStyle('official')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        responseStyle === 'official'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      Офіційний
                    </button>
                    <button
                      onClick={() => setResponseStyle('friendly')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        responseStyle === 'friendly'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      Дружній
                    </button>
                    <button
                      onClick={() => setResponseStyle('support')}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        responseStyle === 'support'
                          ? 'bg-purple-600 text-white'
                          : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
                      }`}
                    >
                      Техпідтримка
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <button
                    onClick={handleGenerateResponse}
                    className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all flex items-center justify-center gap-2"
                  >
                    <Zap className="w-4 h-4" />
                    Згенерувати відповідь
                  </button>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Текст відповіді:
                  </label>
                  <textarea
                    value={responseText}
                    onChange={(e) => setResponseText(e.target.value)}
                    className="w-full h-40 bg-slate-700 text-white p-4 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none resize-none"
                    placeholder="Тут з'явиться згенерована відповідь..."
                  />
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={copyToClipboard}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    disabled={!responseText}
                  >
                    <Copy className="w-4 h-4" />
                    Копіювати
                  </button>
                  <button
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
                    disabled={!responseText}
                  >
                    <Send className="w-4 h-4" />
                    Відправити
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 text-center">
                <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">Оберіть коментар</h3>
                <p className="text-gray-400">Натисніть на коментар зліва, щоб почати створювати відповідь</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SupportPage;
