import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, 
  TrendingUp, 
  TrendingDown, 
  MessageSquare, 
  AlertTriangle, 
  CheckCircle, 
  BarChart3, 
  PieChart, 
  Activity,
  Users,
  Calendar,
  Download,
  ArrowLeft
} from 'lucide-react';

function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');

  // Мокові дані для аналітики
  const mockData = {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link 
                to="/"
                className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                Назад до головної
              </Link>
              <div className="flex items-center gap-3 ml-8">
                <Shield className="w-8 h-8 text-purple-400" />
                <h1 className="text-2xl font-bold text-white">BrandDefender Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-gray-400" />
                <select 
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                  className="bg-slate-800 text-white px-3 py-1 rounded border border-purple-500/30"
                >
                  <option value="24h">Останні 24 години</option>
                  <option value="7d">Останні 7 днів</option>
                  <option value="30d">Останні 30 днів</option>
                  <option value="90d">Останні 90 днів</option>
                </select>
              </div>
              <Link 
                to="/sources"
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <MessageSquare className="w-4 h-4" />
                Джерела
              </Link>
              <Link 
                to="/kanban"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <MessageSquare className="w-4 h-4" />
                Kanban
              </Link>
              <Link 
                to="/support"
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <MessageSquare className="w-4 h-4" />
                Сапорт
              </Link>
              <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4" />
                Експорт
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Репутаційна оцінка</p>
                <p className="text-3xl font-bold text-white">{mockData.reputationScore}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">+5.2%</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
                <Shield className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Всього згадок</p>
                <p className="text-3xl font-bold text-white">{mockData.totalMentions.toLocaleString()}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">+12.3%</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                <MessageSquare className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Позитивні відгуки</p>
                <p className="text-3xl font-bold text-white">{mockData.sentiment.positive}%</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingUp className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm">+2.1%</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>

          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Критичні проблеми</p>
                <p className="text-3xl font-bold text-white">{mockData.priorityIssues.filter(issue => issue.severity === 'high').length}</p>
                <div className="flex items-center gap-1 mt-1">
                  <TrendingDown className="w-4 h-4 text-red-400" />
                  <span className="text-red-400 text-sm">-1</span>
                </div>
              </div>
              <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-orange-500 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sentiment Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Розподіл тональності</h3>
              <PieChart className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                  <span className="text-gray-300">Позитивні</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full">
                    <div className="w-3/4 h-2 bg-green-500 rounded-full"></div>
                  </div>
                  <span className="text-white font-semibold">{mockData.sentiment.positive}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                  <span className="text-gray-300">Нейтральні</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full">
                    <div className="w-1/3 h-2 bg-yellow-500 rounded-full"></div>
                  </div>
                  <span className="text-white font-semibold">{mockData.sentiment.neutral}%</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-gray-300">Негативні</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-slate-700 rounded-full">
                    <div className="w-1/4 h-2 bg-red-500 rounded-full"></div>
                  </div>
                  <span className="text-white font-semibold">{mockData.sentiment.negative}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Intent Classification */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Класифікація намірів</h3>
              <BarChart3 className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-4">
              {Object.entries(mockData.intentClassification).map(([intent, percentage]) => (
                <div key={intent} className="flex items-center justify-between">
                  <span className="text-gray-300">{intent}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-700 rounded-full">
                      <div 
                        className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                        style={{ width: `${percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold">{percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Sources and Trending Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sources Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Джерела згадок</h3>
              <Users className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-3">
              {Object.entries(mockData.sources).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-gray-300">{source}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full">
                      <div 
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(mockData.sources))) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Trending Topics */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Трендові теми</h3>
              <Activity className="w-5 h-5 text-purple-400" />
            </div>
            <div className="space-y-4">
              {mockData.trendingTopics.map((topic, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-gray-300">{topic.topic}</span>
                    {topic.trend === 'up' && <TrendingUp className="w-4 h-4 text-green-400" />}
                    {topic.trend === 'down' && <TrendingDown className="w-4 h-4 text-red-400" />}
                    {topic.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full"></div>}
                  </div>
                  <span className="text-white font-semibold">{topic.mentions}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Priority Issues */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Пріоритетні проблеми</h3>
            <AlertTriangle className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-4">
            {mockData.priorityIssues.map((issue) => (
              <div key={issue.id} className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="text-white font-semibold">{issue.title}</h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        issue.severity === 'high' ? 'bg-red-500/20 text-red-400' :
                        issue.severity === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {issue.severity === 'high' ? 'Критично' : 
                         issue.severity === 'medium' ? 'Важливо' : 'Низький'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-400">
                      <span>{issue.mentions} згадок</span>
                      <span>{issue.source}</span>
                      <span className={`${
                        issue.sentiment === 'negative' ? 'text-red-400' :
                        issue.sentiment === 'positive' ? 'text-green-400' :
                        'text-yellow-400'
                      }`}>
                        {issue.sentiment === 'negative' ? 'Негативний' :
                         issue.sentiment === 'positive' ? 'Позитивний' : 'Нейтральний'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {issue.trend === 'up' && <TrendingUp className="w-4 h-4 text-red-400" />}
                    {issue.trend === 'down' && <TrendingDown className="w-4 h-4 text-green-400" />}
                    {issue.trend === 'stable' && <div className="w-4 h-4 bg-gray-400 rounded-full"></div>}
                    <button className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1 rounded text-sm">
                      Дії
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Trends Chart */}
        <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Динаміка згадок за останні 7 днів</h3>
            <BarChart3 className="w-5 h-5 text-purple-400" />
          </div>
          <div className="h-64 flex items-end justify-between gap-2">
            {mockData.dailyStats.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div 
                  className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-t w-8 transition-all hover:opacity-80"
                  style={{ height: `${(day.mentions / Math.max(...mockData.dailyStats.map(d => d.mentions))) * 200}px` }}
                ></div>
                <span className="text-xs text-gray-400">{new Date(day.date).getDate()}</span>
                <span className="text-xs text-white">{day.mentions}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
