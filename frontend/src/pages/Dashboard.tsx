import { useState, useEffect } from 'react';
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
  ArrowLeft,
  TrendingUp,
  TrendingDown,
  Settings,
  Crown,
  Coins,
  Link as LinkIcon,
  Database,
  Target,
  FileText,
} from 'lucide-react';
import { mockDashboardData, mockAlerts, mockKeywordAlerts } from '@/utils/mockData';
import { MetricCard, PriorityIssueCard, FilterEditModal } from '@/components/dashboard';
import { AlertCard, KeywordAlerts } from '@/components/support';
import { CompanyInfo } from '@/components/CompanyInfo';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchCompanyDataSources } from '@/store/slices/companySlice';
import { useSupportTickets } from '@/hooks/useSupportTickets';

function Dashboard() {
  const [selectedPeriod, setSelectedPeriod] = useState('7d');
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const data = mockDashboardData;
  
  // Хардкоджений баланс токенів
  const tokenBalance = 1000;

  // Redux state
  const dispatch = useAppDispatch();
  const { currentCompany, dataSources } = useAppSelector(state => state.company);

  // Хук для аналізу тікетів підтримки
  const { analysis: supportAnalysis, loading: supportLoading } = useSupportTickets();

  // Завантажуємо джерела даних при завантаженні компонента
  useEffect(() => {
    if (currentCompany) {
      dispatch(fetchCompanyDataSources(currentCompany.id));
    }
  }, [currentCompany, dispatch]);

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
              </div>
            </div>
            <div className="flex items-center gap-4">
              {/* Баланс токенів */}
              <div className="flex items-center gap-2 bg-slate-700/50 px-4 py-2 rounded-lg border border-purple-500/30">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="text-sm font-medium text-white">
                  {tokenBalance.toLocaleString()}
                </span>
              </div>
              
              <button
                onClick={() => setIsFilterModalOpen(true)}
                className="bg-slate-700 hover:bg-slate-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Settings className="w-4 h-4" />
                Фільтри
              </button>
              <Link
                to="/subscription"
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all transform hover:scale-105"
              >
                <Crown className="w-4 h-4" />
                Підписка
              </Link>
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
        {/* Period Selector */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-white">Dashboard</h2>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-gray-400" />
              <select
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="bg-slate-800 text-white px-4 py-2 rounded-lg border border-purple-500/30 focus:border-purple-500 focus:outline-none transition-colors"
              >
                <option value="24h">Останні 24 години</option>
                <option value="7d">Останні 7 днів</option>
                <option value="30d">Останні 30 днів</option>
                <option value="90d">Останні 90 днів</option>
              </select>
            </div>
          </div>
        </div>

        {/* Company Info */}
        <div className="mb-6">
          <CompanyInfo />
        </div>

        {/* Data Sources */}
        {dataSources.length > 0 && (
          <div className="mb-8">
            <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-purple-400" />
                Джерела даних
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {dataSources.map((source) => (
                  <div key={`${source.title}-${source.type_id}`} className="bg-slate-700/50 rounded-lg p-4">
                    <h4 className="font-medium text-white mb-2">{source.title}</h4>
                    <div className="space-y-1">
                      {source.links.map((link) => (
                        <div key={link.id} className="flex items-center gap-2 text-sm text-gray-300">
                          <LinkIcon className="w-3 h-3 text-purple-400" />
                          <a 
                            href={link.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="hover:text-purple-400 transition-colors truncate"
                          >
                            {link.url}
                          </a>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <MetricCard
            title="Всього тікетів"
            value={supportAnalysis ? supportAnalysis.totalTickets.toLocaleString() : '0'}
            trend={{ direction: 'up', value: '+5.2%' }}
            icon={MessageSquare}
            gradientFrom="purple-500"
            gradientTo="pink-500"
          />
          <MetricCard
            title="Позитивні тікети"
            value={supportAnalysis ? `${supportAnalysis.sentimentStats.positive.percentage}%` : '0%'}
            trend={{ direction: 'up', value: `+${supportAnalysis?.sentimentStats.positive.count || 0}` }}
            icon={CheckCircle}
            gradientFrom="green-500"
            gradientTo="emerald-500"
          />
          <MetricCard
            title="Негативні тікети"
            value={supportAnalysis ? `${supportAnalysis.sentimentStats.negative.percentage}%` : '0%'}
            trend={{ direction: 'down', value: `${supportAnalysis?.sentimentStats.negative.count || 0}` }}
            icon={AlertTriangle}
            gradientFrom="red-500"
            gradientTo="orange-500"
          />
          <MetricCard
            title="Нейтральні тікети"
            value={supportAnalysis ? `${supportAnalysis.sentimentStats.neutral.percentage}%` : '0%'}
            trend={{ direction: 'stable', value: `${supportAnalysis?.sentimentStats.neutral.count || 0}` }}
            icon={Activity}
            gradientFrom="yellow-500"
            gradientTo="orange-500"
          />
        </div>

        {/* Early Warning System */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
            <AlertTriangle className="w-6 h-6 text-red-400" />
            Система раннього попередження
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {mockAlerts.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </div>
        </div>

        {/* Keyword Alerts Section */}
        <div className="mb-8">
          <KeywordAlerts alerts={mockKeywordAlerts} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sentiment Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Розподіл тональності тікетів</h3>
              <PieChart className="w-5 h-5 text-purple-400" />
            </div>
            {supportLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Завантаження...</div>
              </div>
            ) : supportAnalysis ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-green-500 rounded-full"></div>
                    <span className="text-gray-300">Позитивні</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-700 rounded-full">
                      <div 
                        className="h-2 bg-green-500 rounded-full"
                        style={{ width: `${supportAnalysis.sentimentStats.positive.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold">{supportAnalysis.sentimentStats.positive.percentage}%</span>
                    <span className="text-xs text-gray-400">({supportAnalysis.sentimentStats.positive.count})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-300">Нейтральні</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-700 rounded-full">
                      <div 
                        className="h-2 bg-yellow-500 rounded-full"
                        style={{ width: `${supportAnalysis.sentimentStats.neutral.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold">{supportAnalysis.sentimentStats.neutral.percentage}%</span>
                    <span className="text-xs text-gray-400">({supportAnalysis.sentimentStats.neutral.count})</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                    <span className="text-gray-300">Негативні</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-32 h-2 bg-slate-700 rounded-full">
                      <div 
                        className="h-2 bg-red-500 rounded-full"
                        style={{ width: `${supportAnalysis.sentimentStats.negative.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-white font-semibold">{supportAnalysis.sentimentStats.negative.percentage}%</span>
                    <span className="text-xs text-gray-400">({supportAnalysis.sentimentStats.negative.count})</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Немає даних про тікети</div>
              </div>
            )}
          </div>

          {/* Intent Classification */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Класифікація намірів тікетів</h3>
              <Target className="w-5 h-5 text-purple-400" />
            </div>
            {supportLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Завантаження...</div>
              </div>
            ) : supportAnalysis ? (
              <div className="space-y-4">
                {Object.entries(supportAnalysis.ticketTypeStats)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .map(([type, stats]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-gray-300">{type}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-2 bg-slate-700 rounded-full">
                          <div
                            className="h-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full"
                            style={{ width: `${stats.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-semibold">{stats.percentage}%</span>
                        <span className="text-xs text-gray-400">({stats.count})</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Немає даних про тікети</div>
              </div>
            )}
          </div>
        </div>

        {/* Sources and Trending Topics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Sources Distribution */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Джерела згадок тікетів</h3>
              <Database className="w-5 h-5 text-purple-400" />
            </div>
            {supportLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Завантаження...</div>
              </div>
            ) : supportAnalysis ? (
              <div className="space-y-3">
                {Object.entries(supportAnalysis.dataSourceStats)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .map(([source, stats]) => (
                    <div key={source} className="flex items-center justify-between">
                      <span className="text-gray-300">{source}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-24 h-2 bg-slate-700 rounded-full">
                          <div
                            className="h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"
                            style={{ width: `${stats.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-white font-semibold">{stats.count}</span>
                        <span className="text-xs text-gray-400">({stats.percentage}%)</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Немає даних про тікети</div>
              </div>
            )}
          </div>

          {/* Trending Topics */}
          <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-white">Теми тікетів</h3>
              <FileText className="w-5 h-5 text-purple-400" />
            </div>
            {supportLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Завантаження...</div>
              </div>
            ) : supportAnalysis ? (
              <div className="space-y-4">
                {Object.entries(supportAnalysis.themeStats)
                  .sort(([,a], [,b]) => b.count - a.count)
                  .map(([theme, stats]) => (
                    <div key={theme} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="text-gray-300">{theme}</span>
                        {stats.count > 5 && <TrendingUp className="w-4 h-4 text-green-400" />}
                        {stats.count <= 5 && stats.count > 2 && <div className="w-4 h-4 bg-yellow-400 rounded-full"></div>}
                        {stats.count <= 2 && <TrendingDown className="w-4 h-4 text-red-400" />}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-white font-semibold">{stats.count}</span>
                        <span className="text-xs text-gray-400">({stats.percentage}%)</span>
                      </div>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-32">
                <div className="text-gray-400">Немає даних про тікети</div>
              </div>
            )}
          </div>
        </div>

        {/* Priority Issues */}
        {/* <div className="bg-slate-800/50 backdrop-blur-lg rounded-xl p-6 border border-purple-500/20 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-semibold text-white">Пріоритетні проблеми</h3>
            <AlertTriangle className="w-5 h-5 text-purple-400" />
          </div>
          <div className="space-y-4">
            {data.priorityIssues.map((issue) => (
              <PriorityIssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        </div> */}

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
