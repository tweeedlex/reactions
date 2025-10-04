import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield,
  MessageSquare,
  CheckCircle,
  AlertTriangle,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Calendar,
  Download,
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Settings,
} from 'lucide-react';
import { mockDashboardData } from '@/utils/mockData';
import { MetricCard, PriorityIssueCard, FilterEditModal } from '@/components/dashboard';

function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const data = mockDashboardData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <header className="bg-slate-900/80 backdrop-blur-lg border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <Link to="/" className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors">
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
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Фільтри
              </button>
              <Link
                to="/support"
                className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <MessageSquare className="w-4 h-4" />
                Сапорт
              </Link>
              {/* <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2">
                <Download className="w-4 h-4" />
                Експорт
              </button> */}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Репутаційна оцінка"
            value={data.reputationScore}
            trend={{ direction: 'up', value: '+5.2%' }}
            icon={Shield}
            gradientFrom="purple-500"
            gradientTo="pink-500"
          />
          <MetricCard
            title="Всього згадок"
            value={data.totalMentions.toLocaleString()}
            trend={{ direction: 'up', value: '+12.3%' }}
            icon={MessageSquare}
            gradientFrom="blue-500"
            gradientTo="cyan-500"
          />
          <MetricCard
            title="Позитивні відгуки"
            value={`${data.sentiment.positive}%`}
            trend={{ direction: 'up', value: '+2.1%' }}
            icon={CheckCircle}
            gradientFrom="green-500"
            gradientTo="emerald-500"
          />
          <MetricCard
            title="Критичні проблеми"
            value={data.priorityIssues.filter((issue) => issue.severity === 'high').length}
            trend={{ direction: 'down', value: '-1' }}
            icon={AlertTriangle}
            gradientFrom="red-500"
            gradientTo="orange-500"
          />
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
                  <span className="text-white font-semibold">{data.sentiment.positive}%</span>
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
                  <span className="text-white font-semibold">{data.sentiment.neutral}%</span>
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
                  <span className="text-white font-semibold">{data.sentiment.negative}%</span>
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
              {Object.entries(data.intentClassification).map(([intent, percentage]) => (
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
              {Object.entries(data.sources).map(([source, count]) => (
                <div key={source} className="flex items-center justify-between">
                  <span className="text-gray-300">{source}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-24 h-2 bg-slate-700 rounded-full">
                      <div
                        className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                        style={{ width: `${(count / Math.max(...Object.values(data.sources))) * 100}%` }}
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
              {data.trendingTopics.map((topic, index) => (
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
            {data.priorityIssues.map((issue) => (
              <PriorityIssueCard key={issue.id} issue={issue} />
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
            {data.dailyStats.map((day, index) => (
              <div key={index} className="flex flex-col items-center gap-2">
                <div
                  className="bg-gradient-to-t from-purple-500 to-pink-500 rounded-t w-8 transition-all hover:opacity-80"
                  style={{
                    height: `${(day.mentions / Math.max(...data.dailyStats.map((d) => d.mentions))) * 200}px`,
                  }}
                ></div>
                <span className="text-xs text-gray-400">{new Date(day.date).getDate()}</span>
                <span className="text-xs text-white">{day.mentions}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filter Edit Modal */}
      <FilterEditModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onSave={() => {
          // Optionally refresh data or show success message
          console.log('Filters updated successfully');
        }}
      />
    </div>
  );
}

export default Dashboard;
