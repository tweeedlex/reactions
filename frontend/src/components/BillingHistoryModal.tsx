import { useState, useEffect } from 'react';
import { X, Calendar, DollarSign, Activity, Download } from 'lucide-react';
import { getBillingHistory, getMonthlyStats } from '@/utils/localStorage';
import type { BillingRecord } from '@/types';

interface BillingHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function BillingHistoryModal({ isOpen, onClose }: BillingHistoryModalProps) {
  const [billingHistory, setBillingHistory] = useState<BillingRecord[]>([]);
  const [monthlyStats, setMonthlyStats] = useState({ totalRequests: 0, totalCost: 0, recordCount: 0 });

  useEffect(() => {
    if (isOpen) {
      const history = getBillingHistory();
      const stats = getMonthlyStats();
      setBillingHistory(history);
      setMonthlyStats(stats);
    }
  }, [isOpen]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'parsing': return <Activity className="w-4 h-4 text-blue-400" />;
      case 'api': return <Activity className="w-4 h-4 text-green-400" />;
      case 'export': return <Download className="w-4 h-4 text-purple-400" />;
      case 'premium_feature': return <DollarSign className="w-4 h-4 text-yellow-400" />;
      default: return <Activity className="w-4 h-4 text-gray-400" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'parsing': return 'Парсинг';
      case 'api': return 'API';
      case 'export': return 'Експорт';
      case 'premium_feature': return 'Преміум';
      default: return type;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('uk-UA', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('uk-UA', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="bg-slate-800 rounded-2xl border border-purple-500/30 max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-purple-500/20 p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white">Історія запитів та витрат</h2>
            <p className="text-gray-400 text-sm mt-1">
              Детальний лог всіх операцій та їх вартості
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Stats */}
        <div className="p-6 border-b border-purple-500/20">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <span className="text-sm text-gray-400">Запитів цього місяця</span>
              </div>
              <p className="text-2xl font-bold text-white">{monthlyStats.totalRequests}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <DollarSign className="w-5 h-5 text-green-400" />
                <span className="text-sm text-gray-400">Витрачено цього місяця</span>
              </div>
              <p className="text-2xl font-bold text-white">${monthlyStats.totalCost.toFixed(2)}</p>
            </div>
            <div className="bg-slate-700/50 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="w-5 h-5 text-purple-400" />
                <span className="text-sm text-gray-400">Операцій цього місяця</span>
              </div>
              <p className="text-2xl font-bold text-white">{monthlyStats.recordCount}</p>
            </div>
          </div>
        </div>


        {/* History List */}
        <div className="p-6 overflow-y-auto max-h-96">
          {billingHistory.length === 0 ? (
            <div className="text-center py-12">
              <Activity className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-400">Записи не знайдені</p>
            </div>
          ) : (
            <div className="space-y-3">
              {billingHistory.map((record) => (
                <div
                  key={record.id}
                  className="bg-slate-700/50 rounded-lg p-4 border border-purple-500/20 hover:border-purple-500/40 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3 flex-1">
                      <div className="flex-shrink-0 mt-1">
                        {getTypeIcon(record.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium text-white">
                            {getTypeLabel(record.type)}
                          </span>
                          <span className="text-xs text-gray-400">
                            {record.requests} запитів
                          </span>
                        </div>
                        <p className="text-sm text-gray-300 mb-2">
                          {record.description}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {formatDate(record.date)} о {formatTime(record.date)}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <p className="text-lg font-bold text-green-400">
                        ${record.cost.toFixed(2)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {record.requests} запитів
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-purple-500/20 p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Всього записів: {billingHistory.length} | 
              Загальна вартість: ${billingHistory.reduce((sum, record) => sum + record.cost, 0).toFixed(2)}
            </div>
            <button
              onClick={onClose}
              className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-2 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105"
            >
              Закрити
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default BillingHistoryModal;
